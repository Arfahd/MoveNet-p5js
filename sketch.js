let video;
let detector;
let poses = [];
let count = 0;
let isDown = false; // Track down phase

function resetCounter() {
  count = 0;
}

async function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Load MoveNet
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
  };
  detector = await poseDetection.createDetector(model, detectorConfig);

  console.log("MoveNet model loaded ✅");
}

async function draw() {
  translate(width, 0); // mirror webcam
  scale(-1, 1);
  image(video, 0, 0, width, height);

  if (detector) {
    const posesDetected = await detector.estimatePoses(video.elt);
    poses = posesDetected;
  }

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

        // Fix mirrored text
        push();
        scale(-1, 1);
        textSize(12);
        fill(255);
        text(kp.name, -kp.x - 5, kp.y - 5);
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

    if (s?.score > 0.4 && e?.score > 0.4)
      line(s.x, s.y, e.x, e.y);
    if (e?.score > 0.4 && w?.score > 0.4)
      line(e.x, e.y, w.x, w.y);
  }
}

// ✅ Calculate elbow angle and count reps
function calculateAngleAndCount() {
  for (let pose of poses) {
    const kp = {};
    for (let point of pose.keypoints) kp[point.name] = point;

    const s = kp["right_shoulder"];
    const e = kp["right_elbow"];
    const w = kp["right_wrist"];

    if (s && e && w && s.score > 0.4 && e.score > 0.4 && w.score > 0.4) {
      // Fix mirrored coordinates (flip X back)
      const ex = width - e.x;
      const sx = width - s.x;
      const wx = width - w.x;

      const a = createVector(sx - ex, s.y - e.y);
      const b = createVector(wx - ex, w.y - e.y);

      const angleDeg = Math.abs(degrees(a.angleBetween(b)));

      // Show angle near elbow
      push();
      scale(-1, 1);
      fill(255, 255, 0);
      noStroke();
      textSize(16);
      text(Math.round(angleDeg) + "°", -e.x - 30, e.y - 10);
      pop();

      // Push-up / pull-up logic
      if (angleDeg < 90 && !isDown) {
        isDown = true; // going down
      }
      if (angleDeg > 145 && isDown) {
        count++;
        isDown = false; // completed one rep
      }
    }
  }
}

function showCounter() {
  push();
  scale(-1, 1);
  textSize(32);
  fill(0, 255, 255);
  textAlign(LEFT, TOP);
  text("Count: " + count, -width + 20, 20);
  pop();
}
