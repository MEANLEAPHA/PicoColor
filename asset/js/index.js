


    const logoInput = document.getElementById("logoInput");
    const logoDropZone = document.getElementById("logoDropZone");

    // Open file dialog on click
    logoDropZone.addEventListener("click", () => logoInput.click());

    // Drag-and-drop events
    logoDropZone.addEventListener("dragover", e => {
      e.preventDefault();
      logoDropZone.classList.add("dragover");
    });

    logoDropZone.addEventListener("dragleave", () => {
      logoDropZone.classList.remove("dragover");
    });

    logoDropZone.addEventListener("drop", e => {
      e.preventDefault();
      logoDropZone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        handleLogoFile(file);
         pUpload.style.display = "none";
      }
    });

    // File input change handler
    logoInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (file) handleLogoFile(file);
    });

    // Handle file load
    function handleLogoFile(file) {
      const reader = new FileReader();
      reader.onload = evt => {
        const img = new Image();
        img.onload = () => {
          uploadedLogo = img;
          logoPreview.src = evt.target.result;
          logoPreviewWrapper.hidden = false;
          const domColor = extractDominantColor(img);
          baseColorInput.value = domColor;
          controlsChanged();
        };
        img.onerror = () => alert("Could not load the image.");
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }

    // Helper: rgb to hex
    function rgbToHex(r, g, b) {
      return "#" + [r, g, b].map(x =>
        x.toString(16).padStart(2, "0")
      ).join("");
    }

    // Convert hex to HSL
    function hexToHSL(hex) {
      hex = hex.replace("#", "");
      let r = parseInt(hex.substring(0, 2), 16) / 255;
      let g = parseInt(hex.substring(2, 4), 16) / 255;
      let b = parseInt(hex.substring(4, 6), 16) / 255;
      let max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
      }
      return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    // Convert HSL to hex
    function HSLToHex(h, s, l) {
      s /= 100; l /= 100;
      let c = (1 - Math.abs(2 * l - 1)) * s;
      let x = c * (1 - Math.abs((h / 60) % 2 - 1));
      let m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (0 <= h && h < 60) { r = c; g = x; b = 0; }
      else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
      else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
      else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
      else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
      else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
      r = Math.round((r + m) * 255);
      g = Math.round((g + m) * 255);
      b = Math.round((b + m) * 255);
      return rgbToHex(r, g, b);
    }

    // Contrast for text color
    function getContrast(hex) {
      hex = hex.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 160 ? '#000' : '#fff';
    }

    // Emotion modifiers for palette variation (5 colors total)
    const emotionMods = {
      Excitement:  [{ h: 0, s: +25, l: +10 }, { h: -10, s: +35, l: -15 }, { h: +20, s: +30, l: +5 }, { h: -20, s: +20, l: -5 }],
      Friendly:    [{ h: +30, s: +15, l: +10 }, { h: -15, s: +10, l: +5 }, { h: +20, s: +25, l: +15 }, { h: -10, s: +5, l: +8 }],
      Optimism:    [{ h: +60, s: +25, l: +20 }, { h: -30, s: +15, l: +10 }, { h: +50, s: +30, l: +25 }, { h: -20, s: +20, l: +15 }],
      Peaceful:    [{ h: -30, s: -20, l: +30 }, { h: -10, s: -10, l: +20 }, { h: -40, s: -15, l: +25 }, { h: -15, s: -25, l: +15 }],
      Trust:       [{ h: -20, s: 0, l: +10 }, { h: -10, s: +5, l: +15 }, { h: -15, s: +10, l: +5 }, { h: -5, s: +7, l: +12 }],
      Creative:    [{ h: +90, s: +20, l: 0 }, { h: +60, s: +10, l: +10 }, { h: +80, s: +25, l: +8 }, { h: +70, s: +15, l: +12 }],
      Hope:        [{ h: +10, s: +10, l: +15 }, { h: -10, s: 0, l: +20 }, { h: +15, s: +8, l: +18 }, { h: -5, s: +5, l: +22 }],
      Reliability: [{ h: 0, s: -10, l: +5 }, { h: -15, s: -20, l: +10 }, { h: -5, s: -12, l: +8 }, { h: -10, s: -15, l: +6 }],
      Power:       [{ h: -40, s: +30, l: -20 }, { h: -60, s: +20, l: -15 }, { h: -50, s: +25, l: -10 }, { h: -45, s: +15, l: -18 }],
      Balance:     [{ h: +20, s: -5, l: +10 }, { h: -20, s: -10, l: +5 }, { h: +15, s: -8, l: +12 }, { h: -10, s: -12, l: +7 }]
    };

    // Extract dominant color from image, ignoring very dark/bright/transparent pixels
    function extractDominantColor(img) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const w = canvas.width = 100;
      const h = canvas.height = 100;

      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;

      const colorCount = {};
      const minAlpha = 50; // Ignore transparent pixels
      const minBrightness = 40; // ignore too dark
      const maxBrightness = 220; // ignore too bright

      function getBrightness(r, g, b) {
        return (r * 299 + g * 587 + b * 114) / 1000;
      }

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        if (a < minAlpha) continue; // ignore transparent
        const brightness = getBrightness(r, g, b);
        if (brightness < minBrightness || brightness > maxBrightness) continue; // ignore too dark or bright

        // Round colors to nearest 16 for grouping similar colors
        const rr = Math.round(r / 16) * 16;
        const gg = Math.round(g / 16) * 16;
        const bb = Math.round(b / 16) * 16;

        const key = `${rr},${gg},${bb}`;
        colorCount[key] = (colorCount[key] || 0) + 1;
      }

      let maxCount = 0;
      let dominant = null;
      for (const key in colorCount) {
        if (colorCount[key] > maxCount) {
          maxCount = colorCount[key];
          dominant = key;
        }
      }

      if (!dominant) return "#6a0dad"; // fallback color

      const rgb = dominant.split(',').map(Number);
      return rgbToHex(rgb[0], rgb[1], rgb[2]);
    }

    // Generate palette and render
    function generatePalette(baseHex) {
      const emotion = document.getElementById("emotion").value;
      const baseHSL = hexToHSL(baseHex);
      const mods = emotionMods[emotion] || [{ h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }, { h: 0, s: 0, l: 0 }];
      const variations = mods.map(mod => {
        let h = (baseHSL.h + mod.h + 360) % 360;
        let s = Math.min(100, Math.max(0, baseHSL.s + mod.s));
        let l = Math.min(100, Math.max(0, baseHSL.l + mod.l));
        return HSLToHex(h, s, l);
      });

      // Full palette: dominant + 4 variations (total 5)
      const palette = [baseHex, ...variations];

      // Render palette grid
      const grid = document.getElementById("paletteGrid");
      grid.innerHTML = "";
      palette.forEach((hex, i) => {
        const box = document.createElement("div");
        box.className = "color-box";
        box.style.backgroundColor = hex;
        const textColor = getContrast(hex);
        box.style.color = textColor;

        box.title = `Click to copy ${hex.toUpperCase()}`;
        box.tabIndex = 0;
        box.innerHTML = `<div class="color-hex">${hex.toUpperCase()}</div>`;
        box.onclick = () => {
          navigator.clipboard.writeText(hex.toUpperCase());
          box.innerHTML = `<div class="color-hex">✅ Copied!</div>`;
          setTimeout(() => box.innerHTML = `<div class="color-hex">${hex.toUpperCase()}</div>`, 1200);
        };
        grid.appendChild(box);
      });

      // Output CSS variables
      const cssVars = palette.map((hex, i) => `--color-${i + 1}: ${hex.toUpperCase()};`).join("\n");
      document.getElementById("cssOutput").value = cssVars;

      return palette;
    }

    // Current palette
    let currentPalette = [];

    // On controls change
    function controlsChanged() {
      // Use current base color (could be extracted from logo)
      const baseColor = document.getElementById("baseColor").value;
      currentPalette = generatePalette(baseColor);
    }

    // Download palette image with colors + CSS vars below each color
    function downloadPalette() {
      if (!currentPalette.length) return alert("Generate palette first!");

      const canvas = document.getElementById("canvas");
      const ctx = canvas.getContext("2d");

      // Setup sizes
      const colorBoxSize = 120;
      const padding = 12;
      const fontSize = 14;
      const cssTextHeight = 30;
      const totalWidth = colorBoxSize * currentPalette.length + padding * (currentPalette.length - 1);
      const totalHeight = colorBoxSize + cssTextHeight + padding * 2;

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // White background
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textBaseline = "top";
      ctx.textAlign = "center";
      ctx.font = `${fontSize}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;

      currentPalette.forEach((hex, i) => {
        const x = i * (colorBoxSize + padding);

        // Draw color box
        ctx.fillStyle = hex;
        ctx.fillRect(x, 0, colorBoxSize, colorBoxSize);

        // Draw CSS variable text below
        ctx.fillStyle = getContrast("#fff") === "#000" ? "#000" : "#333"; // dark text on white
        ctx.fillText(`--color-${i + 1}:`, x + colorBoxSize / 2, colorBoxSize + 2);
        ctx.fillText(hex.toUpperCase(), x + colorBoxSize / 2, colorBoxSize + 2 + fontSize);
      });

      // Trigger download
      const link = document.createElement("a");
      link.download = "brand-palette.png";
      link.href = canvas.toDataURL();
      link.click();
    }

    // Upload & extract dominant color from logo
    let uploadedLogo = null;
  
    const logoPreviewWrapper = document.getElementById("logoPreviewWrapper");
    const pUpload = document.getElementById("pUpload");
    const logoPreview = document.getElementById("logoPreview");
    const clearLogoBtn = document.getElementById("clearLogoBtn");
    const baseColorInput = document.getElementById("baseColor");

    logoInput.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const img = new Image();
     img.onload = () => {
  uploadedLogo = img;
  logoPreview.src = evt.target.result;

  
  // logoDropZone.style.display = "none"; // Hide drop zone after image load
 pUpload.style.display = "none";
  const domColor = extractDominantColor(img);
  baseColorInput.value = domColor;
  controlsChanged();
};

        img.onerror = () => {
          alert("Could not load the image. Please try another file.");
        }
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });

    // Clear uploaded logo but keep colors
//    clearLogoBtn.addEventListener("click", () => {
//   uploadedLogo = null;
//   logoPreview.src = "";
//   logoPreviewWrapper.hidden = true;
//   logoInput.value = "";
//   logoDropZone.style.display = "flex";
//   pUpload.style.display = "flex"; // Show drop zone again
// });

clearLogoBtn.addEventListener("click", () => {
uploadedLogo = null;
  logoPreview.src = "";
  logoPreviewWrapper.hidden = true;

  // Fully clear file input to stop auto re-trigger
  logoInput.type = "";        // Reset input type
  logoInput.type = "file";    // Re-enable input after reset
  logoInput.blur();           // Remove focus completely

  // Show drop zone again
  logoDropZone.style.display = "flex";
  pUpload.style.display = "flex";
});


    // Controls listeners
    baseColorInput.addEventListener("input", controlsChanged);
    document.getElementById("emotion").addEventListener("change", controlsChanged);
    document.getElementById("downloadBtn").addEventListener("click", downloadPalette);

    // Initialize palette on load
    window.addEventListener("load", () => {
      controlsChanged();
    });
