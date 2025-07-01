// JavaScript for Logo Upload and Palette Generation
 // ⬅️ adjust this higher to skip black tones

const logoInput = document.getElementById("logoInput");
const logoDropZone = document.getElementById("logoDropZone");
const logoPreviewWrapper = document.getElementById("logoPreviewWrapper");
const pUpload = document.getElementById("pUpload");
const logoPreview = document.getElementById("logoPreview");
const clearLogoBtn = document.getElementById("clearLogoBtn");
const baseColorInput = document.getElementById("baseColor");

let uploadedLogo = null;
let currentPalette = [];

logoDropZone.addEventListener("click", () => logoInput.click());

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

logoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) handleLogoFile(file);
});

function handleLogoFile(file) {
  const reader = new FileReader();
  reader.onload = evt => {
    const img = new Image();
    img.onload = () => {
      uploadedLogo = img;
      logoPreview.src = evt.target.result;
      logoPreviewWrapper.hidden = false;
      pUpload.style.display = "none";
      const domColor = extractDominantColor(img);
      baseColorInput.value = domColor;
      controlsChanged();
    };
    img.onerror = () => alert("Could not load the image.");
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

clearLogoBtn.addEventListener("click", () => {
  uploadedLogo = null;
  logoPreview.src = "";
  logoPreviewWrapper.hidden = true;
  logoInput.type = "";
  logoInput.type = "file";
  logoInput.blur();
  logoDropZone.style.display = "flex";
  pUpload.style.display = "flex";
});

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

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

function getContrast(hex) {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 160 ? '#000' : '#fff';
}

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


// function extractDominantColor(img) {

//   const canvas = document.createElement('canvas');
//   canvas.width = img.naturalWidth || img.width;
//   canvas.height = img.naturalHeight || img.height;
//   const ctx = canvas.getContext('2d');

//   ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//   const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

//   const colorCount = {};
//   const minAlpha = 200; // Stricter alpha to avoid semi-transparent background
//   const minBrightness = 30; // Allow darker colors but filter out near-black
//   const maxBrightness = 250; // Allow bright colors
//   const maxWhiteThreshold = 240; // Ignore near-white background

//   function getBrightness(r, g, b) {
//     return (r * 299 + g * 587 + b * 114) / 1000;
//   }

//   function rgbToHex(r, g, b) {
//     return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
//   }

//   // Analyze pixel data
//   for (let i = 0; i < data.length; i += 4) {
//     const r = data[i];
//     const g = data[i + 1];
//     const b = data[i + 2];
//     const a = data[i + 3];

//     const brightness = getBrightness(r, g, b);

//     // Skip transparent, very dark, very black, or near-white pixels
//     if (a < minAlpha || 
//         brightness < minBrightness || 
//         (r < 20 && g < 20 && b < 20) || 
//         (r > maxWhiteThreshold && g > maxWhiteThreshold && b > maxWhiteThreshold)) {
//       continue;
//     }

//     // Group similar colors with finer granularity
//     const rr = Math.round(r / 32) * 32; // Adjusted for broader grouping
//     const gg = Math.round(g / 32) * 32;
//     const bb = Math.round(b / 32) * 32;

//     const key = `${rr},${gg},${bb}`;
//     colorCount[key] = (colorCount[key] || 0) + 1;
//   }

//   // Find the most frequent color
//   let maxCount = 0;
//   let dominant = null;
//   for (const key in colorCount) {
//     if (colorCount[key] > maxCount) {
//       maxCount = colorCount[key];
//       dominant = key;
//     }
//   }

//   if (!dominant) return "#6a0dad"; // Fallback color

//   const rgb = dominant.split(',').map(Number);
//   return rgbToHex(rgb[0], rgb[1], rgb[2]);
// }


function extractDominantColor(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  const colorCount = {};
  const minAlpha = 180; // Allow slightly more transparent pixels
  const minBrightness = 20;
  const maxBrightness = 245;
  const maxWhiteThreshold = 250; // Don't exclude slightly off-white

  function getBrightness(r, g, b) {
    return (r * 299 + g * 587 + b * 114) / 1000;
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    const brightness = getBrightness(r, g, b);

    // Filter rules: relaxed to include more valid logo colors
    if (a < minAlpha || 
        brightness < minBrightness || 
        brightness > maxBrightness || 
        (r > maxWhiteThreshold && g > maxWhiteThreshold && b > maxWhiteThreshold)) {
      continue;
    }

    // Group colors (reduce granularity)
    const rr = Math.round(r / 24) * 24;
    const gg = Math.round(g / 24) * 24;
    const bb = Math.round(b / 24) * 24;

    const key = `${rr},${gg},${bb}`;
    colorCount[key] = (colorCount[key] || 0) + 1;
  }

  // Find the most frequent
  let maxCount = 0;
  let dominant = null;
  for (const key in colorCount) {
    if (colorCount[key] > maxCount) {
      maxCount = colorCount[key];
      dominant = key;
    }
  }

  if (!dominant) return "#6a0dad"; // fallback

  const [r, g, b] = dominant.split(',').map(Number);
  return rgbToHex(r, g, b);
}


// Usage example
const img = document.createElement('img');
img.crossOrigin = "Anonymous";
img.src = 'path_to_your_image'; // Replace with your image URL
img.onload = () => {
  const dominantColor = extractDominantColor(img);
  console.log("Dominant color:", dominantColor);
};

document.getElementById("copyAllBtn").addEventListener("click", () => {
  const cssText = document.getElementById("cssOutput").value;
  navigator.clipboard.writeText(cssText)
    .then(() => {
      const btn = document.getElementById("copyAllBtn");
      btn.textContent = "✅";
      setTimeout(() => {
        btn.textContent = "📋";
      }, 1500);
    })
    .catch(err => {
      alert("Failed to copy: " + err);
    });
});
function generatePalette(baseHex) {
  const emotion = document.getElementById("emotion").value;
  const baseHSL = hexToHSL(baseHex);
  const mods = emotionMods[emotion] || Array(4).fill({ h: 0, s: 0, l: 0 });
  const variations = mods.map(mod => {
    let h = (baseHSL.h + mod.h + 360) % 360;
    let s = Math.min(100, Math.max(0, baseHSL.s + mod.s));
    let l = Math.min(100, Math.max(0, baseHSL.l + mod.l));
    return HSLToHex(h, s, l);
  });
  const palette = [baseHex, ...variations];
  const labels = ["primary", "accent", "muted", "neutral", "secondary"];
  const labels2 = ["color 1", "color 2", "color 3", "color 4", "color 5"];


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

  // const cssVars = palette.map((hex, i) => `-- ${labels2[i]} -- ${labels[i]}: ${hex.toUpperCase()};`).join("\n");
  const cssVars = palette.map((hex, i) => `--${labels[i]}: ${hex.toUpperCase()};`).join("\n");

  document.getElementById("cssOutput").value = cssVars;
  return palette;
}

function controlsChanged() {
  const baseColor = document.getElementById("baseColor").value;
  currentPalette = generatePalette(baseColor);
}

document.getElementById("downloadBtn").addEventListener("click", () => {
  if (!currentPalette.length) return alert("Generate palette first!");
  const canvas = document.getElementById("canvas");
  const labels = ["primary", "accent", "muted", "neutral", "secondary"];
  const labels2 = ["color 1", "color 2", "color 3", "color 4", "color 5"];
  const ctx = canvas.getContext("2d");
  const colorBoxSize = 120;
  const padding = 12;
  const fontSize = 14;
  const cssTextHeight = 30;
  const totalWidth = colorBoxSize * currentPalette.length + padding * (currentPalette.length - 1);
  const totalHeight = colorBoxSize + cssTextHeight + padding * 2;
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "top";
  ctx.textAlign = "center";
  ctx.font = `${fontSize}px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`;
  currentPalette.forEach((hex, i) => {
    const x = i * (colorBoxSize + padding);
    ctx.fillStyle = hex;
    ctx.fillRect(x, 0, colorBoxSize, colorBoxSize);
    ctx.fillStyle = getContrast("#fff") === "#000" ? "#000" : "#333";
    ctx.fillText(`--${labels[i]}:`, x + colorBoxSize / 2, colorBoxSize + 2);
    ctx.fillText(hex.toUpperCase(), x + colorBoxSize / 2, colorBoxSize + 2 + fontSize);
  });
  const link = document.createElement("a");
  link.download = "PicoColor-palette.png";
  link.href = canvas.toDataURL();
  link.click();
});

baseColorInput.addEventListener("input", controlsChanged);
document.getElementById("emotion").addEventListener("change", controlsChanged);
window.addEventListener("load", controlsChanged);
