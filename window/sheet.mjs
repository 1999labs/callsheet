import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const plates = [
  ["01-seed.png", "i. the seed"],
  ["02-medium.png", "ii. the medium"],
  ["03-drift.png", "iii. the drift"],
  ["04-poster.png", "iv. the poster"],
];

const cells = plates.map(([file, label]) => `
  <figure>
    <img src="file://${resolve("window/frames", file)}">
    <figcaption>${label}</figcaption>
  </figure>`).join("");

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @page { margin: 0 }
  html, body { margin: 0; background: #eee6d6; }
  body { width: 1350px; padding: 46px 50px 54px; box-sizing: border-box;
         font-family: Georgia, serif; color: #2a2622; }
  h1 { margin: 0 0 6px; font-size: 26px; font-weight: normal; letter-spacing: .08em; }
  .sub { margin: 0 0 34px; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; opacity: .55; }
  .grid { display: grid; grid-template-columns: 600px 600px; gap: 34px 50px; }
  figure { margin: 0; }
  img { width: 600px; display: block; box-shadow: 0 1px 0 rgba(0,0,0,.12); }
  figcaption { margin-top: 12px; font-size: 14px; letter-spacing: .12em; text-transform: uppercase; opacity: .6; }
</style></head>
<body>
  <h1>THE WINDOW</h1>
  <p class="sub">style plates &middot; mark kit &middot; 1974</p>
  <div class="grid">${cells}</div>
</body></html>`;

await writeFile("window/sheet.html", html);

const browser = await chromium.launch({ args: ["--allow-file-access-from-files", "--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1350, height: 1700 }, deviceScaleFactor: 2 });
await page.goto("file://" + resolve("window/sheet.html"), { waitUntil: "networkidle" });
await page.waitForTimeout(300);
await page.screenshot({ path: "window/frames/sheet.png", fullPage: true });
await browser.close();
console.log("sheet -> window/frames/sheet.png");
