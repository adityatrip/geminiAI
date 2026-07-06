import CONSTANTS from './Constants.json' with { type: 'json' };
import { GoogleGenAI } from '@google/genai';
// Passing an empty object {} forces the SDK to automatically pull 
// the key from your GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({apiKey: CONSTANTS.apiKey});

// import { encodingForModel } from 'js-tiktoken'; // not for gemini
// const encoder = encodingForModel(CONSTANTS.modelNames[1]);

async function run(promptText) {
  try {
    console.log("Sending prompt to Gemini...");
    
    const response = await ai.models.generateContent({
      model: CONSTANTS.modelNames[1],
      contents: promptText, // <-- write prompt here
      config: {
        temperature: 0.1,
        maxOutputTokens: 1000,
        // systemInstruction: `Never give long answers. Keep note of these things while responding to any prompt.
        // 1. Answer any descriptive question which does not require code as output, in less than 500 words.
        // 2. For coding examples, give links which will give me more information on that topic, instead of giving a proper response at first attempt along with some hints.`
      }
    });

    console.log("\n--- Response ---");
    console.log(response.text);
  } catch (error) {
    console.error("Error connecting to Gemini:", error);
  }
}

const handleRun = async function() {
    const promptText = 'write a paragraph under 100 words on America'; // <-- write prompt here

    const countResponse = await ai.models.countTokens({
        model: CONSTANTS.modelNames[1],
        contents: promptText
    });
    console.log(countResponse.totalTokens);
    if (countResponse.totalTokens < 100) {
        await run(promptText);
    } else {
        console.log('prompt length limit exceeded.');
    }
}

handleRun();
