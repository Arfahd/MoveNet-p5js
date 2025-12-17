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
let inputMode = "video"; // Default to video mode
let uploadedVideoFile = null; // Store uploaded file
let uploadedVideoURL = null; // Store object URL for cleanup

// Form tracking variables
let positionHistory = []; // Track movement for stability check
let currentFormScore = 0; // Overall form score 0-100
let bodyAlignmentAngle = 0; // Shoulder-hip-ankle angle

// UI Elements
let repCountEl, currentAngleEl, repProgressEl, formFeedbackEl;
let startBtn, pauseBtn, resetBtn, exerciseTypeSelect;
let loadingScreen, navStatus, inputModeSelect, videoSourceSection, instructionsList;

// Video dimensions
let videoReady = false;
let canvasWidth, canvasHeight;

async function setup() {
  // Create canvas immediately so p5.js has something to draw on
  let canvas = createCanvas(1280, 720); // Default size, will resize when video loads
  canvas.parent('canvasWrapper');
  
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
  inputModeSelect = document.getElementById('inputMode');
  videoSourceSection = document.getElementById('videoSourceSection');
  instructionsList = document.getElementById('instructionsList');
  
  try {
    // Initialize video source based on default mode
    await initializeVideoSource(inputMode);

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

async function initializeVideoSource(mode) {
  // Clean up uploaded video URL if switching modes
  if (mode === 'webcam' && uploadedVideoURL) {
    URL.revokeObjectURL(uploadedVideoURL);
    uploadedVideoURL = null;
    uploadedVideoFile = null;
  }
  
  // Remove old video if exists
  if (video) {
    video.remove();
  }
  
  videoReady = false;
  
  if (mode === 'webcam') {
    // Check if getUserMedia is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('getUserMedia not supported');
      alert('Webcam not supported in this environment. Please use Video File mode instead.');
      
      // Fallback to video mode
      inputModeSelect.value = 'video';
      inputMode = 'video';
      videoSourceSection.style.display = 'block';
      updateInstructions('video');
      return;
    }
    
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

    // Wait for video metadata to load, then resize canvas to match video
    video.elt.addEventListener('loadedmetadata', () => {
      const videoWidth = video.elt.videoWidth;
      const videoHeight = video.elt.videoHeight;
      console.log(`Webcam resolution: ${videoWidth}x${videoHeight}`);
      
      // Resize canvas to match video resolution
      resizeCanvas(videoWidth, videoHeight);
      
      videoReady = true;
    });
  }
  // For video mode, wait for user to upload a file
  // No automatic video loading
}

function updateInstructions(mode) {
  if (!instructionsList) return;
  
  if (mode === 'webcam') {
    instructionsList.innerHTML = `
      <li>Allow camera access when prompted</li>
      <li>Position yourself in frame</li>
      <li>Select your exercise type</li>
      <li>Press Start to begin tracking</li>
      <li>Follow the form feedback</li>
    `;
  } else {
    instructionsList.innerHTML = `
      <li>Click "Choose Video File" to upload</li>
      <li>Select MP4, WebM, or OGG video</li>
      <li>Choose matching exercise type</li>
      <li>Press Start to begin tracking</li>
      <li>Watch the form feedback</li>
    `;
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

  // Input mode selector
  inputModeSelect.addEventListener('change', async (e) => {
    const newMode = e.target.value;
    console.log(`Switching to ${newMode} mode`);
    
    inputMode = newMode;
    
    // Show/hide video source section
    if (newMode === 'video') {
      videoSourceSection.style.display = 'block';
    } else {
      videoSourceSection.style.display = 'none';
    }
    
    // Stop tracking during mode switch
    isTracking = false;
    isPaused = true;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    startBtn.style.opacity = '1';
    pauseBtn.innerHTML = '<span>⏸</span><span>Pause</span>';
    
    // Reset state
    count = 0;
    isDown = false;
    poses = [];
    
    // Initialize new video source
    await initializeVideoSource(newMode);
    
    // Update instructions
    updateInstructions(newMode);
    
    updateUI();
  });

  // File upload button click
  const chooseVideoBtn = document.getElementById('chooseVideoBtn');
  const videoFileInput = document.getElementById('videoFileInput');

  if (chooseVideoBtn && videoFileInput) {
    chooseVideoBtn.addEventListener('click', () => {
      videoFileInput.click(); // Trigger file input dialog
    });

    // Handle file selection
    videoFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      
      if (!file) return;
      
      // Validate file
      if (!validateVideoFile(file)) {
        return;
      }
      
      // Display file info
      displayVideoInfo(file);
      
      // Load the video
      await loadUploadedVideo(file);
    });
  }
}

async function draw() {
  // Dark background
  background(13, 14, 18);
  
  if (!videoReady) {
    // Show loading message on canvas
    fill(156, 163, 175);
    textAlign(CENTER, CENTER);
    textSize(16);
    if (inputMode === 'webcam') {
      text('Waiting for camera...', width/2, height/2);
    } else {
      text('Please upload a video file', width/2, height/2);
    }
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
  // Only pushup and pullup now
  return ["right_shoulder", "right_elbow", "right_wrist", "right_hip", "right_ankle"];
}

// ===== ENHANCED FORM DETECTION SYSTEM =====

function checkBodyAlignment(kp, exerciseType) {
  const shoulder = kp['right_shoulder'];
  const hip = kp['right_hip'];
  const ankle = kp['right_ankle'];
  
  // Check confidence
  if (!shoulder || !hip || !ankle || 
      shoulder.score < 0.4 || hip.score < 0.4 || ankle.score < 0.4) {
    return { score: 50, message: 'Position unclear' };
  }
  
  // Calculate body line angle (shoulder-hip-ankle)
  const angle = calculateAngleFromPoints(shoulder, hip, ankle);
  bodyAlignmentAngle = angle; // Store for display
  
  if (exerciseType === 'pushup') {
    // Should be straight: 170-185°
    if (angle >= 170 && angle <= 185) {
      return { score: 100, message: 'Body straight ✓' };
    } else if (angle < 160) {
      return { score: 30, message: 'Hips sagging!' };
    } else if (angle > 195) {
      return { score: 40, message: 'Hips too high!' };
    } else {
      return { score: 70, message: 'Body alignment OK' };
    }
  } 
  else if (exerciseType === 'pullup') {
    // Slightly bent OK: 165-185°
    if (angle >= 165 && angle <= 185) {
      return { score: 100, message: 'Vertical ✓' };
    } else if (angle < 150) {
      return { score: 20, message: 'Stop kipping!' };
    } else {
      return { score: 60, message: 'Stay vertical' };
    }
  }
  
  return { score: 50, message: 'Check form' };
}

function checkCoreEngagement(kp) {
  const shoulder = kp['right_shoulder'];
  const hip = kp['right_hip'];
  const ankle = kp['right_ankle'];
  
  if (!shoulder || !hip || !ankle || 
      shoulder.score < 0.4 || hip.score < 0.4 || ankle.score < 0.4) {
    return { score: 50, message: '' };
  }
  
  // Calculate expected hip Y position (on straight line between shoulder and ankle)
  const totalDistance = ankle.y - shoulder.y;
  const shoulderToHipRatio = 0.5; // Hip should be halfway
  const expectedHipY = shoulder.y + (totalDistance * shoulderToHipRatio);
  
  // Check if hip is sagging (dropping below expected line)
  const hipDrop = hip.y - expectedHipY;
  
  if (Math.abs(hipDrop) < 30) {
    return { score: 100, message: '' };
  } else if (hipDrop > 30) {
    return { score: 40, message: 'Engage core!' };
  } else {
    return { score: 70, message: '' };
  }
}

function checkStability(kp) {
  const hip = kp['right_hip'];
  
  if (!hip || hip.score < 0.4) {
    return { score: 50, message: '' };
  }
  
  // Track hip position over last 10 frames
  positionHistory.push({ x: hip.x, y: hip.y, time: Date.now() });
  if (positionHistory.length > 10) positionHistory.shift();
  
  // Need at least 5 frames to calculate
  if (positionHistory.length < 5) {
    return { score: 100, message: '' };
  }
  
  // Calculate horizontal movement
  const firstPos = positionHistory[0];
  const lastPos = positionHistory[positionHistory.length - 1];
  const horizontalMovement = Math.abs(lastPos.x - firstPos.x);
  
  if (horizontalMovement < 20) {
    return { score: 100, message: '' };
  } else if (horizontalMovement < 40) {
    return { score: 70, message: '' };
  } else {
    return { score: 30, message: 'Too much swing!' };
  }
}

function checkArmAngle(angle) {
  // Check if arm angle is in good range
  // Pushup/Pullup: 90° (down) to 145° (up)
  if (angle >= 90 && angle <= 145) {
    return { score: 100, message: 'Arms ✓' };
  } else if (angle < 80 || angle > 155) {
    return { score: 40, message: 'Arm angle off' };
  } else {
    return { score: 70, message: 'Arms OK' };
  }
}

function analyzeForm(kp, armAngle, exerciseType) {
  // Perform all form checks
  const checks = {
    bodyAlignment: checkBodyAlignment(kp, exerciseType),
    coreEngagement: checkCoreEngagement(kp),
    armAngle: checkArmAngle(armAngle),
    stability: checkStability(kp)
  };
  
  // Calculate weighted score
  const weights = {
    bodyAlignment: 0.40,  // 40% - MOST IMPORTANT
    coreEngagement: 0.20, // 20%
    armAngle: 0.30,       // 30%
    stability: 0.10       // 10%
  };
  
  const totalScore = 
    checks.bodyAlignment.score * weights.bodyAlignment +
    checks.coreEngagement.score * weights.coreEngagement +
    checks.armAngle.score * weights.armAngle +
    checks.stability.score * weights.stability;
  
  currentFormScore = Math.round(totalScore);
  
  // Determine primary issue (lowest score)
  let primaryIssue = '';
  let lowestScore = 100;
  Object.keys(checks).forEach(key => {
    if (checks[key].score < lowestScore && checks[key].message) {
      lowestScore = checks[key].score;
      primaryIssue = checks[key].message;
    }
  });
  
  return {
    score: currentFormScore,
    checks: checks,
    primaryIssue: primaryIssue
  };
}

function calculateAngleFromPoints(p1, p2, p3) {
  // Calculate angle at p2 (middle point)
  // Same logic as existing calculateAngle but for any 3 points
  const a = createVector(p1.x - p2.x, p1.y - p2.y);
  const b = createVector(p3.x - p2.x, p3.y - p2.y);
  const angleDeg = Math.abs(degrees(a.angleBetween(b)));
  return angleDeg;
}

function getFormColor() {
  if (currentFormScore === 0) return [94, 106, 210]; // Purple default
  
  // Use weighted form score
  if (currentFormScore >= 90) {
    return [16, 185, 129]; // Green - perfect form
  } else if (currentFormScore >= 75) {
    return [52, 211, 153]; // Light green - good form
  } else if (currentFormScore >= 60) {
    return [245, 158, 11]; // Orange - needs improvement
  } else {
    return [239, 68, 68]; // Red - poor form
  }
}

function drawSkeleton() {
  for (let pose of poses) {
    const kp = {};
    for (let point of pose.keypoints) kp[point.name] = point;

    let points = getSkeletonPoints(kp);
    let color = getFormColor();
    
    // Draw arm connections (shoulder-elbow-wrist)
    strokeWeight(3);
    stroke(color[0], color[1], color[2], 200);

    if (points[0]?.score > 0.4 && points[1]?.score > 0.4) {
      line(points[0].x, points[0].y, points[1].x, points[1].y); // shoulder-elbow
    }
    if (points[1]?.score > 0.4 && points[2]?.score > 0.4) {
      line(points[1].x, points[1].y, points[2].x, points[2].y); // elbow-wrist
    }
    
    // Draw body alignment line (shoulder-hip-ankle)
    strokeWeight(4); // Thicker for body line
    if (points[0]?.score > 0.4 && points[3]?.score > 0.4) {
      line(points[0].x, points[0].y, points[3].x, points[3].y); // shoulder-hip
    }
    if (points[3]?.score > 0.4 && points[4]?.score > 0.4) {
      line(points[3].x, points[3].y, points[4].x, points[4].y); // hip-ankle
    }
  }
}

function getSkeletonPoints(kp) {
  // Draw both arm and body alignment lines
  return [
    kp["right_shoulder"], 
    kp["right_elbow"], 
    kp["right_wrist"],
    kp["right_hip"],
    kp["right_ankle"]
  ];
}

function calculateAngleAndCount() {
  for (let pose of poses) {
    const kp = {};
    for (let point of pose.keypoints) kp[point.name] = point;

    let points = getSkeletonPoints(kp);
    const [p1, p2, p3] = points; // shoulder, elbow, wrist

    if (p1 && p2 && p3 && p1.score > 0.4 && p2.score > 0.4 && p3.score > 0.4) {
      // Fix mirrored coordinates
      const p2x = width - p2.x;
      const p1x = width - p1.x;
      const p3x = width - p3.x;

      const a = createVector(p1x - p2x, p1.y - p2.y);
      const b = createVector(p3x - p2x, p3.y - p2.y);

      const angleDeg = Math.abs(degrees(a.angleBetween(b)));
      currentAngle = angleDeg;
      
      // === NEW: Analyze complete form ===
      const formAnalysis = analyzeForm(kp, angleDeg, exerciseType);

      // Show arm angle with better styling
      push();
      scale(-1, 1);
      let angleColor = getFormColor();
      
      // Background for angle text
      fill(13, 14, 18, 200);
      noStroke();
      rectMode(CENTER);
      rect(-p2.x, p2.y - 25, 70, 28, 6);
      
      // Angle text
      fill(angleColor[0], angleColor[1], angleColor[2]);
      textFont('Inter');
      textSize(16);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(Math.round(angleDeg) + "°", -p2.x, p2.y - 25);
      pop();
      
      // Show body alignment angle
      if (bodyAlignmentAngle > 0) {
        push();
        scale(-1, 1);
        const hip = kp['right_hip'];
        if (hip && hip.score > 0.4) {
          fill(13, 14, 18, 200);
          noStroke();
          rectMode(CENTER);
          rect(-hip.x, hip.y - 25, 70, 28, 6);
          
          fill(angleColor[0], angleColor[1], angleColor[2]);
          textFont('Inter');
          textSize(16);
          textStyle(BOLD);
          textAlign(CENTER, CENTER);
          text(Math.round(bodyAlignmentAngle) + "°", -hip.x, hip.y - 25);
        }
        pop();
      }

      // Pushup and pullup use same angle ranges
      const minAngle = 90;
      const maxAngle = 145;

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
  if (currentFormScore === 0 || !isTracking) {
    formFeedbackEl.innerHTML = '';
    return;
  }
  
  let feedbackHTML = '';
  let formClass = '';
  let formLabel = '';
  
  // Determine overall rating
  if (currentFormScore >= 90) {
    formClass = 'good';
    formLabel = '✓ Perfect Form';
  } else if (currentFormScore >= 75) {
    formClass = 'good';
    formLabel = '✓ Good Form';
  } else if (currentFormScore >= 60) {
    formClass = 'adjust';
    formLabel = '⚡ Needs Improvement';
  } else {
    formClass = 'poor';
    formLabel = '⚠ Poor Form';
  }
  
  feedbackHTML = `
    <div class="form-feedback ${formClass}">
      <div style="font-size: 16px; font-weight: bold;">
        ${formLabel}
      </div>
      <div style="font-size: 14px; opacity: 0.9; margin-top: 2px;">
        (${currentFormScore}/100)
      </div>
    </div>
    <div style="margin-top: 8px; font-size: 12px; color: #9CA3AF;">
      <div style="margin-bottom: 3px;">Body: ${Math.round(bodyAlignmentAngle)}°</div>
      <div>Arm: ${Math.round(currentAngle)}°</div>
    </div>
  `;
  
  formFeedbackEl.innerHTML = feedbackHTML;
}

// File upload helper functions
function validateVideoFile(file) {
  // Check file type
  const validTypes = ['video/mp4', 'video/webm', 'video/ogg'];
  if (!validTypes.includes(file.type)) {
    alert('Invalid file type. Please upload MP4, WebM, or OGG video files.');
    return false;
  }
  
  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    alert('File too large. Please upload videos smaller than 100MB.');
    return false;
  }
  
  return true;
}

function displayVideoInfo(file) {
  const videoInfo = document.getElementById('videoInfo');
  const fileName = document.getElementById('videoFileName');
  const fileSize = document.getElementById('videoFileSize');
  
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);
  
  videoInfo.style.display = 'block';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

async function loadUploadedVideo(file) {
  // Clean up previous uploaded video URL
  if (uploadedVideoURL) {
    URL.revokeObjectURL(uploadedVideoURL);
  }
  
  // Create object URL from file
  uploadedVideoURL = URL.createObjectURL(file);
  uploadedVideoFile = file;
  
  // Stop tracking during video switch
  isTracking = false;
  isPaused = true;
  startBtn.disabled = false;
  pauseBtn.disabled = true;
  startBtn.style.opacity = '1';
  pauseBtn.innerHTML = '<span>⏸</span><span>Pause</span>';
  
  // Reset state
  count = 0;
  isDown = false;
  poses = [];
  
  // Remove old video if exists
  if (video) {
    video.remove();
  }
  
  videoReady = false;
  
  // Load video from object URL
  video = createVideo(uploadedVideoURL, () => {
    console.log(`Uploaded video loaded: ${file.name}`);
  });
  video.volume(0);
  video.hide();
  
  video.elt.addEventListener('loadedmetadata', () => {
    const videoWidth = video.elt.videoWidth;
    const videoHeight = video.elt.videoHeight;
    const duration = video.elt.duration;
    
    console.log(`Video resolution: ${videoWidth}x${videoHeight}, Duration: ${duration}s`);
    
    // Update duration in UI
    const videoDuration = document.getElementById('videoDuration');
    if (videoDuration) {
      videoDuration.textContent = formatDuration(duration);
    }
    
    // Resize canvas to match video resolution
    resizeCanvas(videoWidth, videoHeight);
    
    videoReady = true;
    
    // Auto-start video playback
    video.loop();
  });
  
  updateUI();
}
