import CONSTANTS from './../../Constants.json' with {type: 'json'};
import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';

const ai = new GoogleGenAI({apiKey: CONSTANTS.apiKey});

async function LogFileAnalyze() {
    try {

        // const content = await fs.readFile('./ts_src/Huge-Log-File-Handling/system.log', 'utf-8');
        const [systemLog] = await Promise.all([
            fs.readFile('./ts_src/Huge-Log-File-Handling/system.log', 'utf-8'), 
            fs.readFile('./ts_src/Huge-Log-File-Handling/system1.log', 'utf-8'),
        ]);
        console.log('read file contents, now trying to get response from AI');
        const content = systemLog;

        const response = await ai.models.generateContent({
            model: CONSTANTS.modelNames[1] as string,
            contents: [
                `You are principal Software Architect and site reliability engineer.
                Analyze the following files together. Detect architectural anti-patterns, potential memory leaks, performance hazards and cross module bugs where logs match anomalies in code blocks.
                Provide a structural, deeply technical breakdown review.
                
                Context Files: ${content}`
            ],
            config: {
                temperature: 0.2
            }
        });
        console.log('Response from AI: -----\n');
        console.log(response.text);
    } catch (err) {
        console.error(err);
    }
}

LogFileAnalyze();