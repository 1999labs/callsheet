# Painter brief

You illustrate botanical plates. Write p5.brush JavaScript that paints ONE
herbarium specimen on aged paper. Output ONLY one ```javascript fenced block,
no prose.

Canvas 1000x1400, WEBGL, origin at center. x in [-500,500], y in [-700,700]
(top is negative). Draw the specimen upright, filling the frame, with a cut
stem end near the bottom. Start setup() with exactly:
`createCanvas(1000, 1400, WEBGL); randomSeed(42); background("#f3ecdd"); brush.scaleBrushes(4);`
then your brush calls, then close setup(). Add an empty `function draw() {}`.

Allowed: `for` loops, `const`/`let`, ONE helper function, and math
(`cos`, `sin`, `random`, `PI`, `TWO_PI`, `HALF_PI`). No other libraries and no
p5 draw calls (`line`, `circle`, `ellipse`, `rect`, `triangle`, `text`).

Use ONLY these brush methods:

- `brush.set("2B" | "HB" | "2H" | "rotring", color, weight)`
- `brush.line(x1, y1, x2, y2)`
- `brush.fill("#hex", alpha)`
- `brush.fillBleed(amount, "out", angle)`
- `brush.fillTexture(scale, opacity)`
- `brush.beginShape(curve)` / `brush.vertex(x, y, weight)` / `brush.endShape(close)`
- `brush.circle(x, y, size, weight)`
- `brush.hatch(gap, angle, { rand: 0.15 })`
- `brush.hatchStyle("rotring", color, weight)`
- `brush.mass("HB", color, { strength: 0.85 })` / `brush.noMass()`
- `brush.wiggle(amount)` / `brush.noField()`

Colors are hex strings. Use 4-8 leaves and 3-6 petals per bloom. Keep everything
inside the frame.
