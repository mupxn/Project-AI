from flask import Flask, render_template, Response
import cv2
from deepface import DeepFace
import os

app = Flask(__name__)

camera = cv2.VideoCapture(0)  # Use 0 for the default webcam

if not camera.isOpened():
    print("Error: Could not open camera.")
    exit()

# Load Haarcascades for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Specify the database path
db_path = "backen/data_set/user"

def gen_frames():  # generate frame by frame from camera
    while True:
        success, img = camera.read()
        if not success:
            break
        
        # Resize the camera image to a smaller size for faster processing
        img_resized = cv2.resize(img, (640, 480))  # Adjusted size
        imgFlipped = cv2.flip(img_resized, 1)  # This flips the image horizontally.

        # Detect faces
        gray_scale = cv2.cvtColor(imgFlipped, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

        for (x, y, w, h) in faces:
            cv2.rectangle(imgFlipped, (x, y), (x+w, y+h), (255, 0, 0), 2)
            
            # Extract face ROI (Region of Interest)
            face_roi = imgFlipped[y:y+h, x:x+w]
            
            # Attempt to find the face in the database for name recognition and analyze emotion
            try:
                # Directly use the numpy array for face recognition
                results = DeepFace.find(face_roi, db_path=db_path, model_name='VGG-Face', enforce_detection=False)
                if len(results) > 0:
                    first_result_df = results[0]
                    if not first_result_df.empty:
                        most_similar_face_path = first_result_df.iloc[0]['identity']
                        most_similar_face_path = os.path.normpath(most_similar_face_path)
                        name = os.path.basename(os.path.dirname(most_similar_face_path))
                    else:
                        name = 'Unknown'
                else:
                    name = 'Unknown'
                
                # Now detect emotion using the numpy array
                analysis = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                emotion = analysis[0]['dominant_emotion']
                
                # Put name and emotion text above rectangle
                text = f"{name}, {emotion}"
                cv2.putText(imgFlipped, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
                
            except Exception as e:
                print("Error in processing:", e)

        ret, buffer = cv2.imencode('.jpg', imgFlipped)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # concat frame one by one and show result


@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0')