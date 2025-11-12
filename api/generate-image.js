// /api/generate-image.js - FINAL ESM FIX

// 1. Convert require to import
import { Buffer } from 'buffer';

const HF_ROUTER_URL = 'https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0';
const HF_KEY = process.env.HF_API_KEY; 

// 2. Define the handler using 'export default function'
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    if (!HF_KEY) {
        return res.status(500).json({ error: 'API key not configured on Vercel server.' });
    }

    try {
        if (!req.body || !req.body.inputs) {
            return res.status(400).json({ error: 'Missing required key: "inputs" in request body.' });
        }
        
        // Use native/global fetch here
        const hfResponse = await fetch(HF_ROUTER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_KEY}`, 
            },
            body: JSON.stringify(req.body),
        });

        if (!hfResponse.ok) {
            const errorText = await hfResponse.text();
            console.error(`HF API Error Status: ${hfResponse.status}`, errorText);
            return res.status(hfResponse.status).send(errorText);
        }

        const imageBuffer = await hfResponse.arrayBuffer();

        // 3. Use Buffer object (which was imported)
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); 
        res.status(200).send(Buffer.from(imageBuffer)); 

    } catch (error) {
        console.error('SERVERLESS CRASH (UNHANDLED):', error);
        res.status(500).json({ error: 'Internal Server Error (Crash during processing).' });
    }
}