import React, { useState, useEffect } from 'react';
import "./ModalAddUser.css"
import data from '../data.json'

const users = data.User
function ModalAddUser({ onClose }) {
    const [maxDate, setMaxDate] = useState('');
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setMaxDate(today);
      }, []);
    return (
        <div className='modal-container'>
            <div className="modal">
                <div className="modal-header">
                    <h1>Add User</h1>
                </div>
                <div className="modal-content">
                    <form>
                        <div className="input-wrap">
                            <label>ชื่อ :</label>
                            <input type='text' id='name'/>
                        </div>
                        <div className="input-wrap">
                            <label>เพศ :</label>
                            <select>
                                <option id='gender'>F</option>
                                <option id='gender'>M</option>
                            </select>
                        </div>
                        <div className="input-wrap">
                            <label>dob :</label>
                            <input type='date' id='date' max={maxDate}/>
                        </div>
                        <div className="input-wrap img">
                            <label>img</label>
                            <input type='file' accept="image/png, image/jpeg"/>
                        </div>
                        <div className="modal-footer">
                            <input type="submit" className='btn btn-submit' value="Submit"/>
                            <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ModalAddUser