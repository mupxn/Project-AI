from flask import Flask, Response
import cv2
from deepface import DeepFace
import os
from datetime import datetime

app = Flask(__name__)

camera = cv2.VideoCapture(0)  # Use 0 for the default webcam

if not camera.isOpened():
    print("Error: Could not open camera.")
    exit()

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
db_path = "backen/data_set/user"
photos_dir = "backen/data_set/detection/environment"
os.makedirs(photos_dir, exist_ok=True)

screenshot_taken = False

def take_screenshot(img, names):
    global screenshot_taken
    if not screenshot_taken:
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        names_str = "_".join(names) if names else "Unknown"
        filename = f"{photos_dir}/{names_str}_{timestamp}.jpg"
        cv2.imwrite(filename, img)
        print(f"Screenshot saved as {filename}")
        screenshot_taken = True

def reset_screenshot_flag():
    global screenshot_taken
    screenshot_taken = False

def gen_frames():
    global screenshot_taken
    while True:
        success, img = camera.read()
        if not success:
            break

        img_resized = cv2.resize(img, (640, 480))
        imgFlipped = cv2.flip(img_resized, 1)

        gray_scale = cv2.cvtColor(imgFlipped, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

        names_detected = []

        for (x, y, w, h) in faces:
            cv2.rectangle(imgFlipped, (x, y), (x+w, y+h), (255, 0, 0), 2)
            face_roi = imgFlipped[y:y+h, x:x+w]
            try:
                # Using DeepFace to find the face in the database
                results = DeepFace.find(face_roi, db_path=db_path, model_name='VGG-Face', enforce_detection=False)
                name = 'unknown'
                if len(results) > 0 and not results[0].empty:
                    most_similar_face_path = results[0].iloc[0]['identity']
                    most_similar_face_path = os.path.normpath(most_similar_face_path)
                    name = os.path.basename(os.path.dirname(most_similar_face_path))
                names_detected.append(name)  # Add detected name to the list

                # Optional: Perform additional DeepFace analysis, e.g., for emotion
                analysis = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
                emotion = analysis[0]['dominant_emotion']

                # Display the name on the frame
                text = f"Name: {name},{emotion}"
                cv2.putText(imgFlipped, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)

            except Exception as e:
                print("Error in DeepFace processing:", e)

        if len(faces) > 1 and not screenshot_taken:
            take_screenshot(imgFlipped, names_detected)
        elif len(faces) <= 1:
            reset_screenshot_flag()

        ret, buffer = cv2.imencode('.jpg', imgFlipped)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(host='0.0.0.0', threaded=True, debug=True)
