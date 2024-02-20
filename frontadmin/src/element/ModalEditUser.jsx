import React from 'react'
import "./ModalEditUser.css"
function ModalEditUser({isOpen, onClose}) {
    if (!isOpen) {
        return null;
    }
  return (
    <div className='modal-container'>
        <div className="modal">
            <div className="modal-header">
                <h1>Delete User</h1>
            </div>
            <div className="modal-content">
                <p>Are you sure to delete?</p>
            </div>
            <div className="modal-footer">
                <button className='btn btn-submit' onClick={onClose}>Submit</button>
                <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
            </div>
        </div>
    </div>
  )
}

export default ModalEditUser