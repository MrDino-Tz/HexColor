document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initColorPicker();
    initImageColorPicker();
    initColorWheel();
});

// 1. Color Picker Functionality
function initColorPicker() {
    const colorInput = document.getElementById('colorInput');
    const hueSlider = document.getElementById('hue');
    const saturationSlider = document.getElementById('saturation');
    const lightnessSlider = document.getElementById('lightness');
    const colorBox = document.getElementById('selectedColor');
    const hexValue = document.getElementById('hexValue');
    const rgbValue = document.getElementById('rgbValue');
    const hslValue = document.getElementById('hslValue');

    // Update color from color input
    colorInput.addEventListener('input', function() {
        const color = this.value;
        updateColorFromHex(color);
    });

    // Format HEX input field
    const hexInput = document.getElementById('hexValue');
    
    // Keep the hash sign fixed
    hexInput.addEventListener('keydown', function(e) {
        // Don't allow deleting the #
        if (e.key === 'Backspace' && this.selectionStart <= 1) {
            e.preventDefault();
        }
        // Auto-add # at the start if missing
        if (this.selectionStart === 0 && e.key !== '#' && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
            this.value = '#';
        }
    });
    
    // Handle HEX input
    hexInput.addEventListener('input', function(e) {
        // Ensure # is present
        if (!this.value.startsWith('#')) {
            this.value = '#' + this.value.replace(/[^0-9A-Fa-f]/g, '');
        } else {
            // Filter out non-hex characters after the #
            this.value = '#' + this.value.substring(1).replace(/[^0-9A-Fa-f]/g, '');
        }
        
        // Limit length (3 or 6 hex digits after #)
        const hex = this.value.substring(1);
        if (hex.length > 6) {
            this.value = '#' + hex.substring(0, 6);
        }
        
        // Update color if valid
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(this.value)) {
            updateColorFromHex(this.value);
        }
    });
    
    // Format on blur (convert short hex to full hex if needed)
    hexInput.addEventListener('blur', function() {
        if (this.value.length === 4) { // #RGB format
            const hex = this.value;
            this.value = '#' + 
                hex[1] + hex[1] + 
                hex[2] + hex[2] + 
                hex[3] + hex[3];
            updateColorFromHex(this.value);
        } else if (this.value === '#') {
            this.value = '#4285f4';
            updateColorFromHex(this.value);
        }
    });

    // Allow manual RGB input
    rgbValue.addEventListener('input', function() {
        const rgbMatch = this.value.match(/^(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})$/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
                const hex = rgbToHex(r, g, b);
                updateColorFromHex(hex);
            }
        }
    });

    // Allow manual HSL input
    hslValue.addEventListener('input', function() {
        const hslMatch = this.value.match(/^(\d{1,3})[,\s]*(\d{1,3})%?[,\s]*(\d{1,3})%?/);
        if (hslMatch) {
            const h = parseInt(hslMatch[1]);
            const s = parseInt(hslMatch[2]);
            const l = parseInt(hslMatch[3]);
            if (h >= 0 && h <= 360 && s >= 0 && s <= 100 && l >= 0 && l <= 100) {
                const rgb = hslToRgb(h / 360, s / 100, l / 100);
                const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
                updateColorFromHex(hex);
            }
        }
    });

    // Update color from HSL sliders
    [hueSlider, saturationSlider, lightnessSlider].forEach(slider => {
        slider.addEventListener('input', updateColorFromHSL);
    });

    function updateColorFromHex(hex) {
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        // Convert RGB to HSL
        const hsl = rgbToHsl(r, g, b);
        
        // Update UI
        updateColorUI(hex, rgbToRgbString(r, g, b), hslToHslString(hsl[0], hsl[1], hsl[2]));
        
        // Update sliders
        hueSlider.value = Math.round(hsl[0]);
        saturationSlider.value = Math.round(hsl[1]);
        lightnessSlider.value = Math.round(hsl[2]);
    }

    function updateColorFromHSL() {
        const h = parseInt(hueSlider.value);
        const s = parseInt(saturationSlider.value);
        const l = parseInt(lightnessSlider.value);
        
        // Convert HSL to RGB
        const rgb = hslToRgb(h / 360, s / 100, l / 100);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        
        // Update UI
        updateColorUI(hex, rgbToRgbString(rgb[0], rgb[1], rgb[2]), hslToHslString(h, s, l));
    }

    function updateColorUI(hex, rgb, hsl) {
        // Only update inputs if they don't have focus to avoid cursor jumping
        if (document.activeElement !== hexInput) {
            hexInput.value = hex.toUpperCase();
        }
        if (document.activeElement !== rgbValue) {
            rgbValue.value = rgb;
        }
        if (document.activeElement !== hslValue) {
            hslValue.value = hsl;
        }
        colorBox.style.backgroundColor = hex;
        colorInput.value = hex;
        
        // Update HSL sliders
        const hslValues = hsl.match(/\d+/g);
        if (hslValues && hslValues.length >= 3) {
            if (document.activeElement !== hueSlider) {
                hueSlider.value = hslValues[0];
            }
            if (document.activeElement !== saturationSlider) {
                saturationSlider.value = hslValues[1];
            }
            if (document.activeElement !== lightnessSlider) {
                lightnessSlider.value = hslValues[2];
            }
        }
    }

    // Helper functions
    function rgbToHsl(r, g, b) {
        r /= 255, g /= 255, b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        return [h * 360, s * 100, l * 100];
    }

    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function rgbToRgbString(r, g, b) {
        return `rgb(${r}, ${g}, ${b})`;
    }

    function hslToHslString(h, s, l) {
        return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }
}

// 2. Image Color Picker Functionality
function initImageColorPicker() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('imageUpload');
    const uploadBtn = document.getElementById('uploadBtn');
    const canvas = document.getElementById('imageCanvas');
    const ctx = canvas.getContext('2d');
    const colorPalette = document.getElementById('colorPalette');

    // Handle drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropZone.classList.add('highlight');
    }

    function unhighlight() {
        dropZone.classList.remove('highlight');
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFileSelect(e) {
        const files = e.target.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                processImage(file);
            } else {
                alert('Please upload an image file.');
            }
        }
    }

    function processImage(file) {
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                // Set canvas dimensions to match image (with max width/height)
                const maxSize = 500;
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                canvas.style.display = 'block';
                
                // Extract colors from the image
                extractColors();
            };
            img.src = event.target.result;
        };
        
        reader.readAsDataURL(file);
    }

    function extractColors() {
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const colorMap = new Map();
        
        // Sample colors from the image
        for (let i = 0; i < imageData.length; i += 16) { // Sample every 16th pixel for performance
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];
            const hex = rgbToHex(r, g, b);
            
            // Group similar colors
            const colorKey = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
            colorMap.set(colorKey, { r, g, b, hex, count: (colorMap.get(colorKey)?.count || 0) + 1 });
        }
        
        // Convert to array and sort by frequency
        const colors = Array.from(colorMap.values());
        colors.sort((a, b) => b.count - a.count);
        
        // Display top 10 colors
        displayColorPalette(colors.slice(0, 10));
    }
    
    function displayColorPalette(colors) {
        colorPalette.innerHTML = '';
        
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
            swatch.setAttribute('data-hex', color.hex);
            swatch.title = color.hex;
            
            // Copy to clipboard on click
            swatch.addEventListener('click', () => {
                navigator.clipboard.writeText(color.hex);
                const tooltip = document.createElement('div');
                tooltip.textContent = 'Copied!';
                tooltip.style.position = 'absolute';
                tooltip.style.background = 'rgba(0,0,0,0.8)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '2px 8px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.top = '-30px';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.zIndex = '100';
                
                swatch.style.position = 'relative';
                swatch.appendChild(tooltip);
                
                setTimeout(() => {
                    tooltip.remove();
                }, 1000);
            });
            
            colorPalette.appendChild(swatch);
        });
    }
    
    // Helper function to convert RGB to HEX
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}

// 3. Color Wheel Functionality
function initColorWheel() {
    const canvas = document.getElementById('colorWheel');
    const ctx = canvas.getContext('2d');
    const selectedColor = document.getElementById('wheelSelectedColor');
    const hexValue = document.getElementById('wheelHex');
    const rgbValue = document.getElementById('wheelRgb');
    const hslValue = document.getElementById('wheelHsl');
    const harmonyColors = document.getElementById('harmonyColors');
    
    // Set canvas size
    const size = Math.min(400, window.innerWidth - 40);
    canvas.width = size;
    canvas.height = size;
    
    // Draw color wheel
    drawColorWheel();
    
    // Add event listeners
    canvas.addEventListener('mousedown', handleColorPick);
    canvas.addEventListener('mousemove', (e) => {
        if (e.buttons === 1) { // Left mouse button is pressed
            handleColorPick(e);
        }
    });
    
    // Handle color harmony buttons
    document.querySelectorAll('.harmony-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            updateColorHarmony(this.dataset.harmony);
        });
    });
    
    function drawColorWheel() {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        // Draw color wheel
        for (let angle = 0; angle < 360; angle += 0.5) {
            const startAngle = (angle - 2) * Math.PI / 180;
            const endAngle = angle * Math.PI / 180;
            
            for (let r = 0; r < radius; r++) {
                const gradient = ctx.createRadialGradient(centerX, centerY, r, centerX, centerY, r + 1);
                const [h, s, l] = [angle, 100, 50];
                const rgb = hslToRgb(h / 360, 1, 0.5);
                const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
                
                // Create gradient for smooth color transition
                gradient.addColorStop(0, `hsla(${h}, ${s}%, ${l}%, 1)`);
                gradient.addColorStop(1, `hsla(${h}, ${s}%, ${l}%, 0)`);
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, r, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
            }
        }
        
        // Add white center for better visibility of selected color
        ctx.beginPath();
        ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }
    
    function handleColorPick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.min(centerX, centerY) - 10;
        
        if (distance > radius) return; // Clicked outside the wheel
        
        // Calculate angle (0-360 degrees)
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        
        // Calculate saturation (0-100%)
        const saturation = Math.min(100, Math.round((distance / radius) * 100));
        
        // Set fixed lightness for the wheel (50% for full color)
        const lightness = 50;
        
        // Convert HSL to RGB
        const rgb = hslToRgb(angle / 360, saturation / 100, lightness / 100);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        
        // Update UI
        updateColorInfo(hex, rgb, [angle, saturation, lightness]);
        
        // Update harmony colors
        updateColorHarmony('analogous');
    }
    
    function updateColorInfo(hex, rgb, hsl) {
        selectedColor.style.backgroundColor = hex;
        hexValue.textContent = hex.toUpperCase();
        rgbValue.textContent = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
        hslValue.textContent = `${Math.round(hsl[0])}°, ${Math.round(hsl[1])}%, ${Math.round(hsl[2])}%`;
    }
    
    function updateColorHarmony(type) {
        const currentHsl = hslValue.textContent.match(/\d+/g).map(Number);
        let harmonies = [];
        
        switch (type) {
            case 'analogous':
                // 30 degrees on either side
                harmonies = [
                    [(currentHsl[0] - 30 + 360) % 360, currentHsl[1], currentHsl[2]],
                    [currentHsl[0], currentHsl[1], currentHsl[2]],
                    [(currentHsl[0] + 30) % 360, currentHsl[1], currentHsl[2]]
                ];
                break;
                
            case 'complementary':
                // 180 degrees apart
                harmonies = [
                    [currentHsl[0], currentHsl[1], currentHsl[2]],
                    [(currentHsl[0] + 180) % 360, currentHsl[1], currentHsl[2]]
                ];
                break;
                
            case 'triadic':
                // 120 degrees apart
                harmonies = [
                    [currentHsl[0], currentHsl[1], currentHsl[2]],
                    [(currentHsl[0] + 120) % 360, currentHsl[1], currentHsl[2]],
                    [(currentHsl[0] + 240) % 360, currentHsl[1], currentHsl[2]]
                ];
                break;
                
            case 'tetradic':
                // Rectangle of colors
                harmonies = [
                    [currentHsl[0], currentHsl[1], currentHsl[2]],
                    [(currentHsl[0] + 60) % 360, currentHsl[1], currentHsl[2]],
                    [(currentHsl[0] + 180) % 360, currentHsl[1], currentHsl[2]],
                    [(currentHsl[0] + 240) % 360, currentHsl[1], currentHsl[2]]
                ];
                break;
        }
        
        // Display harmony colors
        displayHarmonyColors(harmonies);
    }
    
    function displayHarmonyColors(harmonies) {
        harmonyColors.innerHTML = '';
        
        harmonies.forEach(([h, s, l]) => {
            const rgb = hslToRgb(h / 360, s / 100, l / 100);
            const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
            
            const colorDiv = document.createElement('div');
            colorDiv.className = 'harmony-color';
            colorDiv.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
            colorDiv.setAttribute('data-hex', hex);
            colorDiv.title = hex;
            
            // Copy to clipboard on click
            colorDiv.addEventListener('click', () => {
                navigator.clipboard.writeText(hex);
                const tooltip = document.createElement('div');
                tooltip.textContent = 'Copied!';
                tooltip.style.position = 'absolute';
                tooltip.style.background = 'rgba(0,0,0,0.8)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '2px 8px';
                tooltip.style.borderRadius = '4px';
                tooltip.style.fontSize = '12px';
                tooltip.style.top = '-30px';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                tooltip.style.zIndex = '100';
                
                colorDiv.style.position = 'relative';
                colorDiv.appendChild(tooltip);
                
                setTimeout(() => {
                    tooltip.remove();
                }, 1000);
            });
            
            harmonyColors.appendChild(colorDiv);
        });
    }
    
    // Helper functions for color conversion
    function hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
}
