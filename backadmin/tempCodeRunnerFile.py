@app.route('/api/detect/<string:search>')
def get_detection(search):
    base_query = """
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
    """

    try:
        if search and search != 'null':  
            query = base_query + " WHERE user.Name LIKE %s;"
            search_pattern = f"%{search}%"
            mydb.execute(query, (search_pattern,))
        else:

            mydb.execute(base_query)

        records = mydb.fetchall()
        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], "Age": record[3], "EmoName": record[4], "Date": str(record[5]), "Time": str(record[6]), "FaceDetect": record[7], "BGDetect": record[8]} for record in records]

        return jsonify(formatted_records)
    except Error as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)})

@app.route('/api/detect/filter/date/<string:filter>/<string:search>')
def get_filterdate(filter, search):
    # Prepare initial SQL query and parameters list
    sql = """
    SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, 
    DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, 
    detection.BgDetect 
    FROM detection 
    JOIN user ON detection.UserID = user.UserID 
    JOIN emotionaltext ON detection.TextID = emotionaltext.TextID 
    JOIN emotional ON emotionaltext.EmoID = emotional.EmoID 
    WHERE DATE(detection.DateTime) = %s
    """
    params = [filter]

    if search and search != 'null':
        sql += " AND user.Name LIKE %s"
        search_pattern = f"%{search}%"
        params.append(search_pattern)

    try:
        mydb.execute(sql, params)
        records = mydb.fetchall()

        formatted_records = [{"ID": record[0], "Name": record[1], "Gender": record[2], 
                              "Age": record[3], "EmoName": record[4], "Date": str(record[5]), 
                              "Time": str(record[6]), "FaceDetect": record[7], 
                              "BGDetect": record[8]} 
                             for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({"error": str(err)})
    
    
@app.route('/api/detect/filter/month/<string:filter>/<string:search>')
def get_filtermonth(filter, search):
    sql = """
    SELECT detection.DetectID, user.Name, detection.Gender, detection.Age, emotional.EmoName, 
    DATE(detection.DateTime) AS Date, TIME(detection.DateTime) AS Time, detection.FaceDetect, detection.BgDetect 
    FROM detection 
    JOIN user ON detection.UserID = user.UserID 
    JOIN emotionaltext ON detection.TextID = emotionaltext.TextID 
    JOIN emotional ON emotionaltext.EmoID = emotional.EmoID 
    WHERE DATE_FORMAT(detection.DateTime, '%Y-%m') = %s
    """

    params = [filter]

    if search and search != 'null':
        sql += " AND user.Name LIKE %s"
        search_pattern = f"%{search}%"
        params.append(search_pattern)

    try:
        mydb.execute(sql, params)
        records = mydb.fetchall()
        formatted_records = [{
            "ID": record[0],
            "Name": record[1],
            "Gender": record[2],
            "Age": record[3],
            "EmoName": record[4],
            "Date": str(record[5]),
            "Time": str(record[6]),
            "FaceDetect": record[7],
            "BGDetect": record[8]
        } for record in records]
        return jsonify(formatted_records)
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return jsonify({'error': str(err)}) 