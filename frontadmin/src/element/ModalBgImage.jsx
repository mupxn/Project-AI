import React from 'react'
import './ModalBgImage.css'
import CloseIcon from '../icon/CloseIcon'
import img from '../img/testimg.jpeg'
function ModalBgImage({ onclose }) {
    return (
        <div className='modal-container-Bgimg'>
            <div className="modal-Bgimg">
                <div className="close-button">
                    <button className="icon-close-wrap" onClick={onclose}>
                        <CloseIcon />
                    </button>
                </div>
                <div className="Bg-img">
                    <img src={img} style={{maxHeight: "50vh",objectFit:"cover"}}/>
                </div>
            </div>
        </div>
    )
}

export default ModalBgImage