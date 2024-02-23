import React, { useState, useEffect } from 'react'
import "./ModalEditUser.css"
import data from '../data.json'
function ModalEditUser({ onClose, userId }) {
    const [isEdit, setIsEdit] = useState(false)
    const [maxDate, setMaxDate] = useState('');
    const edited = () => setIsEdit(true)

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setMaxDate(today);
    }, []);
    function print() {
        console.log(userId);
    }
    const users = data.User
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
                                <div>noey</div>
                            </div>
                            <div className="user-info-edit">
                                <div className='section-edit'>Gender :</div>
                                <div>F</div>
                            </div>
                            <div className="user-info-edit">
                                <div className='section-edit'>dob : </div>
                                <div>01/09/2001</div>
                            </div>
                        </div>
                        <div className="modal-footer-edit">
                            <button className='btn btn-submit' onClick={edited}>Edit</button>
                            <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                        </div>
                    </>
                ) : (
                    <>
                        <form>
                            <div className="modal-content-edit">
                                <div className="user-info-edit">
                                    <label className='section-edit'>Name :</label>
                                    <input type='text' id='name' />
                                </div>
                                <div className="user-info-edit">
                                    <label className='section-edit'>Gender :</label>
                                    <select>
                                        <option id='gender'>F</option>
                                        <option id='gender'>M</option>
                                    </select>
                                </div>
                                <div className="user-info-edit">
                                    <label className='section-edit'>dob : </label>
                                    <input type='date' id='date' max={maxDate} />
                                </div>
                            </div>
                            <div className="modal-footer-edit">
                                <input type="submit" className='btn btn-submit' value="Submit" />
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