/**
 * ABDUL WASAY | CINEMATIC PORTFOLIO INTERACTION ENGINE
 * Theme: Gargantua Interstellar Black Hole & Dynamic Real Fire Cursor
 */

document.addEventListener('DOMContentLoaded', () => {
  initFireCursor();
  initHeroParallax();
  initNavigation();
  initServicesStickyStack();
  initHorizontalProjectSlider();
  initVideoOptimizer();
});

/* Global Parallax Offsets */
let globalParallaxX = 0;
let globalParallaxY = 0;

/* ==========================================================================
   1. REAL FIRE & EMBER PARTICLE CURSOR
   - True additive thermal blending (lighter)
   - Upward buoyancy, aerodynamic drag, and convection jitter
   - Precision white-hot plasma pinpoint with golden halo
   - Interactive ember explosions on click
   ========================================================================== */
function initFireCursor() {
  const canvas = document.getElementById('fire-cursor-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let mouseX = -300;
  let mouseY = -300;
  let prevMouseX = -300;
  let prevMouseY = -300;
  let isHovering = false;
  let isInsideWindow = false;

  const particles = [];
  const waves = [];
  const MAX_PARTICLES = 220;

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Mark body to hide standard OS cursor on desktop
  document.body.classList.add('has-fire-cursor');

  class GravitationalWave {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.radius = 4;
      this.maxRadius = isHovering ? 95 : 75;
      this.age = 0;
      this.maxAge = 35;
    }
    update() {
      this.age++;
      this.radius += (this.maxRadius - this.radius) * 0.14;
      return this.age < this.maxAge;
    }
    draw(context) {
      const progress = this.age / this.maxAge;
      const alpha = (1 - progress) * 0.75;
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.strokeStyle = `rgba(245, 186, 109, ${alpha})`;
      context.lineWidth = Math.max(0.5, 2.5 * (1 - progress));
      context.stroke();

      if (this.radius > 16) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius * 0.65, 0, Math.PI * 2);
        context.strokeStyle = `rgba(226, 157, 82, ${alpha * 0.5})`;
        context.lineWidth = 1;
        context.stroke();
      }
    }
  }

  class FireParticle {
    constructor(x, y, type = 'flame', burst = false) {
      this.type = type;
      this.x = x;
      this.y = y;
      this.age = 0;

      if (type === 'flame') {
        this.maxLife = Math.floor(Math.random() * 14 + 20);
        this.baseRadius = Math.random() * 11 + 9;
        if (isHovering) this.baseRadius *= 1.35;
        this.radius = this.baseRadius;
        this.vx = (Math.random() - 0.5) * 1.6;
        this.vy = -(Math.random() * 2.2 + 1.6);
        this.buoyancy = 0.12;
        this.drag = 0.96;
      } else {
        // Glowing ember spark
        this.maxLife = Math.floor(Math.random() * 28 + 32);
        this.radius = Math.random() * 2.2 + 1.2;
        if (burst) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 6.5 + 2.5;
          this.vx = Math.cos(angle) * speed;
          this.vy = Math.sin(angle) * speed - 1.5;
          this.maxLife += 18;
        } else {
          this.vx = (Math.random() - 0.5) * 3.2;
          this.vy = -(Math.random() * 3.4 + 1.8);
        }
        this.buoyancy = 0.07;
        this.drag = 0.97;
        this.flickerSpeed = Math.random() * 0.4 + 0.2;
        this.flickerPhase = Math.random() * Math.PI * 2;
      }
    }

    update() {
      this.age++;

      this.x += this.vx;
      this.y += this.vy;

      if (this.type === 'flame') {
        this.vy -= this.buoyancy;
        this.vx += (Math.random() - 0.5) * 0.45;
        this.vx *= this.drag;
        const progress = this.age / this.maxLife;
        this.radius = Math.max(1, this.baseRadius * (1 - progress * 0.72));
      } else {
        this.vy -= this.buoyancy;
        this.vx += (Math.random() - 0.5) * 0.2;
        this.vx *= this.drag;
      }

      return this.age < this.maxLife;
    }

    draw(context) {
      const progress = this.age / this.maxLife;
      const heat = 1 - progress;

      if (this.type === 'flame') {
        let r, g, b, alpha;
        if (heat > 0.65) {
          // Intense core: white-hot to brilliant gold
          r = 255;
          g = Math.floor(180 + heat * 75);
          b = Math.floor((heat - 0.65) * 210);
          alpha = heat * 0.5;
        } else if (heat > 0.25) {
          // Flame body: blazing fiery orange
          r = 255;
          g = Math.floor(55 + (heat - 0.25) * 310);
          b = 0;
          alpha = heat * 0.4;
        } else {
          // Dying flame tips: crimson red to dark ash
          r = Math.floor(160 + heat * 320);
          g = Math.floor(heat * 110);
          b = 0;
          alpha = heat * 0.25;
        }

        const grad = context.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, Math.max(1, this.radius)
        );
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(0.4, `rgba(${r}, ${Math.floor(g * 0.55)}, 0, ${alpha * 0.65})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        context.beginPath();
        context.arc(this.x, this.y, Math.max(1, this.radius), 0, Math.PI * 2);
        context.fillStyle = grad;
        context.fill();
      } else {
        // Ember spark
        const flicker = 0.55 + 0.45 * Math.sin(this.age * this.flickerSpeed + this.flickerPhase);
        const alpha = (1 - progress) * flicker;

        let color;
        if (heat > 0.45) {
          color = `rgba(255, 240, 150, ${alpha})`;
        } else {
          color = `rgba(255, 130, 20, ${alpha})`;
        }

        context.beginPath();
        context.arc(this.x, this.y, Math.max(0.7, this.radius * (1 - progress * 0.35)), 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
      }
    }
  }

  function spawnParticlesAt(x, y, count = 2) {
    if (particles.length >= MAX_PARTICLES) return;
    for (let i = 0; i < count; i++) {
      particles.push(new FireParticle(
        x + (Math.random() - 0.5) * 6,
        y + (Math.random() - 0.5) * 6,
        'flame'
      ));
    }
    if (Math.random() < 0.4) {
      particles.push(new FireParticle(
        x + (Math.random() - 0.5) * 8,
        y + (Math.random() - 0.5) * 8,
        'ember'
      ));
    }
  }

  // Mouse Move with Smooth Linear Interpolation
  window.addEventListener('mousemove', (e) => {
    isInsideWindow = true;
    const currX = e.clientX;
    const currY = e.clientY;

    if (prevMouseX > 0 && prevMouseY > 0) {
      const dx = currX - prevMouseX;
      const dy = currY - prevMouseY;
      const dist = Math.hypot(dx, dy);
      const steps = Math.min(Math.floor(dist / 6), 14);

      for (let i = 0; i <= steps; i++) {
        const factor = i / (steps || 1);
        spawnParticlesAt(prevMouseX + dx * factor, prevMouseY + dy * factor, isHovering ? 2 : 1);
      }
    } else {
      spawnParticlesAt(currX, currY, 2);
    }

    prevMouseX = mouseX = currX;
    prevMouseY = mouseY = currY;
  }, { passive: true });

  window.addEventListener('mouseleave', () => {
    isInsideWindow = false;
    prevMouseX = -300;
    prevMouseY = -300;
  });

  window.addEventListener('mouseenter', (e) => {
    isInsideWindow = true;
    prevMouseX = mouseX = e.clientX;
    prevMouseY = mouseY = e.clientY;
  });

  // Spark explosion & Gravitational Wave on click
  window.addEventListener('mousedown', (e) => {
    waves.push(new GravitationalWave(e.clientX, e.clientY));
    for (let i = 0; i < 26; i++) {
      particles.push(new FireParticle(e.clientX, e.clientY, 'ember', true));
    }
    for (let i = 0; i < 8; i++) {
      particles.push(new FireParticle(e.clientX, e.clientY, 'flame', true));
    }
  });

  // Track hover on interactives for flame flare
  const interactives = document.querySelectorAll('a, button, input, textarea, select, .project-card, .service-stack-item, .about-card, .timeline-content-card, .channel-row-link, .pill-chip, .tech-tag, .brand-logo');
  interactives.forEach((el) => {
    el.addEventListener('mouseenter', () => { isHovering = true; });
    el.addEventListener('mouseleave', () => { isHovering = false; });
  });

  // 60fps Animation Loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    // Continuous idle pilot flame
    if (isInsideWindow && mouseX > 0 && mouseY > 0) {
      spawnParticlesAt(mouseX, mouseY, isHovering ? 2 : 1);
    }

    // Additive thermal blending
    ctx.globalCompositeOperation = 'lighter';

    // Render relativistic gravitational waves
    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i];
      if (w.update()) {
        w.draw(ctx);
      } else {
        waves.splice(i, 1);
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.update()) {
        p.draw(ctx);
      } else {
        particles.splice(i, 1);
      }
    }

    // Precision white-hot plasma pinpoint
    if (isInsideWindow && mouseX > 0 && mouseY > 0) {
      const glowGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, isHovering ? 16 : 11);
      glowGrad.addColorStop(0, 'rgba(255, 210, 90, 0.85)');
      glowGrad.addColorStop(0.4, 'rgba(255, 100, 0, 0.4)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(mouseX, mouseY, isHovering ? 16 : 11, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Sharp white core
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, isHovering ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffe277';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

/* ==========================================================================
   2. HERO 3D PARALLAX DEPTH ENGINE
   Subtle multi-plane perspective shift on mouse movement across the frontpage
   ========================================================================== */
function initHeroParallax() {
  const hero = document.getElementById('hero');
  const video = document.querySelector('.hero-video-bg');
  const glow = document.querySelector('.hero-accretion-glow');
  const content = document.querySelector('.hero-content');

  if (!hero || !video || !content) return;

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    mouseY = (e.clientY - rect.top) / rect.height - 0.5;
  }, { passive: true });

  hero.addEventListener('mouseleave', () => {
    mouseX = 0;
    mouseY = 0;
  });

  function updateParallax() {
    // Smooth lerp damping
    currentX += (mouseX - currentX) * 0.06;
    currentY += (mouseY - currentY) * 0.06;

    globalParallaxX = currentX * -18;
    globalParallaxY = currentY * -12;

    video.style.transform = `scale(1.03) translate3d(${globalParallaxX}px, ${globalParallaxY}px, 0)`;
    if (glow) {
      glow.style.transform = `translate3d(${currentX * 22}px, ${currentY * 16}px, 0)`;
    }
    content.style.transform = `translate3d(${currentX * 8}px, ${currentY * 5}px, 0)`;

    requestAnimationFrame(updateParallax);
  }

  requestAnimationFrame(updateParallax);
}

/* ==========================================================================
   3. NAVIGATION & FULLSCREEN MENU OVERLAY
   ========================================================================== */
function initNavigation() {
  const nav = document.getElementById('site-nav');
  const menuOverlay = document.getElementById('menu-overlay');
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const menuLinks = document.querySelectorAll('.menu-link');

  // Sticky nav header background blur
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Open menu
  if (openBtn) {
    openBtn.addEventListener('click', () => {
      menuOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  // Close menu
  function closeMenu() {
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  menuLinks.forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // ESC key to close
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('active')) {
      closeMenu();
    }
  });
}

/* ==========================================================================
   4. HORIZONTAL RIGHT-TO-LEFT FLAGSHIP PROJECT SLIDER
   - Seamless slide transition right to left (01 -> 02 -> 03)
   - Controllable via Glassmorphic Tab Pills, Arrow Buttons, and Touch Swipes
   - No scroll hijacking; preserves 100% natural, smooth page scrolling
   - Synchronizes tabs navigation, arrows, step counter, and progress bar
   ========================================================================== */
function initHorizontalProjectSlider() {
  const section = document.getElementById('works');
  const track = document.getElementById('works-slide-track');
  const slides = document.querySelectorAll('.works-slide-item');
  const tabs = document.querySelectorAll('.slider-tab-btn');
  const prevBtn = document.getElementById('project-prev');
  const nextBtn = document.getElementById('project-next');
  const currentNum = document.getElementById('slider-current-num');
  const progressFill = document.getElementById('slider-progress-fill');

  if (!track || slides.length === 0) return;

  const totalSlides = slides.length;
  let activeIndex = 0;

  function goToSlide(index) {
    if (index < 0) {
      activeIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      activeIndex = 0;
    } else {
      activeIndex = index;
    }

    track.style.transition = 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)';
    track.style.transform = `translateX(-${activeIndex * 100}%)`;

    slides.forEach((slide, idx) => {
      const isActive = idx === activeIndex;
      slide.classList.toggle('active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    tabs.forEach((tab, idx) => {
      const isActive = idx === activeIndex;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    if (currentNum) {
      currentNum.textContent = String(activeIndex + 1).padStart(2, '0');
    }

    if (progressFill) {
      const progressPercent = ((activeIndex + 1) / totalSlides) * 100;
      progressFill.style.width = `${progressPercent}%`;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(activeIndex + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(activeIndex - 1);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(tab.getAttribute('data-slide'), 10);
      if (!isNaN(targetIndex)) {
        goToSlide(targetIndex);
      }
    });
  });

  const stage = document.getElementById('works-slider-stage');
  if (stage) {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    stage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
      }
    }, { passive: true });

    stage.addEventListener('touchend', (e) => {
      if (!isSwiping || e.changedTouches.length === 0) return;
      isSwiping = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          goToSlide(activeIndex + 1);
        } else {
          goToSlide(activeIndex - 1);
        }
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.4) {
      if (e.key === 'ArrowRight') {
        goToSlide(activeIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        goToSlide(activeIndex - 1);
      }
    }
  });

  goToSlide(0);
}

/* ==========================================================================
   5. VIDEO BACKGROUND OPTIMIZER & SPEED TUNER
   - Enforces slightly faster playback rate (1.18x) as requested
   - Pauses video playback when scrolled offscreen to conserve GPU/CPU
   ========================================================================== */
function initVideoOptimizer() {
  const video = document.querySelector('.hero-video-bg');
  const hero = document.getElementById('hero');

  if (!video || !hero) return;

  // Playback rate 1.3x as requested
  const setPlaybackSpeed = () => {
    video.playbackRate = 1.3;
  };

  setPlaybackSpeed();
  video.addEventListener('loadedmetadata', setPlaybackSpeed);
  video.addEventListener('play', setPlaybackSpeed);
  video.addEventListener('canplay', setPlaybackSpeed);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setPlaybackSpeed();
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(hero);
}

/* ==========================================================================
   6. SERVICES STICKY STACKING HEADINGS ACCORDION
   Calculates precise dynamic top offsets so headers stack perfectly without gap
   ========================================================================== */
function initServicesStickyStack() {
  const items = document.querySelectorAll('.service-stack-item');
  if (items.length < 3) return;

  function updateStickyTops() {
    const nav = document.getElementById('site-nav');
    const navH = nav ? nav.offsetHeight : 70;
    const isMobile = window.innerWidth <= 768;
    const baseTop = isMobile ? Math.max(navH, 65) : Math.max(navH + 8, 80);

    const h0 = items[0].querySelector('.service-item-header');
    const h1 = items[1].querySelector('.service-item-header');
    if (!h0 || !h1) return;

    const h0Height = Math.round(h0.getBoundingClientRect().height) || h0.offsetHeight || 72;
    const h1Height = Math.round(h1.getBoundingClientRect().height) || h1.offsetHeight || 72;

    items[0].style.top = `${baseTop}px`;
    items[1].style.top = `${baseTop + h0Height}px`;
    items[2].style.top = `${baseTop + h0Height + h1Height}px`;
  }

  window.addEventListener('resize', updateStickyTops, { passive: true });
  window.addEventListener('load', updateStickyTops);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateStickyTops);
  }
  setTimeout(updateStickyTops, 100);
  setTimeout(updateStickyTops, 300);
  setTimeout(updateStickyTops, 600);
  updateStickyTops();
}