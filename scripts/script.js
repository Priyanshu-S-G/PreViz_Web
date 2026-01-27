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
    const toolButtons = document.querySelectorAll('.tool-btn:not([data-role="kernel-dropdown"])');
    
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Get operation details from data attributes
            const operation = btn.dataset.operation;
            const category = btn.dataset.category;
            
            // Remove active state from all buttons
            document.querySelectorAll('.tool-btn')
                .forEach(b => b.classList.remove('active'));
            
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

    // Kernel filter drop-up handling
    // ------------------ KERNEL: body-mounted drop-up (robust) ------------------
    const kernelBtn = document.getElementById('kernel-main-btn');
    const kernelMenu = document.getElementById('kernel-menu');
    const kernelCategory = document.getElementById('kernel-category');

    if (kernelBtn && kernelMenu && kernelCategory) {
    // Guard: ensure we only bind once (prevents duplicate handlers on hot-reload)
    if (!kernelBtn.dataset.dropdownBound) {
        kernelBtn.dataset.dropdownBound = '1';

        // helper: open menu as child of body, positioned above the kernel category
        function openKernelMenuBody() {
        if (kernelMenu.parentElement === document.body) {
            closeKernelMenuBody();
            return;
        }

        // Move menu to body
        document.body.appendChild(kernelMenu);

        // Prepare menu for measurement:
        kernelMenu.classList.remove('hidden');
        kernelMenu.classList.add('body-anchored');

        // force it to be rendered but invisible
        kernelMenu.style.display = 'block';
        kernelMenu.style.visibility = 'hidden';
        kernelMenu.style.left = '0px';
        kernelMenu.style.top = '0px';

        // Debugging lines (can remove later) to inspect computed style
        console.log('computed before measure:',
            window.getComputedStyle(kernelMenu).display,
            window.getComputedStyle(kernelMenu).visibility,
            'inline display:', kernelMenu.style.display,
            'inline visibility:', kernelMenu.style.visibility);

        // double rAF + a read to force reflow and let browser compute sizes
        requestAnimationFrame(() => {
            // force reflow
            const force = kernelMenu.offsetWidth;
            requestAnimationFrame(() => {
            const btnRect  = kernelBtn.getBoundingClientRect();
            const anchorRect = kernelCategory.getBoundingClientRect();
            const menuRect = kernelMenu.getBoundingClientRect();

            console.log('measure -> btnRect, anchorRect, menuRect', btnRect, anchorRect, menuRect);

            // if menu still has zero size, bail with a visible fallback
            if (!menuRect.width || !menuRect.height) {
                // fallback: place it above the kernel category left edge
                kernelMenu.style.left = (anchorRect.left + window.scrollX) + 'px';
                kernelMenu.style.top  = (btnRect.top + window.scrollY - 6 - 200) + 'px'; // arbitrary fallback
                kernelMenu.style.visibility = 'visible';
                console.warn('kernel menu measured 0 - using fallback placement');
                return;
            }

            // center horizontally on anchor (category)
            let left = Math.round(anchorRect.left + anchorRect.width / 2 - menuRect.width / 2);
            let top  = Math.round(btnRect.top - menuRect.height - 6); // drop-up

            // clamp horizontally
            const viewportWidth = document.documentElement.clientWidth;
            const padding = 6;
            if (left < padding) left = padding;
            if (left + menuRect.width + padding > viewportWidth) left = Math.max(padding, viewportWidth - menuRect.width - padding);

            // fallback to open downwards if not enough space above
            if (top < 8) {
                top = Math.round(btnRect.bottom + 6 + window.scrollY);
            }

            kernelMenu.style.left = left + 'px';
            kernelMenu.style.top  = top + 'px';
            kernelMenu.style.visibility = 'visible';

            // mark kernel button active
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            kernelBtn.classList.add('active');

            // attach close handlers
            window.addEventListener('resize', closeKernelMenuBody);
            window.addEventListener('scroll', closeKernelMenuBody, true);
            document.addEventListener('click', bodyClickCloseHandler);
            document.addEventListener('keydown', escCloseHandler);
            });
        });
        }

        function closeKernelMenuBody() {
        // only act if menu is currently in body
        if (kernelMenu.parentElement === document.body) {
            // hide menu using class (so CSS rules take effect)
            kernelMenu.classList.add('hidden');
            kernelMenu.classList.remove('body-anchored');

            // clear inline positioning and rendering overrides we set earlier
            kernelMenu.style.left = '';
            kernelMenu.style.top = '';
            kernelMenu.style.visibility = '';
            kernelMenu.style.display = '';  // <-- important to clear
            kernelMenu.style.position = '';

            // move it back into toolbar DOM so structure remains tidy
            kernelCategory.appendChild(kernelMenu);

            // cleanup listeners
            window.removeEventListener('resize', closeKernelMenuBody);
            window.removeEventListener('scroll', closeKernelMenuBody, true);
            document.removeEventListener('click', bodyClickCloseHandler);
            document.removeEventListener('keydown', escCloseHandler);
        }

        // clear visual active state
        kernelBtn.classList.remove('active');
        }

        function bodyClickCloseHandler(e) {
        if (!kernelMenu.contains(e.target) && !kernelBtn.contains(e.target)) {
            closeKernelMenuBody();
        }
        }

        function escCloseHandler(e) {
        if (e.key === 'Escape') closeKernelMenuBody();
        }

        // toggle handler on the kernel button
        kernelBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // avoid immediate click-close
        openKernelMenuBody();
        });

        // menu item handlers: close menu then open operation
        kernelMenu.querySelectorAll('.kernel-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const operation = item.dataset.op;

            // close menu first (restores DOM)
            closeKernelMenuBody();

            // then run existing UI flow
            if (typeof openOperationPanel === 'function') {
            openOperationPanel(operation, 'kernel');
            } else {
            console.warn('openOperationPanel function not found in uiHelpers.js');
            }
        });
        });
    } // end guard
    }
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
            
            // Edge operations
            case 'sobel':
                const useX = params['use-x'] !== false;
                const useY = params['use-y'] !== false;
                const sobelKsize = params['kernel-size'] || 3;
                result = sobelEdge(srcMat, useX, useY, sobelKsize);
                break;
            
            case 'prewitt':
                const prewittX = params['use-x'] !== false;
                const prewittY = params['use-y'] !== false;
                result = prewittEdge(srcMat, prewittX, prewittY);
                break;
            
            case 'canny':
                const lowThresh = params['low-threshold'] || 50;
                const highThresh = params['high-threshold'] || 150;
                result = cannyEdge(srcMat, lowThresh, highThresh);
                break;
            
            case 'laplace':
                result = laplacianEdge(srcMat); // Fixed ksize=3
                break;
            
            case 'log':
                result = logEdge(srcMat); // Fixed ksize=5
                break;
            
            case 'harris':
                const blockSize = params['block-size'] || 2;
                const kParam = params['k-param'] || 0.04;
                const threshold = params['threshold'] || 100;
                result = harrisCorners(srcMat, blockSize, kParam, threshold);
                break;
            
            // Morphological operations
            case 'dilate':
                const dilateKsize = params['kernel-size'] || 5;
                result = dilateImage(srcMat, dilateKsize);
                break;
            
            case 'erode':
                const erodeKsize = params['kernel-size'] || 5;
                result = erodeImage(srcMat, erodeKsize);
                break;
            
            case 'open':
                const openKsize = params['kernel-size'] || 5;
                result = openingImage(srcMat, openKsize);
                break;
            
            case 'close':
                const closeKsize = params['kernel-size'] || 5;
                result = closingImage(srcMat, closeKsize);
                break;
            
            case 'holefill':
                const holefillThresh = params['threshold'] || 127;
                result = holeFillImage(srcMat, holefillThresh);
                break;
            
            // KERNEL FILTERS
            case 'blur': // Box Filter (editor.html uses 'blur' for Box Filter)
                {
                    const k = parseInt(params['kernel-size']) || 3;
                    // kernelOps.boxMeanFilter expects (src, ksize)
                    result = boxMeanFilter(srcMat, k);
                }
                break;
            
            case 'gaussian':
                {
                    const k = parseInt(params['kernel-size']) || 5;
                    result = gaussianFilter(srcMat, k);
                }
                break;
            
            case 'median':
                {
                    const k = parseInt(params['kernel-size']) || 5;
                    result = medianFilter(srcMat, k);
                }
                break;

            case 'mean': // Weighted Avg (editor data-op = "mean")
                {
                    const k = parseInt(params['kernel-size']) || 5;
                    result = weightedAverageFilter(srcMat, k);
                }
                break;

            case 'max':
                {
                    const k = parseInt(params['kernel-size']) || 3;
                    result = maxFilter(srcMat, k);
                }
                break;

            case 'min':
                {
                    const k = parseInt(params['kernel-size']) || 3;
                    result = minFilter(srcMat, k);
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
            
            // Edge operations
            case 'sobel':
                const useX = params['use-x'] !== false;
                const useY = params['use-y'] !== false;
                const sobelKsize = params['kernel-size'] || 3;
                result = sobelEdge(srcMat, useX, useY, sobelKsize);
                break;
            
            case 'prewitt':
                const prewittX = params['use-x'] !== false;
                const prewittY = params['use-y'] !== false;
                result = prewittEdge(srcMat, prewittX, prewittY);
                break;
            
            case 'canny':
                const lowThresh = params['low-threshold'] || 50;
                const highThresh = params['high-threshold'] || 150;
                result = cannyEdge(srcMat, lowThresh, highThresh);
                break;
            
            case 'laplace':
                result = laplacianEdge(srcMat); // Fixed ksize=3
                break;
            
            case 'log':
                result = logEdge(srcMat); // Fixed ksize=5
                break;
            
            case 'harris':
                const blockSize = params['block-size'] || 2;
                const kParam = params['k-param'] || 0.04;
                const threshold = params['threshold'] || 100;
                result = harrisCorners(srcMat, blockSize, kParam, threshold);
                break;
            
            // KERNEL FILTERS
            case 'blur': // Box Filter (editor.html uses 'blur' for Box Filter)
                {
                    const k = parseInt(params['kernel-size']) || 3;
                    // kernelOps.boxMeanFilter expects (src, ksize)
                    result = boxMeanFilter(srcMat, k);
                }
                break;
            
            case 'gaussian':
                {
                    const k = parseInt(params['kernel-size']) || 5;
                    result = gaussianFilter(srcMat, k);
                }
                break;
            
            case 'median':
                {
                    const k = parseInt(params['kernel-size']) || 5;
                    result = medianFilter(srcMat, k);
                }
                break;

            case 'mean': // Weighted Avg (editor data-op = "mean")
                {
                    const k = parseInt(params['kernel-size']) || 5;
                    result = weightedAverageFilter(srcMat, k);
                }
                break;

            case 'max':
                {
                    const k = parseInt(params['kernel-size']) || 3;
                    result = maxFilter(srcMat, k);
                }
                break;

            case 'min':
                {
                    const k = parseInt(params['kernel-size']) || 3;
                    result = minFilter(srcMat, k);
                }
                break;
            
            // Morphological operations
            case 'dilate':
                const dilateKsize = params['kernel-size'] || 5;
                result = dilateImage(srcMat, dilateKsize);
                break;
            
            case 'erode':
                const erodeKsize = params['kernel-size'] || 5;
                result = erodeImage(srcMat, erodeKsize);
                break;
            
            case 'open':
                const openKsize = params['kernel-size'] || 5;
                result = openingImage(srcMat, openKsize);
                break;
            
            case 'close':
                const closeKsize = params['kernel-size'] || 5;
                result = closingImage(srcMat, closeKsize);
                break;
            
            case 'holefill':
                const holefillThresh = params['threshold'] || 127;
                result = holeFillImage(srcMat, holefillThresh);
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