import base64
import os
import cv2
from flask import Flask, jsonify,request,send_from_directory
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
import requests
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
           
            return str(obj)
      
        return super().default(obj)
app.json_encoder = CustomJSONEncoder()

UPLOAD_FOLDER = '/data_set/user'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'project'

mysql = MySQL(app)

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "/data_set/user")
load_dotenv()
KIOSK_PORT = os.getenv("MY_KEY")
# --------------------------------------------------- home ---------------------------------------------------
# --------------- bar chart ---------------
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
# --------------- bar chart ---------------

# --------------- pie chart ---------------
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
# --------------- pie chart ---------------

# --------------- line chart ---------------
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
# --------------- line chart ---------------



# --------------------------------------------------- user ---------------------------------------------------
# --------------- show user ---------------
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
# --------------- show user ---------------

# --------------- user image ---------------   
@app.route('/user_images/<userid>/<filename>')
def user_images(userid,filename):
    imagepath = os.path.join("data_set/user",str(userid))
    # imagepath = os.path.join("/app/data_set/user", str(userid))
    print(imagepath)
    return send_from_directory(imagepath ,filename)
# --------------- user imag ---------------

# --------------- edit user ---------------
@app.route('/api/user/<int:userID>/update', methods=['PUT'])
def update_name(userID):
    mydb = mysql.connection.cursor()
    try:
        new_name = request.json.get('name')
        sql = ("UPDATE user SET user.Name = %s WHERE user.UserID = %s;")
        val = (new_name,userID)
        mydb.execute(sql, val)
        mysql.connection.commit()
        return jsonify({"message":"success"})
    except MySQLError as err:
        print(f"Error: {err}")
# --------------- edit user ---------------

# --------------- delete user ---------------
@app.route('/api/user/<int:userID>/delete', methods=['POST'])
def delete_user(userID):
    conn = mysql.connection
    mydb = conn.cursor()
    try:
        conn.autocommit = False
        update_sql = "UPDATE detection SET UserID = 0 WHERE UserID = %s"
        mydb.execute(update_sql,(userID,))

        delete_sql = ("DELETE FROM user WHERE user.UserID = %s;")
        mydb.execute(delete_sql,(userID,))
        mysql.connection.commit()

        # try:
        #     url = "http://localhost:5001/api/delete-folder"  
        #     data = {"folder_name": str(userID)} 
        #     response = requests.post(url, json=data)
           
        #     if response.status_code == 200:
        #         print("Folder deleted successfully")
        #     else:
        #         print("Folder deletion failed:", response.json())
        # except requests.exceptions.RequestException as e:
        #     print("Request to delete folder failed:", e)

        return jsonify({"message": "User deleted successfully"})
    except MySQLError as err:
        print(f"Error: {err}")
        return jsonify({"message": "error"})
# --------------- delete user ---------------

# --------------- add user ---------------
@app.route('/api/user/adduser', methods=['POST'])
def add_user():
    mydb = mysql.connection.cursor()
    # print("key",KIOSK_PORT)
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['image']
        userName = request.form['userName']

        sql = "INSERT INTO user(Name) VALUES (%s);"
        val = (userName,)
        mydb.execute(sql, val)
        mysql.connection.commit()
        userId = mydb.lastrowid
        try:
            url = f"{KIOSK_PORT}/api/add-user/photo"
            files = {'image': (file.filename, file.stream, file.mimetype)}
            data = {'userId': userId, 'userName': userName}
            response = requests.post(url, files=files, data=data)
            if response.ok:
                external_api_message = 'File and data sent successfully.'
            else:
                external_api_message = 'Failed to send file and data to the external API.'
        except Exception as e:
            external_api_message = f'Error sending to external API: {str(e)}'

        return jsonify({"message": "User added successfully", "external_api_message": external_api_message})
    except MySQLError as err:
        return jsonify({"error": f"SQL Error: {err}"})
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"})
# --------------- add user ---------------  


# --------------------------------------------------- detection --------------------------------------------------- 
# --------------- show detect user ---------------
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
# --------------- show detect user ---------------

# --------------- search from image ---------------
@app.route('/api/admin/search', methods=['POST'])
def process_image():
    mydb = mysql.connection.cursor()
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image found in request'}), 400

        image_file = request.files['image']
        image_np = np.frombuffer(image_file.read(), np.uint8)
        uploaded_image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
        uploaded_image = cv2.resize(uploaded_image, (224, 224), interpolation=cv2.INTER_AREA)
        
        if uploaded_image is None:
            return jsonify({'error': 'Uploaded image is corrupt or in an unsupported format'}), 400

        results = DeepFace.analyze(uploaded_image, actions=['gender'], enforce_detection=False)
        gender = results[0]['dominant_gender'] 

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
        WHERE detection.Gender = %s;
        """
        val = (gender,)
        mydb.execute(query, val)
        records = mydb.fetchall()

        query_results = []
        for record in records:
            try:
                bg_image_data = base64.b64decode(record[7])
                bg_image = Image.open(BytesIO(bg_image_data))
                bg_image_cv = cv2.cvtColor(np.array(bg_image), cv2.COLOR_RGB2BGR)
                verification_result = DeepFace.verify(uploaded_image, bg_image_cv, enforce_detection=False, model_name="Facenet512")
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
# --------------- search from image ---------------

# kiosk 
    
@app.route('/insert-face', methods=['POST'])
def insert_face():
    data = request.json
    mydb = mysql.connection.cursor()

    sql = ("INSERT INTO detection (UserID, TextID, Age, Gender, FaceDetect, BgDetect) "
            "VALUES (%s, (SELECT TextID FROM emotionaltext "
            "JOIN emotional ON emotionaltext.EmoID = emotional.EmoID "
            "WHERE emotional.EmoName = %s ORDER BY RAND() LIMIT 1), %s, %s, %s, %s)")
    val = (data['name'], data['emotion'], data['age'], data['gender'], data['face_image'], data['full_image'])

    try:
        mydb.execute(sql, val)
        mysql.connection.commit()
        return jsonify({"message": "Face inserted successfully"}), 200
    except Exception as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)})


@app.route('/speak', methods=['POST'])
def api_speak():
    data = request.json
    mydb = mysql.connection.cursor()
    emotion = data.get('emotion')
    user_id = data.get('name')  
    
    print(str(emotion) + str(user_id))  
    
    query = """
    SELECT emotionaltext.Text, user.Name 
    FROM detection 
    JOIN emotionaltext ON detection.TextID = emotionaltext.TextID 
    JOIN emotional ON emotionaltext.EmoID = emotional.EmoID 
    JOIN user ON detection.UserID = user.UserID
    WHERE emotional.EmoName = %s AND detection.UserID = %s
    ORDER BY detection.DetectID DESC 
    LIMIT 1
    """
    val = (emotion, user_id)  
    
    mydb.execute(query, val)
    result = mydb.fetchone()  

    if result:
        text_to_speak, user_name = result
        print(text_to_speak)
        return jsonify({"text_to_speak": text_to_speak, "user_name": user_name}), 200
    else:
        return jsonify({"message": "No records found."})
    

@app.route('/user/showresult')
def get_records_from_today():
    with app.app_context():
        mydb = mysql.connection.cursor()
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
        except Exception as err:
            print(f"Error: {err}")


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000, debug=True)