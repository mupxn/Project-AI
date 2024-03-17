import React, { useState, useEffect, useRef } from 'react';
import "./ModalAddUser.css"
import setCanvasPreview from './setCanvasPreview';
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from "axios";
const ASPECT_RATIO = 1
const MIN_DIMENSION = 100
function ModalAddUser({ onClose, action }) {
    const [isImg, setIsImg] = useState(false)
    const [newUser, setnewUser] = useState('')
    const [newId, setnewId] = useState('')
    const imgRef = useRef(null)
    const previewCanvasRef = useRef(null)
    const [imgSrc, setImgSrc] = useState("")
    const [crop, setCrop] = useState()
    const [error, setError] = useState('')
    const handleInputName = (e) => {
        setnewUser(e.target.value)
    }
    const handleInputId = (e) => {
        setnewId(e.target.value)
        console.log(e.target.value);
    }
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
    
        if (!imgSrc) {
            console.log("No image source found.");
            return; // Exit if there is no image to work with
        }
    
        const formData = new FormData();
        formData.append('newId', newId); // Append user ID
        formData.append('newUser', newUser); // Append user name
    
        if (crop && previewCanvasRef && previewCanvasRef.current) {
            // Assuming setCanvasPreview correctly updates the canvas to display the cropped image
            const blob = await new Promise(resolve => previewCanvasRef.current.toBlob(resolve, 'image/jpeg'));
            formData.append('image', blob, 'cropped-image.jpg');
        } else {
            // This branch seems to handle the case where no cropping has occurred,
            // but in your current setup, it might never be used since cropping setup is always initiated.
            console.log('No crop data available');
        }
    
        try {
            // Make sure the URL matches your server's endpoint and it's accessible from the client
            const response = await axios.post('http://localhost:5000/api/user/adduser', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('Server response:', response.data);
            action(); // Callback to refresh or update parent component state
            onClose(); // Close modal or reset component state
        } catch (error) {
            console.error('Error submitting form data:', error);
        }
    };
    
    const showImage = () => {
        console.log();
    }

    const onSelectFile = (e) => {
        const file = e.target.files?.[0]
        if (!file) return;
        const reader = new FileReader();
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
                {!isImg ? (
                    <>
                        <div className="modal-header-adduser">
                            <h1>Add User</h1>
                        </div>
                        <div className="modal-content-adduser">
                            <form onSubmit={handleSubmit}>
                                <div className="input-wrap id">
                                    <label>ID :</label>
                                    <input type='number' onChange={handleInputId} />
                                </div>
                                <div className="input-wrap name">
                                    <label>ชื่อ :</label>
                                    <input type='text' onChange={handleInputName} />
                                </div>
                                <div className="input-wrap img">
                                    <button onClick={() => setIsImg(true)}>img</button>
                                </div>
                                <div className="modal-footer-adduser">
                                    <input type="submit" className='btn btn-submit' value="Submit"/>
                                    <button className='btn btn-cancel' onClick={onClose}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="modal-header-search">
                            <h1>Choose Img</h1>
                        </div>

                        <div className="modal-content-search">
                            <div className="choose-file">
                                <form>
                                    <input type='file' accept="image/*" onChange={onSelectFile} />
                                </form>
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
                                            <button style={{ display: "block", margin: "0 auto" }} onClick={() => {
                                                setCanvasPreview(
                                                    imgRef.current,
                                                    previewCanvasRef.current,
                                                    convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
                                                )
                                            }}>Crop Image</button>
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

                        <div className="modal-footer-search">
                            <div className="">
                                <form>
                                    <button className='btn btn-submit' onClick={() => setIsImg(false)}>submit</button>
                                </form>
                            </div>
                            <div className="">
                                <button className='btn btn-cancel' onClick={() => setIsImg(false)}>cancel</button>
                            </div>
                        </div>
                    </>
                )}

            </div>
        </div>
    )
}

export default ModalAddUser