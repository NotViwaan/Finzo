
(function () {
  const canvas = document.getElementById('dotCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height, dots = [];
  const spacing = 32, dotSize = 1.5;
  const mouse = { x: -1000, y: -1000 };
  const radius = 150;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initDots();
  }

  function initDots() {
    dots = [];
    for (let x = spacing / 2; x < width; x += spacing)
      for (let y = spacing / 2; y < height; y += spacing)
        dots.push({ x, y });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const primaryColor = window.brandingConfig ? window.brandingConfig.primaryColor : '#adc6ff';
    dots.forEach(dot => {
      const dx = mouse.x - dot.x, dy = mouse.y - dot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let color = '#424753', sz = dotSize;
      if (dist < radius) {
        const f = (radius - dist) / radius, a = 0.15 + f * 0.85;
        color = hexToRgba(primaryColor, a); sz = dotSize + f * 1.5;
        ctx.beginPath(); ctx.arc(dot.x, dot.y, sz * 2, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(primaryColor, f * 0.3); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(dot.x, dot.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize(); draw();
})();

// ── Password toggle helper ──
function togglePass(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (!input || !icon) return;
  input.type = input.type === 'password' ? 'text' : 'password';
  icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
}

// ── Toast notification ──
function showToast(message, type = 'info') {
  const colors = {
    success: 'rgba(109,221,129,0.15)',
    error:   'rgba(255,180,169,0.15)',
    info:    'rgba(173,198,255,0.15)',
  };
  const borders = {
    success: 'rgba(109,221,129,0.3)',
    error:   'rgba(255,180,169,0.3)',
    info:    'rgba(173,198,255,0.3)',
  };
  const icons = { success: 'check_circle', error: 'error', info: 'info' };

  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    display:flex; align-items:center; gap:10px;
    background:${colors[type]}; border:1px solid ${borders[type]};
    backdrop-filter:blur(16px); border-radius:12px;
    padding:12px 18px; color:#e2e2e5;
    font-family:'Manrope',sans-serif; font-size:0.8rem; font-weight:600;
    box-shadow:0 8px 32px rgba(0,0,0,0.4);
    transform:translateY(80px); opacity:0;
    transition:transform 0.3s ease, opacity 0.3s ease;
  `;
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.1rem">${icons[type]}</span>${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  });

  setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


function applyBranding() {
  const config = window.brandingConfig;
  if (!config) return;


  document.querySelectorAll('.brand-name').forEach(el => {
    if (el.dataset.brandOnly === 'false' || !el.dataset.brandOnly) {
       el.textContent = config.name;
    }
  });

  document.querySelectorAll('.brand-icon').forEach(el => {
    if (config.logoType === 'image' && config.logoUrl) {
      el.innerHTML = `<img src="${config.logoUrl}" alt="${config.name}" class="h-full w-auto object-contain">`;
      el.classList.remove('material-symbols-outlined');
    } else {
      el.textContent = config.icon;
      el.classList.add('material-symbols-outlined');
    }
  });


  if (document.title.includes('Finzo')) {
    document.title = document.title.replace('Finzo', config.name);
  }

  // 3. Update CSS Variables for Theme
  let style = document.getElementById('dynamic-branding-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'dynamic-branding-style';
    document.head.appendChild(style);
  }
  style.textContent = `
    :root {
      --brand-primary: ${config.primaryColor};
      --brand-secondary: ${config.secondaryColor};
      --brand-primary-rgb: ${hexToRgbValues(config.primaryColor)};
    }
    .brand-color-primary { color: var(--brand-primary) !important; }
    .brand-bg-primary { background-color: var(--brand-primary) !important; }
    .brand-border-primary { border-color: var(--brand-primary) !important; }
  `;
}

function hexToRgbValues(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Run applyBranding immediately if possible, and on DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyBranding);
} else {
  applyBranding();
}
