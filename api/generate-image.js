// /api/generate-image.js - CORRECTED VERSION

// 1. Load dotenv locally (using require)
if (process.env.NODE_ENV !== 'production') {
    // We check for 'dotenv' existence in case it's not installed globally
    try {
        require('dotenv').config({ path: '.env.local' });
    } catch (e) {
        console.warn('dotenv not found. Assuming environment variables are set externally.');
    }
}

// 2. Load node-fetch (using require)
// Node-fetch is needed for older Node versions; modern Node environments use global fetch.
// We'll keep the polyfill via 'require' for maximum compatibility.
const fetch = require('node-fetch'); 

// Access global Buffer object (needed for image buffer conversion)
const { Buffer } = require('buffer'); 

// Hugging Face Router URL
const HF_ROUTER_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

// Key is loaded from the environment variables
const HF_KEY = process.env.HF_API_KEY; 

export default async (req, res) => {
    // Vercel/Netlify automatically parse the JSON body for us sometimes, 
    // but for safety, we assume req.body is already parsed (as it is in Vercel).
    
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 1. Check for the key on the server
    if (!HF_KEY) {
        // This will happen if you forget to set it in the deployment dashboard
        console.error("CRITICAL: HF_API_KEY is not defined.");
        return res.status(500).json({ error: 'API key not configured on server. Please check environment variables.' });
    }

    try {
        // 2. Forward the client's prompt securely
        const hfResponse = await fetch(HF_ROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_KEY}`, 
            },
            // req.body is already an object, must stringify it for the external API call
            body: JSON.stringify(req.body), 
        });

        if (!hfResponse.ok) {
            // Read the error message from HF and pass it back
            const errorText = await hfResponse.text();
            return res.status(hfResponse.status).send(errorText);
        }

        // 3. Forward the image data (Buffer) back to the client
        const imageBuffer = await hfResponse.arrayBuffer();

        // Convert the ArrayBuffer to a Node.js Buffer and send it
        res.setHeader('Content-Type', 'image/jpeg'); // Set content type
        res.status(200).send(Buffer.from(imageBuffer));

    } catch (error) {
        console.error('Serverless Function Runtime Error:', error);
        res.status(500).json({ error: 'Internal server error during image processing.' });
    }
};