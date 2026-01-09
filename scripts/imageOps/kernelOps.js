// kernelOps.js - box/weighted/median/gaussian/max/min filters

function boxMeanFilter(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let k = new cv.Size(ksize, ksize);

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.blur(gray, dst, k);

  gray.delete();
  return dst;
}

function weightedAverageFilter(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let k = new cv.Size(ksize, ksize);

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  // Gaussian with fixed sigma → weighted average
  cv.GaussianBlur(gray, dst, k, 0, 0, cv.BORDER_DEFAULT);

  gray.delete();
  return dst;
}

function medianFilter(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.medianBlur(gray, dst, ksize);

  gray.delete();
  return dst;
}

function gaussianFilter(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let k = new cv.Size(ksize, ksize);

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.GaussianBlur(gray, dst, k, 0, 0, cv.BORDER_DEFAULT);

  gray.delete();
  return dst;
}

function maxFilter(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let kernel = cv.Mat.ones(ksize, ksize, cv.CV_8U);

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.dilate(gray, dst, kernel);

  gray.delete();
  kernel.delete();
  return dst;
}

function minFilter(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let kernel = cv.Mat.ones(ksize, ksize, cv.CV_8U);

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.erode(gray, dst, kernel);

  gray.delete();
  kernel.delete();
  return dst;
}

window.boxMeanFilter = boxMeanFilter;
window.weightedAverageFilter = weightedAverageFilter;
window.medianFilter = medianFilter;
window.gaussianFilter = gaussianFilter;
window.maxFilter = maxFilter;
window.minFilter = minFilter;
