import React, { useState, useEffect, useRef } from 'react';
import "./ModalAddUser.css"
import setCanvasPreview from './setCanvasPreview';
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from "axios";
const ASPECT_RATIO = 1
const MIN_DIMENSION = 100
function ModalAddUser({ onClose, action }) {

    const [newUser, setnewUser] = useState('')

    const imgRef = useRef(null)
    const previewCanvasRef = useRef(null)
    const [imgSrc, setImgSrc] = useState("")
    const [crop, setCrop] = useState(null)
    const [error, setError] = useState('')

    const handleInputName = (e) => {
        setnewUser(e.target.value)
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(imgRef);
        setCanvasPreview(
            imgRef.current,
            previewCanvasRef.current,
            convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
        )
        console.log(imgRef.current);
        if (!previewCanvasRef.current) {
            console.error("No canvas reference");
            return;
        }
        const imageBlob = await new Promise(resolve => previewCanvasRef.current.toBlob(resolve, 'image/jpeg'));
        const formData = new FormData();
        // formData.append("userId", newId);
        formData.append("userName", newUser);
        formData.append("image", imageBlob,'.jpg'); // type of file is .jpg
        try {
            axios.post(`${process.env.REACT_APP_WEB_PORT}/api/user/adduser`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log('Success:')
            action()
            onClose()
        } catch {
            console.error('Error:', error)
        }
        
    };
    const onSelectFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return;
        const reader = new FileReader();
        console.log("EIEI");
        reader.addEventListener("load", () => {
            const imageElement = new Image();
            const imageUrl = reader.result?.toString() || "";
            imageElement.src = imageUrl;
            imageElement.addEventListener("load", (e) => {
                if (error) setError("")
                const { naturalWidth, naturalHeight } = e.currentTarget;
                if (naturalWidth < MIN_DIMENSION || naturalHeight < MIN_DIMENSION) {
                    setError("Image muse be at least 150 x 150 pixels.")
                    return setImgSrc("");
                }
            })
            setImgSrc(imageUrl)
        })
        reader.readAsDataURL(file)
    }
    const onImageLoad = (e) => {
        console.log("uu");
        if (!imgRef.current) return;
        const { width, height } = e.currentTarget;
        const cropWidthInPercent = (MIN_DIMENSION / width) * 100
        const initialCrop = makeAspectCrop({
            unit: "%",
            width: cropWidthInPercent,
        }, ASPECT_RATIO,
            width,
            height
        );
        const centeredCrop = centerCrop(initialCrop, width, height)
        setCrop(centeredCrop)
    }

    return (
        <div className='modal-container-adduser'>
            <div className="modal-adduser">

                <div className="modal-header-adduser">
                    <h1>Add User</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-content-adduser">

                        {/* <div className="input-wrap id">
                            <label>ID :</label>
                            <input type='number' onChange={handleInputId} required />
                        </div> */}
                        <div className="input-wrap name">
                            <label>ชื่อ :</label>
                            <input type='text' onChange={handleInputName} required />
                        </div>
                        <div className="choose-file">
                            <input type='file' accept="image/*" onChange={onSelectFile} required />
                        </div>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        <div className="content-img">
                            <div className="img-before-crop">
                                {imgSrc && (
                                    <div>
                                        <ReactCrop
                                            crop={crop}
                                            onChange={
                                                (percentCrop) => setCrop(percentCrop)
                                            }
                                            regtangleCrop
                                            keepSelection
                                            aspect={ASPECT_RATIO}
                                            minWidth={MIN_DIMENSION}
                                        >
                                            <img
                                                ref={imgRef}
                                                src={imgSrc}
                                                alt='Upload'
                                                style={{ maxHeight: "50vh", marginBottom: "15px" }}
                                                onLoad={onImageLoad}
                                            />
                                        </ReactCrop>
                                    </div>
                                )}
                            </div>
                            <div className="img-after-crop">
                                {crop && (
                                    <canvas
                                        ref={previewCanvasRef}
                                        style={{
                                            border: "1px solid black",
                                            objectFit: "contain",
                                            width: 150,
                                            height: 150,
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer-adduser">
                        <input type="submit" className='btn btn-submit' value="Submit" />
                        <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ModalAddUser