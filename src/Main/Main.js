import React, { useEffect, useState } from 'react'
import "./MainStyle.scss"
import defaultgif from "../assets/default.gif"
var gifFrames = require('gif-frames');
// var fs = require('fs');
let animationInterval

const Main = () => {
    const [frames, setFrames] = useState(null)
    const [load, setLoad] = useState(true)
    const [url, seturl] = useState(defaultgif)
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
        let i = 0
        animationInterval = setInterval(() => {
            if(i === asciiGIF.length) i = 0
            setFrames(asciiGIF[i])
            i++
        }, 100)
    }


    const fetchGIF = file => {
        gifFrames({ url: file, frames: '0-999', outputType: 'canvas' })
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
                            setTimeout(() => setLoad(false), 500)
                            

                    }).catch( console.error.bind(console));
    }


    useEffect(() => {
        clearInterval(animationInterval)
        fetchGIF(url)
    }, [url])


    const handleChange = e => {
        seturl(URL.createObjectURL(e.target.files[0]))
        setLoad(true)
    }

  

    return (
        <div className="main-wrapper" >
            <h1> ASCII GIF Converter </h1>
            <div className="inputs" >
                <input type="file"  accept="image/gif" name="image-upload" id="upload" onChange={ handleChange }  />
                <label htmlFor="upload" type="url"  name="image-url" id="url" className="upload-label" >Upload GIF</label>
            </div>
            {load ? <pre className="loader" >Loading...</pre> : <pre>{frames}</pre> }
        </div>
    )
}

export default Main
