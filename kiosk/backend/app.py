from flask import Flask, jsonify, Response,request,send_from_directory
from flask_cors import CORS
import json
import os
import cv2
from deepface import DeepFace
import os
from datetime import timedelta
import base64
import pyttsx3
import threading
# from flask_mysqldb import MySQL
import requests
import shutil
from werkzeug.utils import secure_filename
import os
from datetime import datetime


app = Flask(__name__)
CORS(app)


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
           
            return str(obj)
      
        return super().default(obj)
app.json_encoder = CustomJSONEncoder()

camera = cv2.VideoCapture(0)  


if not camera.isOpened():
    print("Error: Could not open camera.")
    exit()

face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "/data_set/user")
TH_voice_id = "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_THAI"

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "/data_set/user")
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def sound(name, emotion):
    url = "http://localhost:5000/speak"  
    data = {"name": name, "emotion": emotion}
    response = requests.post(url, json=data)
    
    if response.status_code == 200:
        response_data = response.json()
        text_to_speak = response_data.get('text_to_speak')  
        user_name = response_data.get('user_name') 
        
        
        print(f"speak {user_name} {text_to_speak}") 
        
        engine = pyttsx3.init()
        engine.setProperty('volume', 1)
        engine.setProperty('rate', 120)
        engine.setProperty('voice', TH_voice_id)
        engine.say(f'คุณ {user_name} {text_to_speak}') 
        engine.runAndWait()
    else:
        print("Failed to get response from API.")


def analyze_face(face_roi, x, y, w, h, img_flipped, saved_faces, db_path):
    try:
        analysis = DeepFace.analyze(face_roi, actions=['emotion', 'age', 'gender'], enforce_detection=False)
        emotion = analysis[0]['dominant_emotion']
        age = analysis[0]['age']
        gender = analysis[0]['dominant_gender']

        results = DeepFace.find(face_roi, db_path=db_path, enforce_detection=False)
        if results and not results[0].empty:
            first_result_df = results[0]
            most_similar_face_path = first_result_df.iloc[0]['identity']
            most_similar_face_path = os.path.normpath(most_similar_face_path)
            name = os.path.basename(os.path.dirname(most_similar_face_path))
        else:
            name = 0

        face_image_base64 = base64.b64encode(cv2.imencode('.jpg', face_roi)[1]).decode()
        full_image_base64 = base64.b64encode(cv2.imencode('.jpg', img_flipped)[1]).decode()

        api_url = ' http://localhost:5000/insert-face'
        data = {
            "name": name,
            "emotion": emotion,
            "age": age,
            "gender": gender,
            "face_image": face_image_base64,
            "full_image": full_image_base64
        }

        response = requests.post(api_url, json=data)
        
        if response.status_code == 200:
            print("Face inserted successfully")
        else:
            print("Failed to insert face")

        print("name :" + name)

        sound(name,emotion)

        face_id = f"{x}-{y}-{w}-{h}"
        saved_faces.add(face_id)

    except Exception as e:
        print("Error in processing:", e)

def gen_frames(camera, db_path):
    trackers = []  
    saved_faces = set()  

    while True:
        success, img = camera.read()
        if not success:
            break

        img_resized = cv2.resize(img, (640, 480))
        img_flipped = cv2.flip(img_resized, 1)

       
        trackers = [tracker for tracker in trackers if tracker.update(img_flipped)[0]]

        gray_scale = cv2.cvtColor(img_flipped, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

        for (x, y, w, h) in faces:
            cv2.rectangle(img_flipped, (x, y), (x+w, y+h), (255, 0, 0), 2)

       
        if not trackers:
            for (x, y, w, h) in faces:
                face_roi = img_flipped[y:y+h, x:x+w]
                threading.Thread(target=analyze_face, args=(face_roi, x, y, w, h, img_flipped, saved_faces, db_path)).start()
                tracker = cv2.TrackerKCF_create()
                tracker.init(img_flipped, (x, y, w, h))
                trackers.append(tracker)

    
        ret, buffer = cv2.imencode('.jpg', img_flipped)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')



@app.route('/video_feed')
def video_feed():
    """Video streaming route. Put this in the src attribute of an img tag."""
    return Response(gen_frames(camera, db_path),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

# admin
@app.route('/user_images/<userid>/<filename>')
def user_images(userid, filename):
    base_path = os.path.dirname(os.path.abspath(__file__))
    image_path = os.path.join(base_path, "data_set", "user", str(userid))
    print(image_path)
    return send_from_directory(image_path, filename)

@app.route('/api/delete-folder/<userId>', methods=['POST'])
def delete_folder(userId):
    folder_name = userId

    if not folder_name:
        return jsonify({'error': 'Folder name is required'}), 400
    base_path = os.path.dirname(os.path.abspath(__file__))
    folder_path = os.path.join(base_path, "data_set", "user", folder_name)
    
    if not os.path.exists(folder_path):
        return jsonify({'error': 'Folder does not exist'}), 404

    try:
        shutil.rmtree(folder_path)
        return jsonify({'message': 'Folder deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)})
    
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
    
@app.route('/api/add-user/photo', methods=['POST'])
def add_folder():
   
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['image']
    userId = request.form.get('userId') 

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        original_ext = file.filename.rsplit('.', 1)[1].lower()  # Extract the original file extension
        filename = secure_filename(f'photo{userId}.{original_ext}')  # Securely format the new filename
        base_path = os.path.dirname(os.path.abspath(__file__))
        user_folder = os.path.join(base_path, "data_set", "user", userId)

        if not os.path.exists(user_folder):
            os.makedirs(user_folder)

        file_path = os.path.join(user_folder, filename)
        file.save(file_path)

        print("add" + file_path)
        return jsonify({'message': f'File {filename} uploaded successfully to {user_folder}.'}), 200
    else:
        return jsonify({'error': 'File not allowed'}), 400
    
@app.route('/addanother/image',methods=['POST'])
def add_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    userId = request.form.get('userId')

    # Ensure a userId is provided
    if not userId:
        return jsonify({'error': 'userId is required'}), 400
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        original_ext = file.filename.rsplit('.', 1)[1].lower()
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename = secure_filename(f'{userId}_{timestamp}.{original_ext}')
        base_path = os.path.dirname(os.path.abspath(__file__))
        user_folder_path = os.path.join(base_path, "data_set", "user", userId)
        if not os.path.exists(user_folder_path):
            os.makedirs(user_folder_path)
    file_path = os.path.join(user_folder_path, filename)
    file.save(file_path)
    print("file_path : ",file_path)
    print("unique_filename : ",filename)
    return jsonify({'message': 'Image uploaded successfully'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

    