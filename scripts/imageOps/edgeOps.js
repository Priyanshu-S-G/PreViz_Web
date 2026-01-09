// edgeOps.js - sobel, prewitt, canny, harris
function sobelEdge(src, useX, useY, ksize) {
  let gray = new cv.Mat();
  let gradX = new cv.Mat();
  let gradY = new cv.Mat();
  let dst = new cv.Mat();

  // ensure grayscale
  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  // Sobel gradients
  if (useX) {
    cv.Sobel(gray, gradX, cv.CV_16S, 1, 0, ksize);
    cv.convertScaleAbs(gradX, gradX);
  }

  if (useY) {
    cv.Sobel(gray, gradY, cv.CV_16S, 0, 1, ksize);
    cv.convertScaleAbs(gradY, gradY);
  }

  // combine results
  if (useX && useY) {
    cv.addWeighted(gradX, 0.5, gradY, 0.5, 0, dst);
  } else if (useX) {
    gradX.copyTo(dst);
  } else if (useY) {
    gradY.copyTo(dst);
  } else {
    gray.copyTo(dst); // no direction selected
  }

  gray.delete();
  gradX.delete();
  gradY.delete();

  return dst;
}

function prewittEdge(src, useX, useY) {
  let gray = new cv.Mat();
  let gradX = new cv.Mat();
  let gradY = new cv.Mat();
  let dst = new cv.Mat();

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  // Prewitt kernels (3x3 base)
  let kernelX = cv.matFromArray(3, 3, cv.CV_32F, [
    -1, 0, 1,
    -1, 0, 1,
    -1, 0, 1
  ]);

  let kernelY = cv.matFromArray(3, 3, cv.CV_32F, [
     1,  1,  1,
     0,  0,  0,
    -1, -1, -1
  ]);

  if (useX) {
    cv.filter2D(gray, gradX, cv.CV_16S, kernelX);
    cv.convertScaleAbs(gradX, gradX);
  }

  if (useY) {
    cv.filter2D(gray, gradY, cv.CV_16S, kernelY);
    cv.convertScaleAbs(gradY, gradY);
  }

  if (useX && useY) {
    cv.addWeighted(gradX, 0.5, gradY, 0.5, 0, dst);
  } else if (useX) {
    gradX.copyTo(dst);
  } else if (useY) {
    gradY.copyTo(dst);
  } else {
    gray.copyTo(dst);
  }

  gray.delete();
  gradX.delete();
  gradY.delete();
  kernelX.delete();
  kernelY.delete();

  return dst;
}

function cannyEdge(src, lowThresh, highThresh) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();

  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  cv.Canny(gray, dst, lowThresh, highThresh);

  gray.delete();
  return dst;
}

function laplacianEdge(src, ksize = 3) {
  let gray = new cv.Mat();
  let lap = new cv.Mat();
  let dst = new cv.Mat();

  // ensure grayscale
  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  // Laplacian (CV_16S to capture negatives)
  cv.Laplacian(gray, lap, cv.CV_16S, ksize);
  cv.convertScaleAbs(lap, dst);

  gray.delete();
  lap.delete();

  return dst;
}

function logEdge(src, ksize = 5) {
  let gray = new cv.Mat();
  let blur = new cv.Mat();
  let lap = new cv.Mat();
  let dst = new cv.Mat();

  // ensure grayscale
  if (src.channels() === 1) {
    src.copyTo(gray);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
  }

  // Gaussian blur (sigma auto from kernel size)
  let k = new cv.Size(ksize, ksize);
  cv.GaussianBlur(gray, blur, k, 0, 0, cv.BORDER_DEFAULT);

  // Laplacian
  cv.Laplacian(blur, lap, cv.CV_16S);
  cv.convertScaleAbs(lap, dst);

  gray.delete();
  blur.delete();
  lap.delete();

  return dst;
}

window.logEdge = logEdge;

function harrisCorners(src, blockSize, k, thresh) {
  let gray = new cv.Mat();
  let dst = new cv.Mat();
  let dstNorm = new cv.Mat();
  let dstNormScaled = new cv.Mat();
  let color = new cv.Mat();

  if (src.channels() === 1) {
    src.copyTo(gray);
    cv.cvtColor(src, color, cv.COLOR_GRAY2RGBA);
  } else {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    src.copyTo(color);
  }

  cv.cornerHarris(gray, dst, blockSize, 3, k);
  cv.normalize(dst, dstNorm, 0, 255, cv.NORM_MINMAX);
  cv.convertScaleAbs(dstNorm, dstNormScaled);

  // mark corners
  for (let i = 0; i < dstNorm.rows; i++) {
    for (let j = 0; j < dstNorm.cols; j++) {
      if (dstNorm.ucharPtr(i, j)[0] > thresh) {
        color.ucharPtr(i, j)[0] = 255; // R
        color.ucharPtr(i, j)[1] = 0;   // G
        color.ucharPtr(i, j)[2] = 0;   // B
      }
    }
  }

  gray.delete();
  dst.delete();
  dstNorm.delete();
  dstNormScaled.delete();

  return color;
}

window.sobelEdge = sobelEdge;
window.prewittEdge = prewittEdge;
window.cannyEdge = cannyEdge;
window.laplacianEdge = laplacianEdge;
window.harrisCorners = harrisCorners;