function setup() {
  paper();
  wash(OCHRE, -460, -585, 920, 775);
  wash(TERRA, -460, 190, 920, 395);

  fillC(CREAM);
  rect(-180, -380, 360, 570);

  fillC(GREEN);
  rect(-180, 40, 360, 150);

  rain(-180, -380, 360, 570, 10, "#9aa678");

  shadow(0, 196, 200, 24);
  figure(0, 190, 430, BLUE, { pose: "window" });

  finish();
}
