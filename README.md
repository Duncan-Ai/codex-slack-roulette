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

## Multiplayer storage

The app works without configuration by keeping rooms in server memory. For reliable games on a multi-instance Vercel deployment, connect shared Redis storage so every serverless request reads and updates the same room:

1. In the Vercel project, open **Storage → Create Database**.
2. Choose an **Upstash Redis** integration and connect it to the project.
3. Make sure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are available to Production and Preview deployments. The older `KV_REST_API_URL` and `KV_REST_API_TOKEN` names are also supported.
4. Redeploy after connecting the database.

When Redis is connected, rooms expire after eight hours. Without Redis, creating and testing a game still works, but a server restart or a request routed to another instance can lose the room.

## Publish on Vercel

```bash
npx vercel deploy --prod
```

The host shares the resulting root URL on the call; players use the same URL with `/play`. Visitors do not need a Vercel account. If the project has Vercel Authentication enabled, turn off **Deployment Protection** for the production environment in the project settings so the host and phone controller remain publicly accessible.

### If players see “Log in to Vercel”

That screen is served by Vercel before the request reaches this application, so it cannot be disabled in application code. In the Vercel dashboard:

1. Open the `codex-slack-roulette` project.
2. Go to **Settings → Deployment Protection**.
3. Under **Vercel Authentication**, turn the toggle off and save.
4. Redeploy the `main` branch to **Production** and share the production domain, not a `-git-...` preview URL.
5. Confirm the `/play` URL in a private/incognito window. It should open the room-code form directly.

The host screen prints its current origin followed by `/play`, so opening the host on a protected preview deployment will also print a protected player link. Always run the host from the public production domain.

An unauthenticated CLI can create a public preview with `npx vercel deploy --temporary`, but Vercel deletes anonymous deployments after one hour. After expiration, the URL redirects to a Vercel page and can look like a login requirement. Claim the deployment from the URL printed by the CLI before it expires, then disable Deployment Protection for production. The owner signs in once to claim it; players never need to sign in.

Run `npm run deploy:public-preview` whenever an immediately public, login-free test URL is needed. This creates a new URL instead of reusing a protected Git preview deployment.
