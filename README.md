# MoveNet Pose Detection (Video Testing Version)

## Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Internet connection (for loading libraries)
- No camera required

### Setup

Clone the repository:
```bash
git clone https://github.com/Arfahd/MoveNet-p5js.git
cd MoveNet-p5js
```

Switch to vidinput branch:
```bash
git checkout vidinput
```

Start a local web server:
```bash
python3 -m http.server 8000
```

## Usage

Open your browser and navigate to:
```bash
http://localhost:8000
```

1. The video will auto-play on load
2. Use the "Video Source" dropdown to switch between push-up and pull-up videos
3. Select your exercise type from the dropdown
4. Click "Start" to begin tracking
5. Watch the app count reps from the video

Note: This branch uses pre-recorded video files for testing and development without camera access. For live webcam tracking, use the main branch.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) for machine learning in the browser
- [MoveNet](https://www.tensorflow.org/hub/tutorials/movenet) for pose estimation model
- [p5.js](https://p5js.org/) for creative coding framework
