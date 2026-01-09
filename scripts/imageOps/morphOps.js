// morphOps.js - dilate/erode/open/close/holeFill (placeholders)

function dilateImage(src, ksize) {
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

function erodeImage(src, ksize) {
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

function openingImage(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let kernel = cv.Mat.ones(ksize, ksize, cv.CV_8U);

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.morphologyEx(gray, dst, cv.MORPH_OPEN, kernel);

  gray.delete();
  kernel.delete();
  return dst;
}

function closingImage(src, ksize) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let kernel = cv.Mat.ones(ksize, ksize, cv.CV_8U);

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.morphologyEx(gray, dst, cv.MORPH_CLOSE, kernel);

  gray.delete();
  kernel.delete();
  return dst;
}

/*
 Hole Filling (binary-based):
 - Threshold to binary
 - Flood fill background
 - Invert + OR to fill holes
*/
function holeFillImage(src, thresh) {
  let gray = new cv.Mat();
  let binary = new cv.Mat();
  let floodFilled = new cv.Mat();
  let floodFillMask = new cv.Mat();
  let inverted = new cv.Mat();
  let dst = new cv.Mat();

  // ensure grayscale
  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  // threshold to binary
  cv.threshold(gray, binary, thresh, 255, cv.THRESH_BINARY);

  // copy for flood fill
  binary.copyTo(floodFilled);

  // mask must be 2 pixels larger
  floodFillMask = new cv.Mat.zeros(
    floodFilled.rows + 2,
    floodFilled.cols + 2,
    cv.CV_8U
  );

  // flood fill from top-left corner (background)
  cv.floodFill(
    floodFilled,
    floodFillMask,
    new cv.Point(0, 0),
    new cv.Scalar(255)
  );

  // invert flood-filled image
  cv.bitwise_not(floodFilled, inverted);

  // combine with original binary image
  cv.bitwise_or(binary, inverted, dst);

  gray.delete();
  binary.delete();
  floodFilled.delete();
  floodFillMask.delete();
  inverted.delete();

  return dst;
}

window.dilateImage = dilateImage;
window.erodeImage = erodeImage;
window.openingImage = openingImage;
window.closingImage = closingImage;
window.holeFillImage = holeFillImage;
