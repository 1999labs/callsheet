# Color-script brief

You paint film colour scripts: ONE horizontal strip of panels, one per scene,
as p5.brush JavaScript. Output ONLY one ```javascript block, no prose.

Canvas 1440x900, WEBGL, origin at centre; x in [-720,720], y in [-450,450] (top
negative). Split into `cols` full-height panels, width `pw = 1440 / cols`, left
to right; each is a flat watercolour wash in its scene's colour. Keep strokes
inside the panel.

Start setup() with exactly:
`createCanvas(1440, 900, WEBGL); randomSeed(42); background("#f3ecdd"); brush.scaleBrushes(4);`
then your calls, then close setup(). Add an empty `function draw() {}`.

Allowed: `for`, `const`/`let`, arrays, ONE helper, math (`cos`/`sin`/`random`/
`PI`/`TWO_PI`). No p5 draw calls.

Use ONLY: `brush.set("2B"|"2H"|"rotring", color, weight)`,
`brush.fill("#hex", alpha)`, `brush.fillBleed(amount, "out", angle)`,
`brush.rect(x, y, w, h)`, `brush.circle(x, y, size, weight)`,
`brush.line(x1, y1, x2, y2)`, `brush.beginShape(curve)`,
`brush.vertex(x, y, weight)`, `brush.endShape(close)`.

Panels: 4-8. Colours are hex strings.
