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
        # Placeholder for your database query execution
        # Assuming mydb is already connected to your database
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
        # Execute your query here
        mydb.execute(query)
        records = mydb.fetchall()

        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'}), 400
        
        image_file = request.files['image']
        image_np = np.frombuffer(image_file.read(), np.uint8)
        uploaded_image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        # Create a temporary file for the uploaded image
        with NamedTemporaryFile(delete=False, suffix='.jpg') as temp_uploaded:
            cv2.imwrite(temp_uploaded.name, uploaded_image)
            uploaded_image_path = temp_uploaded.name

        results = []

        for record in formatted_records:
            # Decode BGDetect base64 string into an image
            bg_image_data = base64.b64decode(record['BGDetect'])
            bg_image = Image.open(BytesIO(bg_image_data))
            bg_image_cv = cv2.cvtColor(np.array(bg_image), cv2.COLOR_RGB2BGR)

            # Create a temporary file for the background image
            with NamedTemporaryFile(delete=False, suffix='.jpg') as temp_bg:
                cv2.imwrite(temp_bg.name, bg_image_cv)
                bg_image_path = temp_bg.name

                # Use DeepFace to verify the uploaded image against the background image
                try:
                    result = DeepFace.find(uploaded_image_path, bg_image_path, enforce_detection=False)
                    result['record'] = record  # Attach the record info to the result
                    results.append(result)
                finally:
                    temp_bg.close()
                    os.remove(bg_image_path)

        os.remove(uploaded_image_path)

        return jsonify(results), 200
    except Exception as e:
        return jsonify({'error': str(e)})


    

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)