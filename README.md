# MoveNet Pose Detection

## Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam access
- Internet connection (for loading libraries)

### Setup

Clone the repository:
```bash
git clone https://github.com/Arfahd/MoveNet-p5js.git
cd MoveNet-p5js
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

1. Allow camera access when prompted
2. Select your exercise type from the dropdown
3. Click "Start" to begin tracking
4. Perform your exercises while the app counts your reps

## License

This project is open source and available under the MIT License.

## Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) for machine learning in the browser
- [MoveNet](https://www.tensorflow.org/hub/tutorials/movenet) for pose estimation model
- [p5.js](https://p5js.org/) for creative coding framework
