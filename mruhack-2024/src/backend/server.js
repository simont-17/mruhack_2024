import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import moment from 'moment'; // Import moment for date formatting

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
    - (Include sub-tasks as necessary, ensuring each task has a specific due date in the format: YYYY-MM-DD)

Ensure that every task has a specific date that includes Year, Month, and Date in the format 'YYYY-MM-DD', and be thorough in detailing all phases and tasks necessary to complete the assignment.`;

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
                max_tokens: 500, // Increased token limit if necessary
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error.message || 'Error communicating with OpenAI');
        }

        // Parsing the response to create prioritized tasks with task and dueDate
        const content = data.choices[0].message.content;

        // Regular expression to match tasks and due dates
        const taskRegex = /- \*\*(.+?)\*\*: (.+?) - Due (\d{4}-\d{2}-\d{2})/g;

        const prioritizedTasks = [];
        let match;
        while ((match = taskRegex.exec(content)) !== null) {
            const taskTitle = match[2].trim();
            const dueDateStr = match[3].trim();

            // Validate and format the due date
            const dueDateFormatted = moment(dueDateStr, 'YYYY-MM-DD', true);
            if (!dueDateFormatted.isValid()) {
                continue; // Skip if the date is invalid
            }

            prioritizedTasks.push({
                task: taskTitle,
                dueDate: dueDateFormatted.format('YYYY-MM-DD'),
            });
        }

        res.json({ prioritizedTasks });
    } catch (error) {
        console.error('Error fetching data from OpenAI:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
