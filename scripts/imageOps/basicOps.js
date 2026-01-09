// basicOps.js - color/gray transforms, invert, transpose, BGR/RGB, Quantize, HistEq
function colorToGray(src) {
  let dst = new cv.Mat();
  if (src.channels() === 1) {
    src.copyTo(dst);
  } else {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
  }
  return dst;
}

function invertImage(src) {
  let dst = new cv.Mat();
  cv.bitwise_not(src, dst);
  return dst;
}

function transposeImage(src) {
  let dst = new cv.Mat();
  cv.transpose(src, dst);
  return dst;
}

function swapBGRRGB(src) {
  let dst = new cv.Mat();

  if (src.channels() === 1) {
    // grayscale → no-op
    src.copyTo(dst);
    return dst;
  }

  if (src.channels() === 4) {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2BGRA);
  } else if (src.channels() === 3) {
    cv.cvtColor(src, dst, cv.COLOR_RGB2BGR);
  } else {
    src.copyTo(dst);
  }

  return dst;
}

function quantizeImage(src, levels) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();

  // Ensure grayscale
  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  // Clamp levels
  levels = Math.max(2, Math.min(256, levels));
  const step = Math.floor(256 / levels);

  // Manual quantization
  for (let i = 0; i < gray.rows; i++) {
    for (let j = 0; j < gray.cols; j++) {
      const val = gray.ucharPtr(i, j)[0];
      const q = Math.floor(val / step) * step;
      gray.ucharPtr(i, j)[0] = q;
    }
  }

  gray.copyTo(dst);
  gray.delete();

  return dst;
}

function histogramEqualization(src) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();

  // Ensure grayscale
  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.equalizeHist(gray, dst);
  gray.delete();

  return dst;
}

window.colorToGray = colorToGray;
window.invertImage = invertImage;
window.transposeImage = transposeImage;
window.swapBGRRGB = swapBGRRGB;
window.quantizeImage = quantizeImage;
window.histogramEqualization = histogramEqualization;
