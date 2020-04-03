const gCanvas = document.querySelector("#c");
const gCtx = gCanvas.getContext("2d");
gCtx.translate(9.5, 9.5);

let gCurrentRow = 2;
let gCurrentCol = 5;
let gCurrentInput = "1";

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

function drawBackground() {
  gCtx.fillStyle = "rgba(0, 0, 0, 0.1)";
  gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);
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
    const y = 50 + row * 50 + 37;
    gCtx.fillText(`${row + 1}`, 65, y);
  }

  gCtx.textAlign = "center";
  for (let col = 0; col < 10; col++) {
    const x = 50 + col * 75 + 60;
    gCtx.fillText(`${col + 1}`, x, 40);
  }
}

function drawCurrentFocus() {
  gCtx.fillStyle = COLORS.purple600;
  // Highlight current row
  gCtx.fillRect(0, gCurrentRow * 50, (gCurrentCol + 1) * 75, 50);
  // Highlight current column
  gCtx.fillRect(gCurrentCol * 75, 0, 75, (gCurrentRow + 1) * 50);

  // Highlight current square
  gCtx.fillStyle = COLORS.purple400;
  gCtx.fillRect(gCurrentCol * 75, gCurrentRow * 50, 75, 50);
}

function drawCurrentInput() {
  let text = gCurrentInput;
  while (text.length < 2) {
    text += "_";
  }
  gCtx.textAlign = "center";
  const x = gCurrentCol * 75 + 40;
  const y = gCurrentRow * 50 + 40;
  gCtx.fillText(text, x, y);
}

window.requestAnimationFrame(() => {
  // drawBackground();
  drawCurrentFocus();
  drawGrid();
  drawCurrentInput();
});
