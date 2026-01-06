// state.js - Runtime memory + OpenCV Mats lifecycle
// Purpose: Manages cv.Mat objects and runtime state

// ============================================================================
// STATE VARIABLES
// ============================================================================

let srcMat = null;          // Original image (cv.Mat)
let dstMat = null;          // Last applied output (cv.Mat)
let previewMat = null;      // Small resized mat for fast preview
let currentOp = null;       // Current operation name (string)
let imageType = null;       // "color" | "gray" | "binary"

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Set source image and initialize state
 * @param {cv.Mat} mat - Source OpenCV Mat
 */
function setSource(mat) {
    // Clear old mats
    if (srcMat) srcMat.delete();
    if (dstMat) dstMat.delete();
    if (previewMat) previewMat.delete();
    
    // Clone the input mat to store as source
    srcMat = mat.clone();
    dstMat = null;
    previewMat = null;
    
    // Detect image type
    imageType = detectImageType(srcMat);
    
    console.log(`[state.js] Source set: ${srcMat.cols}x${srcMat.rows}, type: ${imageType}`);
}

/**
 * Set preview mat (downscaled version for fast preview)
 * @param {cv.Mat} mat - Preview OpenCV Mat
 */
function setPreview(mat) {
    // Delete old preview
    if (previewMat) previewMat.delete();
    
    // Store downscaled version
    previewMat = mat.clone();
    
    console.log(`[state.js] Preview set: ${previewMat.cols}x${previewMat.rows}`);
}

/**
 * Set result/output mat
 * @param {cv.Mat} mat - Result OpenCV Mat
 */
function setResult(mat) {
    // Delete old result
    if (dstMat) dstMat.delete();
    
    // Store new output
    dstMat = mat.clone();
    
    // Update image type based on result
    imageType = detectImageType(dstMat);
    
    console.log(`[state.js] Result set: ${dstMat.cols}x${dstMat.rows}, type: ${imageType}`);
}

/**
 * Get the currently active mat (dstMat if exists, else srcMat)
 * @returns {cv.Mat|null} Active mat
 */
function getActiveMat() {
    if (dstMat) {
        return dstMat;
    } else if (srcMat) {
        return srcMat;
    }
    return null;
}

/**
 * Get source mat
 * @returns {cv.Mat|null} Source mat
 */
function getSourceMat() {
    return srcMat;
}

/**
 * Get result/destination mat
 * @returns {cv.Mat|null} Result mat
 */
function getResultMat() {
    return dstMat;
}

/**
 * Get preview mat
 * @returns {cv.Mat|null} Preview mat
 */
function getPreviewMat() {
    return previewMat;
}

/**
 * Get current operation name
 * @returns {string|null} Operation name
 */
function getCurrentOperation() {
    return currentOp;
}

/**
 * Set current operation name
 * @param {string} operation - Operation name
 */
function setCurrentOperation(operation) {
    currentOp = operation;
    console.log(`[state.js] Current operation: ${operation}`);
}

/**
 * Get image type
 * @returns {string|null} Image type: "color" | "gray" | "binary"
 */
function getImageType() {
    return imageType;
}

/**
 * Check if current image is binary
 * @returns {boolean} True if binary
 */
function isBinary() {
    return imageType === 'binary';
}

/**
 * Check if current image is grayscale
 * @returns {boolean} True if grayscale
 */
function isGrayscale() {
    return imageType === 'gray' || imageType === 'binary';
}

/**
 * Check if current image is color
 * @returns {boolean} True if color
 */
function isColor() {
    return imageType === 'color';
}

/**
 * Reset all state (clear mats and metadata)
 */
function resetState() {
    console.log('[state.js] Resetting state...');
    
    // Delete all mats
    if (srcMat) {
        srcMat.delete();
        srcMat = null;
    }
    if (dstMat) {
        dstMat.delete();
        dstMat = null;
    }
    if (previewMat) {
        previewMat.delete();
        previewMat = null;
    }
    
    // Clear metadata
    currentOp = null;
    imageType = null;
    
    console.log('[state.js] State reset complete');
}

/**
 * Free all OpenCV mats (cleanup)
 */
function freeAll() {
    console.log('[state.js] Freeing all mats...');
    
    if (srcMat) {
        try { srcMat.delete(); } catch (e) { console.warn('Error deleting srcMat:', e); }
        srcMat = null;
    }
    if (dstMat) {
        try { dstMat.delete(); } catch (e) { console.warn('Error deleting dstMat:', e); }
        dstMat = null;
    }
    if (previewMat) {
        try { previewMat.delete(); } catch (e) { console.warn('Error deleting previewMat:', e); }
        previewMat = null;
    }
    
    console.log('[state.js] All mats freed');
}

/**
 * Reset output only (keep source)
 */
function resetOutput() {
    console.log('[state.js] Resetting output...');
    
    if (dstMat) {
        dstMat.delete();
        dstMat = null;
    }
    if (previewMat) {
        previewMat.delete();
        previewMat = null;
    }
    
    currentOp = null;
    
    // Reset image type to source
    if (srcMat) {
        imageType = detectImageType(srcMat);
    }
    
    console.log('[state.js] Output reset complete');
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Detect image type from OpenCV Mat
 * @param {cv.Mat} mat - OpenCV Mat
 * @returns {string} Image type: "color" | "gray" | "binary"
 */
function detectImageType(mat) {
    if (!mat) return null;
    
    const channels = mat.channels();
    
    // Check if binary (single channel with only 0 and 255 values)
    if (channels === 1) {
        // Sample some pixels to check if binary
        const isBinary = checkIfBinary(mat);
        return isBinary ? 'binary' : 'gray';
    }
    
    // Multi-channel (RGB/RGBA)
    return 'color';
}

/**
 * Check if a grayscale mat is binary
 * @param {cv.Mat} mat - Grayscale OpenCV Mat
 * @returns {boolean} True if binary
 */
function checkIfBinary(mat) {
    if (mat.channels() !== 1) return false;
    
    // Sample pixels (check first 100 pixels)
    const samples = Math.min(100, mat.rows * mat.cols);
    const data = mat.data;
    
    for (let i = 0; i < samples; i++) {
        const val = data[i];
        if (val !== 0 && val !== 255) {
            return false; // Found non-binary value
        }
    }
    
    return true;
}

/**
 * Get state summary for debugging
 * @returns {Object} State summary
 */
function getStateSummary() {
    return {
        hasSrc: srcMat !== null,
        hasDst: dstMat !== null,
        hasPreview: previewMat !== null,
        srcSize: srcMat ? `${srcMat.cols}x${srcMat.rows}` : null,
        dstSize: dstMat ? `${dstMat.cols}x${dstMat.rows}` : null,
        imageType: imageType,
        currentOp: currentOp
    };
}

// ============================================================================
// CLEANUP ON PAGE UNLOAD
// ============================================================================

window.addEventListener('beforeunload', () => {
    console.log('[state.js] Page unloading, cleaning up...');
    freeAll();
});

// ============================================================================
// EXPORTS (available globally)
// ============================================================================

// Make functions available globally
window.setSource = setSource;
window.setPreview = setPreview;
window.setResult = setResult;
window.getActiveMat = getActiveMat;
window.getSourceMat = getSourceMat;
window.getResultMat = getResultMat;
window.getPreviewMat = getPreviewMat;
window.getCurrentOperation = getCurrentOperation;
window.setCurrentOperation = setCurrentOperation;
window.getImageType = getImageType;
window.isBinary = isBinary;
window.isGrayscale = isGrayscale;
window.isColor = isColor;
window.resetState = resetState;
window.resetOutput = resetOutput;
window.freeAll = freeAll;
window.getStateSummary = getStateSummary;