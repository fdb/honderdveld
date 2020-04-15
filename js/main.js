const gCanvas = document.querySelector("#c");
const gCtx = gCanvas.getContext("2d");
gCtx.translate(9.5, 9.5);

let gCurrentRow = 1;
let gCurrentCol = 1;
let gCurrentInput = "";
let gCorrectAnswers = [];
let gAssignments = [];

for (let col = 1; col <= 10; col++) {
  for (let row = 1; row <= 10; row++) {
    gAssignments.push([col, row]);
  }
}
shuffle(gAssignments);

const INPUT_STATE_INCOMPLETE = "incomplete";
const INPUT_STATE_RIGHT_ANSWER = "right_answer";
const INPUT_STATE_WRONG_ANSWER = "wrong_answer";
const INPUT_STATE_GAME_OVER = "game_over";

let gInputState = INPUT_STATE_GAME_OVER;

const COLORS = {
  // PURPLE
  purple100: "#faf5ff",
  purple200: "#e9d8fd",
  purple300: "#d6bcfa",
  purple400: "#b794f4",
  purple500: "#9f7aea",
  purple600: "#805ad5",
  purple700: "#6b46c1",
  purple800: "#553c9a",
  purple900: "#44337a",
  // PINK
  pink100: "#fff5f7",
  pink200: "#fed7e2",
  pink300: "#fbb6ce",
  pink400: "#f687b3",
  pink500: "#ed64a6",
  pink600: "#d53f8c",
  pink700: "#b83280",
  pink800: "#97266d",
  pink900: "#702459"
};

function choice(l) {
  return l[Math.floor(Math.random() * l.length)];
}

// https://stackoverflow.com/a/6274381/231298
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawBackground() {
  gCtx.clearRect(0, 0, gCanvas.width, gCanvas.height);
  // gCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
  // gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);
}

function drawGrid() {
  gCtx.font = "36px Bungee";
  gCtx.fillStyle = "white";
  gCtx.textAlign = "right";

  gCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
  gCtx.beginPath();
  for (let row = 0; row <= 11; row++) {
    const y = row * 50;
    gCtx.moveTo(0, y);
    gCtx.lineTo(825, y);
  }
  for (let col = 0; col <= 11; col++) {
    const x = col * 75;
    gCtx.moveTo(x, 0);
    gCtx.lineTo(x, 550);
  }
  gCtx.stroke();

  gCtx.textAlign = "right";
  for (let row = 0; row < 10; row++) {
    const y = 50 + row * 50 + 40;
    gCtx.fillText(`${row + 1}`, 65, y);
  }

  gCtx.textAlign = "center";
  for (let col = 0; col < 10; col++) {
    const x = 50 + col * 75 + 60;
    gCtx.fillText(`${col + 1}`, x, 40);
  }
}

function drawCurrentFocus() {
  if (gInputState === INPUT_STATE_GAME_OVER) return;
  gCtx.fillStyle = COLORS.purple600;
  // Highlight current row
  gCtx.fillRect(0, gCurrentRow * 50, (gCurrentCol + 1) * 75, 50);
  // Highlight current column
  gCtx.fillRect(gCurrentCol * 75, 0, 75, (gCurrentRow + 1) * 50);

  // Highlight current square
  if (gInputState === INPUT_STATE_INCOMPLETE) {
    gCtx.fillStyle = COLORS.purple400;
  } else if (gInputState === INPUT_STATE_RIGHT_ANSWER) {
    gCtx.fillStyle = COLORS.purple800;
  } else if (gInputState === INPUT_STATE_WRONG_ANSWER) {
    gCtx.fillStyle = "red";
  } else {
    throw new Error("Invalid input state", gInputState);
  }
  gCtx.fillRect(gCurrentCol * 75, gCurrentRow * 50, 75, 50);
}

function drawTextInCell(text, col, row) {
  gCtx.textAlign = "center";
  const x = col * 75 + 40;
  const y = row * 50 + 40;
  gCtx.fillText(text, x, y);
}

function drawCurrentInput() {
  gCtx.fillStyle = "white";
  let text = gCurrentInput;
  const correctAnswerLength = `${gCurrentCol * gCurrentRow}`.length;

  while (text.length < correctAnswerLength) {
    text += "_";
  }
  drawTextInCell(text, gCurrentCol, gCurrentRow);
}

function drawCorrectAnswers() {
  gCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
  for ([row, col] of gCorrectAnswers) {
    drawTextInCell(row * col, row, col);
  }
}

function validateAnswer() {
  const result = gCurrentCol * gCurrentRow;
  const answer = parseInt(gCurrentInput);
  if (result !== answer) {
    gInputState = INPUT_STATE_WRONG_ANSWER;
    setTimeout(clearInput, 400);
  } else {
    gInputState = INPUT_STATE_RIGHT_ANSWER;
    gCorrectAnswers.push([gCurrentCol, gCurrentRow]);
    setTimeout(nextAssignment, 150);
  }
  draw();
}

function clearInput() {
  gCurrentInput = "";
  gInputState = INPUT_STATE_INCOMPLETE;
  draw();
}

function nextAssignment() {
  gInputState = INPUT_STATE_INCOMPLETE;
  const assignment = gAssignments.pop();
  if (assignment) {
    gCurrentCol = assignment[0];
    gCurrentRow = assignment[1];
    gCurrentInput = "";
    draw();
  } else {
    gameOver();
  }
}

function gameOver() {
  gInputState = INPUT_STATE_GAME_OVER;
  setInterval(draw, 500);
}

function onKeyDown(e) {
  // console.log(e);
  if (gInputState !== INPUT_STATE_INCOMPLETE) return;
  const correctAnswerLength = `${gCurrentCol * gCurrentRow}`.length;
  if (e.keyCode >= 48 && e.keyCode <= 57) {
    gCurrentInput += e.key;
  } else if (e.key === "Backspace") {
    gCurrentInput = gCurrentInput.substring(0, gCurrentInput.length - 1);
  }
  if (gCurrentInput.length === correctAnswerLength) {
    validateAnswer();
  }
  draw();
}

function drawGameOver() {
  for ([col, row] of gCorrectAnswers) {
    gCtx.fillStyle = `hsla(${Math.random() * 100}, 80%, 50%, 0.8)`;
    gCtx.fillRect(col * 75, row * 50, 75, 50);
  }
}

function draw() {
  drawBackground();
  drawCurrentFocus();
  drawGrid();
  drawCorrectAnswers();
  if (gInputState === INPUT_STATE_GAME_OVER) {
    drawGameOver();
  } else {
    drawCurrentInput();
  }
}

nextAssignment();
draw();

window.addEventListener("keydown", onKeyDown);
