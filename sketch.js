let video;
let detector;
let poses = [];
let count = 0;
let isDown = false;

let modelLoaded = false;
let videoLoaded = false;
let ready = false;
let running = true; // for pose loop

async function setup() {
  createCanvas(640, 480);
  background(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  text("Loading video and model...", width / 2, height / 2);

  // 🔹 Use GPU acceleration
  await tf.setBackend("webgl");
  await tf.ready();
  console.log("TensorFlow.js backend:", tf.getBackend());

  // 🔹 Load video (don’t autoplay yet)
  video = createVideo("media/pushup.mp4", () => {
    console.log("Video file loaded");
    video.volume(0);
    video.hide();
  });

  // When metadata (dimensions) are ready
  video.elt.onloadedmetadata = () => {
    const vidW = video.elt.videoWidth;
    const vidH = video.elt.videoHeight;
    console.log(`Video resolution: ${vidW}x${vidH}`);
    createCanvas(vidW, vidH);
    frameRate(30);
    videoLoaded = true;
    checkReady();
  };

  // 🔹 Load MoveNet model
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
  };

  detector = await poseDetection.createDetector(model, detectorConfig);
  console.log("MoveNet model loaded ✅");
  modelLoaded = true;
  checkReady();
}

// ✅ Wait until both model + video loaded
function checkReady() {
  if (videoLoaded && modelLoaded && !ready) {
    ready = true;
    console.log("Model + Video ready — starting!");
    video.loop();
    poseLoop(); // start async inference loop
  }
}

// 🔹 Run pose estimation in its own async loop (non-blocking)
async function poseLoop() {
  while (running) {
    if (detector && video && video.elt.readyState === 4) {
      const res = await detector.estimatePoses(video.elt);
      poses = res;
    }
    await tf.nextFrame(); // yield to browser — prevents frame violation
  }
}

function draw() {
  if (!ready) {
    background(0);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(24);
    text("Loading video and model...", width / 2, height / 2);
    return;
  }

  background(0);
  image(video, 0, 0, width, height);

  // poses are already updated asynchronously
  drawKeypoints();
  drawSkeleton();
  calculateAngleAndCount();
  showCounter();
}

function drawKeypoints() {
  const targetPoints = ["right_shoulder", "right_elbow", "right_wrist"];

  for (let pose of poses) {
    for (let kp of pose.keypoints) {
      if (kp.score > 0.4 && targetPoints.includes(kp.name)) {
        fill(0, 255, 0);
        noStroke();
        ellipse(kp.x, kp.y, 10, 10);

        push();
        textSize(12);
        fill(255);
        text(kp.name, kp.x + 8, kp.y - 8);
        pop();
      }
    }
  }
}

function drawSkeleton() {
  for (let pose of poses) {
    const kp = {};
    for (let point of pose.keypoints) kp[point.name] = point;

    const s = kp["right_shoulder"];
    const e = kp["right_elbow"];
    const w = kp["right_wrist"];

    stroke(0, 255, 0);
    strokeWeight(2);

    if (s?.score > 0.4 && e?.score > 0.4) line(s.x, s.y, e.x, e.y);
    if (e?.score > 0.4 && w?.score > 0.4) line(e.x, e.y, w.x, w.y);
  }
}

function calculateAngleAndCount() {
  for (let pose of poses) {
    const kp = {};
    for (let point of pose.keypoints) kp[point.name] = point;

    const s = kp["right_shoulder"];
    const e = kp["right_elbow"];
    const w = kp["right_wrist"];

    if (s && e && w && s.score > 0.4 && e.score > 0.4 && w.score > 0.4) {
      const a = createVector(s.x - e.x, s.y - e.y);
      const b = createVector(w.x - e.x, w.y - e.y);
      const angleDeg = Math.abs(degrees(a.angleBetween(b)));

      push();
      fill(255, 255, 0);
      noStroke();
      textSize(16);
      text(Math.round(angleDeg) + "°", e.x + 15, e.y - 10);
      pop();

      if (angleDeg < 90 && !isDown) isDown = true;
      if (angleDeg > 145 && isDown) {
        count++;
        isDown = false;
      }
    }
  }
}

function showCounter() {
  push();
  textSize(32);
  fill(0, 200, 255);
  textAlign(LEFT, TOP);
  text("Count: " + count, 20, 20);
  pop();
}
