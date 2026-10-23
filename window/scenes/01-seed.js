function setup() {
  paper();
  wash(OCHRE, -460, -585, 920, 775);
  wash(TERRA, -460, 190, 920, 400);

  windowAt(50, -430, 360, 520, { outside: "field", rain: 20, sill: true });

  wash(RUST, 14, -448, 52, 548);

  shadow(-40, 196, 200, 26);
  figure(-40, 190, 470, BLUE, { pose: "window" });

  finish();
}
