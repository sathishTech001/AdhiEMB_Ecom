/**
 * Fast Marching / Telea Inpainting Algorithm Implementation for HTML5 Canvas
 * Performs content-aware pixel reconstruction across masked boundaries.
 */

export interface InpaintOptions {
  radius?: number;
  fastMode?: boolean;
}

export function inpaintImageData(
  imageCtx: CanvasRenderingContext2D,
  maskCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: InpaintOptions = {}
): ImageData {
  const radius = options.radius || 4;
  const imgData = imageCtx.getImageData(0, 0, width, height);
  const maskData = maskCtx.getImageData(0, 0, width, height);

  const img = imgData.data;
  const mask = maskData.data;

  // 0: KNOWN, 1: BAND (boundary), 2: INSIDE (masked)
  const flag = new Uint8Array(width * height);
  const dist = new Float32Array(width * height);

  const INSIDE = 2;
  const BAND = 1;
  const KNOWN = 0;

  let hasMask = false;

  // 1. Initialize flags based on mask channel (alpha or red threshold)
  for (let i = 0; i < width * height; i++) {
    const maskAlpha = mask[i * 4 + 3];
    const maskRed = mask[i * 4];
    if (maskAlpha > 30 || maskRed > 100) {
      flag[i] = INSIDE;
      dist[i] = 1e6;
      hasMask = true;
    } else {
      flag[i] = KNOWN;
      dist[i] = 0;
    }
  }

  if (!hasMask) {
    return imgData;
  }

  // 2. Identify boundary pixels (BAND)
  const bandList: number[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (flag[idx] === INSIDE) {
        let isBoundary = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (flag[nidx] === KNOWN) {
                isBoundary = true;
                break;
              }
            }
          }
          if (isBoundary) break;
        }

        if (isBoundary) {
          flag[idx] = BAND;
          dist[idx] = 1.0;
          bandList.push(idx);
        }
      }
    }
  }

  // 3. Propagate inward and reconstruct colors
  let step = 0;
  const maxSteps = width * height;

  while (bandList.length > 0 && step < maxSteps) {
    step++;

    // Find pixel with minimum distance in BAND
    let minIdx = 0;
    let minDist = dist[bandList[0]];
    for (let i = 1; i < bandList.length; i++) {
      if (dist[bandList[i]] < minDist) {
        minDist = dist[bandList[i]];
        minIdx = i;
      }
    }

    const currentIdx = bandList.splice(minIdx, 1)[0];
    flag[currentIdx] = KNOWN;

    const cx = currentIdx % width;
    const cy = Math.floor(currentIdx / width);

    // Reconstruct pixel color from surrounding KNOWN pixels
    let rSum = 0, gSum = 0, bSum = 0, aSum = 0, weightSum = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const dSq = dx * dx + dy * dy;
        if (dSq > radius * radius) continue;

        const nx = cx + dx;
        const ny = cy + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (flag[nidx] === KNOWN && dist[nidx] < dist[currentIdx]) {
            const distance = Math.sqrt(dSq);
            const w = 1.0 / (1.0 + distance * distance);

            const pIdx = nidx * 4;
            rSum += img[pIdx] * w;
            gSum += img[pIdx + 1] * w;
            bSum += img[pIdx + 2] * w;
            aSum += img[pIdx + 3] * w;
            weightSum += w;
          }
        }
      }
    }

    if (weightSum > 0) {
      const cIdx = currentIdx * 4;
      img[cIdx] = Math.round(rSum / weightSum);
      img[cIdx + 1] = Math.round(gSum / weightSum);
      img[cIdx + 2] = Math.round(bSum / weightSum);
      img[cIdx + 3] = Math.round(aSum / weightSum);
    }

    // Add surrounding INSIDE neighbors to BAND
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (flag[nidx] === INSIDE) {
            flag[nidx] = BAND;
            dist[nidx] = dist[currentIdx] + 1.0;
            bandList.push(nidx);
          }
        }
      }
    }
  }

  // 4. Subtle bilateral smoothing for natural embroidery surface texture
  const smoothed = new Uint8ClampedArray(img);
  for (let i = 0; i < width * height; i++) {
    if (mask[i * 4 + 3] > 30 || mask[i * 4] > 100) {
      const x = i % width;
      const y = Math.floor(i / width);
      let r = 0, g = 0, b = 0, count = 0;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += img[idx];
            g += img[idx + 1];
            b += img[idx + 2];
            count++;
          }
        }
      }

      if (count > 0) {
        smoothed[i * 4] = Math.round(r / count);
        smoothed[i * 4 + 1] = Math.round(g / count);
        smoothed[i * 4 + 2] = Math.round(b / count);
      }
    }
  }

  return new ImageData(smoothed, width, height);
}
