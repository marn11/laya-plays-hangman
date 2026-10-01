import { WORDS } from "./words.js";

const MAX_WRONG = 6;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
const KEYBOARD_ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

const boardEl = document.getElementById("board");
const wordRowEl = document.getElementById("word-row");
const missPipsEl = document.getElementById("miss-pips");
const bannerEl = document.getElementById("banner");
const keyboardEl = document.getElementById("keyboard");
const newWordBtn = document.getElementById("new-word-btn");

let word = "";
let guessed = new Set();
let keyButtons = new Map();

function pickWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function wrongLetters() {
  return [...guessed].filter((l) => !word.includes(l));
}

function wrongCount() {
  return wrongLetters().length;
}

function isWon() {
  return [...word].every((l) => guessed.has(l));
}

function isLost() {
  return wrongCount() >= MAX_WRONG;
}

function isPlaying() {
  return !isWon() && !isLost();
}

function maskedDisplay() {
  return [...word].map((l) => (guessed.has(l) ? l : "_")).join(" ");
}

function buildMissPips() {
  missPipsEl.innerHTML = "";
  for (let i = 0; i < MAX_WRONG; i++) {
    const pip = document.createElement("span");
    pip.className = "pip";
    missPipsEl.appendChild(pip);
  }
}

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  keyButtons.clear();
  for (const row of KEYBOARD_ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "row";
    for (const letter of row) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = letter;
      btn.addEventListener("click", () => guessLetter(letter.toLowerCase()));
      keyButtons.set(letter.toLowerCase(), btn);
      rowEl.appendChild(btn);
    }
    keyboardEl.appendChild(rowEl);
  }
}

function render() {
  // word tiles
  wordRowEl.innerHTML = "";
  for (const letter of word) {
    const tile = document.createElement("span");
    const revealed = guessed.has(letter) || !isPlaying();
    tile.className = "tile" + (guessed.has(letter) ? " filled" : "");
    tile.textContent = guessed.has(letter) ? letter : revealed ? letter : "";
    wordRowEl.appendChild(tile);
  }

  // miss pips
  const spent = wrongCount();
  [...missPipsEl.children].forEach((pip, i) => {
    pip.classList.toggle("spent", i < spent);
  });

  // gallows parts
  document.querySelectorAll(".gallows .part").forEach((part) => {
    const idx = Number(part.dataset.part);
    part.classList.toggle("revealed", idx <= spent);
  });

  // keyboard button states
  for (const [letter, btn] of keyButtons) {
    const guessedLetter = guessed.has(letter);
    btn.disabled = guessedLetter || !isPlaying();
    btn.classList.toggle("correct", guessedLetter && word.includes(letter));
    btn.classList.toggle("wrong", guessedLetter && !word.includes(letter));
  }

  // banner
  bannerEl.classList.remove("won", "lost");
  if (isWon()) {
    bannerEl.textContent = `Solved it. ${word}, with ${MAX_WRONG - spent} misses to spare.`;
    bannerEl.classList.add("won");
  } else if (isLost()) {
    bannerEl.textContent = `Out of chalk. The word was ${word}.`;
    bannerEl.classList.add("lost");
  } else {
    bannerEl.textContent = `${MAX_WRONG - spent} misses left.`;
  }
}

function guessLetter(letter) {
  letter = letter.toLowerCase();
  if (!ALPHABET.includes(letter)) return;
  if (!isPlaying()) return;
  if (guessed.has(letter)) return;
  guessed.add(letter);
  render();
}

function restartGame() {
  word = pickWord().toLowerCase();
  guessed = new Set();
  boardEl.classList.add("wiping");
  setTimeout(() => boardEl.classList.remove("wiping"), 520);
  render();
}

document.addEventListener("keydown", (e) => {
  if (e.key.length === 1 && /[a-z]/i.test(e.key)) {
    guessLetter(e.key);
  }
});

newWordBtn.addEventListener("click", restartGame);

buildMissPips();
buildKeyboard();
restartGame();

// --- programmatic control bridge, for a later AI agent (Laya) to play via Playwright ---

function getState() {
  const guessedLetters = [...guessed].sort();
  const remainingLetters = ALPHABET.filter((l) => !guessed.has(l));
  return {
    masked: maskedDisplay(),
    wordLength: word.length,
    guessedLetters,
    remainingLetters,
    wrongLetters: wrongLetters().sort(),
    wrongCount: wrongCount(),
    maxWrong: MAX_WRONG,
    isPlaying: isPlaying(),
    isWon: isWon(),
    isLost: isLost(),
    word: isPlaying() ? null : word,
  };
}

window.__getState = getState;

window.__action = function (letter) {
  guessLetter(letter);
  return getState();
};

window.__restart = function () {
  restartGame();
  return getState();
};
