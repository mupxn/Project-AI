import React, { useRef, useState } from 'react'
import "./ModalChooseImg.css"
import setCanvasPreview from './setCanvasPreview';
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
const ASPECT_RATIO = 1
const MIN_DIMENSION = 100
function ModalChooseImg({ onclose }) {
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
    return (
        <div className='modal-container-search'>
            <div className="modal-search">
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
                            <input type="submit" className='btn btn-submit' value="Search" />
                        </form>
                    </div>
                    <div className="">
                        <button className='btn btn-cancel' onClick={onclose}>Cancel</button>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default ModalChooseImg