from flask import Flask, jsonify, Response
from flask_cors import CORS
import json
import os
import cv2
from deepface import DeepFace
import os
from datetime import timedelta
import numpy as np 
import base64
import mysql.connector
import pyttsx3





app = Flask(__name__)
CORS(app)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
           
            return str(obj)
      
        return super().default(obj)
app.json_encoder = CustomJSONEncoder()

camera = cv2.VideoCapture(0)  

connection = mysql.connector.connect(
  host="localhost",
  user="root",
  password="",
  database="project-ai"
)

mydb = connection.cursor()


if not camera.isOpened():
    print("Error: Could not open camera.")
    exit()

# Load Haarcascades for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Specify the database path
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data_set/user")
TH_voice_id = "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_THAI"

def sound(emotion):

    query = """
    SELECT emotionaltext.Text FROM emotionaltext 
    JOIN emotional ON emotionaltext.EmoID = emotional.EmoID 
    WHERE emotional.EmoName = %s ORDER BY RAND() LIMIT 1
    """
    val = (emotion,)  

    # Use cursor to execute and fetch
    mydb.execute(query, val)
    result = mydb.fetchone()  

    if result:
        text_to_speak = result[0]
        engine = pyttsx3.init()
        engine.setProperty('volume', 0.9) 
        engine.setProperty('rate', 120) 
        engine.setProperty('voice', TH_voice_id)
        engine.say(text_to_speak)
        engine.runAndWait()
    else:
        print("No text found for the given emotion.")




def insert_face(name, emotion, age, gender, face_image, full_image):
    face_image_base64 = base64.b64encode(cv2.imencode('.jpg', face_image)[1]).decode()
    full_image_base64 = base64.b64encode(cv2.imencode('.jpg', full_image)[1]).decode()

    sql = ("INSERT INTO detection (UserID, TextID, Age, Gender, FaceDetect, BgDetect) "
           "VALUES (%s, (SELECT TextID FROM emotionaltext "
           "JOIN emotional ON emotionaltext.EmoID = emotional.EmoID "
           "WHERE emotional.EmoName = %s ORDER BY RAND() LIMIT 1), %s, %s, %s, %s)")
    val = (name, emotion, age, gender, face_image_base64, full_image_base64)

    try:
        mydb.execute(sql, val)
        connection.commit()
    except mysql.connector.Error as err:
        print(f"Error: {err}")


def calculate_motion(prev_frame, current_frame):
    gray_prev = cv2.cvtColor(prev_frame, cv2.COLOR_BGR2GRAY)
    gray_current = cv2.cvtColor(current_frame, cv2.COLOR_BGR2GRAY)
    
    frame_diff = cv2.absdiff(gray_prev, gray_current)
    
    motion_measure = np.sum(frame_diff)
    
    return motion_measure

def gen_frames():
    trackers = []  # List to hold trackers for each detected face
    saved_faces = set()  # To track which faces have been saved to avoid duplicates
    prev_frame = None  # Variable to store the previous frame for motion detection
    motion_threshold = 1000000  # Set an appropriate threshold value

    while True:
        success, img = camera.read()
        if not success:
            break

        img_resized = cv2.resize(img, (640, 480))
        img_flipped = cv2.flip(img_resized, 1)

        # If the previous frame is available, calculate the motion
        if prev_frame is not None:
            motion = calculate_motion(prev_frame, img_flipped)
            if motion > motion_threshold:  # Skip detection if there's too much motion
                prev_frame = img_flipped
                continue

        prev_frame = img_flipped

        # Update and remove trackers that have lost the face
        for tracker in trackers[:]:
            tracking_success, _ = tracker.update(img_flipped)
            if not tracking_success:
                trackers.remove(tracker)

        gray_scale = cv2.cvtColor(img_flipped, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)
        
        for (x, y, w, h) in faces:
            cv2.rectangle(img_flipped, (x, y), (x+w, y+h), (255, 0, 0), 2)


        # Detect new faces if no trackers are active
        if not trackers:
            for (x, y, w, h) in faces:
                tracker = cv2.TrackerKCF_create()
                tracker.init(img_flipped, (x, y, w, h))
                trackers.append(tracker)

                face_roi = img_flipped[y:y+h, x:x+w]
                cv2.rectangle(img_flipped, (x, y), (x+w, y+h), (255, 0, 0), 2)

                face_id = f"{x}-{y}-{w}-{h}"
                if face_id not in saved_faces:
                    try:
                        analysis = DeepFace.analyze(face_roi, actions=['emotion', 'age', 'gender'], enforce_detection=False)
                        emotion = analysis[0]['dominant_emotion']
                        age = analysis[0]['age']
                        gender = analysis[0]['dominant_gender']
                        results = DeepFace.find(face_roi, db_path=db_path, model_name='VGG-Face', enforce_detection=False)

                        if results and not results[0].empty:
                            first_result_df = results[0]
                            most_similar_face_path = first_result_df.iloc[0]['identity']
                            most_similar_face_path = os.path.normpath(most_similar_face_path)
                            name = os.path.basename(os.path.dirname(most_similar_face_path))
                        else:
                            name = 'Unknown'

                            
                        label = f"{name}, {emotion}, {age}, {gender}"
                        cv2.putText(img_flipped, label, (x, y+h+20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2, cv2.LINE_AA)

                        
                        insert_face(name, emotion, age, gender, face_roi, img_flipped)
                        saved_faces.add(face_id)
                        sound(emotion)
                    except Exception as e:
                        print("Error in processing:", e)

        # Encode the processed frame for streaming
        ret, buffer = cv2.imencode('.jpg', img_flipped)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')



@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen_frames(),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/user/showresult')
def get_records_from_today():
    query = """
    SELECT 
        user.Name, 
        detection.Gender, 
        detection.Age, 
        detection.Date,
        detection.Time,
        detection.FaceDetect,
        emotional.EmoName
    FROM 
        detection 
    JOIN 
        user ON detection.UserID = user.UserID 
    JOIN 
        emotionaltext ON emotionaltext.TextID = detection.TextID 
    JOIN 
        emotional ON emotionaltext.EmoID = emotional.EmoID 
    WHERE 
        detection.Date = CURDATE()
    ORDER BY detection.DetectID DESC;
    """
    
    try:
        mydb.execute(query)
        records = mydb.fetchall() 
        
        for record in records:
            # Formatting each record as a dictionary
            formatted_record = {
            "Name": record[0],
            "Gender": record[1],
            "Age": record[2],
            "Date": str(record[3]),  
            "Time": str(record[4]),  
            "FaceDetect": record[5],  
            "EmoName" : record[6],
             }
            
        if not records:
            return jsonify({"message": "No records found for today."}), 404
        
        formatted_records = [{"Name": record[0], "Gender": record[1], "Age": record[2], "Date": str(record[3]), "Time": str(record[4]), "FaceDetect": record[5], "EmoName": record[6]} for record in records]
        
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
    
    