// uiHelpers.js - Popup tab + visuals
// Purpose: All UI rendering that isn't raw HTML

// ============================================================================
// PANEL MANAGEMENT
// ============================================================================

let currentOperation = null;
let currentCategory = null;

/**
 * Open the right-side popup panel with operation-specific controls
 * @param {string} operation - The operation name (e.g., 'blur', 'sobel')
 * @param {string} category - The category (e.g., 'kernel', 'edge', 'morph')
 */
function openOperationPanel(operation, category) {
    currentOperation = operation;
    currentCategory = category;
    
    // Set current operation in state
    if (typeof setCurrentOperation === 'function') {
        setCurrentOperation(operation);
    }
    
    const panel = document.getElementById('options-panel');
    const panelTitle = document.getElementById('panel-title');
    const panelDescription = document.getElementById('panel-description');
    const panelControls = document.getElementById('panel-controls');
    
    // Get operation metadata (this should come from imageOps modules)
    const metadata = getOperationMetadata(operation, category);
    
    // Set panel header
    panelTitle.textContent = metadata.title;
    panelDescription.textContent = metadata.description;
    
    // Clear and rebuild controls
    panelControls.innerHTML = '';
    renderOperationControls(panelControls, metadata);
    
    // Show controls and open panel
    panelControls.classList.add('active');
    panel.classList.add('open');
}

/**
 * Close the popup panel
 */
function closeOperationPanel() {
    const panel = document.getElementById('options-panel');
    const panelControls = document.getElementById('panel-controls');
    
    panel.classList.remove('open');
    panelControls.classList.remove('active');
    
    currentOperation = null;
    currentCategory = null;
}

// ============================================================================
// OPERATION METADATA (temporary - will come from imageOps modules)
// ============================================================================

function getOperationMetadata(operation, category) {
    const metadata = {
        // Kernel Operations
        blur: {
            title: 'BOX BLUR',
            description: 'Simple averaging filter',
            controls: [
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 3, max: 21, step: 2, value: 5, hint: 'Must be odd' }
            ]
        },
        gaussian: {
            title: 'GAUSSIAN BLUR',
            description: 'Weighted blur using Gaussian kernel',
            controls: [
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 3, max: 21, step: 2, value: 5, hint: 'Must be odd' },
                //{ type: 'slider', id: 'sigma', label: 'Sigma (σ)', min: 0.1, max: 10, step: 0.1, value: 1.0, hint: 'Standard deviation' }
            ]
        },
        median: {
            title: 'MEDIAN FILTER',
            description: 'Non-linear noise reduction filter',
            controls: [
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 3, max: 21, step: 2, value: 5, hint: 'Must be odd' }
            ]
        },
        mean: {
            title: 'MEAN FILTER',
            description: 'Average intensity in kernel area',
            controls: [
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 3, max: 21, step: 2, value: 5, hint: 'Must be odd' }
            ]
        },
        max: {
            title: 'MAX FILTER',
            description: 'Maximum intensity in kernel area',
            controls: [
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 3, max: 21, step: 2, value: 5, hint: 'Must be odd' }
            ]
        },
        min: {
            title: 'MIN FILTER',
            description: 'Minimum intensity in kernel area',
            controls: [
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 3, max: 21, step: 2, value: 5, hint: 'Must be odd' }
            ]
        },
        
        // Edge Detection
        sobel: {
            title: 'SOBEL EDGE DETECTION',
            description: 'Gradient-based edge detector (choose directions + kernel)',
            controls: [
                { type: 'checkbox', id: 'use-x', label: 'Detect X direction', checked: true },
                { type: 'checkbox', id: 'use-y', label: 'Detect Y direction', checked: true },
                { type: 'slider',   id: 'kernel-size', label: 'Kernel size (odd)', min: 1, max: 7, step: 2, value: 3, hint: '3 or 5 recommended' }
            ]
        },
        prewitt: {
            title: 'PREWITT EDGE DETECTION',
            description: 'Simple gradient filter (prewitt)',
            controls: [
                { type: 'checkbox', id: 'use-x', label: 'Detect X direction', checked: true },
                { type: 'checkbox', id: 'use-y', label: 'Detect Y direction', checked: true }
            ]
        },
        canny: {
            title: 'CANNY EDGE DETECTION',
            description: 'Multi-stage edge detector with hysteresis',
            controls: [
                { type: 'slider', id: 'low-threshold',  label: 'Lower Threshold', min: 0, max: 255, step: 1, value: 50 },
                { type: 'slider', id: 'high-threshold', label: 'Upper Threshold', min: 0, max: 255, step: 1, value: 150 }
            ]
        },
        laplace: {
            title: 'LAPLACIAN',
            description: 'Laplacian operator (fixed ksize = 3)',
            controls: [
                { type: 'info', text: 'Kernel size fixed to 3 in current implementation' }
            ]
        },
        log: {
            title: 'LoG (Laplacian of Gaussian)',
            description: 'LoG (fixed ksize = 5)',
            controls: [
                { type: 'info', text: 'Kernel size fixed to 5 in current implementation' }
            ]
        },
        harris: {
            title: 'HARRIS CORNER DETECTION',
            description: 'Corner detector (block size, Harris k, threshold)',
            controls: [
                { type: 'slider', id: 'block-size', label: 'Block size', min: 1, max: 7, step: 1, value: 2 },
                { type: 'slider', id: 'k-param',    label: 'Harris k (0.01 - 0.2)', min: 0.01, max: 0.2, step: 0.01, value: 0.04 },
                { type: 'slider', id: 'threshold',  label: 'Corner threshold', min: 1, max: 500, step: 1, value: 100 }
            ]
        },
        
        // Morphology Operations
        dilate: {
            title: 'DILATION',
            description: 'Expand white regions',
            controls: [
                { type: 'select', id: 'kernel-shape', label: 'Kernel Shape', options: ['Rectangle', 'Ellipse', 'Cross'], value: 'Rectangle' },
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 1, max: 21, step: 2, value: 5, hint: 'Must be odd' },
                { type: 'slider', id: 'iterations', label: 'Iterations', min: 1, max: 10, step: 1, value: 1 }
            ],
            warnings: ['Requires binary image']
        },
        erode: {
            title: 'EROSION',
            description: 'Shrink white regions',
            controls: [
                { type: 'select', id: 'kernel-shape', label: 'Kernel Shape', options: ['Rectangle', 'Ellipse', 'Cross'], value: 'Rectangle' },
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 1, max: 21, step: 2, value: 5, hint: 'Must be odd' },
                { type: 'slider', id: 'iterations', label: 'Iterations', min: 1, max: 10, step: 1, value: 1 }
            ],
            warnings: ['Requires binary image']
        },
        open: {
            title: 'OPENING',
            description: 'Erosion followed by dilation',
            controls: [
                { type: 'select', id: 'kernel-shape', label: 'Kernel Shape', options: ['Rectangle', 'Ellipse', 'Cross'], value: 'Rectangle' },
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 1, max: 21, step: 2, value: 5, hint: 'Must be odd' },
                { type: 'slider', id: 'iterations', label: 'Iterations', min: 1, max: 10, step: 1, value: 1 }
            ],
            warnings: ['Requires binary image']
        },
        close: {
            title: 'CLOSING',
            description: 'Dilation followed by erosion',
            controls: [
                { type: 'select', id: 'kernel-shape', label: 'Kernel Shape', options: ['Rectangle', 'Ellipse', 'Cross'], value: 'Rectangle' },
                { type: 'slider', id: 'kernel-size', label: 'Kernel Size', min: 1, max: 21, step: 2, value: 5, hint: 'Must be odd' },
                { type: 'slider', id: 'iterations', label: 'Iterations', min: 1, max: 10, step: 1, value: 1 }
            ],
            warnings: ['Requires binary image']
        },
        holefill: {
            title: 'HOLE FILLING',
            description: 'Fill holes in binary objects',
            controls: [
                { type: 'select', id: 'connectivity', label: 'Connectivity', options: ['4-connected', '8-connected'], value: '8-connected' }
            ],
            warnings: ['Requires binary image']
        },
        
        // Neighbourhood Operations
        neighbours4: {
            title: '4-NEIGHBOURHOOD',
            description: 'Show 4-connected neighbours',
            controls: [
                { type: 'info', text: 'Click on image pixel to select' },
                { type: 'checkbox', id: 'show-overlay', label: 'Show overlay', checked: true }
            ]
        },
        neighbours8: {
            title: '8-NEIGHBOURHOOD',
            description: 'Show 8-connected neighbours',
            controls: [
                { type: 'info', text: 'Click on image pixel to select' },
                { type: 'checkbox', id: 'show-overlay', label: 'Show overlay', checked: true }
            ]
        },
        connectivity: {
            title: 'CONNECTIVITY ANALYSIS',
            description: 'Analyze pixel connectivity',
            controls: [
                { type: 'select', id: 'connectivity', label: 'Connectivity', options: ['4-connected', '8-connected'], value: '8-connected' },
                { type: 'info', text: 'Click on image pixel to analyze connected region' }
            ]
        },
        components: {
            title: 'CONNECTED COMPONENTS',
            description: 'Label connected regions',
            controls: [
                { type: 'select', id: 'connectivity', label: 'Connectivity', options: ['4-connected', '8-connected'], value: '8-connected' },
                { type: 'checkbox', id: 'colorize', label: 'Colorize components', checked: true }
            ],
            warnings: ['Requires binary image']
        },
        
        // Texture Operations
        glcm: {
            title: 'GLCM TEXTURE ANALYSIS',
            description: 'Gray-Level Co-occurrence Matrix features',
            controls: [
                { type: 'slider', id: 'distance', label: 'Distance', min: 1, max: 10, step: 1, value: 1, hint: 'Pixel offset' },
                { type: 'select', id: 'angle', label: 'Angle', options: ['0° (Horizontal)', '45° (Diagonal)', '90° (Vertical)', '135° (Anti-diagonal)'], value: '0° (Horizontal)' },
                { type: 'slider', id: 'levels', label: 'Quantization Levels', min: 4, max: 32, step: 1, value: 8, hint: 'Gray levels' },
                { type: 'checkbox', id: 'show-matrix', label: 'Show GLCM matrix', checked: false },
                { type: 'checkboxgroup', label: 'Features to compute:', options: [
                    { id: 'feat-contrast', label: 'Contrast', checked: true },
                    { id: 'feat-correlation', label: 'Correlation', checked: true },
                    { id: 'feat-energy', label: 'Energy', checked: true },
                    { id: 'feat-homogeneity', label: 'Homogeneity', checked: true }
                ]},
                { type: 'checkbox', id: 'use-roi', label: 'Use ROI selector', checked: false }
            ],
            extras: ['metrics-output']
        },
        moments: {
            title: 'IMAGE MOMENTS',
            description: 'Compute spatial moments and centroids',
            controls: [
                { type: 'checkbox', id: 'show-centroid', label: 'Show centroid overlay', checked: true },
                { type: 'checkbox', id: 'use-roi', label: 'Use ROI selector', checked: false }
            ],
            extras: ['metrics-output'],
            warnings: ['Works best on binary images']
        },
        
        // Basic Operations
        threshold: {
            title: 'THRESHOLD',
            description: 'Convert to binary image',
            controls: [
                { type: 'slider', id: 'threshold-value', label: 'Threshold Value', min: 0, max: 255, step: 1, value: 127 },
                { type: 'select', id: 'threshold-type', label: 'Type', options: ['Binary', 'Binary Inverted', 'Truncate', 'To Zero', 'To Zero Inverted'], value: 'Binary' },
                { type: 'slider', id: 'max-value', label: 'Max Value', min: 0, max: 255, step: 1, value: 255 },
                { type: 'checkbox', id: 'show-histogram', label: 'Show histogram', checked: false }
            ],
            extras: ['histogram']
        },
        colorToGray: {
            title: 'COLOR TO GRAYSCALE',
            description: 'Convert color image to grayscale',
            controls: [
                { type: 'info', text: 'Converts RGB/RGBA image to single-channel grayscale' }
            ]
        },
        invert: {
            title: 'INVERT IMAGE',
            description: 'Invert all pixel values (bitwise NOT)',
            controls: [
                { type: 'info', text: 'Black becomes white, white becomes black' }
            ]
        },
        transpose: {
            title: 'TRANSPOSE IMAGE',
            description: 'Flip image over its diagonal',
            controls: [
                { type: 'info', text: 'Rows become columns, columns become rows' }
            ]
        },
        bgrRgb: {
            title: 'BGR ↔ RGB CONVERSION',
            description: 'Swap red and blue channels',
            controls: [
                { type: 'info', text: 'Useful for format conversions between OpenCV and other libraries' }
            ]
        },
        quantize: {
            title: 'COLOR QUANTIZATION',
            description: 'Reduce number of colors',
            controls: [
                { type: 'slider', id: 'levels', label: 'Color Levels', min: 2, max: 32, step: 1, value: 8, hint: 'Per channel' }
            ]
        },
        histEq: {
            title: 'HISTOGRAM EQUALIZATION',
            description: 'Enhance contrast using histogram equalization',
            controls: [
                { type: 'info', text: 'Works best on grayscale images' },
                { type: 'checkbox', id: 'show-histogram', label: 'Show before/after histogram', checked: true }
            ],
            extras: ['histogram-comparison']
        },
    };
    
    return metadata[operation] || {
        title: operation.toUpperCase(),
        description: 'Operation configuration',
        controls: []
    };
}

// ============================================================================
// CONTROL RENDERING
// ============================================================================

function renderOperationControls(container, metadata) {
    // Render warnings first
    if (metadata.warnings && metadata.warnings.length > 0) {
        metadata.warnings.forEach(warning => {
            container.appendChild(createWarningBox(warning));
        });
    }
    
    // Render controls
    metadata.controls.forEach(control => {
        const controlGroup = createControlGroup(control);
        container.appendChild(controlGroup);
    });
    
    // Render extras (histogram, metrics, etc.)
    if (metadata.extras && metadata.extras.length > 0) {
        metadata.extras.forEach(extra => {
            container.appendChild(createExtraView(extra));
        });
    }
}

function createControlGroup(control) {
    const group = document.createElement('div');
    group.className = 'control-group';
    
    switch (control.type) {
        case 'slider':
            group.appendChild(createSlider(control));
            break;
        case 'select':
            group.appendChild(createSelect(control));
            break;
        case 'checkbox':
            group.appendChild(createCheckbox(control));
            break;
        case 'checkboxgroup':
            group.appendChild(createCheckboxGroup(control));
            break;
        case 'color':
            group.appendChild(createColorPicker(control));
            break;
        case 'info':
            group.appendChild(createInfoBox(control.text));
            break;
    }
    
    return group;
}

function createSlider(control) {
    const wrapper = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'control-label';
    label.textContent = control.label;
    wrapper.appendChild(label);
    
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container';
    
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.id = control.id;
    slider.min = control.min;
    slider.max = control.max;
    slider.step = control.step;
    slider.value = control.value;
    
    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'slider-value';
    valueDisplay.textContent = formatNumber(control.value);
    
    slider.addEventListener('input', (e) => {
        valueDisplay.textContent = formatNumber(e.target.value);
    });
    
    sliderContainer.appendChild(slider);
    sliderContainer.appendChild(valueDisplay);
    wrapper.appendChild(sliderContainer);
    
    if (control.hint) {
        const hint = document.createElement('span');
        hint.className = 'range-hint';
        hint.textContent = control.hint;
        wrapper.appendChild(hint);
    }
    
    return wrapper;
}

function createSelect(control) {
    const wrapper = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'control-label';
    label.textContent = control.label;
    wrapper.appendChild(label);
    
    const select = document.createElement('select');
    select.id = control.id;
    
    control.options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        if (option === control.value) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
    
    wrapper.appendChild(select);
    return wrapper;
}

function createCheckbox(control) {
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = control.id;
    checkbox.checked = control.checked || false;
    
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(control.label));
    
    return label;
}

function createCheckboxGroup(control) {
    const wrapper = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'control-label';
    label.textContent = control.label;
    wrapper.appendChild(label);
    
    control.options.forEach(option => {
        const optLabel = document.createElement('label');
        optLabel.className = 'checkbox-label';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = option.id;
        checkbox.checked = option.checked || false;
        
        optLabel.appendChild(checkbox);
        optLabel.appendChild(document.createTextNode(option.label));
        wrapper.appendChild(optLabel);
    });
    
    return wrapper;
}

function createColorPicker(control) {
    const wrapper = document.createElement('div');
    
    const label = document.createElement('label');
    label.className = 'control-label';
    label.textContent = control.label;
    wrapper.appendChild(label);
    
    const colorWrapper = document.createElement('div');
    colorWrapper.className = 'color-picker-wrapper';
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.id = control.id;
    colorInput.value = control.value || '#ff0000';
    
    const colorLabel = document.createElement('span');
    colorLabel.textContent = colorInput.value;
    colorLabel.style.fontSize = '10px';
    
    colorInput.addEventListener('input', (e) => {
        colorLabel.textContent = e.target.value;
    });
    
    colorWrapper.appendChild(colorInput);
    colorWrapper.appendChild(colorLabel);
    wrapper.appendChild(colorWrapper);
    
    return wrapper;
}

function createWarningBox(text) {
    const warning = document.createElement('div');
    warning.className = 'warning-box';
    warning.textContent = text;
    return warning;
}

function createInfoBox(text) {
    const info = document.createElement('div');
    info.className = 'info-box';
    info.textContent = text;
    return info;
}

function createExtraView(type) {
    const container = document.createElement('div');
    
    switch (type) {
        case 'histogram':
            container.innerHTML = '<div class="separator"></div>';
            const histCanvas = document.createElement('canvas');
            histCanvas.id = 'histogram-canvas';
            histCanvas.className = 'histogram-canvas';
            histCanvas.width = 256;
            histCanvas.height = 100;
            container.appendChild(histCanvas);
            break;
            
        case 'histogram-comparison':
            container.innerHTML = '<div class="separator"></div>';
            
            const beforeLabel = document.createElement('div');
            beforeLabel.style.fontSize = '10px';
            beforeLabel.style.fontWeight = 'bold';
            beforeLabel.style.marginTop = '8px';
            beforeLabel.textContent = 'Before:';
            container.appendChild(beforeLabel);
            
            const histCanvasBefore = document.createElement('canvas');
            histCanvasBefore.id = 'histogram-before';
            histCanvasBefore.className = 'histogram-canvas';
            histCanvasBefore.width = 256;
            histCanvasBefore.height = 80;
            container.appendChild(histCanvasBefore);
            
            const afterLabel = document.createElement('div');
            afterLabel.style.fontSize = '10px';
            afterLabel.style.fontWeight = 'bold';
            afterLabel.style.marginTop = '8px';
            afterLabel.textContent = 'After:';
            container.appendChild(afterLabel);
            
            const histCanvasAfter = document.createElement('canvas');
            histCanvasAfter.id = 'histogram-after';
            histCanvasAfter.className = 'histogram-canvas';
            histCanvasAfter.width = 256;
            histCanvasAfter.height = 80;
            container.appendChild(histCanvasAfter);
            break;
            
        case 'metrics-output':
            container.innerHTML = '<div class="separator"></div>';
            const metrics = document.createElement('div');
            metrics.id = 'metrics-output';
            metrics.className = 'metrics-output';
            metrics.innerHTML = '<div style="color: #666;">Metrics will appear here after processing</div>';
            container.appendChild(metrics);
            break;
    }
    
    return container;
}

// ============================================================================
// GET CONTROL VALUES
// ============================================================================

/**
 * Read all control values from the panel and return as object
 * @returns {Object} Parameters object with all control values
 */
function getControlValues() {
    const params = {};
    const controls = document.getElementById('panel-controls');
    
    // Get all sliders
    controls.querySelectorAll('input[type="range"]').forEach(slider => {
        params[slider.id] = parseFloat(slider.value);
    });
    
    // Get all selects
    controls.querySelectorAll('select').forEach(select => {
        params[select.id] = select.value;
    });
    
    // Get all checkboxes
    controls.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        params[checkbox.id] = checkbox.checked;
    });
    
    // Get all color pickers
    controls.querySelectorAll('input[type="color"]').forEach(color => {
        params[color.id] = color.value;
    });
    
    return params;
}

// ============================================================================
// VISUAL HELPERS
// ============================================================================

/**
 * Draw histogram on canvas
 * @param {HTMLCanvasElement} canvas - Canvas to draw on
 * @param {Array} histData - Histogram data array (256 bins)
 */
function drawHistogram(canvas, histData) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);
    
    const maxVal = Math.max(...histData);
    const barWidth = width / histData.length;
    
    ctx.fillStyle = '#000080';
    histData.forEach((val, i) => {
        const barHeight = (val / maxVal) * height;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
    });
}

/**
 * Calculate histogram from grayscale cv.Mat
 * @param {cv.Mat} mat - Grayscale OpenCV Mat
 * @returns {Array} Histogram data (256 bins)
 */
function calculateHistogram(mat) {
    const hist = new Array(256).fill(0);
    
    // Ensure grayscale
    let gray = mat;
    let needsDelete = false;
    
    if (mat.channels() !== 1) {
        gray = new cv.Mat();
        cv.cvtColor(mat, gray, cv.COLOR_RGBA2GRAY);
        needsDelete = true;
    }
    
    // Count pixel values
    for (let i = 0; i < gray.rows; i++) {
        for (let j = 0; j < gray.cols; j++) {
            const val = gray.ucharPtr(i, j)[0];
            hist[val]++;
        }
    }
    
    if (needsDelete) {
        gray.delete();
    }
    
    return hist;
}

/**
 * Draw before/after histogram comparison
 * @param {cv.Mat} beforeMat - Original mat
 * @param {cv.Mat} afterMat - Processed mat
 */
function drawHistogramComparison(beforeMat, afterMat) {
    const beforeCanvas = document.getElementById('histogram-before');
    const afterCanvas = document.getElementById('histogram-after');
    
    if (!beforeCanvas || !afterCanvas) {
        console.warn('Histogram canvases not found');
        return;
    }
    
    const beforeHist = calculateHistogram(beforeMat);
    const afterHist = calculateHistogram(afterMat);
    
    drawHistogram(beforeCanvas, beforeHist);
    drawHistogram(afterCanvas, afterHist);
}

/**
 * Draw overlay on canvas (corners, regions, etc.)
 * @param {HTMLCanvasElement} canvas - Canvas to draw on
 * @param {Array} points - Array of {x, y} points
 * @param {string} color - Color for overlay
 * @param {number} size - Size of overlay markers
 */
function drawOverlay(canvas, points, color = '#ff0000', size = 5) {
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = color;
    points.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
        ctx.fill();
    });
}

/**
 * Display metrics in the metrics output box
 * @param {Object} metrics - Object with metric key-value pairs
 */
function displayMetrics(metrics) {
    const metricsDiv = document.getElementById('metrics-output');
    if (!metricsDiv) return;
    
    metricsDiv.innerHTML = '';
    
    Object.entries(metrics).forEach(([key, value]) => {
        const row = document.createElement('div');
        row.className = 'metric-row';
        
        const label = document.createElement('span');
        label.className = 'metric-label';
        label.textContent = key + ':';
        
        const val = document.createElement('span');
        val.textContent = formatNumber(value);
        
        row.appendChild(label);
        row.appendChild(val);
        metricsDiv.appendChild(row);
    });
}

/**
 * Display GLCM matrix
 * @param {Array} matrix - 2D array representing GLCM
 */
function displayGLCMMatrix(matrix) {
    const metricsDiv = document.getElementById('metrics-output');
    if (!metricsDiv) return;
    
    let html = '<div style="font-size: 8px; overflow: auto;">';
    matrix.forEach(row => {
        html += row.map(val => val.toFixed(3).padStart(6)).join(' ') + '<br>';
    });
    html += '</div>';
    
    metricsDiv.innerHTML = html;
}

/**
 * Format number for display
 * @param {number} value - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(value) {
    const num = parseFloat(value);
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return num.toFixed(2);
}

/**
 * Show validation warning
 * @param {string} message - Warning message
 */
function showWarning(message) {
    const controls = document.getElementById('panel-controls');
    
    // Remove existing warnings
    controls.querySelectorAll('.warning-box.dynamic').forEach(el => el.remove());
    
    // Add new warning
    const warning = createWarningBox(message);
    warning.classList.add('dynamic');
    controls.insertBefore(warning, controls.firstChild);
}

/**
 * Clear dynamic warnings
 */
function clearWarnings() {
    const controls = document.getElementById('panel-controls');
    controls.querySelectorAll('.warning-box.dynamic').forEach(el => el.remove());
}

// ============================================================================
// EXPORTS (for script.js to use)
// ============================================================================

// These functions are available globally for script.js
window.openOperationPanel = openOperationPanel;
window.closeOperationPanel = closeOperationPanel;
window.getControlValues = getControlValues;
window.drawHistogram = drawHistogram;
window.calculateHistogram = calculateHistogram;
window.drawHistogramComparison = drawHistogramComparison;
window.drawOverlay = drawOverlay;
window.displayMetrics = displayMetrics;
window.displayGLCMMatrix = displayGLCMMatrix;
window.showWarning = showWarning;
window.clearWarnings = clearWarnings;