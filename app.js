import { CubeScene, MOVE_COLORS } from './cube.js';

// ===== STEP DATA =====
const STEPS = [
  {
    num: 1,
    title: "Make the White Cross",
    icon: "✚",
    color: "#e74c3c",
    intro: "Let's start by making a white cross on the top of the cube!",
    instructions: [
      "Find the white center piece (it's in the middle of the white face).",
      "Look for the 4 white edge pieces (pieces with white and one other color).",
      "Move each white edge to match the white center AND the side center color.",
      "Take your time — there's no rush! Focus on matching colors."
    ],
    algorithms: null,
    tip: "The white cross doesn't need a special formula. Just move pieces around until the white edges are in the right spot! This step is all about looking and thinking."
  },
  {
    num: 2,
    title: "Solve the White Corners",
    icon: "🔄",
    color: "#3498db",
    intro: "Now let's put the white corners in place! First, flip the cube so white is on the bottom.",
    instructions: [
      "Turn the cube upside down so the white face is on the bottom.",
      "Find a white corner piece (it has white and two other colors).",
      "Move it to the top, right above where it needs to go.",
      "Do the magic move below — repeat until the corner clicks in!",
      "Do this for all 4 white corners."
    ],
    algorithms: [
      { name: "The Righty Move", moves: ["R", "U", "R'", "U'"] }
    ],
    tip: "You might need to do R U R' U' several times (1 to 5 times) before the corner goes in. Keep repeating — it will click!"
  },
  {
    num: 3,
    title: "Solve the Middle Layer",
    icon: "↔️",
    color: "#2ecc71",
    intro: "The white face is done! Now let's fill in the middle layer edges.",
    instructions: [
      "Keep white on the bottom.",
      "Find an edge piece on top that has NO yellow on it.",
      "Match the front color of the edge with the center piece below it.",
      "If the edge needs to go to the RIGHT: use the Right Move.",
      "If the edge needs to go to the LEFT: use the Left Move."
    ],
    algorithms: [
      { name: "Move Right", moves: ["U", "R", "U'", "R'", "U'", "F'", "U", "F"] },
      { name: "Move Left", moves: ["U'", "L'", "U", "L", "U", "F", "U'", "F'"] }
    ],
    tip: "Look at the top color of the edge. If it matches the right center, use the Right Move. If it matches the left center, use the Left Move."
  },
  {
    num: 4,
    title: "Make the Yellow Cross",
    icon: "✚",
    color: "#f1c40f",
    intro: "Time for the yellow cross on top! Look at the yellow pattern on the top face.",
    instructions: [
      "Look at the top face — you'll see a dot, an L-shape, a line, or a cross.",
      "If it's a dot, do the move once to get an L-shape.",
      "If it's an L-shape, hold it in the back-left and do the move to get a line.",
      "If it's a line, hold it horizontal and do the move to get a cross!",
      "Repeat the move until you see a yellow cross."
    ],
    algorithms: [
      { name: "Yellow Cross Move", moves: ["F", "R", "U", "R'", "U'", "F'"] }
    ],
    tip: "The pattern goes: dot → L-shape → line → cross. Each time you do the move, the cross gets closer!"
  },
  {
    num: 5,
    title: "Make the Entire Yellow Face",
    icon: "🟨",
    color: "#e67e22",
    intro: "Great! You have a yellow cross. Now let's make the whole top face yellow!",
    instructions: [
      "Look for yellow corners that are NOT facing up.",
      "Pick a corner that needs to be fixed.",
      "Do the move below to twist that corner yellow-side-up.",
      "Turn the top face (U) to bring the next corner to the same spot.",
      "Repeat until all yellow stickers face up!"
    ],
    algorithms: [
      { name: "Yellow Face Move", moves: ["R", "U", "R'", "U", "R", "U2", "R'"] }
    ],
    tip: "Important: Don't rotate the whole cube! Just turn the TOP face (U) to bring each corner to the right spot, then repeat the move."
  },
  {
    num: 6,
    title: "Put Yellow Corners in Correct Places",
    icon: "🎯",
    color: "#9b59b6",
    intro: "The top is all yellow now! But the corners might not be in the right spots yet.",
    instructions: [
      "Look at the corners — find one that's already in the correct position.",
      "If none are correct, do the move once and check again.",
      "When you find a correct corner, hold it in the front-right-top.",
      "Do the move until all 4 corners are in the right spots.",
      "The corners might be twisted — that's okay, we fix that next!"
    ],
    algorithms: [
      { name: "Corner Position Move", moves: ["U", "R", "U'", "L'", "U", "R'", "U'", "L"] }
    ],
    tip: "A corner is 'correct' if its colors match the centers on both sides — even if the yellow isn't on top. Just check the side colors!"
  },
  {
    num: 7,
    title: "Finish the Cube!",
    icon: "🎉",
    color: "#e91e63",
    intro: "Almost there! Just one more step to solve the whole cube!",
    instructions: [
      "You should have at most 2 or 3 corners that need twisting.",
      "Hold the cube so an unsolved corner is in the front-right-top.",
      "Do the finishing move until that corner is solved.",
      "Turn only the TOP face (U) to bring the next unsolved corner to the front-right-top.",
      "Repeat until the cube is fully solved!"
    ],
    algorithms: [
      { name: "Finishing Move", moves: ["R'", "F", "R'", "B2", "R", "F'", "R'", "B2", "R2"] }
    ],
    tip: "This is the trickiest step! Don't rotate the whole cube. Just turn U to bring each unsolved corner to the same spot. The cube will look scrambled during this step — that's normal! Keep going!"
  }
];

// ===== STATE =====
let cube;
let currentStep = 0;
let completedSteps = JSON.parse(localStorage.getItem('cubeQuest_progress') || '[]');
let moveCount = 0;
let timerStart = null;
let timerInterval = null;
let moveHistory = [];
let currentPlayingChips = []; // track chip elements for highlighting

// ===== DOM HELPERS =====
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}

// ===== INIT =====
function init() {
  // Initialize 3D cube
  const container = $('#cube-canvas-container');
  cube = new CubeScene(container);

  cube.onMoveStart = (move) => {
    updateCurrentMoveDisplay(move);
    highlightPlayingChip(move);
  };

  cube.onMoveComplete = (move) => {
    moveHistory.push(move);
    updateMoveHistory();
    moveCount++;
    $('#move-count').textContent = moveCount;
    if (!timerStart) startTimer();
  };

  cube.onQueueComplete = () => {
    hideCurrentMoveDisplay();
    clearChipHighlights();
    updateSolvedStatus();
  };

  cube.onSolved = () => {
    showSolvedMessage();
  };

  // Setup UI
  setupTabs();
  setupStepDots();
  renderStep();
  setupStepNavigation();
  setupQuickActions();
  setupSpeedControl();
  setupPracticeMode();
  setupMoveButtons();
  setupKeyboardControls();
  setupCelebration();

  updateProgress();

  // Hide loading
  setTimeout(() => {
    $('#loading').classList.add('hidden');
  }, 800);
}

// ===== TABS =====
function setupTabs() {
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('active'));
      $$('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      $(`#tab-${tabId}`).classList.add('active');
      // Resize cube when switching to practice tab
      if (tabId === 'practice') {
        setTimeout(() => cube._handleResize(), 100);
      }
    });
  });
}

// ===== STEP DOTS =====
function setupStepDots() {
  const dotsContainer = $('#step-dots');
  dotsContainer.innerHTML = '';
  STEPS.forEach((step, i) => {
    const dot = createEl('div', 'step-dot');
    dot.dataset.step = i;
    if (i === 0) dot.classList.add('active');
    if (completedSteps.includes(i)) dot.classList.add('completed');

    const num = createEl('span', 'dot-num', step.num);
    dot.appendChild(num);

    dot.addEventListener('click', () => {
      currentStep = i;
      updateStepDots();
      renderStep();
      updateProgress();
    });
    dotsContainer.appendChild(dot);
  });
}

function updateStepDots() {
  $$('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentStep);
    dot.classList.toggle('completed', completedSteps.includes(i));
  });
}

// ===== STEP RENDERING =====
function renderStep() {
  const step = STEPS[currentStep];
  const container = $('#step-content');
  container.innerHTML = '';
  container.style.setProperty('--step-color', step.color);

  // Step header
  const header = createEl('div', 'step-header');
  const icon = createEl('div', 'step-icon', step.icon);
  const titleWrap = createEl('div');
  titleWrap.appendChild(createEl('div', 'step-number', `Step ${step.num} of 7`));
  titleWrap.appendChild(createEl('div', 'step-title', step.title));
  header.appendChild(icon);
  header.appendChild(titleWrap);
  container.appendChild(header);

  // Intro
  container.appendChild(createEl('div', 'step-intro', step.intro));

  // Instructions
  const ol = createEl('ol', 'step-instructions');
  step.instructions.forEach(text => {
    ol.appendChild(createEl('li', null, text));
  });
  container.appendChild(ol);

  // Algorithms
  if (step.algorithms) {
    step.algorithms.forEach((algo, algoIdx) => {
      const section = createEl('div', 'algorithm-section');
      section.appendChild(createEl('div', 'algorithm-title', `📐 ${algo.name}`));

      const chipsDiv = createEl('div', 'algorithm-chips');
      chipsDiv.dataset.algoIdx = algoIdx;
      algo.moves.forEach((move, moveIdx) => {
        const chip = createEl('div', 'algo-chip');
        chip.textContent = move.replace("'", "′");
        chip.style.background = MOVE_COLORS[move] || '#666';
        if (move.includes("'")) chip.classList.add('prime');
        if (move.includes('2')) chip.classList.add('double');
        chip.dataset.move = move;
        chip.dataset.moveIdx = moveIdx;
        chipsDiv.appendChild(chip);
      });
      section.appendChild(chipsDiv);

      // Buttons
      const btnRow = createEl('div', 'algorithm-buttons');
      const playBtn = createEl('button', 'btn btn-primary', '▶ Play on Cube');
      playBtn.addEventListener('click', () => playAlgorithm(algo.moves, chipsDiv));
      btnRow.appendChild(playBtn);

      const repeatBtn = createEl('button', 'btn btn-secondary', '🔁 Repeat');
      repeatBtn.addEventListener('click', () => playAlgorithm(algo.moves, chipsDiv));
      btnRow.appendChild(repeatBtn);

      if (step.algorithms.length > 1) {
        const playAllBtn = createEl('button', 'btn btn-secondary', '▶ Play Both');
        playAllBtn.addEventListener('click', () => {
          const allMoves = step.algorithms.flatMap(a => a.moves);
          playAlgorithm(allMoves, null);
        });
        btnRow.appendChild(playAllBtn);
      }

      section.appendChild(btnRow);
      container.appendChild(section);
    });
  } else {
    const noAlgo = createEl('div', 'step-intro');
    noAlgo.style.background = '#f0f0f0';
    noAlgo.style.borderLeftColor = '#999';
    noAlgo.textContent = "No formula needed for this step! Just practice moving pieces around. Use the Scramble button and try it yourself!";
    container.appendChild(noAlgo);
  }

  // Tip
  if (step.tip) {
    const tip = createEl('div', 'step-tip', `💡 ${step.tip}`);
    container.appendChild(tip);
  }

  // Update complete button
  const completeBtn = $('#btn-complete-step');
  if (completedSteps.includes(currentStep)) {
    completeBtn.classList.add('completed');
    completeBtn.textContent = '⭐ Completed!';
  } else {
    completeBtn.classList.remove('completed');
    completeBtn.textContent = '⭐ Mark Complete';
  }

  // Update nav button states
  $('#btn-prev-step').disabled = currentStep === 0;
  $('#btn-next-step').disabled = currentStep === STEPS.length - 1;
}

// ===== ALGORITHM PLAYBACK =====
function playAlgorithm(moves, chipsDiv) {
  cube.stopQueue();
  // Clear previous highlights
  clearChipHighlights();
  currentPlayingChips = [];

  if (chipsDiv) {
    const chips = chipsDiv.querySelectorAll('.algo-chip');
    chips.forEach(c => {
      c.classList.remove('playing', 'done');
      currentPlayingChips.push(c);
    });
  }

  // Small delay to let stopQueue take effect
  setTimeout(() => {
    cube.queueMoves(moves);
  }, 50);
}

let currentChipIdx = 0;
function highlightPlayingChip(move) {
  // Find the chip matching this move in currentPlayingChips
  if (currentPlayingChips.length === 0) return;

  // Mark previous as done
  if (currentChipIdx > 0 && currentChipIdx <= currentPlayingChips.length) {
    const prev = currentPlayingChips[currentChipIdx - 1];
    if (prev) {
      prev.classList.remove('playing');
      prev.classList.add('done');
    }
  }

  // Highlight current
  if (currentChipIdx < currentPlayingChips.length) {
    const chip = currentPlayingChips[currentChipIdx];
    if (chip && chip.dataset.move === move) {
      chip.classList.add('playing');
      currentChipIdx++;
    } else {
      // Try to find matching chip from current position
      for (let i = currentChipIdx; i < currentPlayingChips.length; i++) {
        if (currentPlayingChips[i].dataset.move === move) {
          if (currentChipIdx > 0) {
            currentPlayingChips[currentChipIdx - 1].classList.remove('playing');
            currentPlayingChips[currentChipIdx - 1].classList.add('done');
          }
          currentPlayingChips[i].classList.add('playing');
          currentChipIdx = i + 1;
          break;
        }
      }
    }
  }
}

function clearChipHighlights() {
  currentPlayingChips.forEach(c => c.classList.remove('playing', 'done'));
  currentPlayingChips = [];
  currentChipIdx = 0;
}

// ===== STEP NAVIGATION =====
function setupStepNavigation() {
  $('#btn-prev-step').addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateStepDots();
      renderStep();
      updateProgress();
    }
  });

  $('#btn-next-step').addEventListener('click', () => {
    if (currentStep < STEPS.length - 1) {
      currentStep++;
      updateStepDots();
      renderStep();
      updateProgress();
    }
  });

  $('#btn-complete-step').addEventListener('click', () => {
    if (!completedSteps.includes(currentStep)) {
      completedSteps.push(currentStep);
      localStorage.setItem('cubeQuest_progress', JSON.stringify(completedSteps));
      updateStepDots();
      renderStep();
      updateProgress();

      // Check if all steps complete
      if (completedSteps.length === STEPS.length) {
        showCelebration();
      } else {
        // Show a small toast
        showToast('⭐ Step complete! Great job!');
      }
    }
  });
}

// ===== PROGRESS =====
function updateProgress() {
  const count = completedSteps.length;
  const pct = (count / STEPS.length) * 100;
  $('#progress-fill').style.width = pct + '%';
  $('#progress-text').textContent = `Step ${currentStep + 1} of ${STEPS.length} · ${count} completed`;
}

// ===== QUICK ACTIONS =====
function setupQuickActions() {
  $('#btn-scramble').addEventListener('click', () => {
    cube.scramble();
    moveCount = 0;
    moveHistory = [];
    $('#move-count').textContent = '0';
    updateMoveHistory();
    resetTimer();
  });

  $('#btn-reset').addEventListener('click', () => {
    cube.stopQueue();
    setTimeout(() => {
      cube.reset();
      moveCount = 0;
      moveHistory = [];
      $('#move-count').textContent = '0';
      updateMoveHistory();
      resetTimer();
      updateSolvedStatus();
    }, 50);
  });
}

// ===== SPEED CONTROL =====
function setupSpeedControl() {
  const slider = $('#speed-slider');
  slider.addEventListener('input', () => {
    // Invert so left = slow (high ms), right = fast (low ms)
    const speed = parseInt(slider.max) - parseInt(slider.value) + parseInt(slider.min);
    cube.setSpeed(speed);
  });
  // Set initial speed
  const initialSpeed = parseInt(slider.max) - parseInt(slider.value) + parseInt(slider.min);
  cube.setSpeed(initialSpeed);
}

// ===== CURRENT MOVE DISPLAY =====
function updateCurrentMoveDisplay(move) {
  const display = $('#current-move-display');
  const chip = $('#current-move-chip');
  display.style.display = 'flex';
  chip.textContent = move.replace("'", "′");
  chip.style.color = MOVE_COLORS[move] || '#666';
}

function hideCurrentMoveDisplay() {
  $('#current-move-display').style.display = 'none';
}

// ===== MOVE HISTORY =====
function updateMoveHistory() {
  const container = $('#move-history');
  // Show last 15 moves
  const recent = moveHistory.slice(-15);
  container.innerHTML = '';
  recent.forEach(move => {
    const chip = createEl('span', 'move-chip', move.replace("'", "′"));
    chip.style.background = MOVE_COLORS[move] || '#666';
    container.appendChild(chip);
  });
}

// ===== PRACTICE MODE =====
function setupPracticeMode() {
  $('#btn-practice-scramble').addEventListener('click', () => {
    cube.scramble();
    moveCount = 0;
    moveHistory = [];
    $('#move-count').textContent = '0';
    updateMoveHistory();
    resetTimer();
    updateSolvedStatus();
  });

  $('#btn-practice-reset').addEventListener('click', () => {
    cube.stopQueue();
    setTimeout(() => {
      cube.reset();
      moveCount = 0;
      moveHistory = [];
      $('#move-count').textContent = '0';
      updateMoveHistory();
      resetTimer();
      updateSolvedStatus();
    }, 50);
  });

  $('#btn-undo').addEventListener('click', () => {
    if (moveHistory.length === 0) return;
    const lastMove = moveHistory.pop();
    const inverse = getInverseMove(lastMove);
    cube.queueMoves([inverse]);
    moveCount = Math.max(0, moveCount - 1);
    $('#move-count').textContent = moveCount;
    updateMoveHistory();
  });
}

function getInverseMove(move) {
  if (move.includes('2')) return move; // 180° is its own inverse
  if (move.includes("'")) return move.replace("'", "");
  return move + "'";
}

// ===== MOVE BUTTONS GRID =====
function setupMoveButtons() {
  const grid = $('#move-buttons-grid');
  const faces = [
    { letter: 'R', name: 'Right', color: '#c41e3a' },
    { letter: 'L', name: 'Left', color: '#ff5722' },
    { letter: 'U', name: 'Up', color: '#95a5a6' },
    { letter: 'D', name: 'Down', color: '#f1c40f' },
    { letter: 'F', name: 'Front', color: '#009b48' },
    { letter: 'B', name: 'Back', color: '#0046ad' },
  ];

  grid.innerHTML = '';
  faces.forEach(face => {
    const group = createEl('div', 'move-face-group');
    group.appendChild(createEl('h4', null, face.name));

    const btnContainer = createEl('div', 'move-face-buttons');

    // Normal, Prime, Double
    [face.letter, face.letter + "'", face.letter + '2'].forEach(move => {
      const btn = createEl('button', 'move-btn', move.replace("'", "′"));
      btn.style.background = face.color;
      if (move.includes("'")) btn.classList.add('prime');
      if (move.includes('2')) btn.classList.add('double');
      btn.addEventListener('click', () => {
        cube.queueMoves([move]);
      });
      btnContainer.appendChild(btn);
    });

    group.appendChild(btnContainer);
    grid.appendChild(group);
  });
}

// ===== KEYBOARD CONTROLS =====
function setupKeyboardControls() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    const key = e.key.toUpperCase();
    const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
    if (faces.includes(key)) {
      e.preventDefault();
      const move = e.shiftKey ? key + "'" : key;
      cube.queueMoves([move]);
    }
  });
}

// ===== TIMER =====
function startTimer() {
  timerStart = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - timerStart) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    $('#timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
  }, 1000);
}

function resetTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  timerStart = null;
  $('#timer').textContent = '0:00';
}

// ===== SOLVED STATUS =====
function updateSolvedStatus() {
  const status = $('#solved-status');
  if (cube.isSolved()) {
    status.textContent = '✅ Solved';
    status.style.color = 'var(--success)';
  } else {
    status.textContent = '🔄 Scrambled';
    status.style.color = 'var(--danger)';
  }
}

function showSolvedMessage() {
  showToast('🎉 The cube is solved! Amazing!');
  updateSolvedStatus();
}

// ===== TOAST =====
function showToast(message) {
  let toast = $('#toast');
  if (!toast) {
    toast = createEl('div', 'toast');
    toast.id = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== CELEBRATION =====
function setupCelebration() {
  $('#btn-celebration-close').addEventListener('click', () => {
    $('#celebration').classList.remove('show');
  });
}

function showCelebration() {
  const celebration = $('#celebration');
  celebration.classList.add('show');
  createConfetti();
}

function createConfetti() {
  const container = $('#confetti');
  container.innerHTML = '';
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e91e63', '#00cec9'];
  for (let i = 0; i < 50; i++) {
    const piece = createEl('div', 'confetti-piece');
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 2) + 's';
    piece.style.animationDelay = Math.random() * 2 + 's';
    if (Math.random() > 0.5) piece.style.borderRadius = '50%';
    container.appendChild(piece);
  }
}

// ===== START =====
// Wait for DOM and Three.js to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
