function setup() {
  paper();
  wash(OCHRE, -460, -585, 920, 925);
  wash(TERRA, -460, 340, 920, 250);

  windowAt(-190, -520, 700, 860, {
    outside: "field",
    rain: 38,
    thick: 16,
    figures: [{ x: 90, baseY: 300, h: 300, col: "#4a4640" }]
  });

  finish();
}
