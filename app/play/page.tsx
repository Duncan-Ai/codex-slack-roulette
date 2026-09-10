"use client";

import { useCallback, useEffect, useState } from "react";
import { roster, type Round } from "@/lib/rounds";
import type { Phase, Player } from "@/lib/game-store";

type PlayerGame = { code: string; phase: Phase; roundIndex: number; players: Player[]; answered: string[]; me?: Player; round?: Omit<Round,"answer"> & { answer?: string } };

export default function Play() {
  const [code, setCode] = useState(""); const [name, setName] = useState(""); const [playerId, setPlayerId] = useState("");
  const [game, setGame] = useState<PlayerGame>(); const [error, setError] = useState("");
  const refresh = useCallback(async () => { if (!code || !playerId) return; const response = await fetch(`/api/game?code=${code}&playerId=${playerId}`, { cache:"no-store" }); if (response.ok) setGame(await response.json()); }, [code, playerId]);
  useEffect(() => { if (!playerId) return; const timer = setInterval(refresh, 1000); return () => clearInterval(timer); }, [playerId, refresh]);

  async function join() { setError(""); const response = await fetch("/api/game", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"join",code,name}) }); const data = await response.json(); if (!response.ok) setError(data.error); else { setPlayerId(data.playerId); setGame(data.game); } }
  async function submit(value: string) { const response = await fetch("/api/game", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({action:"answer",code,playerId,value}) }); const data = await response.json(); if (!response.ok) setError(data.error); else setGame(data); }
  const answered = !!game?.answered.includes(playerId); const round = game?.round;

  return <main className="phone-shell"><div className="phone-logo">SLACK MESSAGE <strong>ROULETTE</strong><i>✦</i></div>
    {!game && <section className="join-panel panel-enter"><div className="eyebrow">JOIN THE CHAOS</div><h1>GET<br/><em>IN.</em></h1><label>ROOM CODE<input maxLength={4} autoCapitalize="characters" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g,""))} placeholder="ABCD"/></label><label>WHO ARE YOU?<select value={name} onChange={(e) => setName(e.target.value)}><option value="">Pick your name</option>{roster.map((person) => <option key={person}>{person}</option>)}</select></label>{error && <p className="error">{error}</p>}<button className="primary" disabled={code.length !== 4 || !name} onClick={join}>JOIN GAME <span>→</span></button></section>}
    {game?.phase === "lobby" && <section className="phone-wait panel-enter"><span className="big-check">✓</span><h2>YOU’RE IN, {game.me?.name?.toUpperCase()}.</h2><p>Keep this screen open. The host will start soon.</p><div className="mini-code">ROOM {game.code}</div></section>}
    {game?.phase === "question" && round && <section className="phone-question panel-enter"><div className="phone-meta"><span>ROUND {game.roundIndex+1}/20</span><b>{round.mode}</b></div>{answered ? <div className="locked"><span>✓</span><h2>LOCKED IN.</h2><p>Now stare confidently at the main screen.</p></div> : <><p className="phone-prompt">{round.mode === "REAL OR FAKE" ? `Did @${round.author.toLowerCase()} really post this?` : round.mode === "WHO SAID IT" ? "Who said it?" : `Finish @${round.author.toLowerCase()}’s message`}</p><div className={`phone-choices ${round.choices.length > 4 ? "compact" : ""}`}>{round.choices.map((choice,index) => { const value = round.mode === "FINISH THE MESSAGE" ? String.fromCharCode(65+index) : choice; return <button key={choice} onClick={() => submit(value)}><span>{round.mode === "FINISH THE MESSAGE" ? value : round.mode === "WHO SAID IT" ? "@" : index === 0 ? "✓" : "✕"}</span>{choice}</button>})}</div></>}</section>}
    {game?.phase === "reveal" && <section className="phone-wait panel-enter"><span className="big-check">👀</span><h2>RECEIPTS ARE UP.</h2><p>Look at the main screen to see who got exposed.</p></section>}
    {game?.phase === "score" && <section className="phone-wait panel-enter"><span className="big-score">{game.me?.score.toLocaleString()}</span><h2>POINTS SO FAR</h2><p>The leaderboard is on the main screen.</p></section>}
    {game?.phase === "end" && <section className="phone-wait panel-enter"><span className="big-score">{game.me?.score.toLocaleString()}</span><h2>FINAL SCORE</h2><p>{game.me?.score === Math.max(...game.players.map((p) => p.score)) ? "You know too much. Suspicious." : "Your group-chat memory needs work."}</p></section>}
  </main>;
}
