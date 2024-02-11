from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
import cv2
import numpy as np
import base64
from deepface import DeepFace
import logging
import tempfile
import os
import pandas as pd

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

@app.route('/')
def index():
    return jsonify(message="Flask-SocketIO server is running")

@socketio.on('connect')
def test_connect():
    app.logger.info('Client connected')

@socketio.on('disconnect')
def test_disconnect():
    app.logger.info('Client disconnected')

@socketio.on('image')
def handle_image(data):
    try:
        img_data = data['data']
        img_data = base64.b64decode(img_data.split(',')[1])
        nparr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        faces = face_cascade.detectMultiScale(img, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

        if len(faces) == 0:
            emit('response', {'status': 'no_face'})
            return

        for (x, y, w, h) in faces:
            face_image = img[y:y+h, x:x+w]
            fd, path = tempfile.mkstemp(suffix='.jpg')
            try:
                os.close(fd)
                cv2.imwrite(path, face_image)

                results = DeepFace.find(img_path=path, db_path=r"backen\data_set\user", model_name='VGG-Face', enforce_detection=False)
                print(f"Type of results: {type(results)}")
                print(f"Contents of results: {results}")
                
                if len(results) > 0:
                    first_result_df = results[0]
                    if not first_result_df.empty:
                        most_similar_face_path = first_result_df.iloc[0]['identity']
                        print(f"Most similar face path: {most_similar_face_path}")
                        most_similar_face_path = os.path.normpath(most_similar_face_path)
                        name = os.path.basename(os.path.dirname(most_similar_face_path))
    
                    else:
                        name = 'Unknown'
                else:
                    name = 'Unknown'

                analysis = DeepFace.analyze(img_path=path, actions=['emotion', 'age', 'gender', 'race'], enforce_detection=False)
                
                identity = {
                    'name': name,
                    'emotion': analysis[0]['dominant_emotion'],
                    'age': analysis[0]['age'],
                    'gender': analysis[0]['dominant_gender'],
                    'race': analysis[0]['dominant_race']
                }

                response = {
                    'status': 'received',
                    'boundingBox': {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)},
                    'identity': identity
                }

                emit('response', response)
            except Exception as e:
                app.logger.error(f'Error with DeepFace: {e}')
                emit('response', {'status': 'error', 'message': str(e)})
            finally:
                os.unlink(path)
            break

    except Exception as e:
        app.logger.error(f'Error processing image: {e}')
        emit('response', {'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    socketio.run(app, debug=True)
