import { Redis } from "@upstash/redis";
import { roster, rounds } from "./rounds";

export type Phase = "lobby" | "question" | "reveal" | "score" | "end";
export type Player = { id: string; name: string; score: number };
type Answer = { value: string; order: number };
export type Game = { code: string; hostToken: string; phase: Phase; roundIndex: number; players: Player[]; answers: Record<string, Answer>; createdAt: number; revision: number };

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : undefined;
const globalGames = globalThis as typeof globalThis & { rouletteGames?: Map<string, Game> };
const memoryGames = globalGames.rouletteGames ??= new Map<string, Game>();
const ttlSeconds = 60 * 60 * 8;

function gameKey(code: string) { return `roulette:game:${code.toUpperCase()}`; }
const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function saveGame(game: Game, onlyIfMissing = false) {
  if (redis) return onlyIfMissing
    ? redis.set(gameKey(game.code), game, { ex: ttlSeconds, nx: true })
    : redis.set(gameKey(game.code), game, { ex: ttlSeconds });
  if (onlyIfMissing && memoryGames.has(game.code)) return null;
  memoryGames.set(game.code, structuredClone(game)); return "OK";
}

async function mutateGame(gameCode: string, mutation: (game: Game) => void) {
  const normalized = gameCode.toUpperCase();
  if (!redis) {
    const game = memoryGames.get(normalized); if (!game) throw new Error("Game not found. Check the code and try again.");
    mutation(game); memoryGames.set(normalized, game); return game;
  }
  const lockKey = `roulette:lock:${normalized}`; const lockToken = crypto.randomUUID();
  for (let attempt = 0; attempt < 40; attempt++) {
    const acquired = await redis.set(lockKey, lockToken, { nx: true, px: 5000 });
    if (!acquired) { await sleep(50); continue; }
    try {
      const game = await redis.get<Game>(gameKey(normalized));
      if (!game) throw new Error("Game not found. Check the code and try again.");
      mutation(game); await saveGame(game); return game;
    } finally {
      await redis.eval("if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end", [lockKey], [lockToken]);
    }
  }
  throw new Error("The room is busy. Please try again.");
}

function newCode() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
}

export async function createGame() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const game: Game = { code: newCode(), hostToken: crypto.randomUUID(), phase: "lobby", roundIndex: 0, players: [], answers: {}, createdAt: Date.now(), revision: 0 };
    if (await saveGame(game, true)) return game;
  }
  throw new Error("Could not create a unique room. Please try again.");
}
export async function getGame(gameCode: string) {
  const normalized = gameCode.toUpperCase();
  return redis ? redis.get<Game>(gameKey(normalized)) : memoryGames.get(normalized);
}
export function publicGame(game: Game, playerId?: string, host = false) {
  const round = rounds[game.roundIndex];
  return {
    code: game.code, phase: game.phase, roundIndex: game.roundIndex, revision: game.revision, players: game.players,
    answered: Object.keys(game.answers), me: game.players.find((player) => player.id === playerId),
    round: round ? { ...round, answer: host || game.phase === "reveal" ? round.answer : undefined } : undefined,
    voteSplit: game.phase === "reveal" ? round.choices.map((choice, index) => {
      const key = round.mode === "FINISH THE MESSAGE" ? String.fromCharCode(65 + index) : choice;
      return { key, choice, names: game.players.filter((player) => game.answers[player.id]?.value === key).map((player) => player.name) };
    }).filter((item) => item.names.length) : undefined,
  };
}
export async function joinGame(gameCode: string, name: string) {
  let player!: Player;
  const game = await mutateGame(gameCode, (current) => {
    if (current.phase !== "lobby") throw new Error("That game has already started.");
    if (!roster.some((person) => person === name)) throw new Error("Pick a name from the roster.");
    if (current.players.some((item) => item.name.toLowerCase() === name.toLowerCase())) throw new Error("That player is already in the lobby.");
    player = { id: crypto.randomUUID(), name, score: 0 }; current.players.push(player); current.revision++;
  });
  return { game, player };
}
export async function answer(gameCode: string, playerId: string, value: string) {
  return mutateGame(gameCode, (game) => {
    if (game.phase !== "question") throw new Error("Answers are closed.");
    if (!game.players.some((player) => player.id === playerId)) throw new Error("Player not found.");
    const round = rounds[game.roundIndex];
    const validAnswers = round.mode === "FINISH THE MESSAGE" ? round.choices.map((_, index) => String.fromCharCode(65 + index)) : round.choices;
    if (!validAnswers.includes(value)) throw new Error("That is not a valid answer.");
    if (!game.answers[playerId]) { game.answers[playerId] = { value, order: Object.keys(game.answers).length }; game.revision++; }
  });
}
export async function hostAction(gameCode: string, action: string) {
  return mutateGame(gameCode, (game) => {
    if (action === "start" && game.phase === "lobby") { if (game.players.length === 0) throw new Error("At least one player is required."); game.phase = "question"; game.revision++; }
    else if (action === "reveal" && game.phase === "question") {
      if (Object.keys(game.answers).length !== game.players.length) throw new Error("Waiting for every player to answer.");
      const round = rounds[game.roundIndex];
      for (const player of game.players) { const response = game.answers[player.id]; if (response?.value === round.answer) player.score += (100 + Math.max(0, 50 - response.order * 10)) * (round.bonus ? 2 : 1); }
      game.phase = "reveal"; game.revision++;
    } else if (action === "next" && game.phase === "reveal") {
      if (game.roundIndex === rounds.length - 1) game.phase = "end";
      else if ((game.roundIndex + 1) % 7 === 0) game.phase = "score";
      else { game.roundIndex++; game.answers = {}; game.phase = "question"; }
      game.revision++;
    } else if (action === "continue" && game.phase === "score") { game.roundIndex++; game.answers = {}; game.phase = "question"; game.revision++; }
    else throw new Error("That action is not available right now.");
  });
}
