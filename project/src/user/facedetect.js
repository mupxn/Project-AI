import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Webcam from 'react-webcam';
import './face.css'; // Make sure this path is correct for your CSS

const FaceDetect = () => {
    const webcamRef = useRef(null);
    const socketRef = useRef(null);
    const [faceData, setFaceData] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Dummy scale factors, adjust these according to your needs
    const scaleWidth = 1.3;
    const scaleHeight = 0.95;

    useEffect(() => {
        socketRef.current = io("http://localhost:5000");

        socketRef.current.on('response', (data) => {
            setIsProcessing(false);
            if (data.status === 'received') {
                setFaceData([data]);
            } else if (data.status === 'no_face') {
                setFaceData([]);
            }
        });

        return () => socketRef.current.disconnect();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (webcamRef.current && !isProcessing) {
                setIsProcessing(true);
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    socketRef.current.emit('image', { data: imageSrc });
                } else {
                    setIsProcessing(false);
                }
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [isProcessing]);

    return (
        <div className="video-container">
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="mirror webcam"
                width={640}
                height={480}
            />
            {faceData.length === 0 && !isProcessing && (
                <div className="no-face">No face detected or processing...</div>
            )}
            {faceData.map((face, index) => {
                // Perform calculations inside the map callback function
                const scaledX = face.boundingBox.x * scaleWidth;
                const scaledY = face.boundingBox.y * scaleHeight;
                const scaledWidth = face.boundingBox.width * scaleWidth;
                const scaledHeight = face.boundingBox.height * scaleHeight;
                const mirroredX = webcamRef.current.videoWidth - scaledX;

                return (
                    <React.Fragment key={index}>
                        <div className="face-overlay" style={{
                            position: 'absolute',
                            border: '2px solid green',
                            left: `${scaledX}px`,
                            top: `${scaledY}px`,
                            width: `${scaledWidth}px`,
                            height: `${scaledHeight}px`,
                        }} />
                        <div className="identity-labels" style={{
                            position: 'absolute',
                            left: `${scaledX}px`,
                            top: `${scaledY + scaledHeight + 5}px`, // Positioned just below the box
                        }}>
                            {Object.entries(face.identity).map(([key, value]) => (
                                <div key={key}>{`${key}: ${value}`}</div>
                            ))}
                        </div>
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default FaceDetect;
