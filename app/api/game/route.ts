import { answer, createGame, getGame, hostAction, joinGame, publicGame } from "@/lib/game-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url); const game = await getGame(url.searchParams.get("code") ?? "");
  if (!game) return Response.json({ error: "Game not found." }, { status: 404 });
  const isHost = url.searchParams.get("token") === game.hostToken;
  return Response.json(publicGame(game, url.searchParams.get("playerId") ?? undefined, isHost), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === "create") { const game = await createGame(); return Response.json({ code: game.code, hostToken: game.hostToken, game: publicGame(game, undefined, true) }); }
    const game = await getGame(body.code ?? ""); if (!game) return Response.json({ error: "Game not found. Check the code and try again." }, { status: 404 });
    if (body.action === "join") { const result = await joinGame(game.code, String(body.name ?? "").trim()); return Response.json({ playerId: result.player.id, game: publicGame(result.game, result.player.id) }); }
    if (body.action === "answer") { const updated = await answer(game.code, body.playerId, body.value); return Response.json(publicGame(updated, body.playerId)); }
    if (body.hostToken !== game.hostToken) return Response.json({ error: "Host authorization failed." }, { status: 403 });
    const updated = await hostAction(game.code, body.action); return Response.json(publicGame(updated, undefined, true));
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Something went wrong." }, { status: 400 }); }
}
