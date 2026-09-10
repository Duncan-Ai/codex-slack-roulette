# Slack Message Roulette

A shared-screen party game for remote teams. One browser is the host display; players join the room and answer privately from their phones.

## Run it

```bash
npm install
npm run dev
```

1. Open `http://localhost:3000` on the shared screen and choose **Create a game**.
2. Players open the displayed `/play` URL on their phones.
3. Each player enters the four-letter room code and chooses their roster name.
4. The host starts the game, waits for everyone to answer, and reveals each result.

Only one player is required, so the complete flow can be tested solo with the host screen and one `/play` tab.

Phones poll the game API once per second, so they follow the host automatically through questions, reveals, score checks, and the final result.

## Deployment note

Rooms are held in server memory and are intended for a single long-running Node.js process (`npm run build && npm start`). Restarting the server clears active rooms. For a multi-instance or serverless deployment, replace the map in `lib/game-store.ts` with a shared store such as Redis.
