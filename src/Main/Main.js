import React, { useRef, useState } from 'react'
import "./MainStyle.scss"
// const fs = require('fs');
const extractFrames = require('gif-extract-frames')
var gifFrames = require('gif-frames');
var fs = require('fs');


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


    const animateASCII = (asciiGIF) => {
        let data = null
        data = asciiGIF
        let i = 0
        console.log(data.length)
        setInterval(() => {
            if(i === data.length-1) i = 0
            setFrames(data[i])
            i++
        }, 100)
    }




    const handleChange = e => {
       
            const file = e.target.files[0];
            
            let asciiGIF = 0
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
            // context.clearRect(0, 0, canvas.width, canvas.height)
            // const reader = new FileReader();
            imgRef.current.src = null
            imgRef.current.src = URL.createObjectURL(file)

            gifFrames({ url: imgRef.current.src, frames: '0-99', outputType: 'canvas' })
                    .then(function (frameData) {
                    let gifWidth
                    let gifFrameData = null
                    gifFrameData = frameData.map( frame => {
                            const [width, height] = clampDimensions(frame.getImage().width, frame.getImage().height);
                            context.drawImage(frame.getImage(), 0, 0, width, height);
                            const gifData = Array.from(context.getImageData(0, 0, width, height).data)
                            // context.clearRect(0, 0, canvas.width, canvas.height)
                            gifWidth = width
                            // frameRef.current.appendChild(frame.getImage())
                            // console.log(gifData)
                        return gifData
                        }  );
                        // const gray = getGrayScales(gifFrameData) 
                        asciiGIF = gifFrameData.map( (data) => {
                                // console.log(data)
                                const gray = getGrayScales(data) 
                                return gray.map((grayScale, index) => {
                                    let nextChars = getCharacterForGrayScale(grayScale);
                                    return ((index + 1) % gifWidth === 0) ? nextChars + '\n' : nextChars;
                                }).join('')
                                // }, '')

                                
                            })
                            animateASCII(asciiGIF)
                            // console.log(asciiGIF)
                    }).catch(console.error.bind(console));
           

            

    }

  

    return (
        <div className="main-wrapper" >
            <input type="file"  accept="image/gif" name="image" id="file" onChange={ handleChange }  />
            <div className="img-wrapper" >
                <img id="output" ref={imgRef}  />
                <canvas ref={canvasRef} id="gray" />
                <pre ref={preRef}></pre>
            </div>
            <div id='frames' ref={frameRef} ></div>
            
            {frames && <pre > {frames} </pre> }
            
            {/* <button onClick={handleClick} > Click </button> */}
        </div>
    )
}

export default Main
