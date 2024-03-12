import React, { useState, useEffect } from 'react'
import "./ModalDeleteUser.css"
import CheckmarkIcon from "../icon/CheckmarkIcon"
import axios from "axios";

function ModalDeleteUser({ onClose, userId, userName, action}) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [deleteUser,setDeleteUser] = useState('');
    const Submitted = () => setIsSubmitted(true)
    function print(){
        console.log(userId);
    }
    const handleSubmit = async() => {
        try {
            await axios.post(`http://localhost:5000/api/user/${userId}/delete`);
            action()
            onClose()
          } catch (error) {
            console.error('Error fetching data:', error);
          }
    }
    return (
        <div className='modal-container-delete'>
            <div className="modal-delete">
                <div className="modal-header-delete">
                    <h1>Delete User</h1>
                </div>
                {!isSubmitted ? (
                    <>
                        <div className="modal-content-delete">
                            <p>Are you sure to delete {userName}?</p>
                        </div>
                        <div className="modal-footer-delete">
                            <button className='btn btn-submit' onClick={Submitted} >Submit</button>
                            <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-content-delete">
                            <div className='icon'>
                                <CheckmarkIcon/>
                            </div>
                            
                        </div>
                        <div className="modal-footer-delete">
                            <button className='btn btn-ok' onClick={handleSubmit}>ok</button>
                        </div>
                    </>
                )}


            </div>
        </div>
    )
}

export default ModalDeleteUser