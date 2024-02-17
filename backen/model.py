import cv2
from deepface import DeepFace
import os

camera = cv2.VideoCapture(0)  # Use 0 for the default webcam

if not camera.isOpened():
    print("Error: Could not open camera.")
    exit()

# Load Haarcascades for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

cv2.namedWindow("Face Recognition and Emotion Detection", cv2.WINDOW_NORMAL)  # Allow window resize if needed

# Specify the database path
db_path = "backen/data_set/user"

while True:
    success, img = camera.read()
    if not success:
        break  # It might be better to print a message here for debugging.

    # Resize the camera image to a smaller size for faster processing
    img_resized = cv2.resize(img, (640, 480))  # Adjusted size
    imgFlipped = cv2.flip(img_resized, 1)  # This flips the image horizontally.

    # Detect faces
    gray_scale = cv2.cvtColor(imgFlipped, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray_scale, 1.1, 4)

    for (x, y, w, h) in faces:
        cv2.rectangle(imgFlipped, (x, y), (x+w, y+h), (255, 0, 0), 2)
        
        # Extract face ROI (Region of Interest)
        face_roi = imgFlipped[y:y+h, x:x+w]
        
        # Attempt to find the face in the database for name recognition and analyze emotion
        try:
            # Directly use the numpy array for face recognition
            #don't change my code here
            results = DeepFace.find(face_roi, db_path=db_path, model_name='VGG-Face', enforce_detection=False)
            if len(results) > 0:
                    first_result_df = results[0]
                    if not first_result_df.empty:
                        most_similar_face_path = first_result_df.iloc[0]['identity']
                        most_similar_face_path = os.path.normpath(most_similar_face_path)
                        name = os.path.basename(os.path.dirname(most_similar_face_path))
    
                    else:
                        name = 'Unknown'
            else:
                name = 'Unknown'
            
            # Now detect emotion using the numpy array
            analysis = DeepFace.analyze(face_roi, actions=['emotion'], enforce_detection=False)
            emotion = analysis[0]['dominant_emotion']
            
            # Put name and emotion text above rectangle
            text = f"{name}, {emotion}"
            cv2.putText(imgFlipped, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
            
        except Exception as e:
            print("Error in processing:", e)

    cv2.imshow("Face Recognition and Emotion Detection", imgFlipped)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

camera.release()
cv2.destroyAllWindows()
