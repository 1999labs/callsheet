function CarduusSpinens_Thistle_Head_Thorny_Grey_Leaves_Violet_Crown_21_DAY_021_1400x1000_Ext_Clav_Path_Bright_Windy_0x1::setup() {
  createCanvas(1000, 1400, WEBGL);
  randomSeed(28141);
  background("#f3ecdd");
  brush.scaleBrushes(4);
  const fol = "#7f5f4a", pet = "#9a5a34", acc = "#6d3d1a", stm = "#b07aa8";
  brush.set("2B", stm, 0.8);
  for (let i = 0; i < 11; i++) {
    const x0 = -90 + i * 18;
    brush.line(x0, 640, x0 - 40 + i * 14, -560 - i * 8);
  }
  brush.set("2H", pet, 0.4);
  for (let i = 0; i < 20; i++) {
    const x = -160 + i * 16, y = -600 - (i % 5) * 16;
    brush.line(x, y, x + 6, y - 50);
  }
  brush.fill(acc, 50);
  brush.circle(-50, 640, 60, 0.6);
}

function CarduusSpinens_Thistle_Head_Thorny_Grey_Leaves_Violet_Crown_21_DAY_021_1400x1000_Ext_Clav_Path_Bright_Windy_0x1::draw() {}