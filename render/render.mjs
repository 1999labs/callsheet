import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const DEFAULT = {
  width: 1000,
  height: 1400,
  seed: 1,
  timeoutMs: Number(process.env.CALLSHEET_TIMEOUT_MS || 30000),
  settleMs: Number(process.env.CALLSHEET_SETTLE_MS || 400),
};

function buildHtml({ sketch, width, height, seed }) {
  const p5Path = resolve(ROOT, "node_modules/p5/lib/p5.min.js");
  const brushPath = resolve(ROOT, "node_modules/p5.brush/dist/p5.brush.js");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  canvas { display: block; }
</style>
</head>
<body>
<script>
  window.CALLSHEET = { W: ${width}, H: ${height}, SEED: ${seed} };
  window.__errors = [];
  window.addEventListener("error", function (e) {
    window.__errors.push(e.message || String(e.error) || "unknown error");
  });
</script>
<script src="file://${p5Path}"></script>
<script src="file://${brushPath}"></script>
<script>
  (function () {
    if (typeof window.createCanvas !== "function") return;
    var _cc = window.createCanvas;
    window.createCanvas = function (w, h, r) {
      return _cc(window.CALLSHEET.W, window.CALLSHEET.H, r);
    };
  })();
</script>
<script>
${sketch}
</script>
</body>
</html>`;
}

export async function renderSketch(sketch, opts = {}) {
  const { width, height, seed, timeoutMs, settleMs } = { ...DEFAULT, ...opts };

  await mkdir(join(__dirname, ".tmp"), { recursive: true });
  const tmpHtml = join(__dirname, ".tmp", `sketch-${randomUUID()}.html`);
  await writeFile(tmpHtml, buildHtml({ sketch, width, height, seed }), "utf8");

  const browser = await chromium.launch({
    args: [
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--no-sandbox",
    ],
  });

  try {
    const page = await browser.newPage({ viewport: { width, height } });
    let failure = null;
    page.on("pageerror", (err) => {
      failure = failure || String(err.message);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") failure = failure || msg.text().slice(0, 300);
    });

    await page.goto("file://" + tmpHtml, { waitUntil: "load", timeout: timeoutMs });

    const deadline = Date.now() + timeoutMs;
    let frames = 0;
    while (Date.now() < deadline) {
      frames = await page.evaluate(() => window.frameCount || 0).catch(() => 0);
      const pageErrs = await page.evaluate(() => window.__errors || []).catch(() => []);
      if (pageErrs.length) failure = failure || pageErrs[0];
      if (frames > 0 || failure) break;
      await page.waitForTimeout(150);
    }

    const canvasFound = await page
      .evaluate(() => !!document.querySelector("canvas"))
      .catch(() => false);

    let png = null;
    if (canvasFound) {
      await page.evaluate(() => { try { noLoop(); } catch {} }).catch(() => {});
      await page.waitForTimeout(settleMs);
      try {
        const client = await page.context().newCDPSession(page);
        const shot = await client.send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: false,
        });
        png = Buffer.from(shot.data, "base64");
      } catch (e) {
        console.error("cdp screenshot error:", e.message);
      }
    }

    return {
      ok: !failure && frames > 0 && png != null,
      errors: failure ? [failure] : frames > 0 ? [] : ["sketch did not draw (timeout)"],
      png,
    };
  } finally {
    await browser.close();
    writeFile(tmpHtml, "", "utf8").catch(() => {});
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { readFile } = await import("node:fs/promises");
  const [, , sketchPath, outPath] = process.argv;
  if (!sketchPath || !outPath) {
    console.error("usage: node render/render.mjs <sketch.js> <out.png>");
    process.exit(1);
  }
  const sketch = await readFile(resolve(sketchPath), "utf8");
  const result = await renderSketch(sketch);
  const out = resolve(outPath);
  if (result.png) {
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, result.png);
    console.log(result.ok ? `rendered -> ${out}` : `rendered with errors -> ${out}`);
  } else {
    console.log("no image produced");
  }
  if (result.errors.length) console.error(result.errors.join("\n"));
}
