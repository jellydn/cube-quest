import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ===== COLORS =====
const COLORS = {
  white:  0xffffff,
  yellow: 0xffd000,
  red:    0xc41e3a,
  orange: 0xff5722,
  green:  0x009b48,
  blue:   0x0046ad,
  black:  0x111111,
};

// Face index mapping for BoxGeometry: [right(+X), left(-X), top(+Y), bottom(-Y), front(+Z), back(-Z)]
const FACE_RIGHT = 0, FACE_LEFT = 1, FACE_TOP = 2, FACE_BOTTOM = 3, FACE_FRONT = 4, FACE_BACK = 5;

// ===== MOVE DEFINITIONS =====
// Each move: which axis, which layer value, target rotation angle (radians)
// Clockwise when viewed from outside that face
const MOVES = {
  'R':  { axis: 'x', layer:  1, angle: -Math.PI / 2 },
  "R'": { axis: 'x', layer:  1, angle:  Math.PI / 2 },
  'R2': { axis: 'x', layer:  1, angle:  Math.PI },
  'L':  { axis: 'x', layer: -1, angle:  Math.PI / 2 },
  "L'": { axis: 'x', layer: -1, angle: -Math.PI / 2 },
  'L2': { axis: 'x', layer: -1, angle:  Math.PI },
  'U':  { axis: 'y', layer:  1, angle: -Math.PI / 2 },
  "U'": { axis: 'y', layer:  1, angle:  Math.PI / 2 },
  'U2': { axis: 'y', layer:  1, angle:  Math.PI },
  'D':  { axis: 'y', layer: -1, angle:  Math.PI / 2 },
  "D'": { axis: 'y', layer: -1, angle: -Math.PI / 2 },
  'D2': { axis: 'y', layer: -1, angle:  Math.PI },
  'F':  { axis: 'z', layer:  1, angle: -Math.PI / 2 },
  "F'": { axis: 'z', layer:  1, angle:  Math.PI / 2 },
  'F2': { axis: 'z', layer:  1, angle:  Math.PI },
  'B':  { axis: 'z', layer: -1, angle:  Math.PI / 2 },
  "B'": { axis: 'z', layer: -1, angle: -Math.PI / 2 },
  'B2': { axis: 'z', layer: -1, angle:  Math.PI },
};

// Color mapping per face
const FACE_COLORS = {
  [FACE_RIGHT]:  COLORS.red,
  [FACE_LEFT]:   COLORS.orange,
  [FACE_TOP]:    COLORS.white,
  [FACE_BOTTOM]: COLORS.yellow,
  [FACE_FRONT]:  COLORS.green,
  [FACE_BACK]:   COLORS.blue,
};

// Move-to-color mapping for UI chips
export const MOVE_COLORS = {
  'R': '#c41e3a', "R'": '#c41e3a', 'R2': '#c41e3a',
  'L': '#ff5722', "L'": '#ff5722', 'L2': '#ff5722',
  'U': '#95a5a6', "U'": '#95a5a6', 'U2': '#95a5a6',
  'D': '#f1c40f', "D'": '#f1c40f', 'D2': '#f1c40f',
  'F': '#009b48', "F'": '#009b48', 'F2': '#009b48',
  'B': '#0046ad', "B'": '#0046ad', 'B2': '#0046ad',
};

// ===== CUBE SCENE CLASS =====
export class CubeScene {
  constructor(container) {
    this.container = container;
    this.cubies = [];
    this.moveQueue = [];
    this.isAnimating = false;
    this.speed = 400; // ms per move
    this.onMoveStart = null;
    this.onMoveComplete = null;
    this.onQueueComplete = null;
    this.onSolved = null;
    this._wasSolved = true;
    this._stopRequested = false;

    this._initScene();
    this._createCube();
    this._animate();
    this._handleResize();
    window.addEventListener('resize', () => this._handleResize());
  }

  _initScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // transparent

    // Camera
    const w = this.container.clientWidth || 360;
    const h = this.container.clientHeight || 360;
    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    this.camera.position.set(4.5, 4.5, 6.5);
    this.camera.lookAt(0, 0, 0);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 4;
    this.controls.maxDistance = 15;
    this.controls.enablePan = false;
    this.controls.rotateSpeed = 0.8;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight1.position.set(5, 10, 7);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -3, -5);
    this.scene.add(dirLight2);
  }

  _createCube() {
    const size = 0.94; // cubie size (gap between cubies)
    const stickerSize = 0.84;
    const stickerOffset = size / 2 + 0.001;

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // Skip the invisible center cubie
          if (x === 0 && y === 0 && z === 0) continue;

          const cubie = this._createCubie(x, y, z, size, stickerSize, stickerOffset);
          cubie.userData = {
            originalX: x,
            originalY: y,
            originalZ: z,
          };
          this.cubies.push(cubie);
          this.scene.add(cubie);
        }
      }
    }
  }

  _createCubie(x, y, z, size, stickerSize, stickerOffset) {
    const group = new THREE.Group();

    // Black body
    const bodyGeo = new THREE.BoxGeometry(size, size, size);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: COLORS.black,
      roughness: 0.7,
      metalness: 0.1,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    group.add(body);

    // Add stickers on outward-facing sides
    const stickerGeo = new THREE.PlaneGeometry(stickerSize, stickerSize);
    const stickerMatProps = { roughness: 0.35, metalness: 0.15 };

    // +X (Right) = Red
    if (x === 1) {
      const m = new THREE.Mesh(stickerGeo, new THREE.MeshStandardMaterial({ color: COLORS.red, ...stickerMatProps }));
      m.position.x = stickerOffset;
      m.rotation.y = Math.PI / 2;
      group.add(m);
    }
    // -X (Left) = Orange
    if (x === -1) {
      const m = new THREE.Mesh(stickerGeo, new THREE.MeshStandardMaterial({ color: COLORS.orange, ...stickerMatProps }));
      m.position.x = -stickerOffset;
      m.rotation.y = -Math.PI / 2;
      group.add(m);
    }
    // +Y (Top) = White
    if (y === 1) {
      const m = new THREE.Mesh(stickerGeo, new THREE.MeshStandardMaterial({ color: COLORS.white, ...stickerMatProps }));
      m.position.y = stickerOffset;
      m.rotation.x = -Math.PI / 2;
      group.add(m);
    }
    // -Y (Bottom) = Yellow
    if (y === -1) {
      const m = new THREE.Mesh(stickerGeo, new THREE.MeshStandardMaterial({ color: COLORS.yellow, ...stickerMatProps }));
      m.position.y = -stickerOffset;
      m.rotation.x = Math.PI / 2;
      group.add(m);
    }
    // +Z (Front) = Green
    if (z === 1) {
      const m = new THREE.Mesh(stickerGeo, new THREE.MeshStandardMaterial({ color: COLORS.green, ...stickerMatProps }));
      m.position.z = stickerOffset;
      group.add(m);
    }
    // -Z (Back) = Blue
    if (z === -1) {
      const m = new THREE.Mesh(stickerGeo, new THREE.MeshStandardMaterial({ color: COLORS.blue, ...stickerMatProps }));
      m.position.z = -stickerOffset;
      m.rotation.y = Math.PI;
      group.add(m);
    }

    group.position.set(x, y, z);
    return group;
  }

  // ===== MOVE EXECUTION =====
  queueMoves(moves) {
    this._stopRequested = false;
    const arr = Array.isArray(moves) ? moves : this._parseMoveString(moves);
    this.moveQueue.push(...arr);
    this._processQueue();
  }

  _parseMoveString(str) {
    return str.trim().split(/\s+/).filter(m => MOVES[m]);
  }

  _processQueue() {
    if (this.isAnimating) return;
    if (this._stopRequested) {
      this.moveQueue = [];
      this._stopRequested = false;
      if (this.onQueueComplete) this.onQueueComplete();
      return;
    }
    if (this.moveQueue.length === 0) {
      if (this.onQueueComplete) this.onQueueComplete();
      // Check solved state
      const solved = this.isSolved();
      if (solved && !this._wasSolved) {
        this._wasSolved = true;
        if (this.onSolved) this.onSolved();
      } else if (!solved) {
        this._wasSolved = false;
      }
      return;
    }
    const move = this.moveQueue.shift();
    this._executeMove(move);
  }

  _executeMove(moveStr) {
    const move = MOVES[moveStr];
    if (!move) {
      this._processQueue();
      return;
    }

    this.isAnimating = true;
    if (this.onMoveStart) this.onMoveStart(moveStr);

    const pivot = new THREE.Group();
    this.scene.add(pivot);

    // Find cubies in the layer
    const layerCubies = this.cubies.filter(c => {
      return Math.round(c.position[move.axis]) === move.layer;
    });

    // Attach to pivot (preserves world transforms)
    layerCubies.forEach(c => pivot.attach(c));

    const startAngle = 0;
    const endAngle = move.angle;
    const duration = this.speed;
    const startTime = performance.now();

    const tween = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease in-out
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      pivot.rotation[move.axis] = startAngle + (endAngle - startAngle) * eased;

      if (t < 1) {
        requestAnimationFrame(tween);
      } else {
        // Finish: reparent cubies to scene, snap positions
        layerCubies.forEach(c => {
          this.scene.attach(c);
          c.position.x = Math.round(c.position.x);
          c.position.y = Math.round(c.position.y);
          c.position.z = Math.round(c.position.z);
        });
        this.scene.remove(pivot);
        this.isAnimating = false;
        if (this.onMoveComplete) this.onMoveComplete(moveStr);
        this._processQueue();
      }
    };

    requestAnimationFrame(tween);
  }

  stopQueue() {
    this._stopRequested = true;
  }

  // ===== SCRAMBLE =====
  scramble(numMoves = 20) {
    this.stopQueue();
    // Wait for current animation to finish, then scramble
    const doScramble = () => {
      this.reset();
      const allMoves = Object.keys(MOVES);
      const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
      const modifiers = ['', "'", '2'];
      const scrambleMoves = [];
      let lastFace = '';
      for (let i = 0; i < numMoves; i++) {
        let face;
        do {
          face = faces[Math.floor(Math.random() * faces.length)];
        } while (face === lastFace);
        lastFace = face;
        const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
        scrambleMoves.push(face + mod);
      }
      // Temporarily speed up scramble
      const oldSpeed = this.speed;
      this.speed = 200;
      this._wasSolved = false;
      this.queueMoves(scrambleMoves);
      // Restore speed after scramble completes
      const checkInterval = setInterval(() => {
        if (!this.isAnimating && this.moveQueue.length === 0) {
          this.speed = oldSpeed;
          clearInterval(checkInterval);
        }
      }, 100);
    };

    if (this.isAnimating) {
      setTimeout(doScramble, this.speed + 50);
    } else {
      doScramble();
    }
  }

  // ===== RESET =====
  reset() {
    this.stopQueue();
    this.moveQueue = [];
    // Remove all cubies and recreate
    this.cubies.forEach(c => {
      this.scene.remove(c);
      this._disposeHierarchy(c);
    });
    this.cubies = [];
    this._createCube();
    this._wasSolved = true;
  }

  _disposeHierarchy(obj) {
    obj.traverse(child => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }

  // ===== SOLVED CHECK =====
  isSolved() {
    const identity = new THREE.Quaternion();
    return this.cubies.every(c => {
      const ox = c.userData.originalX;
      const oy = c.userData.originalY;
      const oz = c.userData.originalZ;
      // Skip center pieces (only one non-zero coordinate) — their rotation doesn't affect visual solved state
      const nonZero = [ox, oy, oz].filter(v => v !== 0).length;
      if (nonZero <= 1) {
        // For centers, just check position
        return Math.round(c.position.x) === ox &&
               Math.round(c.position.y) === oy &&
               Math.round(c.position.z) === oz;
      }
      // For edges and corners, check position AND orientation
      const posMatch = Math.round(c.position.x) === ox &&
                       Math.round(c.position.y) === oy &&
                       Math.round(c.position.z) === oz;
      const rotMatch = Math.abs(c.quaternion.dot(identity)) > 0.999;
      return posMatch && rotMatch;
    });
  }

  // ===== RENDER LOOP =====
  _animate() {
    requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  _handleResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w > 0 && h > 0) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    }
  }

  setSpeed(ms) {
    this.speed = ms;
  }
}
