let video;
let detector;
let poses = [];
let count = 0;
let isDown = false;
let isPaused = false;
let isTracking = false;
let currentAngle = 0;
let targetReps = 20;
let exerciseType = "pushup";
let sessionStartTime = null;
let bestForm = 0;

// UI Elements
let repCountEl, currentAngleEl, repProgressEl, formFeedbackEl;
let startBtn, pauseBtn, resetBtn, exerciseTypeSelect;
let loadingScreen, navStatus;

// Video dimensions
let videoReady = false;
let canvasWidth, canvasHeight;

async function setup() {
  // Get UI elements
  repCountEl = document.getElementById('repCount');
  currentAngleEl = document.getElementById('currentAngle');
  repProgressEl = document.getElementById('repProgress');
  formFeedbackEl = document.getElementById('formFeedback');
  startBtn = document.getElementById('startBtn');
  pauseBtn = document.getElementById('pauseBtn');
  resetBtn = document.getElementById('resetBtn');
  exerciseTypeSelect = document.getElementById('exerciseType');
  loadingScreen = document.getElementById('loadingScreen');
  navStatus = document.getElementById('navStatus');
  
  try {
    // Request high-resolution video with constraints
    video = createCapture({
      video: {
        width: { ideal: 1280, max: 1920 },
        height: { ideal: 720, max: 1080 },
        facingMode: "user",
        frameRate: { ideal: 30 }
      }
    });
    video.hide();

    // Wait for video metadata to load, then create canvas at native resolution
    video.elt.addEventListener('loadedmetadata', () => {
      const videoWidth = video.elt.videoWidth;
      const videoHeight = video.elt.videoHeight;
      console.log(`Video resolution: ${videoWidth}x${videoHeight}`);
      
      // Create canvas at exact video resolution
      let canvas = createCanvas(videoWidth, videoHeight);
      canvas.parent('canvasWrapper');
      
      videoReady = true;
    });

    // Update loading text
    document.querySelector('.loading-text').textContent = 'Initializing AI Model...';

    // Load MoveNet
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    detector = await poseDetection.createDetector(model, detectorConfig);

    console.log("MoveNet model loaded");
    
    // Hide loading screen
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 500);

    // Setup event listeners
    setupEventListeners();
    
  } catch (error) {
    console.error("Setup error:", error);
    document.querySelector('.loading-text').textContent = 'Error: ' + error.message;
    navStatus.innerHTML = '<span style="color: #EF4444;">⚠ Error Loading</span>';
  }
}

function setupEventListeners() {
  startBtn.addEventListener('click', () => {
    isTracking = true;
    isPaused = false;
    if (!sessionStartTime) sessionStartTime = Date.now();
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    startBtn.style.opacity = '0.5';
  });

  pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.innerHTML = isPaused 
      ? '<span>▶</span><span>Resume</span>' 
      : '<span>⏸</span><span>Pause</span>';
  });

  resetBtn.addEventListener('click', () => {
    count = 0;
    isDown = false;
    bestForm = 0;
    updateUI();
  });

  exerciseTypeSelect.addEventListener('change', (e) => {
    exerciseType = e.target.value;
    count = 0;
    isDown = false;
    updateUI();
  });
}

async function draw() {
  // Dark background
  background(13, 14, 18);
  
  if (!videoReady) {
    // Show loading message on canvas
    fill(156, 163, 175);
    textAlign(CENTER, CENTER);
    textSize(16);
    text('Waiting for camera...', 320, 240);
    return;
  }
  
  // Mirror the canvas
  translate(width, 0);
  scale(-1, 1);
  
  // Draw video at native resolution (1:1, no scaling)
  image(video, 0, 0, width, height);

  if (detector && !isPaused) {
    const posesDetected = await detector.estimatePoses(video.elt);
    poses = posesDetected;
  }

  if (isTracking && !isPaused) {
    drawKeypoints();
    drawSkeleton();
    calculateAngleAndCount();
  }
  
  // Always update UI
  updateUI();
}

function drawKeypoints() {
  const targetPoints = getTargetPoints();

  for (let pose of poses) {
    for (let kp of pose.keypoints) {
      if (kp.score > 0.4 && targetPoints.includes(kp.name)) {
        // Gradient keypoint colors based on form quality
        let keypointColor = getFormColor();
        
        // Outer glow
        fill(keypointColor[0], keypointColor[1], keypointColor[2], 50);
        noStroke();
        ellipse(kp.x, kp.y, 20, 20);
        
        // Inner point
        fill(keypointColor[0], keypointColor[1], keypointColor[2]);
        ellipse(kp.x, kp.y, 10, 10);

        // Label with better styling
        push();
        scale(-1, 1);
        textSize(11);
        textFont('Inter');
        fill(230, 232, 235);
        strokeWeight(3);
        stroke(13, 14, 18);
        text(kp.name.replace('_', ' '), -kp.x - 5, kp.y - 15);
        pop();
      }
    }
  }
}

function getTargetPoints() {
  switch(exerciseType) {
    case 'pushup':
    case 'pullup':
    case 'bicep':
      return ["right_shoulder", "right_elbow", "right_wrist"];
    case 'squat':
      return ["right_hip", "right_knee", "right_ankle"];
    default:
      return ["right_shoulder", "right_elbow", "right_wrist"];
  }
}

function getFormColor() {
  if (currentAngle === 0) return [94, 106, 210]; // Purple default
  
  let minAngle, maxAngle;
  switch(exerciseType) {
    case 'pushup':
    case 'pullup':
    case 'bicep':
      minAngle = 90;
      maxAngle = 145;
      break;
    case 'squat':
      minAngle = 90;
      maxAngle = 170;
      break;
    default:
      minAngle = 90;
      maxAngle = 145;
  }
  
  if (currentAngle < minAngle - 10 || currentAngle > maxAngle + 10) {
    return [239, 68, 68]; // Red - poor form
  } else if (currentAngle < minAngle || currentAngle > maxAngle) {
    return [245, 158, 11]; // Orange - adjust
  } else {
    return [16, 185, 129]; // Green - good form
  }
}

function drawSkeleton() {
  for (let pose of poses) {
    const kp = {};
    for (let point of pose.keypoints) kp[point.name] = point;

    let points = getSkeletonPoints(kp);
    let color = getFormColor();
    
    // Draw connections with gradient effect
    strokeWeight(3);
    stroke(color[0], color[1], color[2], 200);

    if (points[0]?.score > 0.4 && points[1]?.score > 0.4) {
      line(points[0].x, points[0].y, points[1].x, points[1].y);
    }
    if (points[1]?.score > 0.4 && points[2]?.score > 0.4) {
      line(points[1].x, points[1].y, points[2].x, points[2].y);
    }
  }
}

function getSkeletonPoints(kp) {
  switch(exerciseType) {
    case 'pushup':
    case 'pullup':
    case 'bicep':
      return [kp["right_shoulder"], kp["right_elbow"], kp["right_wrist"]];
    case 'squat':
      return [kp["right_hip"], kp["right_knee"], kp["right_ankle"]];
    default:
      return [kp["right_shoulder"], kp["right_elbow"], kp["right_wrist"]];
  }
}

function calculateAngleAndCount() {
  for (let pose of poses) {
    const kp = {};
    for (let point of pose.keypoints) kp[point.name] = point;

    let points = getSkeletonPoints(kp);
    const [p1, p2, p3] = points;

    if (p1 && p2 && p3 && p1.score > 0.4 && p2.score > 0.4 && p3.score > 0.4) {
      // Fix mirrored coordinates
      const p2x = width - p2.x;
      const p1x = width - p1.x;
      const p3x = width - p3.x;

      const a = createVector(p1x - p2x, p1.y - p2.y);
      const b = createVector(p3x - p2x, p3.y - p2.y);

      const angleDeg = Math.abs(degrees(a.angleBetween(b)));
      currentAngle = angleDeg;

      // Show angle with better styling
      push();
      scale(-1, 1);
      let angleColor = getFormColor();
      
      // Background for angle text
      fill(13, 14, 18, 200);
      noStroke();
      rectMode(CENTER);
      rect(-p2.x, p2.y - 25, 60, 28, 6);
      
      // Angle text
      fill(angleColor[0], angleColor[1], angleColor[2]);
      textFont('Inter');
      textSize(18);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(Math.round(angleDeg) + "°", -p2.x, p2.y - 25);
      pop();

      // Exercise-specific logic
      let minAngle, maxAngle;
      switch(exerciseType) {
        case 'pushup':
        case 'pullup':
        case 'bicep':
          minAngle = 90;
          maxAngle = 145;
          break;
        case 'squat':
          minAngle = 90;
          maxAngle = 170;
          break;
        default:
          minAngle = 90;
          maxAngle = 145;
      }

      // Count logic
      if (angleDeg < minAngle && !isDown) {
        isDown = true;
      }
      if (angleDeg > maxAngle && isDown) {
        count++;
        isDown = false;
        // Celebration effect
        celebrateRep();
      }
    }
  }
}

function celebrateRep() {
  // Visual feedback on rep completion
  if (repCountEl) {
    repCountEl.style.transform = 'scale(1.2)';
    setTimeout(() => {
      repCountEl.style.transform = 'scale(1)';
    }, 200);
  }
}

function updateUI() {
  if (repCountEl) {
    repCountEl.textContent = count;
    repCountEl.style.transition = 'transform 0.2s ease';
  }
  
  if (currentAngleEl) {
    currentAngleEl.textContent = currentAngle > 0 ? Math.round(currentAngle) + "°" : "--°";
  }
  
  if (repProgressEl) {
    const progress = Math.min((count / targetReps) * 100, 100);
    repProgressEl.style.width = progress + "%";
  }
  
  if (formFeedbackEl) {
    updateFormFeedback();
  }
}

function updateFormFeedback() {
  if (currentAngle === 0 || !isTracking) {
    formFeedbackEl.innerHTML = '';
    return;
  }
  
  let minAngle, maxAngle, feedbackHTML;
  
  switch(exerciseType) {
    case 'pushup':
    case 'pullup':
    case 'bicep':
      minAngle = 90;
      maxAngle = 145;
      break;
    case 'squat':
      minAngle = 90;
      maxAngle = 170;
      break;
    default:
      minAngle = 90;
      maxAngle = 145;
  }
  
  if (currentAngle < minAngle - 10 || currentAngle > maxAngle + 10) {
    feedbackHTML = '<div class="form-feedback poor">⚠ Poor Form - Adjust Position</div>';
  } else if (currentAngle < minAngle || currentAngle > maxAngle) {
    feedbackHTML = '<div class="form-feedback adjust">⚡ Adjust Your Form</div>';
  } else {
    feedbackHTML = '<div class="form-feedback good">✓ Perfect Form</div>';
  }
  
  formFeedbackEl.innerHTML = feedbackHTML;
}
