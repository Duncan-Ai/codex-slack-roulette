"use client";

import { useMemo, useState } from "react";

const roster = ["Duncan", "Caelee", "Naqsh", "Mitch", "Ahmed", "Benjamin", "Jessica", "Anas", "Jasim", "Sherjeel", "Mariana"];

type Mode = "REAL OR FAKE" | "WHO SAID IT" | "FINISH THE MESSAGE";
type Round = {
  mode: Mode;
  author: string;
  message: string;
  answer: string;
  choices: string[];
  context?: string;
  bonus?: boolean;
};

const rounds: Round[] = [
  { mode: "REAL OR FAKE", author: "Duncan", message: "BURN IT ALL DOWN", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Ahmed", message: "LOVE SHANIA TWAIN", answer: "Ahmed", choices: roster },
  { mode: "REAL OR FAKE", author: "Naqsh", message: "chai is a personality trait", answer: "FAKE", choices: ["REAL", "FAKE"] },
  { mode: "FINISH THE MESSAGE", author: "Caelee", message: "Let me tell you about...", answer: "A", choices: ["way back in the 1900's", "the email I just found", "my very first flip phone", "how far behind I am"] },
  { mode: "WHO SAID IT", author: "Benjamin", message: "YOU STOLE MY WIN", answer: "Benjamin", choices: roster },
  { mode: "REAL OR FAKE", author: "Anas", message: "The shape of donut is circle", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "REAL OR FAKE", author: "Jessica", message: "I can still open a PDF, everyone", answer: "FAKE", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Jasim", message: "You can say \"Mazedaar!\" Which translates to Tasty", answer: "Jasim", choices: roster },
  { mode: "FINISH THE MESSAGE", author: "Mitch", message: "What a grate mistake it was...", answer: "C", choices: ["starting all these food jokes.", "not ordering lunch before this.", "missing the cheese puns. I'm quite blue about it", "letting this conversation mature so long."] },
  { mode: "REAL OR FAKE", author: "Ahmed", message: "schrodinger's progress", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Duncan", message: "mine landed on free septic", answer: "Duncan", choices: roster },
  { mode: "REAL OR FAKE", author: "Caelee", message: "I'm two steps behind the learning curve!", answer: "FAKE", choices: ["REAL", "FAKE"] },
  { mode: "FINISH THE MESSAGE", author: "Benjamin", message: "This took so long...", answer: "D", choices: ["the meeting scheduled itself", "I forgot why we started", "the client figured it out", "the ice cream turned into cheese"] },
  { mode: "REAL OR FAKE", author: "Naqsh", message: "yall are amazing but so are my systems", answer: "REAL", choices: ["REAL", "FAKE"] },
  { mode: "WHO SAID IT", author: "Jessica", message: "Neither are the correct AAron though", answer: "Jessica", choices: roster, bonus: true },
  { mode: "REAL OR FAKE", author: "Mitch", message: "That sounds like a campaign problem, not a feature.", answer: "FAKE", choices: ["REAL", "FAKE"], bonus: true },
  { mode: "REAL OR FAKE", author: "Anas", message: "Hell yeah", answer: "REAL", choices: ["REAL", "FAKE"], bonus: true },
  { mode: "FINISH THE MESSAGE", author: "Jasim", message: "For me it takes 1,5 hour...", answer: "B", choices: ["if the ingredients are ready first", "to make it the easy to cook one", "but the real recipe takes much longer", "when I cook the powdered version"], bonus: true },
  { mode: "WHO SAID IT", author: "Naqsh", message: "damn", answer: "Naqsh", choices: roster, bonus: true },
  { mode: "REAL OR FAKE", author: "Benjamin", message: "Could be more cursed", answer: "FAKE", choices: ["REAL", "FAKE"], bonus: true },
];

type Scores = Record<string, number>;

function Logo() {
  return <div className="logo"><span>SLACK MESSAGE</span><strong>ROULETTE</strong><i>✦</i></div>;
}

export default function Home() {
  const [screen, setScreen] = useState<"lobby" | "question" | "reveal" | "score" | "end">("lobby");
  const [players, setPlayers] = useState<string[]>([]);
  const [roundIndex, setRoundIndex] = useState(0);
  const [turn, setTurn] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<Scores>({});
  const round = rounds[roundIndex];

  const ranked = useMemo(() => [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0)), [players, scores]);

  function togglePlayer(name: string) {
    setPlayers((current) => current.includes(name) ? current.filter((p) => p !== name) : [...current, name]);
  }

  function startGame() {
    setScores(Object.fromEntries(players.map((p) => [p, 0])));
    setScreen("question");
  }

  function submitAnswer(value: string) {
    const player = players[turn];
    const nextAnswers = { ...answers, [player]: value };
    setAnswers(nextAnswers);
    if (turn < players.length - 1) setTurn(turn + 1);
    else {
      const multiplier = round.bonus ? 2 : 1;
      const nextScores = { ...scores };
      players.forEach((name, index) => {
        if (nextAnswers[name] === round.answer) nextScores[name] += (100 + Math.max(0, 50 - index * 10)) * multiplier;
      });
      setScores(nextScores);
      setScreen("reveal");
    }
  }

  function advance() {
    if (roundIndex === rounds.length - 1) return setScreen("end");
    if ((roundIndex + 1) % 7 === 0) return setScreen("score");
    nextRound();
  }

  function nextRound() {
    setRoundIndex((n) => n + 1);
    setTurn(0);
    setAnswers({});
    setScreen("question");
  }

  function reset() {
    setScreen("lobby"); setPlayers([]); setRoundIndex(0); setTurn(0); setAnswers({}); setScores({});
  }

  const split = round ? round.choices.map((choice, index) => {
    const key = round.mode === "FINISH THE MESSAGE" ? String.fromCharCode(65 + index) : choice;
    return { choice: round.mode === "FINISH THE MESSAGE" ? `${key} — ${choice}` : choice, key, names: players.filter((p) => answers[p] === key) };
  }).filter((x) => x.names.length) : [];

  return (
    <main className="game-shell">
      <header><Logo /><div className="header-right"><span className="live-dot" />{screen === "lobby" ? "GAME NIGHT" : `ROUND ${roundIndex + 1} / 20`}</div></header>

      {screen === "lobby" && <section className="lobby panel-enter">
        <div className="eyebrow">⚡ READY TO RISK THE GROUP CHAT?</div>
        <h1>WHO’S<br/><em>PLAYING?</em></h1>
        <p className="lede">Pick your players. Protect your dignity.</p>
        <div className="roster-grid">
          {roster.map((name, i) => <button key={name} onClick={() => togglePlayer(name)} className={`player-chip ${players.includes(name) ? "selected" : ""}`}><span>{String(i + 1).padStart(2, "0")}</span>{name}<b>{players.includes(name) ? "✓" : "+"}</b></button>)}
        </div>
        <div className="lobby-footer"><div><strong>{players.length}</strong><span>PLAYERS LOCKED IN</span></div><button className="primary" disabled={players.length < 2} onClick={startGame}>START THE CHAOS <span>→</span></button></div>
      </section>}

      {screen === "question" && <section className="question panel-enter">
        <div className="round-meta"><span className={`mode mode-${round.mode.charAt(0).toLowerCase()}`}>{round.mode}</span>{round.bonus && <span className="bonus">2× BONUS ROUND</span>}<span className="answering"><b>{players[turn]}</b> is answering · {turn + 1}/{players.length}</span></div>
        {round.mode === "REAL OR FAKE" && <div className="claim">Allegedly posted by <strong>@{round.author.toLowerCase()}</strong></div>}
        {round.mode === "FINISH THE MESSAGE" && <div className="claim">Complete <strong>@{round.author.toLowerCase()}</strong>’s message</div>}
        {round.mode === "WHO SAID IT" && <div className="claim">One of your coworkers sent this...</div>}
        <blockquote>“{round.message}”</blockquote>
        <div className={`choices ${round.choices.length > 4 ? "author-choices" : ""}`}>
          {round.choices.map((choice, i) => <button key={choice} onClick={() => submitAnswer(round.mode === "FINISH THE MESSAGE" ? String.fromCharCode(65 + i) : choice)}><span>{round.mode === "FINISH THE MESSAGE" ? String.fromCharCode(65 + i) : round.mode === "WHO SAID IT" ? "@" : ["✓", "✕"][i]}</span>{choice}</button>)}
        </div>
        <p className="privacy">Answers stay hidden until everyone locks in.</p>
      </section>}

      {screen === "reveal" && <section className="reveal panel-enter">
        <div className={round.answer === "FAKE" ? "stamp fake" : "stamp"}>{round.mode === "WHO SAID IT" ? `@${round.author}` : round.mode === "FINISH THE MESSAGE" ? `ANSWER ${round.answer}` : round.answer}</div>
        <h2>{round.mode === "WHO SAID IT" ? `${round.author} said it.` : round.mode === "FINISH THE MESSAGE" ? round.choices[round.answer.charCodeAt(0) - 65] : round.answer === "REAL" ? "Yep. They really said that." : "Nice try. Totally fabricated."}</h2>
        <p className="original">“{round.mode === "FINISH THE MESSAGE" ? `${round.message.replace("...", "")} ${round.choices[round.answer.charCodeAt(0) - 65]}` : round.message}”</p>
        <div className="vote-split"><h3>THE DAMAGE REPORT</h3>{split.map(({ choice, key, names }) => <div className={`vote-row ${key === round.answer ? "correct" : ""}`} key={choice}><b>{choice}</b><div className="bar"><i style={{width: `${(names.length / players.length) * 100}%`}} /></div><strong>{names.length}</strong><span>{names.length} {names.length === 1 ? "player thought" : "players thought"} {choice}: {names.join(", ")}</span></div>)}</div>
        <button className="primary" onClick={advance}>{roundIndex === 19 ? "FINAL SCORES" : "NEXT ROUND"} <span>→</span></button>
      </section>}

      {(screen === "score" || screen === "end") && <section className="scoreboard panel-enter">
        <div className="eyebrow">{screen === "end" ? "✦ THAT’S THE GAME ✦" : "SCORE CHECK"}</div>
        <h2>{screen === "end" ? "THE RECEIPTS ARE IN" : "CURRENT DAMAGE"}</h2>
        <div className="rank-list">{ranked.map((name, i) => <div className={i === 0 ? "leader" : ""} key={name}><span className="rank">{i + 1}</span><b>{name}</b>{i === 0 && <small>CHAT LORE MASTER</small>}<strong>{scores[name]?.toLocaleString()} <em>PTS</em></strong></div>)}</div>
        <button className="primary" onClick={screen === "end" ? reset : nextRound}>{screen === "end" ? "PLAY AGAIN" : "KEEP SPINNING"} <span>→</span></button>
      </section>}
      <footer><span>20 ROUNDS</span><i>✦</i><span>ZERO CONTEXT</span><i>✦</i><span>MAXIMUM CONSEQUENCES</span></footer>
    </main>
  );
}
