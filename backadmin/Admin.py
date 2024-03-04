from flask import Flask, jsonify, Response
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)