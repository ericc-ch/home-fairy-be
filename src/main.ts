import { resetFiles } from "@/lib/files.ts";
import { commandRoutes } from "@/routes/commands/mod.ts";
import { wsRoutes } from "@/routes/ws/mod.ts";
import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";

const app = new Hono();

app.use(logger());
app.route("/", commandRoutes);
app.route("/", wsRoutes);

console.log("Deleting uploaded files...");
await resetFiles();

Deno.serve(app.fetch);
