import { assetsDir } from "@/lib/directories.ts";
import { resetFiles } from "@/lib/files.ts";
import { commandRoutes } from "@/routes/commands/mod.ts";
import { wsRoutes } from "@/routes/ws/mod.ts";
import { Hono } from "@hono/hono";
import { serveStatic } from "@hono/hono/deno";
import { logger } from "@hono/hono/logger";
import { relative } from "@std/path";

const app = new Hono();

app.use(logger());

app.use(
  "/voicelines/*",
  serveStatic({ root: relative(Deno.cwd(), assetsDir) })
);

app.route("/", commandRoutes);
app.route("/", wsRoutes);

console.log("Deleting uploaded files...");
await resetFiles();

Deno.serve(app.fetch);
