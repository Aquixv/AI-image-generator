import React, { useRef, useState } from 'react';
import './ImageGenerator.css';
import default_image from '../Assets/default_image.svg';
import Ghost from '../Assets/Ghost.gif';

export const ImageGenerator = () => {
    
    const [image_url, setImage_url] = useState('/');
    const [loading, setLoading] = useState(false); 
    let inputRef = useRef(null);
    
    const ImageGenerator = async () => {
        if (inputRef.current.value === '') {
            return '/';
        }

        
        setLoading(true);
        setImage_url(Ghost); // Optional: Clear the image or show a loading indicator here

        try {
            const response = await fetch(
                '/hf-image/stabilityai/stable-diffusion-xl-base-1.0',
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        // The 'User-Agent' header is not strictly needed for this API
                        Authorization: "Bearer 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", 
                    },
                    body: JSON.stringify({
                        // Correct key is 'inputs'
                        inputs: inputRef.current.value, 
                        // Optional: Add parameters here for better quality control
                    }),
                }
            );

            if (!response.ok) {
                // Handle non-200 responses (401, 404, 503 errors)
                console.error("API Error:", response.status, await response.text());
                alert(`Image generation failed (Status: ${response.status}). Check console.`);
                return '/'; 
            }

            // 3. Process the response as a Blob
            let data = await response.blob();
            
            // 4. Convert the Blob to a displayable URL
            const newImageURL = URL.createObjectURL(data);
            
            return newImageURL; // Return the new URL
            
        } catch (error) {
            console.error("Fetch failed:", error);
            alert("Network error or connection issue.");
            return '/';
        } finally {
            setLoading(false); // 5. Reset loading state
        }
    };

    // 6. The Component Render Logic
    return (
        <div className='ai-image-generator'>
            <div className='header'>AI image <span>Generator</span></div>
            <div className="img-loading">
                <div className="image">
                    <img src={image_url === '/' ? default_image : image_url} alt="Generated AI Art" />
                    <div className="loading">
                      <div className= {loading? "loading-bar-full" : "loading-bar"}></div>
                      <div className=  {loading? "loading-text" : "display-none"}>Loading....</div>
                    </div>
                </div>
            </div>
            <div className="search-box">
                <input type="text" ref={inputRef} className='search-input' placeholder='Describe what you want to see....'/>
                <div 
                    className="generate-button" 
                    // 7. Make the onClick handler an async function to wait for the URL
                    onClick={async () => {
                        const url = await ImageGenerator(); // Call the generator and wait for the URL
                        if (url && url !== '/') {
                            setImage_url(url); // 8. Update state to display the image
                        }
                    }}
                >
                    {/* Display loading feedback */}
                    {loading ? 'Generating...' : 'Generate'}
                </div>
            </div>
        </div>
    );
};

export default ImageGenerator;