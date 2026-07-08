/** 
 * Requirement is to make the AI respond in a certain response type (like text/html or application/json).
 * Three approaches to achieve this.
*/
import constFile from '../Constants.json' with { type: 'json' };
import {GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({
    apiKey: constFile.apiKey
});
const CONTENTS = 'Extract structural info from: Dev Anand is a 28 year old engineer fluent in TS, Rust, and Kafka. He is actively looking for roles.';
/**
 * Method 1: The modern Standard: Enforcing type safety via zod
 * use zod package to get the fixed and custom output in any mime type. 
 */
import { z } from 'zod';

// define your strict zod schema
const UserProfileSchema = z.object({
    fullName: z.string().describe("The user's full legal name"),
    age: z.number().int().positive(),
    skills: z.array(z.string()),
    isAvailableForHire: z.boolean()
});

type UserProfile = z.infer<typeof UserProfileSchema>;

async function getStructuredProfile() {
    const response = await ai.models.generateContent({
        model: constFile.modelNames[0] as string,
        contents: CONTENTS,
        config: {
            responseMimeType: 'application/json',
            // responseSchema: UserProfileSchema // this does not works, due to version incompatibility between zod and gemini sdk version. We fixed it as below
            responseSchema: z.toJSONSchema(UserProfileSchema)
        }
    });

    if (!response.text) {
        throw new Error("No response string returned.");
    }

    const profileData : UserProfile = JSON.parse(response.text);

    console.log('Typescript Type Verified Object:', profileData);
    console.log(`Skills count : ${profileData.skills.length}`);
}

// getStructuredProfile();

/**
 * Method 2: Loose Structured Output (Not fixed)
 * getting raw json without zod
 * this approach gets the work done, but it is not recommended. It does not give fixed json structure. Which is not ideal for an api to return.
 */
async function getRawJson() {
    const response = await ai.models.generateContent({
        model: constFile.modelNames[0] as string,
        contents: CONTENTS,
        config: {
            responseMimeType: 'application/json'
        }
    });

    const parsedArray: string[] = JSON.parse(response.text!);
    console.log('decoded JSON array: ', parsedArray);
}

// getRawJson();

/**
 * Method 3: Unstructured Output(Text or HTML Documentation)
 * 
 */
async function generateHTMLOutput() {
    const response = await ai.models.generateContent({
        model: constFile.modelNames[0] as string,
        contents: CONTENTS,
        config: {
            responseMimeType: 'text/plain',
            systemInstruction: 'You are an elite frontend layout developer. Output raw HTML code only inside markdown wraps. Do not add explanations.'
        }
    });
    
    const htmlMarkup: string = response.text!;
    console.log('Raw html output:', htmlMarkup);
}

// generateHTMLOutput();

/**
 * The Rule of Schema Selection: 
 * Use Method 1 (Zod) whenever your AI Agent communicates with other internal functions, tools, API end-points, or database models.
 * If an agent hallucinates a variable name, your backend script will instantly break. Zod ensures type alignment.
 * 
 * Prompt Cleanliness: 
 * When specifying a responseSchema, avoid explicitly describing or restating that exact schema format manually inside the main contents prompt string.
 * Doing both wastes input token bandwidth and risks model confusion if descriptions contradict. Let the schema handle the layout automatically.
 */