// basicOps.js - color/gray transforms, invert, transpose, BGR/RGB, Quantize, HistEq (placeholders)
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
  let dst = new cv.Mat();z
  cv.transpose(src, dst);
  return dst;
}

window.colorToGray = colorToGray;
window.invertImage = invertImage;
window.transposeImage = transposeImage;