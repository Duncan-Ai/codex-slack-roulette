"use client";

import { useCallback, useEffect, useState } from "react";
import type { Phase, Player } from "@/lib/game-store";
import type { Round } from "@/lib/rounds";

type HostGame = { code: string; phase: Phase; roundIndex: number; players: Player[]; answered: string[]; round?: Round; voteSplit?: { key: string; choice: string; names: string[] }[] };

function Logo() { return <div className="logo"><span>SLACK MESSAGE</span><strong>ROULETTE</strong><i>✦</i></div>; }

export default function Host() {
  const [game, setGame] = useState<HostGame>();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async (code: string, hostToken: string) => {
    const response = await fetch(`/api/game?code=${code}&token=${hostToken}`, { cache: "no-store" });
    if (response.ok) setGame(await response.json());
  }, []);

  async function create() {
    setError("");
    const response = await fetch("/api/game", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create" }) });
    const data = await response.json(); setToken(data.hostToken); await refresh(data.code, data.hostToken);
  }

  async function act(action: string) {
    if (!game) return;
    const response = await fetch("/api/game", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, code: game.code, hostToken: token }) });
    const data = await response.json(); if (!response.ok) setError(data.error); else setGame(data);
  }

  useEffect(() => {
    if (!game || game.phase === "end") return;
    const timer = setInterval(() => refresh(game.code, token), 1000);
    return () => clearInterval(timer);
  }, [game, token, refresh]);

  const round = game?.round;
  const ranked = [...(game?.players ?? [])].sort((a, b) => b.score - a.score);
  const answerText = round?.mode === "FINISH THE MESSAGE" && round.answer ? round.choices[round.answer.charCodeAt(0) - 65] : round?.answer;

  return <main className="game-shell host-shell">
    <header><Logo/><div className="header-right"><span className="live-dot"/>{game ? `ROOM ${game.code}` : "HOST SCREEN"}</div></header>

    {!game && <section className="splash panel-enter"><div className="eyebrow">⚡ YOUR TEAM. THEIR MESSAGES.</div><h1>SPIN THE<br/><em>GROUP CHAT.</em></h1><p className="lede">Put this screen where everyone can see it. Players join from their phones.</p><button className="primary" onClick={create}>CREATE A GAME <span>→</span></button></section>}

    {game?.phase === "lobby" && <section className="host-lobby panel-enter">
      <div className="join-callout"><span>JOIN ON YOUR PHONE</span><b>{typeof window !== "undefined" ? `${window.location.host}/play` : "/play"}</b><small>ENTER ROOM CODE</small><strong>{game.code}</strong></div>
      <h2>{game.players.length ? `${game.players.length} ${game.players.length === 1 ? "PLAYER" : "PLAYERS"} ARE IN` : "WAITING FOR TROUBLEMAKERS..."}</h2>
      <div className="player-wall">{game.players.map((player, index) => <div key={player.id}><span>{String(index + 1).padStart(2,"0")}</span>{player.name}<b>✓</b></div>)}</div>
      {error && <p className="error">{error}</p>}<button className="primary" disabled={game.players.length === 0} onClick={() => act("start")}>START THE CHAOS <span>→</span></button>
    </section>}

    {game?.phase === "question" && round && <section className="question panel-enter">
      <div className="round-meta"><span className="mode">{round.mode}</span>{round.bonus && <span className="bonus">2× BONUS ROUND</span>}<span className="answering">ROUND {game.roundIndex + 1} / 20</span></div>
      {round.mode === "REAL OR FAKE" && <div className="claim">Allegedly posted by <strong>@{round.author.toLowerCase()}</strong></div>}
      {round.mode === "FINISH THE MESSAGE" && <div className="claim">Complete <strong>@{round.author.toLowerCase()}</strong>’s message</div>}
      {round.mode === "WHO SAID IT" && <div className="claim">One of your coworkers sent this...</div>}
      <blockquote>“{round.message}”</blockquote>
      <div className="waiting-card"><div><b>{game.answered.length}</b><span>OF {game.players.length}<br/>LOCKED IN</span></div><div className="answer-dots">{game.players.map((p) => <i title={p.name} className={game.answered.includes(p.id) ? "done" : ""} key={p.id}/>)}</div></div>
      <button className="primary" disabled={game.answered.length !== game.players.length} onClick={() => act("reveal")}>REVEAL THE TRUTH <span>→</span></button>
    </section>}

    {game?.phase === "reveal" && round && <section className="reveal panel-enter">
      <div className={round.answer === "FAKE" ? "stamp fake" : "stamp"}>{round.mode === "WHO SAID IT" ? `@${round.author}` : round.mode === "FINISH THE MESSAGE" ? `ANSWER ${round.answer}` : round.answer}</div>
      <h2>{round.mode === "WHO SAID IT" ? `${round.author} said it.` : answerText}</h2>
      <p className="original">“{round.mode === "FINISH THE MESSAGE" ? `${round.message.replace("...", "")} ${answerText}` : round.message}”</p>
      <div className="vote-split"><h3>THE DAMAGE REPORT</h3>{game.voteSplit?.map((vote) => <div className={`vote-row ${vote.key === round.answer ? "correct" : ""}`} key={vote.key}><b>{round.mode === "FINISH THE MESSAGE" ? `${vote.key} — ${vote.choice}` : vote.choice}</b><div className="bar"><i style={{width:`${vote.names.length/game.players.length*100}%`}}/></div><strong>{vote.names.length}</strong><span>{vote.names.length} {vote.names.length === 1 ? "player thought" : "players thought"} this: {vote.names.join(", ")}</span></div>)}</div>
      <button className="primary" onClick={() => act("next")}>{game.roundIndex === 19 ? "FINAL SCORES" : "NEXT ROUND"} <span>→</span></button>
    </section>}

    {(game?.phase === "score" || game?.phase === "end") && <section className="scoreboard panel-enter"><div className="eyebrow">{game.phase === "end" ? "✦ THAT’S THE GAME ✦" : "SCORE CHECK"}</div><h2>{game.phase === "end" ? "THE RECEIPTS ARE IN" : "CURRENT DAMAGE"}</h2><div className="rank-list">{ranked.map((player,index) => <div className={index === 0 ? "leader" : ""} key={player.id}><span className="rank">{index+1}</span><b>{player.name}</b>{index === 0 && <small>CHAT LORE MASTER</small>}<strong>{player.score.toLocaleString()} <em>PTS</em></strong></div>)}</div><button className="primary" onClick={game.phase === "end" ? create : () => act("continue")}>{game.phase === "end" ? "NEW GAME" : "KEEP SPINNING"} <span>→</span></button></section>}
    <footer><span>20 ROUNDS</span><i>✦</i><span>ZERO CONTEXT</span><i>✦</i><span>MAXIMUM CONSEQUENCES</span></footer>
  </main>;
}
