$(document).ready(function () {

    // ============================================
    // Real Canvas Fire Cursor Animation
    // ============================================
    const canvas = document.getElementById('fire-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        let particles = [];
        let mouseX = 0;
        let mouseY = 0;
        let isMoving = false;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            isMoving = true;

            // Jb mouse move ho tou 3 particles emit kardo (optimized from 4 to reduce lag but keep visual)
            for (let i = 0; i < 3; i++) {
                particles.push(new FireParticle(mouseX, mouseY));
            }
        });

        // Jb ruky hwe hon tab bhi choti c flame banay rakhein
        setInterval(() => {
            if (!isMoving && mouseX > 0 && mouseY > 0) {
                particles.push(new FireParticle(mouseX, mouseY));
            }
            isMoving = false;
        }, 50);

        class FireParticle {
            constructor(x, y) {
                this.x = x + (Math.random() * 10 - 5);  // Mouse ky ird-gird random start
                this.y = y + (Math.random() * 10 - 5);
                this.size = Math.random() * 12 + 10;      // Start body size
                this.vx = (Math.random() * 2 - 1) * 0.5; // Thora sa right / left drift
                this.vy = (Math.random() * -3 - 1);      // Hamesha UP (upar) move kare
                this.life = 1;                           // 1 se start ho kar 0 pe destroy
                this.decay = Math.random() * 0.03 + 0.02;// Jal ker bujhne ki speed
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.size -= 0.3; // size chota hoga uper jaty we
                this.life -= this.decay;
            }

            draw() {
                ctx.globalCompositeOperation = 'lighter'; // Is se fire glowing lagti hai
                ctx.beginPath();

                // Color fading logic: Center hot(yellow/white) -> Orange -> Red out
                let color;
                if (this.life > 0.7) {
                    color = `rgba(255, 230, 150, ${this.life})`;
                } else if (this.life > 0.4) {
                    color = `rgba(255, 120, 0, ${this.life})`;
                } else {
                    color = `rgba(255, 20, 0, ${this.life})`;
                }

                // Blur aur glow effect radial gradient ka faida laike
                const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                glow.addColorStop(0, color);
                glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

                ctx.fillStyle = glow;
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function animateFire() {
            // Clear canvas slowly banata hai tails smudging, but pure clear rakhein tou individual laptein (flames) theek lagti hain
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                // Agar size chota hojaye ya dead, array se nikal do
                if (particles[i].size <= 0 || particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                } else {
                    particles[i].draw();
                }
            }
            requestAnimationFrame(animateFire);
        }

        // Fire on kardo
        animateFire();
    }
    // ============================================
    // Neural Network Particle Animation for Hero Section
    // ============================================
    const bgCanvas = document.getElementById('bg-canvas');
    if (bgCanvas) {
        const hCtx = bgCanvas.getContext('2d');
        let hWidth, hHeight;
        let heroParticles = [];

        // Mouse interaction
        let hMouse = {
            x: null,
            y: null,
            radius: 150 // Connection radius for mouse
        };

        function resizeBgCanvas() {
            hWidth = window.innerWidth;
            hHeight = window.innerHeight;
            bgCanvas.width = hWidth;
            bgCanvas.height = hHeight;
        }

        window.addEventListener('resize', resizeBgCanvas);
        resizeBgCanvas();

        document.addEventListener('mousemove', function (e) {
            hMouse.x = e.clientX;
            hMouse.y = e.clientY;
        });

        document.addEventListener('mouseleave', function () {
            hMouse.x = null;
            hMouse.y = null;
        });

        class HeroParticle {
            constructor() {
                this.x = Math.random() * hWidth;
                this.y = Math.random() * hHeight;
                this.size = Math.random() * 2 + 1; // Particle size
                this.speedX = Math.random() * 1.5 - 0.75; // Movement speed
                this.speedY = Math.random() * 1.5 - 0.75;
                // Red glowing color
                this.color = 'rgba(255, 0, 60, 0.8)';
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off edges
                if (this.x > hWidth || this.x < 0) this.speedX *= -1;
                if (this.y > hHeight || this.y < 0) this.speedY *= -1;

                // Collision with mouse
                if (hMouse.x != null && hMouse.y != null) {
                    let dx = hMouse.x - this.x;
                    let dy = hMouse.y - this.y;
                    let distSq = dx * dx + dy * dy;
                    let mRadiusSq = hMouse.radius * hMouse.radius;
                    if (distSq < mRadiusSq) {
                        let distance = Math.sqrt(distSq);
                        if (distance === 0) distance = 0.1;
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const force = (hMouse.radius - distance) / hMouse.radius;
                        const directionX = forceDirectionX * force * 1.5;
                        const directionY = forceDirectionY * force * 1.5;

                        this.x -= directionX; // repulse
                        this.y -= directionY;
                    }
                }
            }

            draw() {
                hCtx.beginPath();
                hCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                hCtx.fillStyle = this.color;
                hCtx.shadowBlur = 10;
                hCtx.shadowColor = '#ff0000';
                hCtx.fill();
            }
        }

        function initHeroParticles() {
            heroParticles = [];
            let numberOfParticles = (hWidth * hHeight) / 9000; // density
            if (numberOfParticles > 100) numberOfParticles = 100; // Hard cap to prevent lag on big screens

            for (let i = 0; i < numberOfParticles; i++) {
                heroParticles.push(new HeroParticle());
            }
        }

        function connectHeroParticles() {
            let maxDistance = 120; // connection distance between particles
            let maxDistSq = maxDistance * maxDistance;

            for (let a = 0; a < heroParticles.length; a++) {
                for (let b = a + 1; b < heroParticles.length; b++) { // Optimized: b = a + 1 to avoid duplicate checks
                    let dx = heroParticles[a].x - heroParticles[b].x;
                    let dy = heroParticles[a].y - heroParticles[b].y;
                    let distSq = dx * dx + dy * dy;

                    if (distSq < maxDistSq) {
                        let distance = Math.sqrt(distSq);
                        let opacityValue = 1 - (distance / maxDistance);
                        if (opacityValue > 0.05) { // Skip drawing nearly invisible lines
                            hCtx.strokeStyle = `rgba(255, 0, 60, ${opacityValue * 0.5})`;
                            hCtx.lineWidth = 1;
                            hCtx.beginPath();
                            hCtx.moveTo(heroParticles[a].x, heroParticles[a].y);
                            hCtx.lineTo(heroParticles[b].x, heroParticles[b].y);
                            hCtx.stroke();
                        }
                    }
                }

                // Connect to mouse as well
                if (hMouse.x != null && hMouse.y != null) {
                    let dx = heroParticles[a].x - hMouse.x;
                    let dy = heroParticles[a].y - hMouse.y;
                    let distSq = dx * dx + dy * dy;
                    let mRadiusSq = hMouse.radius * hMouse.radius;

                    if (distSq < mRadiusSq) {
                        let distance = Math.sqrt(distSq);
                        let opacityValue = 1 - (distance / hMouse.radius);
                        if (opacityValue > 0.05) { // Skip drawing nearly invisible lines
                            hCtx.strokeStyle = `rgba(255, 0, 60, ${opacityValue * 0.8})`;
                            hCtx.lineWidth = 1.5;
                            hCtx.beginPath();
                            hCtx.moveTo(heroParticles[a].x, heroParticles[a].y);
                            hCtx.lineTo(hMouse.x, hMouse.y);
                            hCtx.stroke();
                        }
                    }
                }
            }
        }

        function animateHeroParticles() {
            hCtx.clearRect(0, 0, hWidth, hHeight);

            for (let i = 0; i < heroParticles.length; i++) {
                heroParticles[i].update();
                heroParticles[i].draw();
            }
            connectHeroParticles();
            requestAnimationFrame(animateHeroParticles);
        }

        initHeroParticles();
        animateHeroParticles();
    }
    // ============================================
    // Falling Letters Preloader Animation
    // ============================================
    (function runFallingLetters() {
        const text = 'ABDUL WASAY';
        const mainEl = document.getElementById('falling-main');
        const refEl  = document.getElementById('falling-reflection');
        if (!mainEl || !refEl) return;

        const letters = text.split('');
        const mainSpans = [];
        const refSpans  = [];

        // Build both rows of spans
        letters.forEach((ch) => {
            const s = document.createElement('span');
            s.className = ch === ' ' ? '' : 'fl-letter';
            s.textContent = ch === ' ' ? '\u00A0' : ch; // non-breaking space for word gap
            mainEl.appendChild(s);
            mainSpans.push(s);

            const r = document.createElement('span');
            r.className = ch === ' ' ? '' : 'fl-ref-letter';
            r.textContent = ch === ' ' ? '\u00A0' : ch;
            refEl.appendChild(r);
            refSpans.push(r);
        });

        // Add divider line between text and reflection
        const divider = document.createElement('div');
        divider.className = 'preloader-divider';
        mainEl.parentNode.insertBefore(divider, refEl);

        // Stagger: drop each letter one by one
        const dropDelay  = 80;   // ms between each letter
        const fillDelay  = 200;  // ms after landing before outline→fill
        const totalDropTime = letters.length * dropDelay + fillDelay + 500;

        letters.forEach((ch, i) => {
            if (ch === ' ') return;

            // Trigger drop animation
            setTimeout(() => {
                mainSpans[i].style.animationDelay = '0ms';
                refSpans[i].style.animationDelay  = '0ms';
                // Force reflow so animation plays
                mainSpans[i].style.animation = 'letterDrop 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) forwards';
                refSpans[i].style.animation  = 'letterDrop 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) forwards';
            }, i * dropDelay);

            // After landing: outline → solid fill
            setTimeout(() => {
                mainSpans[i].classList.add('filled');
                refSpans[i].classList.add('filled');
            }, i * dropDelay + 450 + fillDelay);
        });

        // After all letters landed: show divider line + role text
        setTimeout(() => {
            divider.classList.add('expand');
            const roleReveal = document.querySelector('.intro-role-reveal');
            if (roleReveal) roleReveal.classList.add('show');
        }, totalDropTime);

        // Fade out preloader and trigger scramble
        setTimeout(function () {
            $('#preloader').fadeOut(800, function () {
                startScrambleEffect();
            });
        }, totalDropTime + 1200);
    })();

    // Initialize AOS Animation Library
    AOS.init({
        offset: 150,
        duration: 1000,
        once: false,
        mirror: true
    });

    // 3D TagCloud Sphere Animation for Generative AI Skills
    const myTags = [
        'Python', 'React', 'OpenAI', 'Node.js', 'TensorFlow', 'PyTorch',
        'PostgreSQL', 'LangChain', 'Hugging Face', 'Docker', 'AWS',
        'Pandas', 'NumPy', 'Scikit-Learn', 'Keras', 'LlamaIndex', 'Pinecone', 'Jupyter'
    ];

    const icons = {
        'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
        'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
        'OpenAI': 'https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg',
        'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
        'TensorFlow': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg',
        'PyTorch': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg',
        'PostgreSQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
        'LangChain': 'https://avatars.githubusercontent.com/u/126733250?s=200&v=4', 
        'Hugging Face': 'https://huggingface.co/datasets/huggingface/brand-assets/resolve/main/hf-logo.png',
        'Linux': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg',
        'Docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
        'AWS': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
        'Pandas': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original.svg',
        'NumPy': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original.svg',
        'Scikit-Learn': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg',
        'Keras': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/keras/keras-original.svg',
        'LlamaIndex': 'https://avatars.githubusercontent.com/u/118318928?s=200&v=4',
        'Pinecone': 'https://avatars.githubusercontent.com/u/74032087?s=200&v=4',
        'Jupyter': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jupyter/jupyter-original.svg'
    };

    let sphereRadius = 220;
    if (window.innerWidth < 768) sphereRadius = 160;
    if (window.innerWidth < 450) sphereRadius = 120;

    // ==========================================
    // Unified Drag-to-Rotate 3D System
    // ==========================================
    const container = document.querySelector('.skills-globe-container');
    const tagcloudDiv = document.querySelector('.tagcloud');
    const globeCanvas = document.getElementById('globe-canvas');
    let ctx = null;
    let width, height, cx, cy;

    // Wireframe points
    let points = [];
    let edges = [];

    // HTML Element points
    let htmlItems = [];

    // Physics
    let rx = 0, ry = 0; // Angles
    let vx = 0, vy = 0.002; // Velocities
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    if (globeCanvas && container && tagcloudDiv) {
        ctx = globeCanvas.getContext('2d');
        tagcloudDiv.innerHTML = ''; // clear any old tagcloud content

        function initGlobe() {
            width = container.clientWidth || 600;
            height = container.clientHeight || 600;
            globeCanvas.width = width;
            globeCanvas.height = height;
            cx = width / 2;
            cy = height / 2;

            points = [];
            edges = [];
            htmlItems = [];
            tagcloudDiv.innerHTML = '';

            sphereRadius = 220;
            if (window.innerWidth < 768) sphereRadius = 160;
            if (window.innerWidth < 450) sphereRadius = 120;

            const wireframeRadius = sphereRadius - 5;

            // 1. Build Wireframe Lat/Lon Sphere Coordinates
            const lats = 12; // Zyada horizontal rings
            const lons = 24; // Zyada vertical lines (more wires)

            for (let i = 0; i <= lats; i++) {
                const lat = Math.PI * (i / lats) - Math.PI / 2;
                for (let j = 0; j < lons; j++) {
                    const lon = 2 * Math.PI * (j / lons);
                    const x = wireframeRadius * Math.cos(lat) * Math.cos(lon);
                    const y = wireframeRadius * Math.sin(lat);
                    const z = wireframeRadius * Math.cos(lat) * Math.sin(lon);
                    points.push({ x, y, z });
                }
            }

            // Connect lines
            for (let i = 0; i <= lats; i++) {
                for (let j = 0; j < lons; j++) {
                    const idx = i * lons + j;
                    const nextLon = i * lons + ((j + 1) % lons);
                    edges.push({ a: idx, b: nextLon });
                    if (i < lats) {
                        const nextLat = (i + 1) * lons + j;
                        edges.push({ a: idx, b: nextLat });
                        const nextLatNextLon = (i + 1) * lons + ((j + 1) % lons);
                        edges.push({ a: idx, b: nextLatNextLon });
                    }
                }
            }

            // 2. Build HTML Items with Fibonacci Sphere layout
            const n = myTags.length;
            const goldenRatio = (1 + Math.sqrt(5)) / 2;
            const tagRadius = sphereRadius; // items at edge

            for (let i = 0; i < n; i++) {
                const theta = 2 * Math.PI * i / goldenRatio;
                const phi = Math.acos(1 - 2 * (i + 0.5) / n);

                const x = tagRadius * Math.cos(theta) * Math.sin(phi);
                const y = tagRadius * Math.sin(theta) * Math.sin(phi);
                const z = tagRadius * Math.cos(phi);

                // Create DOM Element
                const el = document.createElement('div');
                el.className = 'tagcloud--item';
                el.style.position = 'absolute';
                el.style.transform = `translate(-50%, -50%)`;
                el.style.left = '50%';
                el.style.top = '50%';
                el.style.cursor = 'pointer';

                const tagIcon = icons[myTags[i]];
                el.innerHTML = `
                    <div class="skill-icon-container">
                        <img src="${tagIcon}" alt="${myTags[i]}" class="skill-globe-icon" />
                        <span class="skill-globe-text">${myTags[i]}</span>
                    </div>
                `;
                tagcloudDiv.appendChild(el);

                htmlItems.push({ x, y, z, el });
            }
        }

        initGlobe();
        window.addEventListener('resize', initGlobe);

        // Interaction Events (Drag to rotate)
        container.addEventListener('mousedown', dragStart);
        container.addEventListener('touchstart', dragStart, { passive: true });

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });

        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchend', dragEnd);

        function dragStart(e) {
            isDragging = true;
            let clientX = e.clientX || e.touches[0].clientX;
            let clientY = e.clientY || e.touches[0].clientY;
            lastMouseX = clientX;
            lastMouseY = clientY;
            vx = 0; // stop normal rotation when dragged
            vy = 0;
            // Prevent default only on mouse to avoid text selection. Allow touch scroll if not swiping on canvas.
            if (e.type === 'mousedown') e.preventDefault();
        }

        function drag(e) {
            if (!isDragging) return;
            // Only stop default touch to stop page scrolling while rotating globe tightly
            if (e.type === 'touchmove' && e.cancelable) e.preventDefault();

            let clientX = e.clientX || e.touches[0].clientX;
            let clientY = e.clientY || e.touches[0].clientY;

            let deltaX = clientX - lastMouseX;
            let deltaY = clientY - lastMouseY;

            // Adjusted mass/speed for realistic weighting
            vy = deltaX * 0.003; // Mouse X moves Y axis rotation
            vx = deltaY * 0.003; // Mouse Y moves X axis rotation

            lastMouseX = clientX;
            lastMouseY = clientY;
        }

        function dragEnd() {
            isDragging = false;
        }

        function renderGlobe() {
            ctx.clearRect(0, 0, width, height);

            // Momentum & Friction physics
            if (!isDragging) {
                // Decay custom drag momentum smoothly
                vx *= 0.92;
                vy *= 0.92;
                // Auto spin smoothly
                vy += 0.0006;
                rx += vx;
                ry += vy;
            } else {
                rx += vx;
                ry += vy;
            }

            // Draw globe dark core
            ctx.beginPath();
            ctx.arc(cx, cy, sphereRadius - 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(15, 10, 7, 0.93)'; // Original core color
            ctx.shadowBlur = 25; // Subtle core glow
            ctx.shadowColor = 'rgba(200, 110, 60, 0.3)';
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 80, 20, 0.15)'; // Original stroke color
            ctx.stroke();

            // Perspective Focal length (Lower = more dynamic 3D effect)
            let fl = 800;

            // Project & Draw Wireframe (Lines)
            let projectedLines = points.map(p => {
                let x1 = p.x * Math.cos(ry) - p.z * Math.sin(ry);
                let z1 = p.z * Math.cos(ry) + p.x * Math.sin(ry);
                let y2 = p.y * Math.cos(rx) - z1 * Math.sin(rx);
                let z2 = z1 * Math.cos(rx) + p.y * Math.sin(rx);

                let scale = fl / (fl + z2);
                let px = cx + x1 * scale;
                let py = cy + y2 * scale;
                return { px, py, z: z2 };
            });

            // 1. Draw Edges (Wireframe)
            edges.forEach(e => {
                let p1 = projectedLines[e.a];
                let p2 = projectedLines[e.b];
                let avgZ = (p1.z + p2.z) / 2;

                // Front is negative Z, Back is positive Z.
                let alpha = (sphereRadius - avgZ) / (sphereRadius * 2);
                alpha = Math.max(0.04, Math.min(0.6, alpha));

                ctx.strokeStyle = `rgba(200, 110, 60, ${alpha})`; // Original line color
                ctx.shadowBlur = 0; // Clean lines without muddy shadow
                ctx.lineWidth = 1.2; // Sleeker lines
                ctx.beginPath();
                ctx.moveTo(p1.px, p1.py);
                ctx.lineTo(p2.px, p2.py);
                ctx.stroke();
            });

            // 2. Draw Nodes (Dots at intersections to make it look like a high-tech network)
            projectedLines.forEach(p => {
                let alpha = (sphereRadius - p.z) / (sphereRadius * 2);
                if (alpha > 0.3) { // Only draw visible front dots
                    ctx.fillStyle = `rgba(255, 200, 150, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.px, p.py, 1.5, 0, 2 * Math.PI);
                    ctx.fill();
                }
            });

            // Project & Position DOM Elements (Logos)
            htmlItems.forEach(item => {
                let x1 = item.x * Math.cos(ry) - item.z * Math.sin(ry);
                let z1 = item.z * Math.cos(ry) + item.x * Math.sin(ry);
                let y2 = item.y * Math.cos(rx) - z1 * Math.sin(rx);
                let z2 = z1 * Math.cos(rx) + item.y * Math.sin(rx);

                let scale = fl / (fl + z2);
                let px = cx + x1 * scale;
                let py = cy + y2 * scale;

                let zDepth = z2;
                let itemAlpha = (sphereRadius - zDepth) / (sphereRadius * 2);
                itemAlpha = Math.max(0.15, Math.min(1, itemAlpha));

                // Depth of Field (blur further away items)
                let blur = Math.max(0, (zDepth / sphereRadius) * 4);

                // Enhance scale difference mathematically so front items pop correctly
                let dynamicScale = scale * 1.1;

                item.el.style.transform = `translate(-50%, -50%) translate3d(${px - cx}px, ${py - cy}px, 0) scale(${dynamicScale})`;
                item.el.style.opacity = itemAlpha;
                item.el.style.filter = `blur(${blur}px)`;
                item.el.style.zIndex = Math.floor((sphereRadius - zDepth) * 10);
            });

            requestAnimationFrame(renderGlobe);
        }
        renderGlobe();
    }
    
    // ==========================================
    // Scrolling Marquee Population
    // ==========================================
    const marqueeTrack = document.querySelector('.marquee-track');
    if (marqueeTrack) {
        let marqueeHTML = '';
        // Add logos twice to create a seamless infinite loop
        for (let i = 0; i < 2; i++) {
            myTags.forEach(tag => {
                marqueeHTML += `
                <div class="marquee-item">
                    <img src="${icons[tag]}" alt="${tag}">
                    <span>${tag}</span>
                </div>`;
            });
        }
        marqueeTrack.innerHTML = marqueeHTML;
    }
    // ==========================================


    // Toggle menu/navbar
    $('.menu-btn').click(function () {
        $(this).find('i').toggleClass('fa-times');
        $('.navbar').toggleClass('active');
    });

    // Sticky navbar on scroll & Active Link Highlighting
    $(window).scroll(function () {
        // Sticky Navbar
        if (this.scrollY > 20) {
            $('.header').addClass("sticky");
        } else {
            $('.header').removeClass("sticky");
        }

        // Scroll Progress Bar
        let docHeight = $(document).height() - $(window).height();
        let scrollPercent = (this.scrollY / docHeight) * 100;
        $('.scroll-progress').css('width', scrollPercent + '%');

        // Active Link Highlights
        let scrollY = $(window).scrollTop();
        $('section').each(function () {
            let offset = $(this).offset().top - 150;
            let height = $(this).outerHeight();
            let id = $(this).attr('id');

            if (scrollY >= offset && scrollY < offset + height) {
                $('.navbar a').removeClass('active');
                $('.navbar a[href="#' + id + '"]').addClass('active');
            }
        });

        // Remove menu toggle icon and navbar when scrolling
        $('.menu-btn i').removeClass('fa-times');
        $('.navbar').removeClass('active');
    });

    // Smooth Scrolling (Handled mainly by CSS now, but fallback provided)
    $('a[href*="#"]').on('click', function (e) {
        $('html, body').animate({
            scrollTop: $($(this).attr('href')).offset().top - 50
        }, 500, 'linear');
    });

    // ============================================
    // Burnable Text Effect for Hero Title
    // ============================================
    const heroElements = document.querySelectorAll('.hero-name, .hero-role');

    heroElements.forEach(el => {
        const text = el.textContent;
        el.innerHTML = ''; // clear original text

        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                el.appendChild(document.createTextNode(' '));
            } else {
                const span = document.createElement('span');
                span.className = 'burnable';
                span.textContent = text[i];
                span.setAttribute('data-char', text[i]); // Save original char for scramble effect
                el.appendChild(span);
            }
        }
    });

    // ============================================
    // Scramble Text Effect (Hacker Decrypt)
    // ============================================
    function startScrambleEffect() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        const spans = document.querySelectorAll('.hero-name .burnable');

        spans.forEach((span, index) => {
            const originalChar = span.getAttribute('data-char');
            let iterations = 0;
            // Har letter thora aur time le ga decrypt hone mai
            const maxIterations = 15 + (index * 3);

            const interval = setInterval(() => {
                if (iterations >= maxIterations) {
                    span.textContent = originalChar;
                    clearInterval(interval);
                } else {
                    span.textContent = letters[Math.floor(Math.random() * letters.length)];
                }
                iterations++;
            }, 30); // Fast changing speed
        });
    }

    // ============================================
    // Holographic Datapad 3D Tilt Effect
    // ============================================
    const datapad = document.getElementById('about-datapad');
    if (datapad) {
        document.addEventListener('mousemove', (e) => {
            const rect = datapad.getBoundingClientRect();
            
            // We want it to tilt based on mouse position relative to the screen center
            // but only tilt significantly if the mouse is near it, or just always track the mouse gently.
            // Let's do a gentle global tracking so it feels like a physical object in the room.
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            // Calculate rotation. Max rotation is 15 degrees.
            const maxRotation = 15;
            const rotateY = ((mouseX - centerX) / centerX) * maxRotation;
            const rotateX = -((mouseY - centerY) / centerY) * maxRotation; // Negative to tilt towards mouse

            datapad.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        // Reset when mouse leaves the window
        document.addEventListener('mouseleave', () => {
            datapad.style.transform = `rotateX(0deg) rotateY(0deg)`;
        });
    }

    // ============================================
    // Project List Hover to Card Animation Sync
    // ============================================
    const projectListItems = document.querySelectorAll('.project-list-item');
    const portfolioCards = document.querySelectorAll('.portfolio-card-container');

    projectListItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            if (portfolioCards[index]) {
                portfolioCards[index].classList.add('hovered');
            }
        });

        item.addEventListener('mouseleave', () => {
            if (portfolioCards[index]) {
                portfolioCards[index].classList.remove('hovered');
            }
        });
    });

    // ============================================
    // Secure Uplink Terminal (Contact Section)
    // ============================================
    const secureForm = document.getElementById('secure-form');
    const inputs = document.querySelectorAll('.input-group input, .input-group textarea');
    const cyberBtn = document.querySelector('.cyber-btn');
    const btnText = document.querySelector('.btn-text');

    // Scramble Text Function
    function scrambleText(element, originalText, isFocus) {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let iterations = 0;
        const maxIterations = 10;
        const targetText = isFocus ? '> DECRYPTING_...' : originalText;

        clearInterval(element.scrambleInterval);

        element.scrambleInterval = setInterval(() => {
            if (iterations >= maxIterations) {
                element.textContent = targetText;
                clearInterval(element.scrambleInterval);
            } else {
                element.textContent = targetText.split('').map((char, index) => {
                    if (char === ' ' || char === '>') return char;
                    return letters[Math.floor(Math.random() * letters.length)];
                }).join('');
            }
            iterations++;
        }, 40);
    }

    // Input Focus/Blur Events
    inputs.forEach(input => {
        const label = input.previousElementSibling;
        if (!label) return;
        const originalText = label.getAttribute('data-original');

        input.addEventListener('focus', () => {
            scrambleText(label, originalText, true);
        });

        input.addEventListener('blur', () => {
            if (input.value.trim() === '') {
                scrambleText(label, originalText, false);
            } else {
                label.textContent = '> DATA_LOCKED_';
                label.style.color = '#27c93f'; // Green for locked data
            }
        });
        
        // Reset color on input
        input.addEventListener('input', () => {
             label.style.color = 'var(--main-color)';
        });
    });

    // Form Submit Integration (Native)
    if (secureForm && cyberBtn && btnText) {
        secureForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent immediate submission to show animation early

            const originalBtnText = btnText.textContent;
            btnText.textContent = "VERIFYING UPLINK...";
            cyberBtn.style.pointerEvents = "none";

            let dots = 0;
            const encryptInterval = setInterval(() => {
                dots = (dots + 1) % 4;
                btnText.textContent = "VERIFYING UPLINK" + ".".repeat(dots);
            }, 300);

            // Give it 1.5 seconds for our cool terminal effect, then submit for real
            setTimeout(() => {
                clearInterval(encryptInterval);
                btnText.textContent = "ROUTING TO SERVER...";
                btnText.style.color = "#27c93f";
                
                // Actually submit the form to Formspree (opens Captcha test)
                secureForm.submit();
                
                setTimeout(() => {
                    btnText.textContent = originalBtnText;
                    btnText.style.color = "#fff";
                    cyberBtn.style.pointerEvents = "auto";
                }, 3000);
            }, 1500);
        });
    }

});