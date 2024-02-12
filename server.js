const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer((req, res) => {
  const ext = path.extname(req.url);

  if (!ext) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const filePath = path.join(__dirname, req.url);
  const hasFile = fs.existsSync(filePath);

  if (hasFile) {
    res.writeHead(200, { "Content-Type": getMimeType(ext) });
    res.end(fs.readFileSync(filePath), "utf-8");
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = 3006;

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

function getMimeType(extname) {
  switch (extname) {
    case ".js":
      return "text/javascript";
    case ".css":
      return "text/css";
    case ".json":
      return "application/json";
    case ".png":
      return "image/png";
    case ".jpg":
      return "image/jpg";
    default: {
      return "text/html";
    }
  }
}
