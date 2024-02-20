from flask import Flask, render_template, Response
import cv2
from deepface import DeepFace
import os
import time

app = Flask(__name__)

camera = cv2.VideoCapture(0)  # Use 0 for the default webcam

if not camera.isOpened():
    print("Error: Could not open camera.")
    exit()

# Load Haarcascades for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Specify the database path
db_path = "backen/data_set/user"

# Dictionary to store the last known analysis for each face
last_known_analysis = {}

def gen_frames():
    global last_known_analysis
    analysis_interval = 1  # Seconds between analyses
    last_analysis_time = 0

    while True:
        success, img = camera.read()
        if not success:
            break

        img_resized = cv2.resize(img, (640, 480))
        imgFlipped = cv2.flip(img_resized, 1)

        gray_scale = cv2.cvtColor(imgFlipped, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

        current_time = time.time()
        if current_time - last_analysis_time > analysis_interval:
            last_known_analysis = {}  # Clear previous analysis to handle faces leaving the frame

        for (x, y, w, h) in faces:
            cv2.rectangle(imgFlipped, (x, y), (x+w, y+h), (255, 0, 0), 2)
            face_roi = imgFlipped[y:y+h, x:x+w]

            face_id = f"{x}_{y}"  # Simplified identifier based on position

            if current_time - last_analysis_time > analysis_interval:
                try:
                    # Perform face recognition and emotion detection
                    results = DeepFace.find(face_roi, db_path=db_path, model_name='VGG-Face', enforce_detection=False)
                    name = 'Unknown'
                    if len(results) > 0 and not results[0].empty:
                        most_similar_face_path = results[0].iloc[0]['identity']
                        most_similar_face_path = os.path.normpath(most_similar_face_path)
                        name = os.path.basename(os.path.dirname(most_similar_face_path))
                    
                    analysis = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                    emotion = analysis[0]['dominant_emotion']

                    # Update the last known analysis
                    last_known_analysis[face_id] = (name, emotion)

                    last_analysis_time = current_time
                except Exception as e:
                    print("Error in processing:", e)
                    last_known_analysis[face_id] = ("Error", "Error")
            else:
                # Use the last known analysis if available
                name, emotion = last_known_analysis.get(face_id)

            # Display the name and emotion
            text = f"{name}, {emotion}"
            cv2.putText(imgFlipped, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

        # Encode the frame before sending it
        ret, buffer = cv2.imencode('.jpg', imgFlipped)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=True, debug=True)
