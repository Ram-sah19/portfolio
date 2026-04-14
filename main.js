/* ═══════════════════════════════════════════════════════
   RAM PORTFOLIO — main.js
   Three.js scenes + all interactivity
═══════════════════════════════════════════════════════ */

"use strict";

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));

/* ─────────────────────────────────────────
   LOADER
───────────────────────────────────────── */
window.addEventListener("load", () => {
  if (window.location.hash) {
    history.replaceState(null, null, window.location.pathname);
  }
  setTimeout(() => {
    $("#loader").classList.add("hidden");
    initAll();
  }, 2000);
});

function initAll() {
  initNavbar();
  initHamburger();
  initTypewriter();
  initHeroScene();
  initAboutCard();
  initAboutScene();
  initSkillsScene();
  initOrbit();
  initProjectScenes();
  initContactScene();
  initScrollReveal();
  initCounters();
  initContactForm();
  initTilt();
}

/* ─────────────────────────────────────────
   NAVBAR
───────────────────────────────────────── */
function initNavbar() {
  const nav = $("#navbar");
  const links = $$(".nav-link");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);

    // Active link
    const sections = $$("section[id]");
    let current = "";
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    links.forEach(l => {
      l.classList.toggle("active", l.getAttribute("href") === `#${current}`);
    });
  });
}

/* ─────────────────────────────────────────
   HAMBURGER
───────────────────────────────────────── */
function initHamburger() {
  const btn  = $("#hamburger");
  const menu = $("#mobileMenu");
  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    menu.classList.toggle("open");
  });
  $$(".mob-link").forEach(l => l.addEventListener("click", () => {
    btn.classList.remove("open");
    menu.classList.remove("open");
  }));
}

/* ─────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────── */
function initTypewriter() {
  const el    = $("#typewriter");
  const words = ["Full-Stack Developer", "ML & AI Enthusiast", "MERN Specialist", "CSE Student"];
  let wi = 0, ci = 0, deleting = false;

  function tick() {
    const word = words[wi];
    el.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);

    if (!deleting && ci > word.length)      { deleting = true; setTimeout(tick, 1400); return; }
    if (deleting  && ci < 0)                { deleting = false; wi = (wi + 1) % words.length; }
    setTimeout(tick, deleting ? 55 : 95);
  }
  tick();
}

/* ═══════════════════════════════════════════════════════
   THREE.JS — HERO SCENE  (floating particles + torus)
═══════════════════════════════════════════════════════ */
function initHeroScene() {
  const canvas = $("#heroCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Ambient + point lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const pl1 = new THREE.PointLight(0xc9a84c, 4, 20);
  pl1.position.set(3, 3, 3);
  scene.add(pl1);
  const pl2 = new THREE.PointLight(0xe8d5a3, 3, 20);
  pl2.position.set(-3, -2, 2);
  scene.add(pl2);

  // ── Torus knot (hero centrepiece) ──
  const torusGeo = new THREE.TorusKnotGeometry(1.2, 0.38, 180, 24, 2, 3);
  const torusMat = new THREE.MeshStandardMaterial({
    color: 0xc9a84c,
    metalness: 0.85,
    roughness: 0.1,
    wireframe: false,
  });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(3.5, 0, -1);
  scene.add(torus);

  // ── Icosahedron ──
  const icoGeo = new THREE.IcosahedronGeometry(0.7, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0xe8d5a3,
    metalness: 0.9,
    roughness: 0.08,
    wireframe: true,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-3.5, 1, -1);
  scene.add(ico);

  // ── Particle field ──
  const pCount = 1800;
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount * 3; i++) pPos[i] = rand(-12, 12);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    size: 0.025,
    color: 0xc9a84c,
    transparent: true,
    opacity: 0.55,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(pGeo, pMat);
  scene.add(particles);

  // ── Mouse parallax ──
  let mx = 0, my = 0;
  document.addEventListener("mousemove", e => {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ──
  window.addEventListener("resize", () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  });

  // ── Animate ──
  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    torus.rotation.x = t * 0.4;
    torus.rotation.y = t * 0.3;
    ico.rotation.x   = t * 0.5;
    ico.rotation.y   = t * 0.6;
    particles.rotation.y = t * 0.04;

    // Parallax
    camera.position.x = lerp(camera.position.x, mx * 0.5, 0.05);
    camera.position.y = lerp(camera.position.y, -my * 0.3, 0.05);
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  })();
}

/* ═══════════════════════════════════════════════════════
   THREE.JS — ABOUT CARD SCENE  (animated sphere)
═══════════════════════════════════════════════════════ */
function initAboutScene() {
  const canvas = $("#aboutCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 50);
  camera.position.z = 3;

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const pl = new THREE.PointLight(0xc9a84c, 5, 15);
  pl.position.set(2, 2, 2);
  scene.add(pl);
  const pl2 = new THREE.PointLight(0xe8d5a3, 4, 15);
  pl2.position.set(-2, -1, 1);
  scene.add(pl2);

  // Sphere with displacement-like effect via wireframe overlay
  const sGeo = new THREE.SphereGeometry(1.4, 64, 64);
  const sMat = new THREE.MeshStandardMaterial({
    color: 0x1a1508,
    metalness: 0.7,
    roughness: 0.25,
  });
  const sphere = new THREE.Mesh(sGeo, sMat);
  scene.add(sphere);

  const wGeo = new THREE.SphereGeometry(1.42, 24, 24);
  const wMat = new THREE.MeshBasicMaterial({ color: 0xc9a84c, wireframe: true, transparent: true, opacity: 0.22 });
  const wire = new THREE.Mesh(wGeo, wMat);
  scene.add(wire);

  // Orbiting ring
  const rGeo = new THREE.TorusGeometry(1.9, 0.03, 8, 80);
  const rMat = new THREE.MeshBasicMaterial({ color: 0xe8d5a3, transparent: true, opacity: 0.5 });
  const ring = new THREE.Mesh(rGeo, rMat);
  ring.rotation.x = Math.PI / 3;
  scene.add(ring);

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    sphere.rotation.y = t * 0.3;
    wire.rotation.y   = -t * 0.2;
    ring.rotation.z   = t * 0.5;
    renderer.render(scene, camera);
  })();
}

/* ─────────────────────────────────────────
   ABOUT CARD — 3-D tilt on mouse
───────────────────────────────────────── */
function initAboutCard() {
  const card = $("#aboutCard");
  if (!card) return;
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `rotateY(${x * 22}deg) rotateX(${-y * 22}deg) scale(1.04)`;
  });
  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateY(0) rotateX(0) scale(1)";
  });
}

/* ═══════════════════════════════════════════════════════
   THREE.JS — SKILLS BACKGROUND  (floating cubes)
═══════════════════════════════════════════════════════ */
function initSkillsScene() {
  const canvas = $("#skillsCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.z = 8;

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const pl = new THREE.PointLight(0xc9a84c, 3, 30);
  pl.position.set(5, 5, 5);
  scene.add(pl);

  const cubes = [];
  const colors = [0xc9a84c, 0xe8d5a3, 0x8b6914, 0xd4af6a];
  for (let i = 0; i < 30; i++) {
    const s = rand(0.15, 0.55);
    const geo = new THREE.BoxGeometry(s, s, s);
    const mat = new THREE.MeshStandardMaterial({
      color: colors[randInt(0, colors.length)],
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: rand(0.3, 0.7),
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(rand(-10, 10), rand(-6, 6), rand(-5, 0));
    mesh.rotation.set(rand(0, Math.PI), rand(0, Math.PI), rand(0, Math.PI));
    mesh.userData = { vy: rand(-0.005, 0.005), vr: rand(0.003, 0.012) };
    scene.add(mesh);
    cubes.push(mesh);
  }

  window.addEventListener("resize", () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  });

  (function animate() {
    requestAnimationFrame(animate);
    cubes.forEach(c => {
      c.position.y += c.userData.vy;
      c.rotation.x  += c.userData.vr;
      c.rotation.y  += c.userData.vr * 0.7;
      if (c.position.y > 7)  c.position.y = -7;
      if (c.position.y < -7) c.position.y =  7;
    });
    renderer.render(scene, camera);
  })();
}

/* ═══════════════════════════════════════════════════════
   TECH ORBIT — Solar System Skills
═══════════════════════════════════════════════════════ */
function initOrbit() {
  const system = $("#orbitSystem");
  if (!system) return;

  const skillData = [
    { icon:"fa-brands fa-react",    title:"Frontend",  tags:["React.js","TypeScript","Next.js","Tailwind CSS","HTML5","JavaScript"] },
    { icon:"fa-brands fa-node-js",  title:"Backend",   tags:["Node.js","Express.js","REST API","MERN Stack","Passport.js"] },
    { icon:"fa-solid fa-database",  title:"Database",  tags:["MongoDB","PostgreSQL","Supabase","Mongoose","SQL","MongoDB Atlas"] },
    { icon:"fa-brands fa-git-alt",  title:"Tools",     tags:["Git","GitHub","VS Code","Postman","Hoppscotch"] },
    { icon:"fa-solid fa-brain",     title:"AI / ML",   tags:["Machine Learning","Generative AI","TensorFlow","scikit-learn","Deep Learning"] },
    { icon:"fa-solid fa-code",      title:"Languages", tags:["Python","JavaScript","TypeScript","Java","C"] },
  ];

  const planets  = $$(".orbit-planet", system);
  const sidebar  = $("#orbitSidebar");
  const osbIcon  = $("#osbIcon");
  const osbTitle = $("#osbTitle");
  const osbList  = $("#osbList");

  const orbits = [
    { rx:130, ry:50  },
    { rx:210, ry:80  },
    { rx:295, ry:115 },
  ];
  const planetCfg = [
    { orbit:0, angle:0   },
    { orbit:1, angle:60  },
    { orbit:2, angle:120 },
    { orbit:0, angle:180 },
    { orbit:1, angle:240 },
    { orbit:2, angle:300 },
  ];
  const speeds = [0.45, 0.28, 0.18];
  const angles = planetCfg.map(p => p.angle * Math.PI / 180);
  const cx = system.offsetWidth  / 2;
  const cy = system.offsetHeight / 2;

  function placePlanet(el, orbitIdx, angle) {
    const o = orbits[orbitIdx];
    el.style.left = (cx + o.rx * Math.cos(angle)) + "px";
    el.style.top  = (cy + o.ry * Math.sin(angle)) + "px";
  }

  planets.forEach((el, i) => placePlanet(el, planetCfg[i].orbit, angles[i]));

  let hideTimer = null;

  function showSidebar(i) {
    clearTimeout(hideTimer);
    const d = skillData[i];
    osbIcon.innerHTML    = `<i class="${d.icon}"></i>`;
    osbTitle.textContent = d.title;
    osbList.innerHTML    = d.tags.map((t, ti) =>
      `<li style="animation-delay:${ti * 0.04}s">${t}</li>`
    ).join("");
    sidebar.classList.add("visible");
    planets.forEach((p, j) => {
      p.classList.toggle("active", j === i);
      p.classList.toggle("dimmed", j !== i);
    });
  }

  function hideSidebar() {
    hideTimer = setTimeout(() => {
      sidebar.classList.remove("visible");
      planets.forEach(p => p.classList.remove("active", "dimmed"));
    }, 200);
  }

  planets.forEach((el, i) => {
    el.addEventListener("mouseenter", () => showSidebar(i));
    el.addEventListener("mouseleave", hideSidebar);
  });
  sidebar.addEventListener("mouseenter", () => clearTimeout(hideTimer));
  sidebar.addEventListener("mouseleave", hideSidebar);

  // Animation loop
  let last = performance.now();
  (function loop(now) {
    requestAnimationFrame(loop);
    const dt = (now - last) / 1000;
    last = now;
    planets.forEach((el, i) => {
      angles[i] += speeds[planetCfg[i].orbit] * dt;
      placePlanet(el, planetCfg[i].orbit, angles[i]);
    });
  })(performance.now());
}

/* ═══════════════════════════════════════════════════════
   THREE.JS — PROJECT CARD SCENES  (unique per card)
═══════════════════════════════════════════════════════ */
function initProjectScenes() {
  const configs = [
    { color: 0xc9a84c, shape: "torus",  bg: 0x0f0c04 },
    { color: 0xe8d5a3, shape: "knot",   bg: 0x0d0d0d },
    { color: 0x8b6914, shape: "octa",   bg: 0x0a0800 },
    { color: 0xd4af6a, shape: "sphere", bg: 0x0c0b08 },
  ];

  configs.forEach((cfg, i) => {
    const canvas = $(`#pCanvas${i}`);
    if (!canvas) return;

    const w = canvas.parentElement.clientWidth  || 400;
    const h = canvas.parentElement.clientHeight || 220;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(cfg.bg, 1);
    renderer.setSize(w, h);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 50);
    camera.position.z = 3.5;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl  = new THREE.PointLight(cfg.color, 6, 15);
    pl.position.set(2, 2, 2);
    scene.add(pl);
    const pl2 = new THREE.PointLight(0xffffff, 1.5, 15);
    pl2.position.set(-2, -1, 1);
    scene.add(pl2);

    const mat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      metalness: 0.85,
      roughness: 0.1,
      envMapIntensity: 1,
    });

    let mesh;
    if (cfg.shape === "torus")  mesh = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.34, 40, 100), mat);
    if (cfg.shape === "knot")   mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.7, 0.22, 150, 20), mat);
    if (cfg.shape === "octa")   mesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.0, 2), mat);
    if (cfg.shape === "sphere") mesh = new THREE.Mesh(new THREE.SphereGeometry(1.0, 64, 64), mat);
    scene.add(mesh);

    // Wireframe halo
    const haloMat = new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true, transparent: true, opacity: 0.08 });
    let haloGeo;
    if (cfg.shape === "torus")  haloGeo = new THREE.TorusGeometry(0.9, 0.34, 12, 40);
    if (cfg.shape === "knot")   haloGeo = new THREE.TorusKnotGeometry(0.7, 0.22, 60, 8);
    if (cfg.shape === "octa")   haloGeo = new THREE.OctahedronGeometry(1.05, 2);
    if (cfg.shape === "sphere") haloGeo = new THREE.SphereGeometry(1.05, 16, 16);
    const halo = new THREE.Mesh(haloGeo, haloMat);
    scene.add(halo);

    // Particle ring
    const pCount = 400;
    const pPos   = new Float32Array(pCount * 3);
    for (let j = 0; j < pCount; j++) {
      const a = rand(0, Math.PI * 2);
      const r = rand(1.5, 2.2);
      pPos[j * 3]     = Math.cos(a) * r;
      pPos[j * 3 + 1] = rand(-0.25, 0.25);
      pPos[j * 3 + 2] = Math.sin(a) * r;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ size: 0.028, color: cfg.color, transparent: true, opacity: 0.55, sizeAttenuation: true });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Smooth speed with lerp
    let targetSpeed = 0.5, currentSpeed = 0.5;
    const card = canvas.parentElement.parentElement;
    card.addEventListener("mouseenter", () => targetSpeed = 2.2);
    card.addEventListener("mouseleave", () => targetSpeed = 0.5);

    // Mouse tilt
    let tiltX = 0, tiltY = 0;
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      tiltX = ((e.clientY - r.top)  / r.height - 0.5) * -0.3;
      tiltY = ((e.clientX - r.left) / r.width  - 0.5) *  0.3;
    });
    card.addEventListener("mouseleave", () => { tiltX = 0; tiltY = 0; });

    // Resize
    const ro = new ResizeObserver(() => {
      const nw = canvas.parentElement.clientWidth;
      const nh = canvas.parentElement.clientHeight;
      renderer.setSize(nw, nh);
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas.parentElement);

    // Delta-time animation — smooth regardless of speed changes
    let last = performance.now();
    let rx = 0, ry = 0;
    (function animate(now) {
      requestAnimationFrame(animate);
      const dt = Math.min((now - last) / 1000, 0.05); // cap at 50ms
      last = now;

      currentSpeed = lerp(currentSpeed, targetSpeed, 0.06);

      rx += dt * currentSpeed * 0.4;
      ry += dt * currentSpeed * 0.6;

      mesh.rotation.x  = rx + tiltX;
      mesh.rotation.y  = ry + tiltY;
      halo.rotation.x  = -rx * 0.5;
      halo.rotation.y  =  ry * 0.7;
      particles.rotation.y += dt * currentSpeed * 0.15;

      renderer.render(scene, camera);
    })(performance.now());
  });
}

/* ═══════════════════════════════════════════════════════
   THREE.JS — CONTACT BACKGROUND  (wave grid)
═══════════════════════════════════════════════════════ */
function initContactScene() {
  const canvas = $("#contactCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 6, 10);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const pl = new THREE.PointLight(0x7c3aed, 4, 30);
  pl.position.set(0, 5, 5);
  scene.add(pl);

  // Wave grid
  const cols = 40, rows = 40;
  const geo  = new THREE.PlaneGeometry(20, 20, cols - 1, rows - 1);
  geo.rotateX(-Math.PI / 2);
  const mat  = new THREE.MeshBasicMaterial({ color: 0xc9a84c, wireframe: true, transparent: true, opacity: 0.25 });
  const grid = new THREE.Mesh(geo, mat);
  scene.add(grid);

  const posAttr = geo.attributes.position;
  const origY   = new Float32Array(posAttr.count);
  for (let i = 0; i < posAttr.count; i++) origY[i] = posAttr.getY(i);

  window.addEventListener("resize", () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  });

  const clock = new THREE.Clock();
  (function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const z = posAttr.getZ(i);
      posAttr.setY(i, origY[i] + Math.sin(x * 0.8 + t) * 0.3 + Math.cos(z * 0.8 + t * 0.7) * 0.3);
    }
    posAttr.needsUpdate = true;
    renderer.render(scene, camera);
  })();
}

/* ─────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────── */
function initScrollReveal() {
  const els = $$(".section-header,.about-grid,.skill-card,.project-card,.contact-grid");
  els.forEach(el => el.classList.add("reveal"));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  $$(".reveal").forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────
   COUNTERS
───────────────────────────────────────── */
function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        $$(".stat-num", e.target).forEach(el => {
          const target = +el.dataset.target;
          let current  = 0;
          const step   = target / 60;
          const timer  = setInterval(() => {
            current += step;
            if (current >= target) { el.textContent = target; clearInterval(timer); }
            else el.textContent = Math.floor(current);
          }, 20);
        });
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  $$(".about-card").forEach(el => io.observe(el));
}

/* ─────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────── */
function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;
  form.addEventListener("submit", () => {
    const btn = form.querySelector("button[type=submit]");
    btn.textContent = "Sending\u2026";
    btn.disabled = true;
  });
}

/* ─────────────────────────────────────────
   TILT EFFECT (skill cards)
───────────────────────────────────────── */
function initTilt() {
  $$("[data-tilt]").forEach(el => {
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      el.style.transform = `perspective(600px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-8px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(600px) rotateY(0) rotateX(0) translateY(0)";
    });
  });
}
