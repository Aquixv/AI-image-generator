import fetch from 'node-fetch';
// /api/generate-image.js

// --- Local Loading (Add this block) ---
// This runs when you test the function directly in your Node environment
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: '.env.local' });
}
// ---------------------------------------

import fetch from 'node-fetch'; 
// ... rest of your function (HF_ROUTER_URL, HF_KEY, req/res logic) ...

 // Requires "node-fetch" package

// Hugging Face Router URL
const HF_ROUTER_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';

// Key is loaded from the environment variables (HF_API_KEY)
const HF_KEY = process.env.HF_API_KEY; 

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // 1. Check for the key
    if (!HF_KEY) {
        return res.status(500).json({ error: 'API key not configured on server.' });
    }

    try {
        // 2. Forward the client's prompt (body) securely
        const hfResponse = await fetch(HF_ROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // KEY IS SECURELY ADDED HERE!
                'Authorization': `Bearer ${HF_KEY}`, 
            },
            body: JSON.stringify(req.body), // Forward the inputs: "..."
        });

        if (!hfResponse.ok) {
            // If Hugging Face returns an error (400, 503), pass it back
            const errorText = await hfResponse.text();
            return res.status(hfResponse.status).send(errorText);
        }

        // 3. Forward the image data (Blob/Buffer) back to the client
        const imageBuffer = await hfResponse.arrayBuffer();

        // Set headers for the image response
        res.setHeader('Content-Type', 'image/jpeg'); // Assuming JPEG or PNG
        res.status(200).send(Buffer.from(imageBuffer));

    } catch (error) {
        console.error('Serverless Function Error:', error);
        res.status(500).json({ error: 'Internal server error during image generation.' });
    }
};