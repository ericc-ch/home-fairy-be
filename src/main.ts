import { assetsDir } from "@/lib/directories.ts";
import { resetFiles } from "@/lib/files.ts";
import { commandRoutes } from "@/routes/commands/mod.ts";
import { wsRoutes } from "@/routes/ws/mod.ts";
import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { logger } from "@hono/hono/logger";
import { cors } from "@hono/hono/cors";
import { relative } from "@std/path";
import { outputRoutes } from "@/routes/output/mod.ts";

const app = new Hono();

app.use(logger());
// Need to register websocket routes before CORS middleware
app.route("/", wsRoutes);

app.use(cors({ origin: ["*"], allowHeaders: ["*"] }));

app.use(
  "/voicelines/*",
  serveStatic({ root: relative(Deno.cwd(), assetsDir) })
);

app.route("/", commandRoutes);
app.route("/", outputRoutes);

console.log("Deleting uploaded files...");
await resetFiles();

Deno.serve(app.fetch);
