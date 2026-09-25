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

## Publish on Vercel

```bash
npx vercel deploy --prod
```

The host shares the resulting root URL on the call; players use the same URL with `/play`. Visitors do not need a Vercel account. If the project has Vercel Authentication enabled, turn off **Deployment Protection** for the production environment in the project settings so the host and phone controller remain publicly accessible.

An unauthenticated CLI can create a public preview with `npx vercel deploy --temporary`, but Vercel deletes anonymous deployments after one hour. After expiration, the URL redirects to a Vercel page and can look like a login requirement. Claim the deployment from the URL printed by the CLI before it expires, then disable Deployment Protection for production. The owner signs in once to claim it; players never need to sign in.
