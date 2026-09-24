const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const dist = path.join(root, "dist");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(root, "index.html"), path.join(dist, "index.html"));
fs.cpSync(path.join(root, "src"), path.join(dist, "src"), { recursive: true });
fs.copyFileSync(
  path.join(root, "Quayyum Ariyo Software Engineer.pdf"),
  path.join(dist, "Quayyum Ariyo Software Engineer.pdf"),
);

console.log("Built static site in dist/");
