// Corrected setup function
function setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(42);
  background("#f3ecdd");
  brush.scaleBrushes(4);
}