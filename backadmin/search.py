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
        # Assuming `mydb` is a cursor from your database connection
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

        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'}), 400
        
        image_file = request.files['image']
        image_np = np.frombuffer(image_file.read(), np.uint8)
        uploaded_image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)

        with NamedTemporaryFile(delete=False, suffix='.jpg') as temp_uploaded:
            cv2.imwrite(temp_uploaded.name, uploaded_image)
            uploaded_image_path = temp_uploaded.name

        results = []

        for record in records:
            bg_image_data = base64.b64decode(record[8]) # Assuming BgDetect is the last column
            bg_image = Image.open(BytesIO(bg_image_data))
            bg_image_cv = cv2.cvtColor(np.array(bg_image), cv2.COLOR_RGB2BGR)

            with NamedTemporaryFile(delete=False, suffix='.jpg') as temp_bg:
                cv2.imwrite(temp_bg.name, bg_image_cv)
                bg_image_path = temp_bg.name

                # Here we use verify instead of find
                verification_result = DeepFace.verify(uploaded_image_path, bg_image_path, enforce_detection=False)

                if verification_result["verified"]:
                    # Add custom logic to filter or process verified results
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
                        },
                        'verification': verification_result
                    })

                os.remove(bg_image_path)

        os.remove(uploaded_image_path)
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