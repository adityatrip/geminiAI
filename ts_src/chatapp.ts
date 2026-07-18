import constFile from "../Constants.json" with { type: 'json' };
import { GoogleGenAI } from "@google/genai";
import readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { conversationHistory } from "./History.js"

const ai = new GoogleGenAI({
    apiKey: constFile.apiKey
});

const runChatBot = async function() {
    const rl = readline.createInterface({
        input: stdin, 
        output: stdout
    });
    console.log('Gemini Chatbot started.....');
    
    try {
        const chat = ai.chats.create({
            model: constFile.modelNames[1] as string,
            history: conversationHistory,
            config: {
                systemInstruction: 'You are a brilliant, helpful and type-safe software engineering mentor.',
                temperature: 0.5
            }
        });

        while(true) {
            const userInput = await rl.question('You: ');
            if (userInput.trim().toLowerCase() === 'exit') {
                console.log('\n Gemini: Happy coding.');
                break;
            }

            if (!userInput.trim()) continue;
            
            process.stdout.write('Gemini....');

            const resp = await chat.sendMessage({
                message: userInput
            });

            process.stdout.cursorTo(0);
            process.stdout.clearLine(0);

            console.log(`Gemini: ${resp.text}`);
        }
    } catch (err: any) {
        console.log('Error while running chatBot application.', err.ApiError.error);
    } finally {
        rl.close();
    }
}

runChatBot();