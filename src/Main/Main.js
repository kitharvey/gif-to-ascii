import React, { useRef } from 'react'
import "./MainStyle.scss"
const Main = () => {
    // const [imgSource, setImg] = useState(null)

    const canvasRef = useRef(null)
    const preRef = useRef(null)
    // const imgRef = useRef(null)

    const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;


    const handleChange = e => {
        const file = e.target.files[0];
        const grayScales = [];
        
        const reader = new FileReader();
            reader.onload = (event) => {
                const image = new Image();
                image.onload = () => {
                    const canvas = canvasRef.current
                    const context = canvas.getContext('2d')
                    canvas.height = image.height
                    canvas.width = image.width
                    context.drawImage(image, 0, 0, image.width, image.height);
                    const imageData = context.getImageData(0, 0, image.width, image.height);

                    

                    for (let i = 0 ; i < imageData.data.length ; i += 4) {
                        const r = imageData.data[i];
                        const g = imageData.data[i + 1];
                        const b = imageData.data[i + 2];

                        const grayScale = toGrayScale(r, g, b);
                        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;

                        grayScales.push(grayScale);
                    }

                    console.log(imageData)
                    console.log(grayScales)
                    

                    context.putImageData(imageData, 0, 0);
                    // return grayScales;
                }

                image.src = event.target.result;

                const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
                const rampLength = grayRamp.length;
                const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];
                preRef.current.textContent = grayScales.map( (grayScale, index) => index+1 % image.width === 0 ? getCharacterForGrayScale(grayScale) + "123" : getCharacterForGrayScale(grayScale) )
            };

            reader.readAsDataURL(file);

           
    }
    // const handleClick = () => {
        
    // }

    // const handleMouse = (event) => {
    //     const canvas = canvasRef.current
    //     canvas.height = imgRef.current.height
    //     canvas.width = imgRef.current.width
    //     canvas.getContext('2d').drawImage(imgRef.current, 0, 0, imgRef.current.width, imgRef.current.height);
    //     const pixelData = canvas.getContext('2d').getpixelData(event.nativeEvent.offsetX, event.nativeEvent.offsetY, 1, 1).data
    //     const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    //     const rampLength = grayRamp.length;
    //     const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];
    //     console.log( getCharacterForGrayScale(toGrayScale(pixelData[0],pixelData[1],pixelData[2])))
    //     // console.log(String.fromCharCode(pixelData[0] + pixelData[1] + pixelData[2] / 3))

    //     // console.log(event.nativeEvent.offsetX, event.nativeEvent.offsetY)
    // }
  

    return (
        <div className="main-wrapper" >
            <input type="file"  accept="image/*" name="image" id="file" onChange={ handleChange }  />
            <div className="img-wrapper" >
                {/* <img id="output" src={imgSource} ref={imgRef}  /> */}
                <canvas ref={canvasRef} />
                <pre ref={preRef}></pre>
            </div>
            
            {/* <button onClick={handleClick} > Click </button> */}
        </div>
    )
}

export default Main
