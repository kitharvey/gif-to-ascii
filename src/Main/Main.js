import React, { useRef, useState } from 'react'
import "./MainStyle.scss"
// const fs = require('fs');
const extractFrames = require('gif-extract-frames')
 


const Main = () => {
    const [frames, setFrames] = useState(null)

    const canvasRef = useRef(null)
    const preRef = useRef(null)
    const imgRef = useRef(null)
    const frameRef = useRef(null)

    const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
    const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    const rampLength = grayRamp.length;
    const MAXIMUM_WIDTH = 80;
    const MAXIMUM_HEIGHT = 80;

    const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];

    const convertToGrayScales = (context, width, height) => {
        const imageData = context.getImageData(0, 0, width, height);
    
        const grayScales = [];
    
        for (let i = 0 ; i < imageData.data.length ; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
    
            const grayScale = toGrayScale(r, g, b);
            imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayScale;
    
            grayScales.push(grayScale);
        }
    
        context.putImageData(imageData, 0, 0);
    
        return grayScales;
    };
    const getGrayScales = (array) => {
    
        const grayScales = [];
    
        for (let i = 0 ; i < array.length ; i += 4) {
            const r = array[i];
            const g = array[i + 1];
            const b = array[i + 2];
    
            const grayScale = toGrayScale(r, g, b);
            array[i] = array[i + 1] = array[i + 2] = grayScale;
    
            grayScales.push(grayScale);
        }
    
    
        return grayScales;
    };

    const getFontRatio = () => {
        const pre = document.createElement('pre');
        pre.style.display = 'inline';
        pre.textContent = ' ';
    
        document.body.appendChild(pre);
        const { width, height } = pre.getBoundingClientRect();
        document.body.removeChild(pre);
    
        return height / width;
    };
    

    const clampDimensions = (width, height) => {
        const rectifiedWidth = Math.floor(getFontRatio() * width);
        if (height > MAXIMUM_HEIGHT) {
            const reducedWidth = Math.floor(rectifiedWidth * MAXIMUM_HEIGHT / height);
            return [reducedWidth, MAXIMUM_HEIGHT];
        }

        if (width > MAXIMUM_WIDTH) {
            const reducedHeight = Math.floor(height * MAXIMUM_WIDTH / rectifiedWidth);
            return [MAXIMUM_WIDTH, reducedHeight];
        }

        return [rectifiedWidth, height];
    };

    const drawAscii = (grayScales, width) => {
        const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
            let nextChars = getCharacterForGrayScale(grayScale);
            if ((index + 1) % width === 0) {
                nextChars += '\n';
            }
    
            return asciiImage + nextChars;
        }, '');
    
        preRef.current.textContent = ascii;
    };





    const handleChange = async e => {
       
            const file = e.target.files[0];
            

            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
            const reader = new FileReader();
            reader.onload = (event) => {
                const image = new Image();
                image.onload = () => {
                    const [width, height] = clampDimensions(image.width, image.height);
                    imgRef.current.width = image.width
                    imgRef.current.height = image.height
                    canvas.width = width;
                    canvas.height = height;
        
                    context.drawImage(image, 0, 0, width, height);
                    const grayScales = convertToGrayScales(context, width, height);
                    // console.log(grayScales.length)
                    drawAscii(grayScales, width);
                }
        
                image.src = event.target.result;

               

 
            };
            imgRef.current.src = (URL.createObjectURL(file))
            reader.readAsDataURL(file);
            // console.log(imgRef.current.src)

            const results = await extractFrames({
                input: imgRef.current.src,
                // output: 'frame-%d.png'
              })
            const arr = Array.from(results.data)
            const grayscales = getGrayScales(arr)
            const dataPerFrame = grayscales.slice().length
            const frameData = new Array(results.shape[0])
            // console.log(grayscales.length)
            // console.log(dataPerFrame)
            const frameDataArray = frameData.fill().map(_ => grayscales.splice(0, dataPerFrame/results.shape[0]))
            
            const frameASCII = frameDataArray.map( (data) => {
                return data.map((grayScale, index) => {
                    let nextChars = getCharacterForGrayScale(grayScale);
                    // console.log(nextChars, index)
                    // if ((index + 1) % imgRef.current.width === 0) {
                    //     nextChars += '\n';
                    // }
            
                    return ((index + 1) % imgRef.current.width === 0) ? nextChars + '\n' : nextChars;
                }).join('')
                // }, '')
            // console.log(data)

            } ).join('')
            console.log(frameASCII)
            setFrames(frameASCII)


    }

  

    return (
        <div className="main-wrapper" >
            <input type="file"  accept="image/gif" name="image" id="file" onChange={ handleChange }  />
            <div className="img-wrapper" >
                <img id="output" ref={imgRef}  />
                <canvas ref={canvasRef} />
                <pre ref={preRef}></pre>
            </div>
            <div id='frames' ref={frameRef} ></div>
            
            {frames && <pre> {frames} </pre>}
            
            {/* <button onClick={handleClick} > Click </button> */}
        </div>
    )
}

export default Main
