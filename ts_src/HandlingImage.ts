import CONSTANTS from './../Constants.json' with {type: 'json'};
import {GoogleGenAI} from '@google/genai';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const ai = new GoogleGenAI({apiKey: CONSTANTS.apiKey});

// Helper function to convert a local file buffer into specific data shape
async function fileToGenerativePart(filePath: string, mimeType: string) {
    try {
        // creating a buffer to load file in node.js memory, to have zero disk footprint for processing.
        const fileBuffer = await fs.readFile(filePath);
        // Convert raw binary buffer into base 64 encoded string.
        const base64Data = fileBuffer.toString('base64');
        // Returning exact payload structure required by SDK
        return {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };
    } catch (err) {
        console.error(`Error reading file at path: ${filePath}`);
        throw err;
    }
}

async function runImageAnalysis() {
    const imagePath = path.join(process.cwd(), 'sampleImage.jpg');
    const mimeType = 'image/jpeg';

    console.log('Reading file into buffer memory');

    try {
        const imagePart = await fileToGenerativePart(imagePath, mimeType);
        
        console.log('Sending file and prompt to Gemini.');

        const response = await ai.models.generateContent({
            model: CONSTANTS.modelNames[0] as string,
            contents: [
                'Analyze the image, list primary objects present, dominant colors, mood of the image',
                imagePart
            ],
            config: {
                temperature: 0.4
            }
        });

        console.log('----------- Image Analysis with Gemini -----------');
        console.log(response.text);
    } catch (err) {
        console.error('Image analysis failed due to error: ', err);
    }
}

runImageAnalysis();