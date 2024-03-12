import React, { useState, useEffect } from 'react'
import './ModalBgImage.css'
import CloseIcon from '../icon/CloseIcon'
import axios from "axios";
import img from '../img/testimg.jpeg'
function ModalBgImage({ onclose, DetectID }) {
    const [bgImage, setBgImage] = useState('');
    
    useEffect(() => {
        const fetchData = () => {
            axios.get(`http://localhost:5000/api/detect/${DetectID}/bgimage`)
                .then(response => {
                    setBgImage(response.data);
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        };
        fetchData();
    }, [])
    return (
        <div className='modal-container-Bgimg'>
            <div className="modal-Bgimg">
                <div className="close-button">
                    <button className="icon-close-wrap" onClick={onclose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="Bg-img">
                    <img src={`data:image/jpeg;base64,${bgImage}`} style={{ maxHeight: "30vh", objectFit: "cover" }} />
                </div>
            </div>
        </div>
    )
}

export default ModalBgImage