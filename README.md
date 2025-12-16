# 💪 MoveNet Pose Detection

AI-powered fitness tracker with real-time pose estimation for multiple exercise types using TensorFlow.js and MoveNet.

![MoveNet Demo](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![p5.js](https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## ✨ Features

- 🎥 **Live Webcam Tracking** - Real-time pose detection using your device camera
- 💪 **Multiple Exercise Types** - Track Push-ups, Pull-ups, Squats, and Bicep Curls
- 🎨 **Modern UI** - Linear-inspired design with glassmorphism effects
- 📊 **Form Feedback** - Color-coded real-time feedback (Good/Adjust/Poor)
- 🔢 **Rep Counter** - Automatic repetition counting with progress tracking
- 📐 **Angle Display** - Live joint angle measurements
- ⏯️ **Session Controls** - Start, Pause, Resume, and Reset functionality
- 🎯 **Adaptive Thresholds** - Different angle ranges for each exercise type

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam access
- Internet connection (for loading libraries)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Arfahd/MoveNet-p5js.git
   cd MoveNet-p5js
   ```

2. **Start a local web server:**

   **Option 1: Python (Recommended)**
   ```bash
   python3 -m http.server 8000
   ```

   **Option 2: Node.js**
   ```bash
   npm install -g http-server
   http-server -p 8000
   ```

   **Option 3: PHP**
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser:**
   ```
   http://localhost:8000
   ```

4. **Allow camera access** when prompted

## 🎮 Usage

### Getting Started

1. **Allow Camera Access** - Grant permission when prompted by your browser
2. **Position Yourself** - Stand in frame so your full body or targeted area is visible
3. **Select Exercise Type** - Choose from the dropdown: Push-ups, Pull-ups, Squats, or Bicep Curls
4. **Start Tracking** - Click the "▶ Start" button to begin
5. **Follow Feedback** - Watch the color-coded form feedback as you exercise
6. **View Progress** - Monitor your rep count and progress bar

### Exercise-Specific Tips

#### Push-ups & Pull-ups
- Stand sideways to the camera for best tracking
- Ensure your right shoulder, elbow, and wrist are visible
- Angle range: 90° (down) to 145° (up)

#### Squats
- Face the camera or stand sideways
- Keep your right hip, knee, and ankle visible
- Angle range: 90° (down) to 170° (up)

#### Bicep Curls
- Stand sideways to the camera
- Extend and curl your right arm fully
- Angle range: 90° (curled) to 145° (extended)

### Form Feedback Colors

- 🟢 **Green** - Perfect form! Angle is in optimal range
- 🟡 **Yellow/Orange** - Adjust your form slightly
- 🔴 **Red** - Poor form - check your position

## ⚙️ Configuration

### Angle Thresholds

Default angle ranges for each exercise (can be modified in `sketch.js`):

```javascript
// Push-ups, Pull-ups, Bicep Curls
minAngle: 90°
maxAngle: 145°

// Squats
minAngle: 90°
maxAngle: 170°
```

### Target Repetitions

Default target for progress bar (line 9 in `sketch.js`):
```javascript
let targetReps = 20;  // Adjust as needed
```

### Video Resolution

Webcam capture settings (lines 38-44 in `sketch.js`):
```javascript
video: {
  width: { ideal: 1280, max: 1920 },
  height: { ideal: 720, max: 1080 },
  facingMode: "user",
  frameRate: { ideal: 30 }
}
```

## 📁 Project Structure

```
MoveNet-p5js/
├── index.html          # Main HTML with Linear-inspired UI
├── sketch.js           # p5.js sketch with MoveNet integration
└── README.md           # Documentation
```

## 🛠️ Technology Stack

- **[TensorFlow.js](https://www.tensorflow.org/js)** - Machine learning in the browser
- **[MoveNet](https://www.tensorflow.org/hub/tutorials/movenet)** - Fast and accurate pose estimation model (SINGLEPOSE_THUNDER)
- **[p5.js](https://p5js.org/)** - Creative coding library for canvas manipulation
- **HTML5/CSS3** - Modern web standards with custom styling
- **JavaScript (ES6+)** - Async/await for pose detection

## 🎨 UI Components

### Top Navigation Bar
- Logo and branding
- Model status indicator

### Sidebar Control Panel
- **Session Stats** - Rep count, current angle, progress bar
- **Exercise Selector** - Choose exercise type
- **Control Buttons** - Start, Pause, Reset
- **Form Feedback** - Real-time form quality indicator
- **Instructions** - Quick reference guide

### Canvas Display
- Live video feed
- Pose keypoints visualization
- Skeleton overlay
- Angle measurements

## 🔧 Troubleshooting

### Camera Not Working
- Check browser permissions (usually in address bar)
- Ensure no other application is using the camera
- Try a different browser
- Refresh the page and allow permissions again

### Slow Performance
- Close other browser tabs
- Use Google Chrome for best performance
- Ensure good lighting for better detection
- Consider using a device with GPU

### Pose Not Detected
- Improve lighting conditions
- Move closer to the camera
- Ensure target body parts are visible
- Stand against a plain background

### Wrong Rep Counts
- Ensure full range of motion
- Move smoothly through the exercise
- Check that you're going below minimum and above maximum angles
- Use the Reset button to start fresh

## 🌐 Browser Support

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | ✅ | Recommended - Best performance |
| Firefox | ✅ | Full support |
| Edge | ✅ | Full support |
| Safari | ✅ | May require HTTPS |
| Mobile | ⚠️ | Limited - Desktop recommended |

## 📊 Model Information

**MoveNet SINGLEPOSE_THUNDER**
- Architecture: Single-pose estimation
- Speed: ~30 FPS on modern hardware
- Keypoints: 17 body points tracked
- Confidence threshold: 0.4 (40%)

## 🔒 Privacy

- All processing happens **locally in your browser**
- No video or images are uploaded to any server
- No data is collected or stored
- Camera access is only used during active sessions

## 🚦 Alternative Branch

Looking for a **video file testing version**? Check out the `vidinput` branch:

```bash
git checkout vidinput
```

The vidinput branch uses pre-recorded video files instead of webcam, perfect for:
- Development and testing without camera access
- Consistent testing scenarios
- Demonstrations in offline environments

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **[TensorFlow.js](https://www.tensorflow.org/js)** - For bringing ML to the browser
- **[Google MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html)** - For the amazing pose estimation model
- **[p5.js](https://p5js.org/)** - For the creative coding framework
- **[Linear](https://linear.app/)** - For design inspiration

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 👨‍💻 Author

**Arfah Diraja**
- GitHub: [@Arfahd](https://github.com/Arfahd)

---

⭐ Star this repo if you find it helpful!
