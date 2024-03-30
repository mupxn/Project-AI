import React, { useState, useEffect } from 'react'
import './ModalBgImage.css'
import CloseIcon from '../icon/CloseIcon'
function ModalBgImage({ onclose, DetectBG }) {
    
    return (
        <div className='modal-container-Bgimg'>
            <div className="modal-Bgimg">
                <div className="close-button">
                    <button className="icon-close-wrap" onClick={onclose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="Bg-img">
                    <img src={`data:image/jpeg;base64,${DetectBG}`} style={{ maxHeight: "40vh", objectFit: "cover" }} />
                </div>
            </div>
        </div>
    )
}

export default ModalBgImage