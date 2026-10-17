// Image features for judging: decode a rendered PNG and describe the ink.
// Pure JS (pngjs) so the judge needs no Python/vision model to run.
import { PNG } from "pngjs";

const PAPER = [243, 236, 221]; // #f3ecdd
const INK_T = 26; // sum-abs distance from paper to count as "ink"

function rgb2hsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}

const round = (n, p = 4) => Math.round(n * 10 ** p) / 10 ** p;

// Returns a plain object of scalar features describing one plate.
export function extractFeatures(pngBuffer) {
  const png = PNG.sync.read(pngBuffer);
  const W = png.width;
  const H = png.height;
  const data = png.data;
  const N = W * H;

  const mask = new Uint8Array(N);
  const lum = new Float32Array(N);

  let ink = 0;
  let sx = 0;
  let sy = 0;
  let minX = W;
  let minY = H;
  let maxX = -1;
  let maxY = -1;
  let satSum = 0;
  let satN = 0;
  let top = 0;
  let bottom = 0;
  let left = 0;
  let right = 0;
  const hueBins = new Array(12).fill(0);
  const colors = new Set();

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      lum[y * W + x] = 0.299 * r + 0.587 * g + 0.114 * b;
      const d = Math.abs(r - PAPER[0]) + Math.abs(g - PAPER[1]) + Math.abs(b - PAPER[2]);
      if (d <= INK_T) continue;
      mask[y * W + x] = 1;
      ink++;
      sx += x;
      sy += y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (y < H / 2) top++;
      else bottom++;
      if (x < W / 2) left++;
      else right++;
      const [h, s, l] = rgb2hsl(r, g, b);
      if (s > 0.12 && l > 0.08 && l < 0.96) {
        satSum += s;
        satN++;
        hueBins[Math.min(11, Math.floor(h * 12))]++;
      }
      colors.add(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4));
    }
  }

  const cov = ink / N || 0;
  const cx = ink ? (sx / ink / (W - 1)) * 2 - 1 : 0;
  const cy = ink ? (sy / ink / (H - 1)) * 2 - 1 : 0;
  const bboxW = maxX >= 0 ? (maxX - minX) / W : 0;
  const bboxH = maxY >= 0 ? (maxY - minY) / H : 0;
  const bboxFill = ink ? ink / Math.max(1, (maxX - minX + 1) * (maxY - minY + 1)) : 0;
  const marginMin = ink ? Math.min(minX / W, minY / H, (W - maxX) / W, (H - maxY) / H) : 0;
  const clip = ink ? Number(minX <= 1 || minY <= 1 || maxX >= W - 2 || maxY >= H - 2) : 0;

  // hue concentration: 1 - normalized entropy of the hue histogram
  let hueConc = 0;
  if (satN > 0) {
    let H_ = 0;
    for (const c of hueBins) {
      if (!c) continue;
      const p = c / satN;
      H_ -= p * Math.log(p);
    }
    hueConc = 1 - H_ / Math.log(12);
  }

  // mean luminance gradient (detail/noise proxy) sampled on a 4x grid
  let edge = 0;
  let edgeN = 0;
  for (let y = 2; y < H - 2; y += 4) {
    for (let x = 2; x < W - 2; x += 4) {
      const base = y * W + x;
      edge += Math.abs(lum[base + 1] - lum[base - 1]) + Math.abs(lum[base + W] - lum[base - W]);
      edgeN++;
    }
  }
  const edgeDensity = edgeN ? edge / edgeN / 255 : 0;

  // horizontal mirror agreement of the ink mask
  let symAgree = 0;
  let symN = 0;
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W >> 1; x += 2) {
      if (mask[y * W + x] === mask[y * W + (W - 1 - x)]) symAgree++;
      symN++;
    }
  }
  const symmetry = symN ? symAgree / symN : 0;

  return {
    coverage: round(cov),
    cx: round(cx),
    cy: round(cy),
    bboxFill: round(bboxFill),
    bboxW: round(bboxW),
    bboxH: round(bboxH),
    marginMin: round(marginMin),
    clip,
    topCov: round(top / N),
    bottomCov: round(bottom / N),
    leftCov: round(left / N),
    rightCov: round(right / N),
    satMean: round(satN ? satSum / satN : 0),
    hueConc: round(hueConc),
    colorCount: colors.size,
    edgeDensity: round(edgeDensity),
    symmetry: round(symmetry),
    inkPixels: ink,
  };
}

// The scalar axes used for distance scoring (order matters only for stability).
export const FEATURE_AXES = [
  "coverage",
  "cx",
  "cy",
  "bboxFill",
  "topCov",
  "bottomCov",
  "leftCov",
  "rightCov",
  "satMean",
  "hueConc",
  "colorCount",
  "edgeDensity",
  "symmetry",
];
