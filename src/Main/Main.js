import React, { useState } from 'react'
import "./MainStyle.scss"
var gifFrames = require('gif-frames');
// var fs = require('fs');


const Main = () => {
    const [frames, setFrames] = useState(null)
    const [err, setErr] = useState(false)
    const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;
    const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    const rampLength = grayRamp.length;
    const MAXIMUM_WIDTH = 80;
    const MAXIMUM_HEIGHT = 80;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext('2d')

    const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];

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
        // console.log(data)
        setInterval(() => {
            if(i === data.length) i = 0
            setFrames(data[i])
            // console.log(i)
            i++
        }, 100)
        // setFrames(asciiGIF) 
        // setFrames(null)
    }


    const fetchGIF = file => {
        gifFrames({ url: file, frames: '0-199', outputType: 'canvas' })
                    .then(function (frameData) {
                    let gifWidth
                    context.clearRect(0, 0, canvas.width, canvas.height)
                    const gifFrameData = frameData.map( frame => {
                            const [width, height] = clampDimensions(frame.getImage().width, frame.getImage().height);
                            context.drawImage(frame.getImage(), 0, 0, width, height);
                            const gifData = Array.from(context.getImageData(0, 0, width, height).data)
                            
                            gifWidth = width
                        return gifData
                        }  );
                        const asciiGIF = gifFrameData.map( (data) => {
                                // console.log(data)
                                const gray = getGrayScales(data) 
                                return gray.map((grayScale, idx) => {
                                    let nextChars = getCharacterForGrayScale(grayScale);
                                    return (!((idx + 1) % gifWidth === 0)) ? nextChars : nextChars + '\n';
                                }).join('')
                                // }, '')

                                
                            })
                            animateASCII(asciiGIF)
                            setErr(false)

                    }).catch( console.error.bind(console) && setErr(true));
    }

    const handleChangeURL = e => {
        if(e.keyCode === 13){
            fetchGIF(e.target.value)
        }
    }


    const handleChange = e => {
            fetchGIF(URL.createObjectURL(e.target.files[0]))
    }

  

    return (
        <div className="main-wrapper" >
            
            {/* <div className="img-wrapper" > */}
                {/* <img id="output" ref={imgRef}  /> */}
                {/* <canvas ref={canvasRef} id="gray" /> */}
                {/* <pre ref={preRef}></pre> */}
            {/* </div> */}
            {/* <div id='frames' ref={frameRef} ></div> */}
            
            {/* {frames && frames.map( frame => <pre > {frame} </pre> )} */}

            <h2> ASCII GIF Converter </h2>
            <p></p>
            {frames ? <pre>{frames}</pre> : 
                <div className="inputs" >
                    <input type="file"  accept="image/gif" name="image-upload" id="upload" onChange={ handleChange }  />
                    <input type="url"  name="image-url" id="url" onKeyDown={handleChangeURL}  />
                </div>
            }
            {err && <p>Please upload GIF file</p>}
            
            {/* <button onClick={handleClick} > Click </button> */}
        </div>
    )
}

export default Main
