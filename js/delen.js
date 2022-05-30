let gCorrectAnswers = [];
let gAssignments = [];

const NUMBERS_RE = /^#([0-9,]+)$/;

let gNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
if (document.location.hash.match(NUMBERS_RE)) {
  const numbers = document.location.hash.match(NUMBERS_RE)[1].split(",");
  gNumbers = numbers.map((n) => parseInt(n));
}
console.log(gNumbers);

for (let col = 1; col <= 10; col++) {
  for (let row of gNumbers) {
    const divisor = row;
    const dividend = col * row;
    gAssignments.push([dividend, divisor]);
  }
}
shuffle(gAssignments);

// https://stackoverflow.com/a/6274381/231298
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function choice(l) {
  return l[Math.floor(Math.random() * l.length)];
}

const INPUT_STATE_INCOMPLETE = "incomplete";
const INPUT_STATE_RIGHT_ANSWER = "right_answer";
const INPUT_STATE_WRONG_ANSWER = "wrong_answer";
const INPUT_STATE_GAME_OVER = "game_over";

let gInputState = INPUT_STATE_GAME_OVER;
let gCurrentInput = "";

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

const sizes = {
  width: 850,
  height: 580,
};
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 8;
scene.add(camera);
const gAssignmentGroup = new THREE.Group();
scene.add(gAssignmentGroup);
const gDotGroup = new THREE.Group();
scene.add(gDotGroup);

const textureLoader = new THREE.TextureLoader();

// const gridGeo = new THREE.PlaneBufferGeometry(17, 11.5, 10, 10);
// const gridMaterial = new THREE.MeshBasicMaterial({
// color: "pink",
// wireframe: true,
// });
// const grid = new THREE.Mesh(gridGeo, gridMaterial);
// scene.add(grid);

const cardGeo = new THREE.PlaneBufferGeometry(1.4, 1);

const cardMatcapTexture = textureLoader.load("./textures/matcap_card.png");
const cardMaterial = new THREE.MeshMatcapMaterial({
  matcap: cardMatcapTexture,
});

// const cardMaterial = new THREE.MeshBasicMaterial({
//   wireframe: true,
//   color: "red",
// });

const cardMeshes = [];
let delay = 1.0;
for (let y = 1; y <= 10; y++) {
  for (let x = 1; x <= 10; x++) {
    const card = new THREE.Mesh(cardGeo, cardMaterial);
    let cx = (x - 5.5) * 1.8;
    let cy = (y - 5.5) * 1.2;
    card.position.set(cx, cy, 0);
    gsap.to(card.rotation, {
      delay: delay + Math.random() * 0.7,
      duration: 0.5,
      y: -Math.PI,
    });
    card.rotation.y = 0;
    scene.add(card);
    cardMeshes.push(card);
  }
}

const canvas = document.querySelector("#c");
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setClearColor(0x97266d);
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.render(scene, camera);

const textMatcapTexture = textureLoader.load("./textures/matcap_text.png");

const fontLoader = new THREE.FontLoader();

const GLYPHS = {};
const textMaterial = new THREE.MeshMatcapMaterial({
  matcap: textMatcapTexture,
});

fontLoader.load("/fonts/helvetiker_regular.typeface.json", (font) => {
  const chars = "1234567890:=_";
  for (const c of chars) {
    const textGeometry = new THREE.TextGeometry(c, {
      font: font,
      size: 2,
      height: 0.2,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeometry.computeBoundingBox();
    GLYPHS[c] = textGeometry;
  }

  nextAssignment();
});

function buildText(animate = false) {
  gAssignmentGroup.position.set(0, 0, 0);
  gAssignmentGroup.rotation.z = 0;
  while (gAssignmentGroup.children.length) {
    gAssignmentGroup.remove(gAssignmentGroup.children[0]);
  }

  let inputText = gCurrentInput;
  const correctAnswerLength = `${gDividend / gDivisor}`.length;
  while (inputText.length < correctAnswerLength) {
    inputText += "_";
  }
  const string = `${gDividend} : ${gDivisor} = ${inputText}`;
  // Calculate bounding box first
  let textWidth = 0;
  for (const c of string) {
    if (c === " ") {
      textWidth += GLYPHS["6"].boundingBox.max.x;
      continue;
    }
    const textGeometry = GLYPHS[c];
    textWidth += textGeometry.boundingBox.max.x;
    textWidth += 0.2;
  }

  let x = -textWidth / 2;

  let delay = 0.2;
  for (const c of string) {
    if (c === " ") {
      x += 1;
      continue;
    }
    const textGeometry = GLYPHS[c];
    const text = new THREE.Mesh(textGeometry, textMaterial);
    // g(text);
    text.position.x = x;
    if (c === "=") {
      text.position.y -= 0.3;
    }
    x += textGeometry.boundingBox.max.x + 0.2;
    gAssignmentGroup.add(text);
    if (animate) {
      gsap.from(text.position, {
        duration: 0.5,
        delay,
        y: choice([10, -10]),
      });
    }
    delay += 0.1;
  }
}

const clock = new THREE.Clock();
let oldElapsedTime = 0;

const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime;
  oldElapsedTime = elapsedTime;

  renderer.render(scene, camera);

  window.requestAnimationFrame(animate);
};

function onKeyDown(e) {
  if (gInputState !== INPUT_STATE_INCOMPLETE) return;
  const correctAnswerLength = `${gDividend / gDivisor}`.length;
  console.log(e);
  if (e.key >= "0" && e.key <= "9") {
    gCurrentInput += e.key;
  } else if (e.key === "`") {
    gCurrentInput = `${gDividend / gDivisor}`;
  } else if (e.key === "G") {
    gameOver();
  } else if (e.key === "Backspace") {
    gCurrentInput = gCurrentInput.substring(0, gCurrentInput.length - 1);
  }
  buildText();
  if (gCurrentInput.length === correctAnswerLength) {
    validateAnswer();
  }
}

function nextAssignment() {
  gInputState = INPUT_STATE_INCOMPLETE;
  const assignment = gAssignments.pop();
  if (assignment) {
    [gDividend, gDivisor] = assignment;
    gCurrentInput = "";
    buildText(true);

    // draw();
  } else {
    gameOver();
  }
}

function clearInput() {
  // while (gInputGroup.children.length) {
  //   gInputGroup.remove(gInputGroup.children[0]);
  // }
  textMaterial.color = new THREE.Color(0xffffff);

  gCurrentInput = "";
  gInputState = INPUT_STATE_INCOMPLETE;
  buildText();
  // draw();
}

function validateAnswer() {
  if (gInputState !== INPUT_STATE_INCOMPLETE) return;
  const result = gDividend / gDivisor;
  const answer = parseInt(gCurrentInput);
  if (result !== answer) {
    gInputState = INPUT_STATE_WRONG_ANSWER;
    textMaterial.color = new THREE.Color("red");
    setTimeout(clearInput, 400);
  } else {
    // animateCorrectAnswer();
    gInputState = INPUT_STATE_RIGHT_ANSWER;
    gCorrectAnswers.push([gDividend, gDivisor]);
    gsap.to(gAssignmentGroup.position, {
      duration: 0.3,
      z: choice([-500, 10]),
    });

    // Rotate the correct card.
    const a = result;
    const b = gDivisor;
    const cardIndex = (a - 1) * 10 + (b - 1);
    const card = cardMeshes[cardIndex];
    gsap.to(card.rotation, {
      duration: 1.0,
      y: 0,
    });

    setTimeout(nextAssignment, 400);
  }
}

let confettiDuration = 3 * 1000;
let confettiEnd;

function gameOver() {
  gInputState = INPUT_STATE_GAME_OVER;
  gsap.to(gAssignmentGroup.position, { duration: 1, z: 50 });

  confettiEnd = Date.now() + confettiDuration;
  requestAnimationFrame(confettiFrame);
}

function confettiFrame() {
  // launch a few confetti from the left edge
  confetti({
    particleCount: 7,
    angle: 60,
    spread: 55,
    origin: { x: 0 },
  });
  // and launch a few from the right edge
  confetti({
    particleCount: 7,
    angle: 120,
    spread: 55,
    origin: { x: 1 },
  });

  // keep going until we are out of time
  if (Date.now() < confettiEnd) {
    requestAnimationFrame(confettiFrame);
  }
}

// nextAssignment();
animate();

window.addEventListener("keydown", onKeyDown);
window.onbeforeunload = function () {
  return "Ben je zeker dat je de site wil verlaten?";
};
