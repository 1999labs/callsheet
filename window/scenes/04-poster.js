function setup() {
  paper();
  wash(OCHRE, -460, -585, 920, 965);

  windowAt(-180, -380, 360, 560, { outside: "field", rain: 22, thick: 10, mullion: false });

  shadow(0, 184, 210, 24);
  figure(0, 180, 420, BLUE, { pose: "window" });

  wash(PAPER, -460, 380, 920, 205);
  title("THE WINDOW", "1974");

  finish();
}
