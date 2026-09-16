/* =====================================================
   GLOBAL STATE
===================================================== */

const journey = [
  ["intro", "Intro"],
  ["code", "Secret Code"],
  ["puzzle", "Puzzle"],
  ["scratch", "Scratch Card"],
  ["quiz", "10 Questions"],
  ["memories", "Our Memories"],
  ["hearts", "Catch Hearts"],
  ["wheel", "Love Wheel"],
  ["husbandLetter", "Husband's Letter"],
  ["daughterLetter", "Doni Letters"],
  ["final", "Birthday Reveal"]
];

let currentScreenIndex = 0;

// Birthday data loaded from Supabase
const BIRTHDAY = window.BIRTHDAY_DATA || {};

const SECRET_CODE = BIRTHDAY.secret_code || "223010";
function applyBirthdayData() {
  const birthday = window.BIRTHDAY_DATA;

  if (!birthday) return;

  // Page title
  document.title = `Happy Birthday ${birthday.birthday_name || ""} ❤️`;

  // Replace birthday name wherever these elements exist
  document.querySelectorAll("[data-birthday-name]").forEach(element => {
    element.textContent = birthday.birthday_name || "";
  });

  // Final message
  const finalMessage = document.getElementById("finalMessage");
  if (finalMessage && birthday.final_message) {
    finalMessage.textContent = birthday.final_message;
  }

  // Letter
  const letterContent = document.getElementById("husbandLetterContent");
  if (letterContent && birthday.letter) {
    letterContent.innerHTML = birthday.letter.replace(/\n/g, "<br>");
  }
}
let puzzlePieces = [];
let selectedPuzzlePiece = null;

let scratchInitialized = false;
let scratchDone = false;

let quizIndex = 0;
const quizAnswers = new Array(10).fill("");

let heartsCaught = 0;
let heartTimer = null;
let heartGameStarted = false;

let wheelSpinning = false;
let wheelRotation = 0;


/* =====================================================
   PARTICLES
===================================================== */

function createParticles() {
  const container = document.getElementById("particles");
  if (!container) return;

  for (let i = 0; i < 45; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";

    particle.style.left = Math.random() * 100 + "%";
    particle.style.animationDuration = (8 + Math.random() * 14) + "s";
    particle.style.animationDelay = (-Math.random() * 15) + "s";
    particle.style.opacity = 0.2 + Math.random() * 0.6;

    const size = 2 + Math.random() * 4;
    particle.style.width = size + "px";
    particle.style.height = size + "px";

    container.appendChild(particle);
  }
}


/* =====================================================
   SCREEN NAVIGATION
===================================================== */

function goTo(id) {
  const index = journey.findIndex(item => item[0] === id);
  if (index === -1) return;

  currentScreenIndex = index;

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.add("active");
  }

  updateJourneyProgress();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (id === "scratch") {
    setTimeout(initScratchCard, 150);
  }

  if (id === "quiz") {
    renderQuestion();
  }

  if (id === "memories") {
    renderMemories();
  }
}

function updateJourneyProgress() {
  const progress = (currentScreenIndex / (journey.length - 1)) * 100;

  document.getElementById("journeyProgress").style.width = progress + "%";
  document.getElementById("journeyText").textContent =
    `${currentScreenIndex + 1} / ${journey.length} • ${journey[currentScreenIndex][1]}`;
}

function startJourney() {
  goTo("code");
}


/* =====================================================
   SECRET CODE
===================================================== */

const codeInputs = document.querySelectorAll(".code-input");

codeInputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
    if (input.value && index < codeInputs.length - 1) {
      codeInputs[index + 1].focus();
    }
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Backspace" && !input.value && index > 0) {
      codeInputs[index - 1].focus();
    }

    if (event.key === "Enter") {
      checkCode();
    }
  });
});

function checkCode() {
  const enteredCode = [...codeInputs].map(input => input.value).join("");
  const error = document.getElementById("codeError");

  if (enteredCode === SECRET_CODE) {
    error.textContent = "Unlocked! ❤️";
    error.style.color = "#f4d28a";

    codeInputs.forEach((input, index) => {
      setTimeout(() => {
        input.style.background = "rgba(234,123,123,0.25)";
        input.style.borderColor = "#f4d28a";
        input.style.transform = "scale(1.08)";
      }, index * 80);
    });

    setTimeout(() => {
      goTo("puzzle");
      initJigsaw();
    }, 900);

  } else {
    error.textContent = "Hmm... that's not it. Try again ❤️";

    codeInputs.forEach(input => {
      input.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-5px)" },
          { transform: "translateX(5px)" },
          { transform: "translateX(0)" }
        ],
        { duration: 300 }
      );
    });
  }
}

function showHint() {
  document.getElementById("codeHint").textContent =
    "Hint: Most important in u life • 3 birthdays • code is 223010 ❤️";
}


/* =====================================================
   3 × 3 JIGSAW PUZZLE
===================================================== */

function initJigsaw() {
  const board = document.getElementById("jigsawBoard");
  if (!board) return;

  board.innerHTML = "";
  puzzlePieces = [];

  for (let correctPosition = 0; correctPosition < 9; correctPosition++) {
    const piece = document.createElement("div");
    piece.className = "jigsaw-piece";
    piece.dataset.correct = correctPosition;

    const row = Math.floor(correctPosition / 3);
    const col = correctPosition % 3;

    piece.style.backgroundSize = "300% 300%";
    piece.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

    piece.addEventListener("click", () => selectJigsawPiece(piece));

    puzzlePieces.push(piece);
  }

  shuffleJigsaw();
}

function selectJigsawPiece(piece) {
  if (selectedPuzzlePiece === null) {
    selectedPuzzlePiece = piece;
    piece.classList.add("selected");
    return;
  }

  if (selectedPuzzlePiece === piece) {
    piece.classList.remove("selected");
    selectedPuzzlePiece = null;
    return;
  }

  const firstIndex = puzzlePieces.indexOf(selectedPuzzlePiece);
  const secondIndex = puzzlePieces.indexOf(piece);

  [puzzlePieces[firstIndex], puzzlePieces[secondIndex]] = [puzzlePieces[secondIndex], puzzlePieces[firstIndex]];

  const board = document.getElementById("jigsawBoard");
  board.innerHTML = "";
  puzzlePieces.forEach(p => board.appendChild(p));

  selectedPuzzlePiece.classList.remove("selected");
  piece.classList.remove("selected");
  selectedPuzzlePiece = null;

  checkJigsaw();
}

function shuffleJigsaw() {
  const board = document.getElementById("jigsawBoard");
  if (!board || puzzlePieces.length === 0) return;

  selectedPuzzlePiece = null;
  puzzlePieces.forEach(piece => piece.classList.remove("selected"));

  for (let i = puzzlePieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [puzzlePieces[i], puzzlePieces[j]] = [puzzlePieces[j], puzzlePieces[i]];
  }

  board.innerHTML = "";
  puzzlePieces.forEach(piece => board.appendChild(piece));

  if (isJigsawSolved()) {
    shuffleJigsaw();
    return;
  }

  updatePuzzleStatus();
}

function isJigsawSolved() {
  const pieces = [...document.querySelectorAll(".jigsaw-piece")];
  return pieces.every((piece, index) => Number(piece.dataset.correct) === index);
}

function updatePuzzleStatus() {
  const pieces = [...document.querySelectorAll(".jigsaw-piece")];
  let correct = 0;

  pieces.forEach((piece, index) => {
    const isCorrect = Number(piece.dataset.correct) === index;
    if (isCorrect) {
      correct++;
      piece.classList.add("correct");
    } else {
      piece.classList.remove("correct");
    }
  });

  document.getElementById("puzzleStatus").textContent = `${correct} / 9 pieces in place`;
}

function checkJigsaw() {
  updatePuzzleStatus();

  if (isJigsawSolved()) {
    document.getElementById("puzzleStatus").textContent = "9 / 9 pieces in place — Perfect! ❤️";
    document.getElementById("puzzleContinue").classList.remove("hidden");

    document.querySelectorAll(".jigsaw-piece").forEach(piece => {
      piece.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.04)" },
          { transform: "scale(1)" }
        ],
        { duration: 500 }
      );
    });
  }
}


/* =====================================================
   SCRATCH CARD
===================================================== */

function initScratchCard() {
  if (scratchInitialized) return;

  const canvas = document.getElementById("scratchCanvas");
  const container = document.querySelector(".scratch-container");
  if (!canvas || !container) return;

  scratchInitialized = true;

  const rect = container.getBoundingClientRect();
  const dpr = Math.max(1, window.devicePixelRatio || 1);

  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#d7c7a4");
  gradient.addColorStop(0.25, "#f4e8c7");
  gradient.addColorStop(0.5, "#a99b7e");
  gradient.addColorStop(0.75, "#f6e8bf");
  gradient.addColorStop(1, "#b9a77f");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.03 + Math.random() * 0.07})`;
    ctx.fillRect(
      Math.random() * width,
      Math.random() * height,
      1 + Math.random() * 5,
      1 + Math.random() * 5
    );
  }

  ctx.fillStyle = "rgba(80,60,30,0.28)";
  ctx.font = "700 24px Fredoka";
  ctx.textAlign = "center";
  ctx.fillText("SCRATCH ME ❤️", width / 2, height / 2);

  ctx.globalCompositeOperation = "destination-out";

  let scratching = false;

  function scratch(event) {
    if (!scratching || scratchDone) return;

    const bounds = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches && event.touches.length) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;

    const x = (clientX - bounds.left) * scaleX;
    const y = (clientY - bounds.top) * scaleY;

    ctx.beginPath();
    ctx.arc(x, y, 30 * scaleX, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
  }

  canvas.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
  canvas.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });

  canvas.addEventListener("pointerdown", event => {
    scratching = true;
    canvas.setPointerCapture(event.pointerId);
    scratch(event);
  });

  canvas.addEventListener("pointermove", scratch);
  canvas.addEventListener("pointerup", () => scratching = false);
  canvas.addEventListener("pointercancel", () => scratching = false);
}

function checkScratchPercentage() {
  if (scratchDone) return;

  const canvas = document.getElementById("scratchCanvas");
  const ctx = canvas.getContext("2d");

  const width = canvas.width;
  const height = canvas.height;
  const sampleSize = 5000;

  const imageData = ctx.getImageData(0, 0, width, height).data;
  let transparent = 0;
  let samples = 0;

  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / sampleSize)));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (imageData[index + 3] < 80) {
        transparent++;
      }
      samples++;
    }
  }

  const percentage = Math.round((transparent / samples) * 100);

  document.getElementById("scratchProgress").style.width = Math.min(100, percentage * 2.5) + "%";
  document.getElementById("scratchPercent").textContent =
    percentage < 25 ? `Keep scratching... ${percentage}% ✨` : "You found the secret! ❤️";

  if (percentage >= 25) {
    scratchDone = true;
    document.getElementById("scratchProgress").style.width = "100%";
    document.getElementById("scratchContinue").classList.remove("hidden");

    setTimeout(() => {
      ctx.clearRect(0, 0, width, height);
    }, 300);
  }
}


/* =====================================================
   10 QUESTIONS
===================================================== */

const questions = [
  {
    text: "The day you married Thaththa, did you think he would be this annoying? 😂❤️",
    options: ["Yes 😂", "No 😇", "I knew what I was getting into 🤣"]
  },
  {
    text: "Who do you love the most? 👀❤️",
    options: ["Thaththa 😂", "Loku Doni 🥰", "Chooty Doni 🥹", "All three… but secretly one more than the others 🤭😂"]
  },
  {
    text: "Who makes you laugh the most? 😂",
    options: ["Thaththa", "Loku Doni", "Chooty Doni", "All of us together 🤣❤️"]
  },
  {
    text: "Who is the most naughty? 😈😂",
    options: ["Thaththa", "Loku Doni", "Chooty Doni", "Definitely ALL of us 😭🤣"]
  },
  {
    text: "Who do you think loves you the most? 👀❤️",
    options: ["Loku Doni", "Chooty Doni", "Both of us", "Nobody… thankfully 😂"]
  },
  {
    text: "Who gives the best hugs? 🤗❤️",
    options: ["Thaththa", "Loku Doni", "Chooty Doni"]
  },
  {
    text: "Who is your best friend in the family? 👀😂❤️",
    options: ["Thaththa", "Loku Doni", "Chooty Doni", "You can't choose! 🤣"]
  },
  {
    text: "If you could describe our family in three words, what would they be? ❤️",
    open: true
  },
  {
    text: "If our family had a movie, what would you name it? 🎬😂❤️",
    open: true
  },
  {
    text: "What is your favourite family memory that you will never forget? ❤️",
    open: true
  }
];

function renderQuestion() {
  const question = questions[quizIndex];

  document.getElementById("questionNumber").textContent = `Question ${quizIndex + 1} of 10`;
  document.getElementById("questionProgress").style.width = `${((quizIndex + 1) / 10) * 100}%`;
  document.getElementById("questionText").textContent = question.text;

  const area = document.getElementById("answerArea");
  area.innerHTML = "";

  if (question.open) {
    const textarea = document.createElement("textarea");
    textarea.className = "open-answer";
    textarea.placeholder = "Write your answer here... ❤️";
    textarea.value = quizAnswers[quizIndex] || "";

    textarea.addEventListener("input", () => {
      quizAnswers[quizIndex] = textarea.value;
    });

    area.appendChild(textarea);
  } else {
    const answers = document.createElement("div");
    answers.className = "answers";

    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "answer-card";

      if (quizAnswers[quizIndex] === option) {
        button.classList.add("selected");
      }

      button.innerHTML = `
        <span class="answer-letter">${String.fromCharCode(65 + index)}</span>
        ${option}
      `;

      button.addEventListener("click", () => selectAnswer(option, button));
      answers.appendChild(button);
    });

    area.appendChild(answers);
  }

  document.getElementById("previousQuestion").style.visibility = quizIndex === 0 ? "hidden" : "visible";
  document.getElementById("nextQuestion").textContent = quizIndex === 9 ? "Finish Quiz ❤️" : "Next ❤️";
}

function selectAnswer(answer, button) {
  quizAnswers[quizIndex] = answer;

  document.querySelectorAll(".answer-card").forEach(card => card.classList.remove("selected"));
  button.classList.add("selected");

  setTimeout(() => {
    if (quizIndex < 9) {
      nextQuestion();
    }
  }, 450);
}

function nextQuestion() {
  const textarea = document.querySelector(".open-answer");
  if (textarea) {
    quizAnswers[quizIndex] = textarea.value;
  }

  if (quizIndex < 9) {
    quizIndex++;
    renderQuestion();
  } else {
    goTo("memories");
  }
}

function previousQuestion() {
  if (quizIndex > 0) {
    const textarea = document.querySelector(".open-answer");
    if (textarea) {
      quizAnswers[quizIndex] = textarea.value;
    }
    quizIndex--;
    renderQuestion();
  }
}


/* =====================================================
   25 MEMORIES
===================================================== */

function renderMemories() {
  const grid = document.getElementById("memoryGrid");
  if (grid.children.length > 0) return;

  for (let i = 2; i <= 26; i++) {
    const card = document.createElement("figure");
    card.className = "memory-card";

    const image = document.createElement("img");
    image.src = `${i}.jpg`;
    image.alt = `Family memory ${i - 1}`;
    image.loading = "lazy";

    image.onerror = function () {
      this.style.display = "none";
      card.style.background = "linear-gradient(135deg,#9E3B3B,#EA7B7B)";

      const placeholder = document.createElement("div");
      placeholder.style.height = "100%";
      placeholder.style.display = "grid";
      placeholder.style.placeItems = "center";
      placeholder.style.color = "white";
      placeholder.style.fontSize = "13px";
      placeholder.innerHTML = `❤️<br>Memory ${i - 1}`;

      card.appendChild(placeholder);
    };

    const overlay = document.createElement("div");
    overlay.className = "memory-overlay";
    overlay.textContent = `Memory ${String(i - 1).padStart(2, "0")} ❤️`;

    card.appendChild(image);
    card.appendChild(overlay);

    card.addEventListener("click", () => {
      if (image.style.display !== "none") {
        openLightbox(image.src, `Memory ${i - 1} ❤️`);
      }
    });

    grid.appendChild(card);
  }
}


/* =====================================================
   LIGHTBOX
===================================================== */

function openLightbox(src, caption) {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");

  if (lightboxImage) lightboxImage.src = src;
  if (lightboxCaption) lightboxCaption.textContent = caption || "";

  lightbox.classList.add("active", "show");
}

function closeLightbox(event) {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  if (
    !event ||
    event.target.id === "lightbox" ||
    event.target.classList.contains("lightbox-close") ||
    event.target.classList.contains("lightbox")
  ) {
    lightbox.classList.remove("active", "show");
  }
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeLightbox();
  }
});


/* =====================================================
   HEART GAME
===================================================== */

function startHeartGame() {
  goTo("hearts");

  heartsCaught = 0;
  heartGameStarted = false;

  updateHeartScore();

  document.getElementById("heartMessage").textContent = "Catch 5 hearts! ❤️";
  document.getElementById("heartContinue").classList.add("hidden");

  setTimeout(() => {
    heartGameStarted = true;
    startHeartSpawner();
  }, 500);
}

function updateHeartScore() {
  document.getElementById("heartScore").textContent = heartsCaught;
  document.getElementById("heartProgress").style.width = `${(heartsCaught / 5) * 100}%`;
}

function startHeartSpawner() {
  if (heartTimer) {
    clearInterval(heartTimer);
  }

  spawnHeart();

  heartTimer = setInterval(() => {
    if (heartsCaught >= 5) {
      clearInterval(heartTimer);
      return;
    }
    spawnHeart();
  }, 900);
}

function spawnHeart() {
  const arena = document.getElementById("heartArena");
  if (!arena || heartsCaught >= 5) return;

  const heart = document.createElement("button");
  heart.className = "game-heart";
  heart.textContent = ["❤️", "💕", "💗", "💖"][Math.floor(Math.random() * 4)];

  const arenaWidth = arena.clientWidth;
  const arenaHeight = arena.clientHeight;

  const left = 15 + Math.random() * Math.max(1, arenaWidth - 80);
  const top = 15 + Math.random() * Math.max(1, arenaHeight - 85);

  heart.style.left = left + "px";
  heart.style.top = top + "px";

  heart.addEventListener("pointerdown", event => {
    event.preventDefault();
    if (!heartGameStarted) return;
    catchHeart(heart);
  });

  arena.appendChild(heart);

  setTimeout(() => {
    if (heart.parentNode) {
      heart.remove();
    }
  }, 2600);
}

function catchHeart(heart) {
  if (heart.dataset.caught) return;

  heart.dataset.caught = "true";
  heartsCaught++;
  heart.remove();

  updateHeartScore();

  if (heartsCaught >= 5) {
    heartGameStarted = false;
    if (heartTimer) clearInterval(heartTimer);

    document.getElementById("heartMessage").textContent = "You caught all the love! ❤️🎉";
    document.getElementById("heartContinue").classList.remove("hidden");
  } else {
    document.getElementById("heartMessage").textContent = `${5 - heartsCaught} more to go! 💕`;
  }
}


/* =====================================================
   LOVE WHEEL
===================================================== */

const wheelResults = [
  "A BIG HUG from everyone! 🤗❤️",
  "A birthday kiss! 😘❤️",
  "Birthday cake time! 🎂",
  "A beautiful family photo! 📸❤️",
  "A special love note! 💌",
  "A little family dance! 💃🕺",
  "Make a birthday wish! ✨",
  "One more surprise is waiting! 🎁"
];

function spinWheel() {
  if (wheelSpinning) return;

  wheelSpinning = true;
  const wheel = document.getElementById("loveWheel");

  document.getElementById("wheelResult").textContent = "Spinning... 🎡❤️";

  const resultIndex = Math.floor(Math.random() * wheelResults.length);
  const segmentCenter = resultIndex * 45 + 22.5;
  const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));

  const target = extraSpins + (360 - segmentCenter);
  wheelRotation += target;

  wheel.style.transform = `rotate(${wheelRotation}deg)`;

  setTimeout(() => {
    document.getElementById("wheelResult").textContent = wheelResults[resultIndex];
    document.getElementById("spinButton").classList.add("hidden");
    document.getElementById("wheelContinue").classList.remove("hidden");
    wheelSpinning = false;
  }, 5100);
}


/* =====================================================
   ENVELOPES
===================================================== */

function openEnvelope(type) {
  let envelope, letter;

  if (type === "husband") {
    envelope = document.getElementById("husbandEnvelope");
    letter = document.getElementById("husbandLetterContent");
  } else {
    envelope = document.getElementById("daughterEnvelope");
    letter = document.getElementById("daughterLetterContent");
  }

  if (envelope.classList.contains("opened")) return;

  envelope.classList.add("opened");

  setTimeout(() => {
    letter.classList.remove("hidden");
    setTimeout(() => {
      letter.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);
  }, 750);
}


/* =====================================================
   FINAL REVEAL
===================================================== */

function startFinalReveal() {
  goTo("final");

  const countdown = document.getElementById("countdown");
  const celebration = document.getElementById("birthdayCelebration");

  celebration.classList.add("hidden");

  let number = 3;
  countdown.textContent = number;

  const timer = setInterval(() => {
    number--;
    if (number > 0) {
      countdown.textContent = number;
    } else {
      clearInterval(timer);
      countdown.classList.add("hidden");
      celebration.classList.remove("hidden");
      launchConfetti();
    }
  }, 1000);
}


/* =====================================================
   CONFETTI
===================================================== */

function launchConfetti() {
  const symbols = ["❤️", "💕", "✨", "🌸", "🎉", "💗", "⭐"];

  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("span");
    confetti.className = "confetti";
    confetti.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.fontSize = (10 + Math.random() * 16) + "px";
    confetti.style.animationDuration = (2.5 + Math.random() * 3) + "s";
    confetti.style.animationDelay = Math.random() * 1.5 + "s";

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 6500);
  }
}


/* =====================================================
   GIFT
===================================================== */

function openGift() {
  const gift = document.getElementById("giftBox");
  if (gift.classList.contains("opened")) return;

  gift.classList.add("opened");
  document.getElementById("giftHint").classList.add("hidden");

  setTimeout(() => {
    document.getElementById("giftReveal").classList.remove("hidden");
    document.getElementById("giftReveal").scrollIntoView({ behavior: "smooth", block: "center" });
    launchConfetti();
  }, 850);
}


/* =====================================================
   RESTART
===================================================== */

function restartJourney() {
  currentScreenIndex = 0;
  quizIndex = 0;
  quizAnswers.fill("");
  heartsCaught = 0;
  scratchInitialized = false;
  scratchDone = false;
  wheelSpinning = false;
  wheelRotation = 0;

  if (heartTimer) clearInterval(heartTimer);

  document.getElementById("giftBox").classList.remove("opened");
  document.getElementById("giftReveal").classList.add("hidden");
  document.getElementById("giftHint").classList.remove("hidden");
  document.getElementById("countdown").classList.remove("hidden");
  document.getElementById("birthdayCelebration").classList.add("hidden");
  document.getElementById("spinButton").classList.remove("hidden");
  document.getElementById("wheelContinue").classList.add("hidden");
  document.getElementById("wheelResult").textContent = "";

  document.getElementById("husbandEnvelope").classList.remove("opened");
  document.getElementById("daughterEnvelope").classList.remove("opened");
  document.getElementById("husbandLetterContent").classList.add("hidden");
  document.getElementById("daughterLetterContent").classList.add("hidden");

  goTo("intro");
}


/* =====================================================
   INITIALIZE
===================================================== */

window.addEventListener("load", () => {
  createParticles();
  updateJourneyProgress();
  initJigsaw();
});
