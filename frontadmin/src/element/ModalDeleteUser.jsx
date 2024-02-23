import React, { useState } from 'react'
import "./ModalDeleteUser.css"
import CheckmarkIcon from "../icon/CheckmarkIcon"

function ModalDeleteUser({ onClose, userId}) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const Submitted = () => setIsSubmitted(true)
    function print(){
        console.log(userId);
    }
    return (
        <div className='modal-container'>
            <div className="modal">
                <div className="modal-header">
                    <h1>Delete User</h1>
                </div>
                {!isSubmitted ? (
                    <>
                        <div className="modal-content">
                            <p>Are you sure to delete {userId}?</p>
                        </div>
                        <div className="modal-footer">
                            <button className='btn btn-submit' onClick={Submitted} >Submit</button>
                            <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-content">
                            <div className='icon'>
                                <CheckmarkIcon/>
                            </div>
                            
                        </div>
                        <div className="modal-footer">
                            <button className='btn btn-ok' onClick={onClose}>ok</button>
                        </div>
                    </>
                )}


            </div>
        </div>
    )
}

export default ModalDeleteUser