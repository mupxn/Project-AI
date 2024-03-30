import React, { useRef, useState } from 'react'
import "./ModalAddImage.css"
import setCanvasPreview from './setCanvasPreview';
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axios from 'axios';
const ASPECT_RATIO = 1
const MIN_DIMENSION = 100

function ModalAddImage({ userId, action, onClose }) {
    const imgRef = useRef(null)
    const previewCanvasRef = useRef(null)
    const [imgSrc, setImgSrc] = useState("")
    const [crop, setCrop] = useState()
    const [error, setError] = useState('')

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

    const sendPictureToBackend = async () => {
        if (!imgSrc) return;

        const formData = new FormData();
        if (crop && previewCanvasRef && previewCanvasRef.current) {
            // Convert the canvas to a blob and append it to formData
            const blob = await new Promise(resolve => previewCanvasRef.current.toBlob(resolve, 'image/jpeg'));
            formData.append('image', blob, '.jpg');
        } else {
            // For the original image, assuming imgSrc is a base64 or URL, you need to convert it to a Blob
            const response = await fetch(imgSrc);
            const blob = await response.blob();
            formData.append('image', blob, '.jpg');
        }
        formData.append("userId", userId);

        try {
            axios.post(`${process.env.REACT_APP_KIOSK_PORT}/addanother/image`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            console.log('Success:')
            action()
            onClose()
        } catch (error) {
            console.error('Error uploading image:', error.response ? error.response.data : error.message);
        }
    };


    return (
        <div className='modal-container-addimage'>
            <div className="modal-addimage">
                <div className="modal-header-addimage">
                    <h1>Choose Img</h1>
                </div>

                <div className="modal-content-addimage">
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
                        <div className="">
                            <button className='btn btn-submit' onClick={sendPictureToBackend}>Add</button>
                        </div>
                    </div>
                    <div className="">
                        <button className='btn btn-cancel' onClick={onClose} >Cancel</button>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default ModalAddImage