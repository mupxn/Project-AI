import base64
import os
import cv2
from flask import Flask, jsonify, Response,request,send_from_directory
from flask_cors import CORS
import json
import mysql.connector
from datetime import timedelta
from PIL import Image
from io import BytesIO
from deepface import DeepFace
import numpy as np
from werkzeug.utils import secure_filename
from flask_mysqldb import MySQL
from MySQLdb import MySQLError

app = Flask(__name__)
CORS(app)


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
           
            return str(obj)
      
        return super().default(obj)
app.json_encoder = CustomJSONEncoder()

UPLOAD_FOLDER = '../data_set/user'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


# connection = mysql.connector.connect(
#   host="localhost",
#   user="root",
#   password="",
#   database="project"
# )
app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'project'

mysql = MySQL(app)

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data_set/user")

@app.route('/api/user')
def get_user():
    mydb = mysql.connection.cursor()
    query = """
    SELECT user.UserID,user.Name FROM user WHERE user.UserID != 0;
    """
    try:
        mydb.execute(query)
        records = mydb.fetchall()
        
        # if not records:
        #     return jsonify({"message": "No records found for today."})
        
        formatted_records = [{"ID": record[0], "Name": record[1]} for record in records]
        print("success")
        return jsonify(formatted_records)
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/user_images/<userid>/<filename>')
def user_images(userid,filename):
    imagepath = os.path.join(os.getcwd(),"../data_set/user",str(userid))
    print(imagepath)
    return send_from_directory(imagepath ,filename)

@app.route('/api/user/<string:search>')
def get_user_search(search):
    mydb = mysql.connection.cursor()
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
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)})
    
@app.route('/api/detect')
def get_detection():
    mydb = mysql.connection.cursor()
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
    JOIN emotional ON emotionaltext.EmoID = emotional.EmoID ORDER BY detection.DetectID ASC;
    """
    try:
        
        mydb.execute(query)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/detect/<string:search>')
def get_detection_search(search):
    mydb = mysql.connection.cursor()
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
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/date/<string:filter>')
def get_filterdate(filter):
    mydb = mysql.connection.cursor()
    try:
        val = (filter,)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE(detection.DateTime) = %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/date/<string:filter>/<string:search>')
def get_filterdate_search(filter, search):
    mydb = mysql.connection.cursor()
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
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)})


@app.route('/api/detect/filter/month/<string:filter>/<string:search>')
def get_filtermonth_search(filter,search):
    mydb = mysql.connection.cursor()
    try:
        search_pattern = f"%{search}%"
        val = (filter, search_pattern)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y-%m') = %s AND user.Name LIKE %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/month/<string:filter>')
def get_filtermonth(filter):
    mydb = mysql.connection.cursor()
    try:
        val = (filter,)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y-%m') = %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/year/<string:filter>/<string:search>')
def get_filteryear(filter,search):
    mydb = mysql.connection.cursor()
    try:
        search_pattern = f"%{search}%"
        val = (filter, search_pattern)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y') = %s AND user.Name LIKE %s;;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/detect/filter/year/<string:filter>')
def get_filteryear_search(filter):
    mydb = mysql.connection.cursor()
    try:
        val = (filter,)
        sql = ("SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect FROM detection JOIN user ON detection.UserID = user.UserID JOIN emotionaltext ON detection.TextID = emotionaltext.TextID JOIN emotional ON emotionaltext.EmoID = emotional.EmoID WHERE DATE_FORMAT(detection.DateTime, '%Y') = %s;")
        mydb.execute(sql,val)
        records = mydb.fetchall() 
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]
        return jsonify(formatted_records)
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/user/<int:userID>/update', methods=['PUT'])
def update_name(userID):
    mydb = mysql.connection.cursor()
    try:
        new_name = request.json.get('name')
        sql = ("UPDATE user SET user.Name = %s WHERE user.UserID = %s;")
        val = (new_name,userID)
        mydb.execute(sql, val)
        mydb.commit()
        return jsonify({"message":"success"})
    except MySQLError as err:
        print(f"Error: {err}")

@app.route('/api/user/<int:userID>/delete', methods=['POST'])
def delete_user(userID):
    mydb = mysql.connection.cursor()
    try:
        sql = ("DELETE FROM user WHERE user.UserID = %s;")
        val = (userID,)
        mydb.execute(sql,val)
        mydb.commit()
        return jsonify({"message": "User deleted successfully"})
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/user/adduser', methods=['POST'])
def add_user():
    mydb = mysql.connection.cursor()
    try:
        if 'image' not in request.files:
            return 'No file part'
        file = request.files['image']
        userId = request.form['userId']
        userName = request.form['userName']
        if file.filename == '':
            return 'No selected file'
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            user_folder = os.path.join(app.config['UPLOAD_FOLDER'], userId)
            if not os.path.exists(user_folder):
                os.makedirs(user_folder)
            file_path = os.path.join(user_folder, filename)
            file.save(file_path)
            # return 'File successfully saved'

        sql = ("INSERT INTO user(user.UserID,user.Name) VALUES (%s,%s);")
        val = (userId,userName)
        # print("sql ;",image_file)
        # # print("val ;",val)
        mydb.execute(sql,val)
        mydb.commit()
        return jsonify({"message": "User deleted successfully"})
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})    

@app.route('/api/home/barchart/<string:filter>')
def get_data_barchart(filter):
    mydb = mysql.connection.cursor()
    try:
        sql = ("SELECT emotional.EmoName,COALESCE(SUM(CASE WHEN DATE(detection.DateTime) = %s THEN 1 ELSE 0 END), 0) AS detection_count FROM emotional LEFT JOIN emotionaltext ON emotional.EmoID = emotionaltext.EmoID LEFT JOIN detection ON emotionaltext.TextID = detection.TextID GROUP BY emotional.EmoName ORDER BY emotional.EmoID DESC;")
        val = (filter,)
        # print(val)
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
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})   

@app.route('/api/home/piechart/<string:filter>')
def get_data_piechart(filter):
    mydb = mysql.connection.cursor()
    try:
        sql = ("SELECT emotional.EmoName,COALESCE(SUM(CASE WHEN DATE_FORMAT(detection.DateTime, '%%Y-%%m') = %s THEN 1 ELSE 0 END), 0) AS detection_count FROM emotional LEFT JOIN emotionaltext ON emotional.EmoID = emotionaltext.EmoID LEFT JOIN detection ON emotionaltext.TextID = detection.TextID GROUP BY emotional.EmoName ORDER BY emotional.EmoID DESC;")
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
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})
    
@app.route('/emotion_data', methods=['GET'])
def emotion_data():
    mydb = mysql.connection.cursor()
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
        # print(records)
        return jsonify(records)
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})


@app.route('/api/admin/search', methods=['POST'])
def process_image():
    mydb = mysql.connection.cursor()
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'}), 400

        image_file = request.files['image']
        image_np = np.frombuffer(image_file.read(), np.uint8)
        uploaded_image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        if uploaded_image is None:
            return jsonify({'error': 'Uploaded image is corrupt or in an unsupported format'}), 400

        print(db_path)
        results = DeepFace.find(uploaded_image, db_path=db_path, enforce_detection=False)
        if results and not results[0].empty:
            first_result_df = results[0]
            most_similar_face_path = first_result_df.iloc[0]['identity']
            most_similar_face_path = os.path.normpath(most_similar_face_path)
            name = os.path.basename(os.path.dirname(most_similar_face_path))
        else:
            name = 0

        query_results = []  # Initialize query_results list here

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
        WHERE detection.UserID = %s;
        """
        val = (name,)
        mydb.execute(query, val)
        records = mydb.fetchall()

        if name != 0 :
            query_results = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]

        else:
            for record in records:
                try:
                    bg_image_data = base64.b64decode(record[7])
                    bg_image = Image.open(BytesIO(bg_image_data))
                    bg_image_cv = cv2.cvtColor(np.array(bg_image), cv2.COLOR_RGB2BGR)

                    verification_result = DeepFace.verify(uploaded_image, bg_image_cv, enforce_detection=False,model_name = "Facenet512")
                    if verification_result["verified"]:
                        query_results.append({
                                "ID": record[0],
                                "Name": record[1],
                                "Gender": record[2],
                                "Age": record[3],
                                "EmoName": record[4],
                                "Date": str(record[5]),
                                "Time": str(record[6]),
                                "FaceDetect": record[7],
                                "BGDetect": record[8]
                        })
                except Exception as e:
                    print(f"Error processing record: {e}")
                    continue

        return jsonify(query_results), 200
    except Exception as e:
        return jsonify({'error': str(e)})




if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000, debug=True)