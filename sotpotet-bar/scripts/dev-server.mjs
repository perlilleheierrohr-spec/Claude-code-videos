/*
  Minimal statisk dev-server — null avhengigheter, så `npm run dev`
  fungerer uten `npm install`. Serverer mappa /public.
*/
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROT = resolve(fileURLToPath(new URL("../public", import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const server = createServer(async (req, res) => {
  try {
    const sti = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    // Hindre at ".." tar oss ut av /public
    let fil = join(ROT, normalize(sti).replace(/^(\.\.[/\\])+/, ""));

    if (!resolve(fil).startsWith(ROT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }

    const info = await stat(fil).catch(() => null);
    if (info?.isDirectory()) fil = join(fil, "index.html");

    const innhold = await readFile(fil);
    res.writeHead(200, {
      "Content-Type": MIME[extname(fil).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(innhold);
  } catch {
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>404 — fant ikke fila</h1>");
  }
});

server.listen(PORT, () => {
  console.log(`\n  🍠  Søtpotet-baren kjører på http://localhost:${PORT}\n`);
});
