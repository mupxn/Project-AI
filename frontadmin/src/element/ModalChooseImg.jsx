import React, { useState } from 'react'
import "./ModalChooseImg.css"
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function ModalChooseImg({ onclose }) {
    const [src, setSrc] = useState(null);
    const [crop, setCrop] = useState({ aspect: 16 / 9 });
    const [image, setImage] = useState(null);
    const [output, setOutput] = useState(null);

    const selectImage = (file) => {
        setSrc(URL.createObjectURL(file));
        console.log(file);
    };

    const cropImageNow = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        const pixelRatio = window.devicePixelRatio;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height,
        );

        // Converting to base64
        const base64Image = canvas.toDataURL('image/jpeg');
        setOutput(base64Image);
    };
    return (
        <div className='modal-container-search'>
            <div className="modal-search">
                <div className="modal-header-search">
                    <h1>Choose Img</h1>
                </div>
                <div className="modal-content-search">
                    <form>
                        <input type='file' accept="image/png, image/jpeg" onChange={(e) => { selectImage(e.target.files[0]); }} />
                    </form>
                    
                </div>
                <div>
                    {src && (
                        <div>
                            <ReactCrop src={src} onImageLoaded={setImage} crop={crop} onChange={setCrop} />
                            <br />
                            <button onClick={cropImageNow}>Crop</button>
                            <br />
                            <br />
                        </div>
                    )}
                </div>
                
                {output && <img className='showimg' src={output} />}
                
                <div className="modal-footer-edit">
                    <button className='btn btn-cancel' onClick={onclose}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default ModalChooseImg