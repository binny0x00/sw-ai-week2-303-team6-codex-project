import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml"
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  let pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  pathname = normalize(pathname).replace(/^(\.\.[/\\])+/, "");

  try {
    const filePath = join(root, pathname);
    const body = await readFile(filePath);
    const mimeType = mimeTypes[extname(filePath)] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": mimeType });
    res.end(body);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
});

server.listen(port, () => {
  console.log(`Civilization sim running at http://localhost:${port}`);
});
