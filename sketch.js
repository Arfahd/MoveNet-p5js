let video;
let detector;
let poses = [];
let count = 0;
let isDown = false;

async function setup() {
  // Load video dynamically and wait until metadata is loaded
  video = createVideo("media/pullup.mp4", () => {
    console.log("Loaded: pullup.mp4 ✅");
    video.volume(0);
    video.loop();
    video.hide();
  });

  // Wait until we know the real video dimensions
  video.elt.onloadedmetadata = async () => {
    const vidW = video.elt.videoWidth;
    const vidH = video.elt.videoHeight;

    console.log(`🎥 Video resolution: ${vidW}x${vidH}`);

    createCanvas(vidW, vidH);
    frameRate(30);

    // Load MoveNet model
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    detector = await poseDetection.createDetector(model, detectorConfig);
    console.log("MoveNet model loaded ✅");
  };
}

async function draw() {
  if (!video || !video.elt.videoWidth) return;

  background(0);
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

      // Show angle
      push();
      fill(255, 255, 0);
      noStroke();
      textSize(16);
      text(Math.round(angleDeg) + "°", e.x + 15, e.y - 10);
      pop();

      // Count logic
      if (angleDeg < 90 && !isDown) {
        isDown = true;
      }
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
