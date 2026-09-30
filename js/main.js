document.getElementById('top-title').textContent = CONFIG.titulo;

const letterBody = document.getElementById('love-letter-body');
(CONFIG.mensaje || DEFAULTS.mensaje).split(/\n\s*\n/).forEach((paragraph) => {
  const p = document.createElement('p');
  p.textContent = paragraph.trim();
  letterBody.appendChild(p);
});

const startScreen = document.getElementById('start-screen');
const audio = document.getElementById('audio');
audio.src = CONFIG.musica;
audio.preload = 'auto';
audio.load();

let experienceStarted = false;
function unlockAudioAndStart() {
  if (experienceStarted) return;
  experienceStarted = true;
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(err => console.log("Audio no autoplay:", err));
  }
  startScreen.classList.add('hidden');
}
startScreen.addEventListener('touchend', (e) => {
  e.preventDefault();
  unlockAudioAndStart();
}, {passive: false});
startScreen.addEventListener('click', unlockAudioAndStart);

const isMobile = /Android|iPhone|iPad|iPod|Mobi/i.test(navigator.userAgent) || window.innerWidth <= 820;
const letterBtn = document.getElementById('love-letter-btn');
const letterOverlay = document.getElementById('love-letter-overlay');
const letterClose = document.getElementById('love-letter-close');
function openLetter(){ letterOverlay.classList.add('visible'); }
function closeLetter(){ letterOverlay.classList.remove('visible'); }
letterBtn.addEventListener('click', openLetter);
letterClose.addEventListener('click', closeLetter);
letterOverlay.addEventListener('click', (e) => { if (e.target === letterOverlay) closeLetter(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLetter(); });

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({canvas, antialias: !isMobile});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
renderer.setSize(innerWidth, innerHeight);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 5000);
let targetDist = 400, currentDist = 400;
let rotX = 0.2;
let rotY = 0;

function makeDotTexture(){
  const size = 64;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
  grad.addColorStop(0.0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.55, 'rgba(255,255,255,1)');
  grad.addColorStop(0.85, 'rgba(255,255,255,0.55)');
  grad.addColorStop(1.0, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const dotTexture = makeDotTexture();

(function makeStars(count = isMobile ? 1400 : 2200, spread=3000){
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for(let i=0; i<count; i++){
    const r = spread * (0.3 + Math.random() * 0.7);
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pos[i*3+0] = r * Math.sin(ph) * Math.cos(th);
    pos[i*3+1] = r * Math.cos(ph);
    pos[i*3+2] = r * Math.sin(ph) * Math.sin(th);
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({
    size: 2.2,
    sizeAttenuation: false,
    map: dotTexture,
    transparent: true,
    alphaTest: 0.01,
    depthWrite: false,
    opacity: 0.9,
    color: 0xd9ecff
  })));
})();

// --- CURVA DEL CARRO ---
const CAR_BODY = [
  [16, -6.8], [16, 1.2], [8.4, 1.2], [4.0, 6.8],
  [-5.6, 6.8], [-8.4, 1.2], [-16, 1.2], [-16, -6.8]
];
const CAR_WHEEL_R = 3.36;
const CAR_WHEEL_REAR = [-9.2, -6.8];
const CAR_WHEEL_FRONT = [9.2, -6.8];
const CAR_BODY_FRAC = 0.7, CAR_WHEEL_FRAC = 0.15;
function carCurve(t){
  const u = (((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
  if (u < CAR_BODY_FRAC) {
    const n = CAR_BODY.length;
    const segF = (u / CAR_BODY_FRAC) * n;
    const idx = Math.floor(segF) % n;
    const frac = segF - Math.floor(segF);
    const a = CAR_BODY[idx], b = CAR_BODY[(idx + 1) % n];
    return { x: a[0] + (b[0] - a[0]) * frac, y: a[1] + (b[1] - a[1]) * frac };
  }
  if (u < CAR_BODY_FRAC + CAR_WHEEL_FRAC) {
    const angle = ((u - CAR_BODY_FRAC) / CAR_WHEEL_FRAC) * Math.PI * 2;
    return { x: CAR_WHEEL_REAR[0] + CAR_WHEEL_R * Math.cos(angle), y: CAR_WHEEL_REAR[1] + CAR_WHEEL_R * Math.sin(angle) };
  }
  const angle = ((u - CAR_BODY_FRAC - CAR_WHEEL_FRAC) / CAR_WHEEL_FRAC) * Math.PI * 2;
  return { x: CAR_WHEEL_FRONT[0] + CAR_WHEEL_R * Math.cos(angle), y: CAR_WHEEL_FRONT[1] + CAR_WHEEL_R * Math.sin(angle) };
}

// --- CURVA DE LA MOTO ---
const MOTO_BODY = [
  [-14, -6], [-14, 2], [-8, 2], [-6, 8], [0, 10], [4, 8], [8, 4], [12, 4], [14, 0], [14, -6]
];
const MOTO_WHEEL_R = 3.8;
const MOTO_WHEEL_REAR = [-10, -6];
const MOTO_WHEEL_FRONT = [10, -6];
const MOTO_BODY_FRAC = 0.65, MOTO_WHEEL_FRAC = 0.175;

function motoCurve(t){
  const u = (((t % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
  if (u < MOTO_BODY_FRAC) {
    const n = MOTO_BODY.length;
    const segF = (u / MOTO_BODY_FRAC) * n;
    const idx = Math.floor(segF) % n;
    const frac = segF - Math.floor(segF);
    const a = MOTO_BODY[idx], b = MOTO_BODY[(idx + 1) % n];
    return { x: a[0] + (b[0] - a[0]) * frac, y: a[1] + (b[1] - a[1]) * frac };
  }
  if (u < MOTO_BODY_FRAC + MOTO_WHEEL_FRAC) {
    const angle = ((u - MOTO_BODY_FRAC) / MOTO_WHEEL_FRAC) * Math.PI * 2;
    return { x: MOTO_WHEEL_REAR[0] + MOTO_WHEEL_R * Math.cos(angle), y: MOTO_WHEEL_REAR[1] + MOTO_WHEEL_R * Math.sin(angle) };
  }
  const angle = ((u - MOTO_BODY_FRAC - MOTO_WHEEL_FRAC) / MOTO_WHEEL_FRAC) * Math.PI * 2;
  return { x: MOTO_WHEEL_FRONT[0] + MOTO_WHEEL_R * Math.cos(angle), y: MOTO_WHEEL_FRONT[1] + MOTO_WHEEL_R * Math.sin(angle) };
}

const SHAPE_SCALE = 3.2;
const SHAPE_THICKNESS = 3.4;
const SHAPE_DEPTH = 8.5;

function buildShapePositions(curveFn, count, yOffset){
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random() * Math.PI * 2;
    const p0 = curveFn(t);
    const p1 = curveFn(t + 0.001);
    const tx = p1.x - p0.x, ty = p1.y - p0.y;
    const tLen = Math.hypot(tx, ty) || 1;
    const nx = -ty / tLen, ny = tx / tLen;
    const offset = (Math.random() - 0.5) * SHAPE_THICKNESS;

    const rawX = p0.x + nx * offset;
    const rawY = p0.y + ny * offset + yOffset;

    const ix = i * 3;
    arr[ix]   = rawX * SHAPE_SCALE;
    arr[ix+1] = rawY * SHAPE_SCALE;
    arr[ix+2] = (Math.random() - 0.5) * SHAPE_DEPTH;
  }
  return arr;
}

const SHAPE_COUNT = isMobile ? 4400 : 5800;
// Posiciones base: moto (yOffset 0)
const motoPos = buildShapePositions(motoCurve, SHAPE_COUNT, 0);
// Posiciones destino: carro (yOffset 0)
const carPos = buildShapePositions(carCurve, SHAPE_COUNT, 0);
// Array mutable que se actualiza en el tick
const shapePos = motoPos.slice();

const shapeGeom = new THREE.BufferGeometry();
shapeGeom.setAttribute('position', new THREE.BufferAttribute(shapePos, 3));
const shapeMat = new THREE.PointsMaterial({
  color: 0x7fd9ff,
  size: 1.6,
  map: dotTexture,
  transparent: true,
  alphaTest: 0.01,
  depthWrite: false,
  opacity: 1,
  blending: THREE.AdditiveBlending
});
const shape = new THREE.Points(shapeGeom, shapeMat);
scene.add(shape);

const SHAPE_HOLD_SECONDS = 6;
const SHAPE_MORPH_SECONDS = 2.4;
const SHAPE_CYCLE_SECONDS = (SHAPE_HOLD_SECONDS + SHAPE_MORPH_SECONDS) * 2;
function easeInOutCubic(x){ return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2, 3)/2; }
function shapeMixAt(elapsedSec){
  const p = elapsedSec % SHAPE_CYCLE_SECONDS;
  if (p < SHAPE_HOLD_SECONDS) return 0; // moto
  if (p < SHAPE_HOLD_SECONDS + SHAPE_MORPH_SECONDS) {
    return easeInOutCubic((p - SHAPE_HOLD_SECONDS) / SHAPE_MORPH_SECONDS); // moto -> carro
  }
  if (p < SHAPE_HOLD_SECONDS * 2 + SHAPE_MORPH_SECONDS) return 1; // carro
  return 1 - easeInOutCubic((p - SHAPE_HOLD_SECONDS * 2 - SHAPE_MORPH_SECONDS) / SHAPE_MORPH_SECONDS); // carro -> moto
}
const sceneStartMs = performance.now();

const spiralPoints = [];
const arms = 4;
const SPIRAL_COUNT = isMobile ? 4600 : 7000;
for (let i = 0; i < SPIRAL_COUNT; i++) {
  const r = Math.random() * 250;
  const armIndex = Math.floor(Math.random() * arms);
  const theta = (armIndex * Math.PI * 2 / arms) + (r * 0.02) + (Math.random() * 0.4 - 0.2);
  const sx = Math.cos(theta) * r;
  const sz = Math.sin(theta) * r;
  const sy = -35 - (r * 0.4) + (Math.random() * 8 - 4);
  spiralPoints.push(new THREE.Vector3(sx, sy, sz));
}
const spiralGeom = new THREE.BufferGeometry().setFromPoints(spiralPoints);
const spiralMat = new THREE.PointsMaterial({
  color: 0x66d9ff,
  size: 2.1,
  map: dotTexture,
  transparent: true,
  alphaTest: 0.01,
  depthWrite: false,
  opacity: 1,
  blending: THREE.AdditiveBlending
});
const spiral = new THREE.Points(spiralGeom, spiralMat);
scene.add(spiral);

const DUST_INNER_R = 150;
const DUST_OUTER_R = 380;
const dustPoints = [];
const DUST_COUNT = isMobile ? 7000 : 14000;
for (let i = 0; i < DUST_COUNT; i++) {
  const r = DUST_INNER_R + Math.random() * (DUST_OUTER_R - DUST_INNER_R);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  dustPoints.push(new THREE.Vector3(
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  ));
}
const dustGeom = new THREE.BufferGeometry().setFromPoints(dustPoints);
const dustMat = new THREE.PointsMaterial({
  color: 0xc2e6ff,
  size: 1.0,
  map: dotTexture,
  transparent: true,
  alphaTest: 0.01,
  depthWrite: false,
  opacity: 0.68,
  blending: THREE.AdditiveBlending
});
const dust = new THREE.Points(dustGeom, dustMat);
scene.add(dust);

const hitSphere = new THREE.Mesh(
  new THREE.SphereGeometry(62, 16, 16),
  new THREE.MeshBasicMaterial({visible: false})
);
scene.add(hitSphere);

function makeGlow(size=768, c1='140,210,255', c2='0,153,255'){
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size/2, size/2, size*0.05, size/2, size/2, size*0.5);
  grad.addColorStop(0, 'rgba(' + c1 + ',0.88)');
  grad.addColorStop(0.5, 'rgba(' + c2 + ',0.34)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad; g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}
const glow = new THREE.Sprite(new THREE.SpriteMaterial({map: makeGlow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending}));
glow.scale.set(500, 500, 1);
scene.add(glow);

function ringTexture(size=768){
  const c = document.createElement('canvas'); c.width = c.height = size;
  const g = c.getContext('2d'); g.translate(size/2, size/2);
  const r1 = size*0.35, r2 = size*0.48;
  const grd = g.createRadialGradient(0, 0, r1*0.6, 0, 0, r2);
  grd.addColorStop(0.0, 'rgba(240,250,255,1)');
  grd.addColorStop(0.3, 'rgba(120,190,255,1)');
  grd.addColorStop(0.7, 'rgba(20,120,220,0.8)');
  grd.addColorStop(1.0, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.beginPath(); g.arc(0,0,r2,0,Math.PI*2); g.arc(0,0,r1,0,Math.PI*2,true); g.closePath(); g.fill();
  return new THREE.CanvasTexture(c);
}
const ring1 = new THREE.Mesh(new THREE.RingGeometry(80, 115, 128), new THREE.MeshBasicMaterial({map: ringTexture(), transparent: true, side: THREE.DoubleSide, opacity: 0.42, blending: THREE.AdditiveBlending}));
const ring2 = new THREE.Mesh(new THREE.RingGeometry(125, 155, 128), new THREE.MeshBasicMaterial({map: ringTexture(), transparent: true, side: THREE.DoubleSide, opacity: 0.28, blending: THREE.AdditiveBlending}));
ring1.rotation.x = ring2.rotation.x = Math.PI/2;
scene.add(ring1); scene.add(ring2);

const WORDS = [];
const baseWords = (Array.isArray(CONFIG.frases) && CONFIG.frases.length) ? CONFIG.frases : DEFAULTS.frases;
const PHRASE_REPEAT = isMobile ? 4 : 6;
for(let i=0; i<PHRASE_REPEAT; i++){ WORDS.push(...baseWords); }

function makeTextTexture(text, color){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128;
  const ctx = c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let fontSize = 50;
  ctx.font = `700 ${fontSize}px "Indie Flower", cursive`;
  while (ctx.measureText(text).width > c.width - 50 && fontSize > 26) {
    fontSize -= 2;
    ctx.font = `700 ${fontSize}px "Indie Flower", cursive`;
  }
  ctx.fillStyle = '#eaf6ff'; ctx.shadowColor = color; ctx.shadowBlur = 25;
  ctx.fillText(text, c.width/2, c.height/2);
  const tex = new THREE.CanvasTexture(c);
  tex.encoding = THREE.sRGBEncoding;
  return tex;
}
const COLORS = ['#1E90FF','#00BFFF','#0099FF','#38BDF8','#87CEEB','#4F8CFF','#2563EB','#ADD8E6','#00CFFF','#3B82F6'];
const textGroup = new THREE.Group(); scene.add(textGroup);

document.fonts.ready.then(() => {
  for(let i=0; i<WORDS.length; i++){
    const tex = makeTextTexture(WORDS[i], COLORS[i%COLORS.length]);
    const mat = new THREE.SpriteMaterial({map: tex, transparent: true, depthWrite: false, alphaTest: 0.01});
    const sp = new THREE.Sprite(mat);
    sp.scale.set(110, 13.75, 1);
    const phi = Math.acos(2 * Math.random() - 1); const theta = Math.random() * Math.PI * 2;
    const r = DUST_INNER_R + Math.random() * (DUST_OUTER_R - DUST_INNER_R - 30);
    sp.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    sp.userData = {phi: phi, theta: theta, radius: r, speed: 0.001 + Math.random() * 0.001};
    textGroup.add(sp);
  }
});

const photoGroup = new THREE.Group(); scene.add(photoGroup);
const photoGlowTex = makeGlow(512, '150,210,255', '51,181,255');

const PHOTO_PATHS = (Array.isArray(CONFIG.fotos) && CONFIG.fotos.length) ? CONFIG.fotos : DEFAULTS.fotos;
const PHOTO_REPEAT = isMobile ? 7 : 12;
const PHOTO_INSTANCES = [];
for (let rep = 0; rep < PHOTO_REPEAT; rep++) { PHOTO_INSTANCES.push(...PHOTO_PATHS); }

function loadTextureRobust(path, onLoaded, onError) {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const tex = new THREE.Texture(img);
    tex.encoding = THREE.sRGBEncoding;
    tex.needsUpdate = true;
    onLoaded(tex, img.naturalWidth || 1, img.naturalHeight || 1);
  };
  img.onerror = (e) => {
    console.warn('No se pudo cargar la imagen:', path, e);
    if (onError) onError(e);
  };
  img.src = path;
}

PHOTO_INSTANCES.forEach((path) => {
  const phi = Math.acos(2 * Math.random() - 1);
  const theta = Math.random() * Math.PI * 2;
  const r = DUST_INNER_R + Math.random() * (DUST_OUTER_R - DUST_INNER_R - 30);
  const speed = 0.0007 + Math.random() * 0.0009;
  const baseSize = isMobile ? 21 : 23;

  const glowMat = new THREE.SpriteMaterial({
    map: photoGlowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  });
  const glowSprite = new THREE.Sprite(glowMat);
  glowSprite.scale.set(baseSize * 1.6, baseSize * 1.6, 1);
  glowSprite.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  glowSprite.renderOrder = -1;
  glowSprite.userData = {phi: phi, theta: theta, radius: r, speed: speed};
  photoGroup.add(glowSprite);

  loadTextureRobust(path, (tex, iw, ih) => {
    const ratio = iw / ih;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0.96
    });
    const photoSprite = new THREE.Sprite(mat);
    if (ratio >= 1) {
      photoSprite.scale.set(baseSize * ratio, baseSize, 1);
    } else {
      photoSprite.scale.set(baseSize, baseSize / ratio, 1);
    }
    photoSprite.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
    photoSprite.userData = {phi: phi, theta: theta, radius: r, speed: speed, isPhoto: true};
    photoGroup.add(photoSprite);
  }, () => {
    console.log('Falló la carga de: ' + path + ' — revisa que exista y sea público.');
  });
});

let isPointerDown = false;
let isDragging = false;
let startX = 0, startY = 0;
let targetRotX = 0.2, targetRotY = 0;
let velX = 0, velY = 0;

function onDown(e) {
  isPointerDown = true;
  isDragging = false;
  velX = 0; velY = 0;
  const t = e.touches ? e.touches[0] : e;
  startX = t.clientX;
  startY = t.clientY;
}

function onMove(e) {
  if (!isPointerDown) return;
  if (e.touches && e.touches.length > 1) return;
  const t = e.touches ? e.touches[0] : e;
  const dx = t.clientX - startX;
  const dy = t.clientY - startY;

  if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
    isDragging = true;

    const sensX = (Math.PI * 1.5) / innerWidth;
    const sensY = (Math.PI * 0.8) / innerHeight;

    velY = -dx * sensX;
    velX =  dy * sensY;

    targetRotY += velY;
    targetRotX = Math.max(-1.25, Math.min(1.25, targetRotX + velX));

    startX = t.clientX;
    startY = t.clientY;
  }
}

function onUp() {
  isPointerDown = false;
}

const dom = renderer.domElement;
dom.addEventListener('mousedown', onDown);
dom.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);

dom.addEventListener('touchstart', onDown, {passive: true});
dom.addEventListener('touchmove', onMove, {passive: true});
window.addEventListener('touchend', (e) => {
  if (!e.touches || e.touches.length === 0) {
    onUp();
  } else {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    isDragging = false;
  }
}, {passive: true});

addEventListener('wheel', (e) => {
  targetDist += e.deltaY * 0.25;
  targetDist = Math.max(180, Math.min(1100, targetDist));
}, {passive: true});

let pinchDist = null;

function getPinchDist(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

addEventListener('touchstart', (e) => {
  if (e.touches.length === 2) {
    pinchDist = getPinchDist(e.touches);
    isPointerDown = false;
    isDragging = false;
  }
}, {passive: true});

addEventListener('touchmove', (e) => {
  if (e.touches.length === 2) {
    const newDist = getPinchDist(e.touches);
    if (pinchDist !== null) {
      const delta = pinchDist - newDist;
      targetDist += delta * 0.85;
      targetDist = Math.max(180, Math.min(1100, targetDist));
    }
    pinchDist = newDist;
  } else {
    if (pinchDist !== null) {
      pinchDist = null;
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isPointerDown = true;
        isDragging = false;
      }
    }
  }
}, {passive: true});

addEventListener('touchend', (e) => {
  if (e.touches.length < 2) {
    pinchDist = null;
  }
}, {passive: true});

let t = 0;
const INERTIA_DECAY = 0.88;

function tick(){
  requestAnimationFrame(tick);
  t += 0.01;

  if (!isPointerDown) {
    velX *= INERTIA_DECAY;
    velY *= INERTIA_DECAY;
    targetRotX = Math.max(-1.25, Math.min(1.25, targetRotX + velX));
    targetRotY += velY;
  }

  rotX += (targetRotX - rotX) * 0.12;
  rotY += (targetRotY - rotY) * 0.12;

  ring1.rotation.z += 0.002;
  ring2.rotation.z -= 0.0015;
  spiral.rotation.y -= 0.0045;
  dust.rotation.y += 0.0006;

  glow.scale.set(500 * (1 + Math.sin(t*0.4)*0.03), 500 * (1 + Math.sin(t*0.4)*0.03), 1);

  const s = 1.0 + 0.05 * Math.sin(t * 4);
  shape.scale.set(s, s, s);
  hitSphere.scale.set(s, s, s);

  const elapsedSec = (performance.now() - sceneStartMs) / 1000;
  const mix = shapeMixAt(elapsedSec);
  const posArr = shapeGeom.attributes.position.array;
  for (let i = 0; i < SHAPE_COUNT; i++) {
    const ix = i * 3;
    // Interpolamos entre moto (base) y carro (destino)
    posArr[ix]   = motoPos[ix]   + (carPos[ix]   - motoPos[ix])   * mix;
    posArr[ix+1] = motoPos[ix+1] + (carPos[ix+1] - motoPos[ix+1]) * mix;
    posArr[ix+2] = motoPos[ix+2] + (carPos[ix+2] - motoPos[ix+2]) * mix;
  }
  shapeGeom.attributes.position.needsUpdate = true;

  textGroup.children.forEach(sp => {
    sp.material.opacity = 0.8 + 0.2 * Math.sin(t * 2);
    sp.userData.theta += sp.userData.speed;
    sp.position.x = sp.userData.radius * Math.sin(sp.userData.phi) * Math.cos(sp.userData.theta);
    sp.position.z = sp.userData.radius * Math.sin(sp.userData.phi) * Math.sin(sp.userData.theta);
  });

  photoGroup.children.forEach(sp => {
    sp.userData.theta += sp.userData.speed;
    sp.position.x = sp.userData.radius * Math.sin(sp.userData.phi) * Math.cos(sp.userData.theta);
    sp.position.z = sp.userData.radius * Math.sin(sp.userData.phi) * Math.sin(sp.userData.theta);
    if (sp.userData.isPhoto) {
      sp.material.opacity = 0.82 + 0.14 * Math.sin(t * 1.6 + sp.userData.radius);
    }
  });

  currentDist += (targetDist - currentDist) * 0.06;

  const camX = currentDist * Math.cos(rotX) * Math.sin(rotY);
  const camY = currentDist * Math.sin(rotX);
  const camZ = currentDist * Math.cos(rotX) * Math.cos(rotY);
  camera.position.set(camX, camY, camZ);
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
}
tick();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
