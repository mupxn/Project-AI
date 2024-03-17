import base64
import cv2
from flask import Flask, jsonify, Response,request
from flask_cors import CORS
import json
import mysql.connector
from datetime import timedelta
from PIL import Image
from io import BytesIO
from deepface import DeepFace
import numpy as np

app = Flask(__name__)
CORS(app)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
           
            return str(obj)
      
        return super().default(obj)
app.json_encoder = CustomJSONEncoder()

connection = mysql.connector.connect(
  host="localhost",
  user="root",
  password="",
  database="project"
)

mydb = connection.cursor()

@app.route('/api/user')
def get_user():
    query = """
    SELECT user.UserID,user.Name FROM user WHERE user.UserID != 0;
    """
    try:
        mydb.execute(query)
        records = mydb.fetchall()
        
        if not records:
            return jsonify({"message": "No records found for today."}), 404
        
        formatted_records = [{"ID": record[0], "Name": record[1]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        
@app.route('/api/user/<string:search>')
def get_user_search(search):
    # Corrected SQL query with a single WHERE clause and an AND condition
    query = """
    SELECT user.UserID, user.Name FROM user WHERE user.UserID != 0 AND user.Name LIKE %s;
    """
    
    try:
        search_pattern = f"%{search}%"  # Prepare the search pattern
        mydb.execute(query, (search_pattern,))  # Pass the search pattern as a tuple

        records = mydb.fetchall()  # Fetch all matching records

        if not records:
            return jsonify({"message": "No records found."}), 404  # Return a 404 if no records found
        
        # Create a list of dictionaries for the found records to return as JSON
        formatted_records = [{"ID": record[0], "Name": record[1]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)})
    
@app.route('/api/detect')
def get_detection():
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
    try:
        
        mydb.execute(query)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/detect/<string:search>')
def get_detection_search(search):
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
    JOIN emotional ON emotionaltext.EmoID = emotional.EmoID
    AND user.Name LIKE %s;
    """
    try:
        search_pattern = f"%{search}%"
        mydb.execute(query, (search_pattern,))
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/date/<string:filter>')
def get_filterdate(filter):
    try:
        val = (filter,)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE(detection.DateTime) = %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/date/<string:filter>/<string:search>')
def get_filterdate_search(filter, search):
    try:
        search_pattern = f"%{search}%"  # Prepare the LIKE pattern
        val = (filter, search_pattern)  # Correct tuple structure
        sql = """
        SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect 
        FROM detection 
        JOIN user ON detection.UserID = user.UserID 
        JOIN emotionaltext ON detection.TextID = emotionaltext.TextID 
        JOIN emotional ON emotionaltext.EmoID = emotional.EmoID 
        WHERE DATE(detection.DateTime) = %s AND user.Name LIKE %s;
        """
        mydb.execute(sql, val)  # Pass the parameters correctly
        records = mydb.fetchall()
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)})


@app.route('/api/detect/filter/month/<string:filter>/<string:search>')
def get_filtermonth_search(filter,search):
    try:
        search_pattern = f"%{search}%"
        val = (filter, search_pattern)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y-%m') = %s AND user.Name LIKE %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/month/<string:filter>')
def get_filtermonth(filter):
    try:
        val = (filter,)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y-%m') = %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/year/<string:filter>/<string:search>')
def get_filteryear(filter,search):
    try:
        search_pattern = f"%{search}%"
        val = (filter, search_pattern)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y') = %s AND user.Name LIKE %s;;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/year/<string:filter>')
def get_filteryear_search(filter):
    try:
        val = (filter,)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y') = %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/user/<int:userID>/update', methods=['PUT'])
def update_name(userID):
    try:
        new_name = request.json.get('name')
        sql = ("UPDATE user SET user.Name = %s WHERE user.UserID = %s;")
        val = (new_name,userID)
        mydb.execute(sql, val)
        connection.commit()
        return jsonify({"message":"success"})
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/user/<int:userID>/delete', methods=['POST'])
def delete_user(userID):
    try:
        sql = ("DELETE FROM user WHERE user.UserID = %s;")
        val = (userID,)
        mydb.execute(sql,val)
        connection.commit()
        return jsonify({"message": "User deleted successfully"})
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})

@app.route('/api/user/adduser', methods=['POST'])
def add_user():
    try:
        new_id = request.json.get('newId')
        new_user = request.json.get('newUser')
        sql = ("INSERT INTO user(user.UserID,user.Name) VALUES (%s,%s);")
        val = (new_id,new_user)
        print("sql ;",sql)
        print("val ;",val)
        mydb.execute(sql,val)
        connection.commit()
        return jsonify({"message": "User deleted successfully"})
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})    

@app.route('/api/home/barchart/<string:filter>')
def get_data_barchart(filter):
    try:
        sql = ("SELECT emotional.EmoName,COALESCE(SUM(CASE WHEN DATE(detection.DateTime) = %s THEN 1 ELSE 0 END), 0) AS detection_count FROM emotional LEFT JOIN emotionaltext ON emotional.EmoID = emotionaltext.EmoID LEFT JOIN detection ON emotionaltext.TextID = detection.TextID GROUP BY emotional.EmoName ORDER BY emotional.EmoID DESC;")
        val = (filter,)
        print(val)
        # print("sql ;",sql)
        mydb.execute(sql,val)
        records = mydb.fetchall()
        categories = [record[0] for record in records]
        series_data = [int(record[1]) for record in records]
        data = {
        "categories": categories,
        "series": series_data
    }

        return jsonify(data)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})   

@app.route('/api/home/piechart/<string:filter>')
def get_data_piechart(filter):
    try:
        sql = ("SELECT emotional.EmoName,COALESCE(SUM(CASE WHEN DATE_FORMAT(detection.DateTime, '%Y-%m') = %s THEN 1 ELSE 0 END), 0) AS detection_count FROM emotional LEFT JOIN emotionaltext ON emotional.EmoID = emotionaltext.EmoID LEFT JOIN detection ON emotionaltext.TextID = detection.TextID GROUP BY emotional.EmoName ORDER BY emotional.EmoID DESC;")
        val = (filter,)
        # print("sql ;",sql)
        mydb.execute(sql,val)
        records = mydb.fetchall()
        labels_data = [record[0] for record in records]
        series_data = [int(record[1]) for record in records]
        data = {
        "series": series_data,
        "labels": labels_data
        }
        return jsonify(data)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})
    
@app.route('/emotion_data', methods=['GET'])
def emotion_data():
    try:
        query = """
        SELECT 
        emotional.EmoName, 
        MONTH(detection.DateTime) AS Month, 
        COUNT(*) AS EmotionCount
        FROM 
        emotional 
        JOIN 
        emotionaltext ON emotional.EmoID = emotionaltext.EmoID 
        JOIN 
        detection ON emotionaltext.TextID = detection.TextID 
        GROUP BY 
        emotional.EmoName, MONTH(detection.DateTime)
        ORDER BY 
        MONTH(detection.DateTime);
        """
        mydb.execute(query)
        records = mydb.fetchall()
        print(records)
        return jsonify(records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})
    

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


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)