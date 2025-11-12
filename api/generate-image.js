// /api/generate-image.js
// This file assumes 'node-fetch' is uninstalled and you're using Vercel's native fetch.

const { Buffer } = require('buffer'); 

// 🛑 CRITICAL CHECK: Ensure this URL path is 100% correct 
// Router URL + /hf-inference/models/ + Model ID
const HF_ROUTER_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';
// It MUST include /hf-inference/models/ exactly.

// Key is securely loaded from Vercel Environment Variables
const HF_KEY = process.env.HF_API_KEY; 

export default async (req, res) => {
    // 1. Basic checks
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    if (!HF_KEY) {
        console.error("CRITICAL: HF_API_KEY is not defined.");
        return res.status(500).json({ error: 'API key not configured on Vercel server.' });
    }

    try {
        // Vercel auto-parses the body into req.body for JSON requests
        // Check if the required 'inputs' key is present
        if (!req.body || !req.body.inputs) {
            return res.status(400).json({ error: 'Missing required key: "inputs" in request body.' });
        }
        
        // 2. Perform the authenticated external fetch
        const hfResponse = await fetch(HF_ROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_KEY}`, 
            },
            body: JSON.stringify(req.body),
            // Ensure timeout is set for long-running AI tasks (e.g., 30 seconds)
            // You may need to configure maxDuration in vercel.json for this to work
        });

        // 3. Handle non-200 responses from Hugging Face
        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            // Log the error from HF for debugging in Vercel logs
            console.error(`HF API Error Status: ${hfResponse.status}`, errorText);
            
            // Forward the error status and message directly to the client
            return res.status(hfResponse.status).send(errorText);
        }

        // 4. Send the image data back to the client
        const imageBuffer = await hfResponse.arrayBuffer();

        res.setHeader('Content-Type', 'image/jpeg'); // Assuming JPEG response
        res.status(200).send(Buffer.from(imageBuffer));

    } catch (error) {
        // 5. Catch any unhandled Node.js errors (e.g., network failure, malformed URL)
        console.error('SERVERLESS CRASH (UNHANDLED):', error);
        res.status(500).json({ error: 'Internal Server Error (Crash during processing).' });
    }
};