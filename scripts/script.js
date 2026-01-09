// script.js - glue (placeholder)
/*
function initEditor(){ console.log('initEditor placeholder'); }
document.addEventListener('DOMContentLoaded', initEditor);
*/

// Main application logic for PreViz editor

// Global flag to track OpenCV status
let opencvReady = false;

// This function is called by OpenCV.js when it's ready
function onOpenCvReady() {
    opencvReady = true;
    console.log('[script.js] OpenCV.js loaded successfully');
    initializeApp();
}

// Backup: If OpenCV is already loaded before this script runs
if (typeof cv !== 'undefined' && cv.Mat) {
    console.log('[script.js] OpenCV already loaded');
    onOpenCvReady();
}

function initializeApp() {
    // Initialize canvases
    const inputCanvas = document.getElementById('input-canvas');
    const outputCanvas = document.getElementById('output-canvas');

    // Check if image exists in sessionStorage
    const imageDataURL = sessionStorage.getItem('previz_image');
    
    if (!imageDataURL) {
        // No image uploaded - redirect to upload page
        alert('No image loaded. Redirecting to upload page.');
        window.location.href = 'index.html';
        return;
    }
    
    // Load image from sessionStorage
    loadImageFromDataURL(imageDataURL);

    // Initialize event listeners
    setupTopBarHandlers();
    setupToolbarHandlers();
    setupPanelHandlers();
}

/**
 * Load image from DataURL and convert to cv.Mat
 * Keeps original dimensions, scales display to fit canvas
 */
function loadImageFromDataURL(dataURL) {
    console.log('[script.js] Starting image load from DataURL...');
    
    if (!opencvReady) {
        console.error('[script.js] OpenCV not ready! Cannot load image.');
        alert('OpenCV.js is still loading. Please wait a moment and try again.');
        return;
    }
    
    const img = new Image();
    
    img.onload = () => {
        console.log(`[script.js] Image loaded: ${img.width}x${img.height}`);
        
        try {
            const inputCanvas = document.getElementById('input-canvas');
            const outputCanvas = document.getElementById('output-canvas');
            const inputCtx = inputCanvas.getContext('2d');
            const outputCtx = outputCanvas.getContext('2d');
            
            // Clear canvases
            inputCtx.clearRect(0, 0, 512, 384);
            outputCtx.clearRect(0, 0, 512, 384);
            
            // Calculate scaling to fit 512x384 while maintaining aspect ratio
            const scale = Math.min(512 / img.width, 384 / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;
            const offsetX = (512 - scaledWidth) / 2;
            const offsetY = (384 - scaledHeight) / 2;
            
            console.log(`[script.js] Scale: ${scale.toFixed(3)}, Display size: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}`);
            
            // Draw scaled image to input canvas for display
            inputCtx.fillStyle = '#ffffff';
            inputCtx.fillRect(0, 0, 512, 384);
            inputCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
            
            // Create temporary canvas with original dimensions for OpenCV processing
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            
            console.log('[script.js] Converting to cv.Mat...');
            
            // Convert full-resolution image to cv.Mat
            const mat = cv.imread(tempCanvas);
            
            console.log(`[script.js] Mat created: ${mat.cols}x${mat.rows}, channels: ${mat.channels()}`);
            
            // Set as source in state (stores full resolution)
            setSource(mat);
            
            // Display scaled version on output canvas initially
            outputCtx.fillStyle = '#ffffff';
            outputCtx.fillRect(0, 0, 512, 384);
            outputCtx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
            
            // Clean up
            mat.delete();
            
            console.log(`[script.js] ✓ Image loaded successfully!`);
            console.log(`[script.js] Full-resolution stored: ${img.width}x${img.height}`);
            console.log(`[script.js] Display scaled to: ${scaledWidth.toFixed(0)}x${scaledHeight.toFixed(0)}`);
        } catch (error) {
            console.error('[script.js] Error processing image:', error);
            alert('Failed to process image. Error: ' + error.message);
        }
    };
    
    img.onerror = () => {
        console.error('[script.js] Failed to load image from DataURL');
        alert('Failed to load image. Please try uploading again.');
        window.location.href = 'index.html';
    };
    
    img.src = dataURL;
}

function drawPlaceholder(ctx, text) {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, 512, 384);
    ctx.fillStyle = '#999';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(text, 256, 192);
}

/**
 * Display cv.Mat on canvas with scaling to fit
 * @param {string} canvasId - Canvas element ID
 * @param {cv.Mat} mat - OpenCV Mat to display
 */
function displayMat(canvasId, mat) {
    if (!mat) {
        console.warn(`[script.js] Cannot display null mat on ${canvasId}`);
        return;
    }
    
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    
    // Create temporary canvas for the mat
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = mat.cols;
    tempCanvas.height = mat.rows;
    
    // Show mat on temp canvas
    cv.imshow(tempCanvas, mat);
    
    // Clear target canvas
    ctx.clearRect(0, 0, 512, 384);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 384);
    
    // Calculate scaling to fit 512x384
    const scale = Math.min(512 / mat.cols, 384 / mat.rows);
    const scaledWidth = mat.cols * scale;
    const scaledHeight = mat.rows * scale;
    const offsetX = (512 - scaledWidth) / 2;
    const offsetY = (384 - scaledHeight) / 2;
    
    // Draw scaled image
    ctx.drawImage(tempCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
}

// Make displayMat available globally for operation modules
window.displayMat = displayMat;
window.previewCurrentOperation = previewCurrentOperation;
window.applyCurrentOperation = applyCurrentOperation;

// Top bar button handlers
function setupTopBarHandlers() {
    document.getElementById('btn-clear-output').addEventListener('click', () => {
        // Reset output state
        resetOutput();
        
        // Display source image on output canvas (scaled)
        const srcMat = getSourceMat();
        if (srcMat) {
            displayMat('output-canvas', srcMat);
        } else {
            const outputCanvas = document.getElementById('output-canvas');
            const ctx = outputCanvas.getContext('2d');
            drawPlaceholder(ctx, 'Output Cleared');
        }
        
        // Hide "Use Output as Input" button
        document.getElementById('btn-use-output-as-input').style.display = 'none';
        
        // Close panel
        closeOperationPanel();
        
        console.log('[script.js] Output cleared');
    });

    document.getElementById('btn-new-upload').addEventListener('click', () => {
        // Confirm before leaving
        if (confirm('Return to upload page? Current work will be lost.')) {
            // Clear session storage
            sessionStorage.removeItem('previz_image');
            sessionStorage.removeItem('previz_filename');
            
            // Redirect to index.html
            window.location.href = 'index.html';
        }
    });
    
    document.getElementById('btn-use-output-as-input').addEventListener('click', () => {
        const dstMat = getResultMat();
        
        if (!dstMat) {
            alert('No output available to use as input');
            return;
        }
        
        if (confirm('Replace input image with current output? This cannot be undone.')) {
            // Clone the result mat
            const newSrc = dstMat.clone();
            
            // Set as new source
            setSource(newSrc);
            
            // Display on input canvas
            displayMat('input-canvas', newSrc);
            
            // Clear output (since it's now the input)
            resetOutput();
            displayMat('output-canvas', newSrc);
            
            // Hide the button
            document.getElementById('btn-use-output-as-input').style.display = 'none';
            
            // Clean up
            newSrc.delete();
            
            console.log('[script.js] Output replaced input image');
            alert('Output is now the new input image');
        }
    });

    document.getElementById('btn-download-output').addEventListener('click', () => {
        // Get the active mat (result if exists, else source)
        const activeMat = getActiveMat();
        
        if (!activeMat) {
            alert('No image to download.');
            return;
        }
        
        // Create temporary canvas with original dimensions
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = activeMat.cols;
        tempCanvas.height = activeMat.rows;
        
        // Draw mat to temp canvas
        cv.imshow(tempCanvas, activeMat);
        
        // Create download link
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        link.download = `previz-output-${timestamp}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
        
        console.log('[script.js] Image downloaded');
    });
}

// Toolbar button handlers
function setupToolbarHandlers() {
    const toolButtons = document.querySelectorAll('.tool-btn');
    
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Get operation details from data attributes
            const operation = btn.dataset.operation;
            const category = btn.dataset.category;
            
            // Remove active state from all buttons
            toolButtons.forEach(b => b.classList.remove('active'));
            
            // Add active state to clicked button
            btn.classList.add('active');
            
            // Open panel with appropriate configuration
            // This function should be defined in uiHelpers.js
            if (typeof openOperationPanel === 'function') {
                openOperationPanel(operation, category);
            } else {
                console.warn('openOperationPanel function not found in uiHelpers.js');
            }
        });
    });
}

// Panel control handlers
function setupPanelHandlers() {
    const panel = document.getElementById('options-panel');
    const closeBtn = document.getElementById('panel-close-btn');
    const cancelBtn = document.getElementById('btn-cancel');
    const previewBtn = document.getElementById('btn-preview');
    const applyBtn = document.getElementById('btn-apply');

    // Close panel
    function closePanel() {
        panel.classList.remove('open');
        const panelControls = document.getElementById('panel-controls');
        panelControls.classList.remove('active');
        
        // Remove active state from all tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    closeBtn.addEventListener('click', closePanel);
    cancelBtn.addEventListener('click', closePanel);

    // Preview operation
    previewBtn.addEventListener('click', () => {
        previewCurrentOperation();
    });

    // Apply operation
    applyBtn.addEventListener('click', () => {
        applyCurrentOperation();
    });
}

/**
 * Preview the current operation (temporary, uses source)
 */
function previewCurrentOperation() {
    const srcMat = getSourceMat();
    
    if (!srcMat) {
        alert('No source image available');
        return;
    }
    
    const operation = getCurrentOperation();
    
    if (!operation) {
        alert('No operation selected');
        return;
    }
    
    console.log(`[script.js] Previewing operation: ${operation}`);
    
    try {
        // Get control values from UI
        const params = getControlValues();
        
        // Call the appropriate operation function
        let result = null;
        
        switch(operation) {
            // Basic operations
            case 'colorToGray':
                result = colorToGray(srcMat);
                break;
            case 'invert':
                result = invertImage(srcMat);
                break;
            case 'transpose':
                result = transposeImage(srcMat);
                break;
            case 'bgrRgb':
                result = swapBGRRGB(srcMat);
                break;
            case 'quantize':
                const levels = params['levels'] || 8;
                result = quantizeImage(srcMat, levels);
                break;
            case 'histEq':
                result = histogramEqualization(srcMat);
                
                // Show histogram comparison if checkbox is checked
                if (params['show-histogram']) {
                    setTimeout(() => {
                        drawHistogramComparison(srcMat, result);
                    }, 100);
                }
                break;
            
            // Add other operations here as they're implemented
            default:
                alert(`Operation "${operation}" not yet implemented`);
                return;
        }
        
        if (result) {
            // Display result on output canvas
            displayMat('output-canvas', result);
            
            // Clean up
            result.delete();
            
            console.log(`[script.js] ✓ Preview complete`);
        }
        
    } catch (error) {
        console.error('[script.js] Preview error:', error);
        alert('Error during preview: ' + error.message);
    }
}

/**
 * Apply the current operation permanently (saves to state, keeps source unchanged)
 */
function applyCurrentOperation() {
    const srcMat = getSourceMat();
    
    if (!srcMat) {
        alert('No source image available');
        return;
    }
    
    const operation = getCurrentOperation();
    
    if (!operation) {
        alert('No operation selected');
        return;
    }
    
    console.log(`[script.js] Applying operation: ${operation}`);
    
    try {
        // Get control values from UI
        const params = getControlValues();
        
        // Call the appropriate operation function
        let result = null;
        
        switch(operation) {
            // Basic operations
            case 'colorToGray':
                result = colorToGray(srcMat);
                break;
            case 'invert':
                result = invertImage(srcMat);
                break;
            case 'transpose':
                result = transposeImage(srcMat);
                break;
            case 'bgrRgb':
                result = swapBGRRGB(srcMat);
                break;
            case 'quantize':
                const levels = params['levels'] || 8;
                result = quantizeImage(srcMat, levels);
                break;
            case 'histEq':
                result = histogramEqualization(srcMat);
                
                // Show histogram comparison if checkbox is checked
                if (params['show-histogram']) {
                    // Wait for result to be displayed first
                    setTimeout(() => {
                        drawHistogramComparison(srcMat, result);
                    }, 100);
                }
                break;
            
            // Add other operations here as they're implemented
            default:
                alert(`Operation "${operation}" not yet implemented`);
                return;
        }
        
        if (result) {
            // Store result in state (dstMat)
            setResult(result);
            
            // Display result on output canvas
            displayMat('output-canvas', result);
            
            // Show "Use Output as Input" button
            document.getElementById('btn-use-output-as-input').style.display = 'inline-block';
            
            // Don't delete result - it's now stored in state
            
            console.log(`[script.js] ✓ Operation applied`);
        }
        
    } catch (error) {
        console.error('[script.js] Apply error:', error);
        alert('Error applying operation: ' + error.message);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('[script.js] DOM loaded');
        // Check if OpenCV is already loaded
        if (opencvReady) {
            initializeApp();
        } else {
            console.log('[script.js] Waiting for OpenCV.js to load...');
            // OpenCV will call onOpenCvReady() when ready
        }
    });
} else {
    console.log('[script.js] DOM already loaded');
    // DOM already loaded
    if (opencvReady) {
        initializeApp();
    } else {
        console.log('[script.js] Waiting for OpenCV.js to load...');
    }
}