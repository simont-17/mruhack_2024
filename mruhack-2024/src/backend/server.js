import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config(); // Load environment variables from .env
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Sample route to handle task prioritization
app.post('/api/prioritize-tasks', async (req, res) => {
    const { instructions, memberCount, dueDate } = req.body; // Extract new fields

    try {
        // Constructing the prompt based on the new input structure
        const prompt = `I have an assignment with the following details:
        - Instructions: ${instructions}
        - Group Member Count: ${memberCount}
        - Due Date: ${dueDate}

        Please provide a high-level breakdown of a prioritized list of steps with specific deadlines to ensure we are on track for the due date. Structure the response as follows:
        
        - **Project**: [Project Name] - Due [Due Date]
          - **Phase 1**: [Phase Name] - Due [Phase Due Date]
            - **Task 1 of Phase 1**: [Task Description] - Due [Task Due Date]
            - **Task 2 of Phase 1**: [Task Description] - Due [Task Due Date]
            - (Include sub-tasks as necessary, ensuring each task has a specific due date in the format: Year, Month, Date)
        
        Ensure that every task has a specific date that includes Year, Month, and Date, and be thorough in detailing all phases and tasks necessary to complete the assignment.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 300, // Adjusted token limit as needed
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error communicating with OpenAI');
        }

        // Parsing the response to create prioritized tasks with task and dueDate
        const taskLines = data.choices[0].message.content.split('\n').filter(line => line.trim() !== '');
        
        // Create an array of task objects
        const prioritizedTasks = taskLines.map(line => {
            const taskMatch = line.match(/- (.+?) - Due (\d{4}-\d{2}-\d{2})/);
            if (taskMatch) {
                return {
                    task: taskMatch[1].trim(),  // Extracting the task description
                    dueDate: taskMatch[2].trim() // Extracting the due date
                };
            }
            return null;
        }).filter(task => task !== null); // Filter out null values

        res.json({ prioritizedTasks });
    } catch (error) {
        console.error('Error fetching data from OpenAI:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
