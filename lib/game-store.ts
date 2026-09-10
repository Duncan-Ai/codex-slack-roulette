import { roster, rounds } from "./rounds";

export type Phase = "lobby" | "question" | "reveal" | "score" | "end";
export type Player = { id: string; name: string; score: number };
type Answer = { value: string; order: number };
export type Game = { code: string; hostToken: string; phase: Phase; roundIndex: number; players: Player[]; answers: Record<string, Answer>; createdAt: number };

const globalGames = globalThis as typeof globalThis & { rouletteGames?: Map<string, Game> };
const games = globalGames.rouletteGames ??= new Map<string, Game>();

function code() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  let value = "";
  do value = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join(""); while (games.has(value));
  return value;
}

export function createGame() {
  const game: Game = { code: code(), hostToken: crypto.randomUUID(), phase: "lobby", roundIndex: 0, players: [], answers: {}, createdAt: Date.now() };
  games.set(game.code, game);
  return game;
}
export function getGame(gameCode: string) { return games.get(gameCode.toUpperCase()); }
export function publicGame(game: Game, playerId?: string, host = false) {
  const round = rounds[game.roundIndex];
  return {
    code: game.code, phase: game.phase, roundIndex: game.roundIndex, players: game.players,
    answered: Object.keys(game.answers), me: game.players.find((p) => p.id === playerId),
    round: round ? { ...round, answer: host || game.phase === "reveal" ? round.answer : undefined } : undefined,
    voteSplit: game.phase === "reveal" ? round.choices.map((choice, index) => {
      const key = round.mode === "FINISH THE MESSAGE" ? String.fromCharCode(65 + index) : choice;
      return { key, choice, names: game.players.filter((p) => game.answers[p.id]?.value === key).map((p) => p.name) };
    }).filter((item) => item.names.length) : undefined,
  };
}
export function joinGame(game: Game, name: string) {
  if (game.phase !== "lobby") throw new Error("That game has already started.");
  if (!roster.some((person) => person === name)) throw new Error("Pick a name from the roster.");
  if (game.players.some((p) => p.name.toLowerCase() === name.toLowerCase())) throw new Error("That player is already in the lobby.");
  const player = { id: crypto.randomUUID(), name, score: 0 }; game.players.push(player); return player;
}
export function answer(game: Game, playerId: string, value: string) {
  if (game.phase !== "question") throw new Error("Answers are closed.");
  if (!game.players.some((p) => p.id === playerId)) throw new Error("Player not found.");
  if (!game.answers[playerId]) game.answers[playerId] = { value, order: Object.keys(game.answers).length };
}
export function hostAction(game: Game, action: string) {
  if (action === "start" && game.phase === "lobby") { if (game.players.length < 2) throw new Error("At least two players are required."); game.phase = "question"; }
  else if (action === "reveal" && game.phase === "question") {
    const round = rounds[game.roundIndex];
    for (const player of game.players) { const response = game.answers[player.id]; if (response?.value === round.answer) player.score += (100 + Math.max(0, 50 - response.order * 10)) * (round.bonus ? 2 : 1); }
    game.phase = "reveal";
  } else if (action === "next" && game.phase === "reveal") {
    if (game.roundIndex === rounds.length - 1) game.phase = "end";
    else if ((game.roundIndex + 1) % 7 === 0) game.phase = "score";
    else { game.roundIndex++; game.answers = {}; game.phase = "question"; }
  } else if (action === "continue" && game.phase === "score") { game.roundIndex++; game.answers = {}; game.phase = "question"; }
  else throw new Error("That action is not available right now.");
}
