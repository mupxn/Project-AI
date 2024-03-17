from flask import Flask, jsonify, Response,request
from flask_cors import CORS
import cv2
import mysql.connector
import numpy as np
import cv2
import base64
from io import BytesIO
from PIL import Image
import os
from deepface import DeepFace
from tempfile import NamedTemporaryFile

app = Flask(__name__)
CORS(app)

connection = mysql.connector.connect(
  host="localhost",
  user="root",
  password="",
  database="project"
)

mydb = connection.cursor()


@app.route('/api/admin/search', methods=['POST'])
def process_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'}), 400

        image_file = request.files['image']
        image_np = np.frombuffer(image_file.read(), np.uint8)
        uploaded_image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if uploaded_image is None:
            return jsonify({'error': 'Uploaded image is corrupt or in an unsupported format'}), 400

        query = """
        SELECT detection.DetectID,
               user.Name,
               detection.Gender,
               detection.Age,
               emotional.EmoName,
               DATE(detection.DateTime) AS Date,
               TIME(detection.DateTime) AS Time,
               detection.FaceDetect,
               detection.BgDetect
        FROM detection
        JOIN user ON detection.UserID = user.UserID
        JOIN emotionaltext ON detection.TextID = emotionaltext.TextID
        JOIN emotional ON emotionaltext.EmoID = emotional.EmoID;
        """
        mydb.execute(query)
        records = mydb.fetchall()

        results = []

        for record in records:
            try:
                bg_image_data = base64.b64decode(record[8])
                bg_image = Image.open(BytesIO(bg_image_data))
                bg_image_cv = cv2.cvtColor(np.array(bg_image), cv2.COLOR_RGB2BGR)
            except Exception as e:
                print(f"Error processing record: {e}")
                continue  # Skip this record

        
            verification_result = DeepFace.verify(uploaded_image, bg_image_cv, enforce_detection=False) 

            if verification_result:
                results.append({
                    'record': {
                        "ID": record[0],
                        "Name": record[1],
                        "Gender": record[2],
                        "Age": record[3],
                        "EmoName": record[4],
                        "Date": str(record[5]),
                        "Time": str(record[6]),
                        "FaceDetect": record[7],
                        "BGDetect": record[8]
                    }
                })

        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)})
    
@app.route('/user/showresult')
def get_records_from_today():
    query = """
     SELECT 
        user.Name, 
        detection.Gender, 
        detection.Age, 
        DATE(detection.DateTime) AS Date,
        TIME(detection.DateTime) AS Time,
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
        DATE(detection.DateTime) = CURDATE()
    ORDER BY detection.DetectID DESC;
    """
    
    try:
        mydb.execute(query)
        records = mydb.fetchall() 
        
        if not records:
            return jsonify({"message": "No records found for today."}), 404
        
        formatted_records = [{"Name": record[0], "Gender": record[1], "Age": record[2], "Date": str(record[3]), "Time": str(record[4]), "FaceDetect": record[5], "EmoName": record[6]} for record in records]
        
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        # return jsonify({"error": str(err)}), 500
    


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)