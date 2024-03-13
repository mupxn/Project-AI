from flask import Flask, jsonify, Response,request
from flask_cors import CORS
import json
import mysql.connector
from datetime import timedelta
import sqlite3
from deepface import DeepFace

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
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        
        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'})
        
        image_file = request.files['image']

        results = []

        for record in formatted_records:
            result = DeepFace.find(image_file, db_path=record['BGDetect'])
            results.append(result)

        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)})
    

if __name__ == '__main__':
    app.run(host='0.0.0.1', debug=True)