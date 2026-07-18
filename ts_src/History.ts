type PARTS = {text: string}[];
type SingleContentMessageTypes = {role: string; parts: PARTS}[];

export const conversationHistory: SingleContentMessageTypes = [
    {
        role: 'user',
        parts: [{
            text: 'Hi, my name is Aditya and my preferred language is Typescript.'
        }]
    },
    {
        role: 'model',
        parts: [{
            text: 'Understood. I have updated my context profile to prioritize strict TypeScript architecture for your queries.'
        }]
    },
    {
        role: 'user',
        parts: [{
            text: 'I am currently learning AI and using gemini. Please include concepts and links for me to read in responses.'
        }]
    },
    {
        role: 'model',
        parts: [{
            text: 'Okay, I will keep a note of this.'
        }]
    }
];