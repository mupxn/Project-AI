from flask import Flask, jsonify, Response,request
from flask_cors import CORS
import json
import mysql.connector
from datetime import timedelta
import sqlite3

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
    SELECT user.UserID,user.Name FROM user;
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

@app.route('/api/detect/<int:DetectID>/bgimage')
def get_bgimage(DetectID):
    query = f"SELECT detection.BgDetect FROM detection WHERE detection.DetectID = {DetectID};"
    try:
        mydb.execute(query)
        records = mydb.fetchall() 
        bg_image_data = records[0]
        return jsonify(bg_image_data)
    except mysql.connector.Error as err:
        print(f"Error: {err}")

@app.route('/api/user/<int:userID>')
def get_name(userID):
    query = f"SELECT user.Name FROM user WHERE user.UserID = {userID};"
    try:
        mydb.execute(query)
        records = mydb.fetchall() 
        bg_image_data = records[0]
        return jsonify(bg_image_data)
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
        

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)