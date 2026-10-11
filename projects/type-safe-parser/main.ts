import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';
import CONSTANTS from './../../Constants.json' with { type: 'json'};
import chalk from 'chalk';
import { z } from 'zod';

const ai = new GoogleGenAI({apiKey: CONSTANTS.apiKey});

const readLogDump = async function () {
    // use Promise.all and fs.readFile to get all files content.
    const allDump = await Promise.all([
        fs.readFile('./projects/type-safe-parser/multi-file-logs/backend-node-server.log.txt', 'utf-8'),
        fs.readFile('./projects/type-safe-parser/multi-file-logs/frontend-app-error.log.txt', 'utf-8'),
        fs.readFile('./projects/type-safe-parser/multi-file-logs/js-async-issues.log.txt', 'utf-8'),
        fs.readFile('./projects/type-safe-parser/multi-file-logs/js-security-warnings.log.txt', 'utf-8'),
        fs.readFile('./projects/type-safe-parser/multi-file-logs/mysql-query-errors.log.txt', 'utf-8'),
        fs.readFile('./projects/type-safe-parser/multi-file-logs/mysql-schema-design.log.txt', 'utf-8')
    ]);

    console.log(typeof(allDump), allDump.length);

    // console.log('All log files are read.',allDump);
    const dumpJoined = allDump.join('\n--- next file ---\n');
    console.log(chalk.rgb(255, 153, 51).bold('All log files are read.'));
    return dumpJoined;
}

const AnalysisStructure = z.object({
    issues: z.array(z.object({
        "LogStatement" : z.string().describe('quote the logs from logs dump provided via context files'),
        "Solution Proposed": z.string(),
        "Severity": z.number().int().min(1).max(10),
        "Detailed Explaination": z.string().describe('describe the problem in detail, root cause in this case, root cause in general case(in other places for same problem), top 3 approaches to solve this problem taken by industry.')
    }))
})

const generateContent = async function (logDump : any) {
    console.log(typeof(logDump), logDump.length);
    if(logDump && typeof(logDump) === 'string') {
        console.log(chalk.rgb(255, 153, 51).bold('Got the log dump, continuing...... \n'));
        const response = await ai.models.generateContent({
            model: CONSTANTS.modelNames[2] as string,
            contents: [`
                You are principal Software Architect and site reliability engineer.
                Analyze the following files together. Detect architectural anti-patterns, potential memory leaks, performance hazards and cross module bugs where logs match anomalies in code blocks.
                Provide a structural, deeply technical breakdown review.
                Also, mention which types of logs u got, like db, frontend, backend, or server logs.
                Context files: ${logDump}`
            ],
            config: {
                temperature: 0.3,
                responseMimeType: 'application/json',
                responseSchema: z.toJSONSchema(AnalysisStructure)
            }
        });
    
        console.log(chalk.green.bold('Response from Gemini: \n\n'));
        const parsed = AnalysisStructure.parse(JSON.parse(response.text!));
        console.log(chalk.green(JSON.stringify(parsed, null, 2)));
    } else {
        console.log('some issue with log dump');
    }
}

const parser = async function() {
    const logDump = await readLogDump();
    await generateContent(logDump);
}

parser();