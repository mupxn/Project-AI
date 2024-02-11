from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import base64
from deepface import DeepFace

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return jsonify(message="Flask-SocketIO DeepFace Server is running!")

@socketio.on('connect')
def test_connect():
    print('Client connected')

@socketio.on('disconnect')
def test_disconnect():
    print('Client disconnected')

@socketio.on('image')
def handle_image(data):
    img_data = data['data']
    img_data = base64.b64decode(img_data.split(',')[1])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    try:
        # Analyze the frame with DeepFace
        analysis = DeepFace.analyze(img, actions=['age', 'gender', 'race', 'emotion'], enforce_detection=False)
        
        # Return the analysis results
        emit('response', {'status': 'received', 'analysis': analysis})
    except Exception as e:
        emit('response', {'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True)