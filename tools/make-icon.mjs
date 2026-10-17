/**
 * 生成 iOS 主屏图标：米色纸、朱红方块、纸色叉。
 * 4 倍超采样后缩小，边缘不会有锯齿。改配色时改这里再跑：
 *   node tools/make-icon.mjs
 */
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

const SIZE = 180;
const SS = 4;
const W = SIZE * SS;

const paper = [0xef, 0xe7, 0xd6];
const red = [0xc3, 0x3f, 0x28];

const big = new PNG({ width: W, height: W });

for (let y = 0; y < W; y++) {
  for (let x = 0; x < W; x++) {
    // 红块：留 11% 的纸边
    const inset = W * 0.11;
    const inSquare = x >= inset && x < W - inset && y >= inset && y < W - inset;

    // 叉：两条 45° 线，线宽 7% 的方块边长
    const thickness = W * 0.055;
    const dist1 = Math.abs(x - y) / Math.SQRT2;
    const dist2 = Math.abs(x + y - W) / Math.SQRT2;
    const inX =
      x > W * 0.28 && x < W * 0.72 && y > W * 0.28 && y < W * 0.72 &&
      (dist1 < thickness || dist2 < thickness);

    const c = inX ? paper : inSquare ? red : paper;
    const i = (y * W + x) << 2;
    big.data[i] = c[0];
    big.data[i + 1] = c[1];
    big.data[i + 2] = c[2];
    big.data[i + 3] = 255;
  }
}

const out = new PNG({ width: SIZE, height: SIZE });

for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const sum = [0, 0, 0];
    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const i = ((y * SS + sy) * W + (x * SS + sx)) << 2;
        sum[0] += big.data[i];
        sum[1] += big.data[i + 1];
        sum[2] += big.data[i + 2];
      }
    }
    const i = (y * SIZE + x) << 2;
    out.data[i] = Math.round(sum[0] / (SS * SS));
    out.data[i + 1] = Math.round(sum[1] / (SS * SS));
    out.data[i + 2] = Math.round(sum[2] / (SS * SS));
    out.data[i + 3] = 255;
  }
}

const target = path.resolve(import.meta.dirname, '..', 'public', 'apple-touch-icon.png');
writeFileSync(target, PNG.sync.write(out));
console.log(`wrote ${target}`);
