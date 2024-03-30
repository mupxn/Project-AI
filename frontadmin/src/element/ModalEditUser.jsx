import React, { useState, useEffect } from 'react'
import "./ModalEditUser.css"
import axios from "axios";

function ModalEditUser({ onClose, userId, userName, action }) {
    const [isEdit, setIsEdit] = useState(false)
    const [name, setName] = useState('');
    const edited = () => {
        setIsEdit(true)
        setName(userName)
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(name);
        await axios.put(`${process.env.REACT_APP_WEB_PORT}/api/user/${userId}/update`, { name })
            .then(response => {
                setName(response.data);
                action();
                onClose();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });    
    }
    const handleInputChange = (e) => {
        setName(e.target.value);
    };

    return (
        <div className='modal-container-edit'>
            <div className="modal-edit">
                <div className="modal-header">
                    <h1>Edit User</h1>
                </div>
                {!isEdit ? (
                    <>
                        <div className="modal-content-edit">
                            <div className="user-info-edit">
                                <div className='section-edit'>Name :</div>
                                <div>{userName}</div>
                            </div>
                        </div>
                        <div className="modal-footer-edit">
                            <button className='btn btn-submit' onClick={edited}>Edit</button>
                            <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-content-edit">
                                <div className="user-info-edit">
                                    <label className='section-edit'>Name :</label>
                                    <input type='text' value={name} onChange={handleInputChange}/>
                                </div>
                            </div>
                            <div className="modal-footer-edit">
                                <input type="submit" className='btn btn-submit' value="Submit"/>
                                <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

export default ModalEditUser