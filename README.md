# 💪 MoveNet Pose Detection (Video Testing Version)

AI-powered fitness tracker with real-time pose estimation for multiple exercise types using TensorFlow.js and MoveNet. **This branch uses pre-recorded video files** for testing and development without camera access.

![MoveNet Demo](https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)
![p5.js](https://img.shields.io/badge/p5.js-ED225D?style=for-the-badge&logo=p5.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

> 🎥 **Note:** This is the `vidinput` branch - it uses video files instead of live webcam. For live webcam tracking, switch to the [`main`](https://github.com/Arfahd/MoveNet-p5js) branch.

## ✨ Features

- 🎬 **Video File Input** - Test with pre-recorded exercise videos (no camera needed!)
- 🔄 **Video Source Selector** - Switch between push-up and pull-up videos dynamically
- 💪 **Multiple Exercise Types** - Track Push-ups, Pull-ups, Squats, and Bicep Curls
- 🎨 **Modern UI** - Linear-inspired design with glassmorphism effects
- 📊 **Form Feedback** - Color-coded real-time feedback (Good/Adjust/Poor)
- 🔢 **Rep Counter** - Automatic repetition counting with progress tracking
- 📐 **Angle Display** - Live joint angle measurements
- ⏯️ **Session Controls** - Start, Pause, Resume, and Reset functionality
- 🎯 **Adaptive Thresholds** - Different angle ranges for each exercise type

## 🎯 Use Cases

This branch is perfect for:

✅ **Development** - Test without needing camera access  
✅ **Debugging** - Consistent video input for reproducible tests  
✅ **Demonstrations** - Show the app working without live camera  
✅ **Offline Environments** - No camera permission required  
✅ **CI/CD Testing** - Automated testing with video files  

## 🚀 Quick Start

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for loading libraries)
- **No camera required!**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Arfahd/MoveNet-p5js.git
   cd MoveNet-p5js
   ```

2. **Switch to vidinput branch:**
   ```bash
   git checkout vidinput
   ```

3. **Verify video files exist:**
   ```bash
   ls media/
   # Should show: pushup.mp4, pullup.mp4
   ```

4. **Start a local web server:**

   > ⚠️ **Important:** You must use a local server. Opening `index.html` directly will cause CORS errors!

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

   **Option 4: VS Code Live Server**
   - Install "Live Server" extension
   - Right-click `index.html`
   - Select "Open with Live Server"

5. **Open in browser:**
   ```
   http://localhost:8000
   ```

6. **Start using!** - The video will auto-play on load

## 🎮 Usage

### Getting Started

1. **Video Auto-Plays** - The pushup.mp4 video loads and loops automatically
2. **Select Video Source** - Use the "Video Source" dropdown to switch between:
   - Push-up Video (`media/pushup.mp4`)
   - Pull-up Video (`media/pullup.mp4`)
3. **Select Exercise Type** - Choose the matching exercise type from dropdown
4. **Start Tracking** - Click the "▶ Start" button to begin counting
5. **Follow Feedback** - Watch the color-coded form feedback
6. **View Progress** - Monitor your rep count and progress bar

### Video Source Switching

The video source selector allows you to:
- Switch between different exercise videos
- Test various poses without changing files
- Compare tracking accuracy across videos
- Reset tracking state automatically on switch

### Adding Your Own Videos

1. **Add video files** to the `media/` folder:
   ```bash
   cp your-exercise-video.mp4 media/
   ```

2. **Update the selector** in `index.html` (lines 507-510):
   ```html
   <select class="exercise-select" id="videoSource">
     <option value="media/pushup.mp4">Push-up Video</option>
     <option value="media/pullup.mp4">Pull-up Video</option>
     <option value="media/your-exercise-video.mp4">Your Exercise</option>
   </select>
   ```

3. **Refresh the page** and select your new video!

### Video Requirements

For best tracking results, your videos should:
- Show the person from the side (for arm exercises)
- Have good lighting
- Keep the body fully in frame
- Be in MP4 format (H.264 codec)
- Have at least 480p resolution
- Be 10-30 seconds long (will loop automatically)

## ⚙️ Configuration

### Angle Thresholds

Default angle ranges for each exercise (in `sketch.js`):

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

### Video Configuration

Change the initial video in `sketch.js` (line 38):
```javascript
video = createVideo("media/pushup.mp4", () => {
  // Change to "media/pullup.mp4" or your custom video
});
```

## 📁 Project Structure

```
MoveNet-p5js/ (vidinput branch)
├── index.html          # Main HTML with Linear-inspired UI
├── sketch.js           # p5.js sketch with video file input
├── media/              # Video files directory
│   ├── pushup.mp4     # Push-up exercise video (3.1MB)
│   └── pullup.mp4     # Pull-up exercise video (2.6MB)
└── README.md           # This file
```

## 🛠️ Technology Stack

- **[TensorFlow.js](https://www.tensorflow.org/js)** - Machine learning in the browser
- **[MoveNet](https://www.tensorflow.org/hub/tutorials/movenet)** - Fast and accurate pose estimation model (SINGLEPOSE_THUNDER)
- **[p5.js](https://p5js.org/)** - Creative coding library for canvas and video manipulation
- **HTML5/CSS3** - Modern web standards with custom styling
- **JavaScript (ES6+)** - Async/await for pose detection

## 🎨 UI Components

### Top Navigation Bar
- Logo and branding
- Model status indicator

### Sidebar Control Panel
- **Video Source Selector** - Switch between video files (unique to this branch)
- **Session Stats** - Rep count, current angle, progress bar
- **Exercise Selector** - Choose exercise type
- **Control Buttons** - Start, Pause, Reset
- **Form Feedback** - Real-time form quality indicator
- **Instructions** - Quick reference guide

### Canvas Display
- Video playback
- Pose keypoints visualization
- Skeleton overlay
- Angle measurements

## 🔧 Troubleshooting

### CORS Error (Video Won't Load)
```
Access to video from origin 'null' has been blocked by CORS policy
```

**Solution:** You MUST use a local web server (see installation step 4). Never open `index.html` directly from the filesystem.

### Video Not Playing
- Verify files exist in `media/` folder
- Check browser console for errors
- Ensure video codec is H.264 (MP4)
- Try refreshing the page

### Slow Performance
- Close other browser tabs
- Use Google Chrome for best performance
- Consider reducing video resolution
- Check that video file isn't too large (< 10MB recommended)

### Pose Not Detected
- Check video quality and lighting
- Ensure person is fully visible in frame
- Try a different video with better lighting
- Verify the exercise motion is clear

### Video Source Selector Not Working
- Check browser console for errors
- Ensure the video path is correct
- Verify the video file exists
- Try manually typing the video path

## 🌐 Browser Support

| Browser | Supported | Notes |
|---------|-----------|-------|
| Chrome | ✅ | Recommended - Best performance |
| Firefox | ✅ | Full support |
| Edge | ✅ | Full support |
| Safari | ✅ | Full support |
| Mobile | ✅ | Works with video files |

## 📊 Model Information

**MoveNet SINGLEPOSE_THUNDER**
- Architecture: Single-pose estimation
- Speed: ~30 FPS on modern hardware
- Keypoints: 17 body points tracked
- Confidence threshold: 0.4 (40%)

## 🔄 Branch Comparison

| Feature | Main Branch | Vidinput Branch (This) |
|---------|-------------|----------------------|
| **Input Source** | Live webcam | Video files |
| **Camera Required** | ✅ Yes | ❌ No |
| **Video Selector** | ❌ N/A | ✅ Yes |
| **Use Case** | Production | Development/Testing |
| **Setup** | Camera permissions | Local server only |
| **UI** | Identical | Identical |
| **Features** | Identical | Identical + Video switcher |

## 🚦 Switch to Live Webcam

Want to use **live webcam** instead of video files?

```bash
git checkout main
python3 -m http.server 8000
# Open http://localhost:8000
```

The main branch has identical UI and features, but uses your device camera for real-time tracking.

## 🎥 Recording Your Own Videos

### Using OBS Studio (Recommended)

1. Download [OBS Studio](https://obsproject.com/)
2. Set up a camera source
3. Record your exercise (10-30 seconds)
4. Save as MP4
5. Place in `media/` folder

### Using Phone Camera

1. Record video on your phone
2. Transfer to computer
3. Convert to MP4 if needed:
   ```bash
   ffmpeg -i input.mov -c:v libx264 -preset slow -crf 22 output.mp4
   ```
4. Place in `media/` folder

### Video Tips

- **Position:** Stand sideways for arm exercises
- **Lighting:** Use bright, even lighting
- **Background:** Use a plain, contrasting background
- **Duration:** 10-30 seconds is ideal
- **Format:** MP4 (H.264 codec)
- **Resolution:** 720p minimum, 1080p recommended

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **[TensorFlow.js](https://www.tensorflow.org/js)** - For bringing ML to the browser
- **[Google MoveNet](https://blog.tensorflow.org/2021/05/next-generation-pose-detection-with-movenet-and-tensorflowjs.html)** - For the amazing pose estimation model
- **[p5.js](https://p5js.org/)** - For the creative coding framework and video handling
- **[Linear](https://linear.app/)** - For design inspiration

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

Feel free to:
- Add more exercise videos
- Improve pose detection algorithms
- Enhance UI/UX
- Fix bugs

## 👨‍💻 Author

**Arfah Diraja**
- GitHub: [@Arfahd](https://github.com/Arfahd)

---

⭐ Star this repo if you find it helpful!

💡 **Pro Tip:** Use this branch for development, then switch to `main` for production with live webcam!
