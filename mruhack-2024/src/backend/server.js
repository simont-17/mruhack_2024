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
        // Get today's date as the project start date
        const startDate = moment().utc().format('YYYY-MM-DD');

        // Constructing the prompt based on the new input structure
        const prompt = `I have an assignment with the following details:
- Instructions: ${instructions}
- Group Member Count: ${memberCount}
- Start Date: ${startDate}
- Due Date: ${dueDate}

Please provide a high-level breakdown of a prioritized list of steps with specific deadlines to ensure we are on track for the due date. All tasks should start on or after the Start Date (${startDate}) and end on or before the Due Date (${dueDate}). Structure the response as follows:

- **Project**: [Project Name] - Start [Start Date] - Due [Due Date]
  - **Phase 1**: [Phase Name] - Start [Phase Start Date] - Due [Phase Due Date]
    - **Task 1 of Phase 1**: [Task Description] - Start [Task Start Date] - Due [Task Due Date]
    - **Task 2 of Phase 1**: [Task Description] - Start [Task Start Date] - Due [Task Due Date]
    - (Include sub-tasks as necessary, ensuring each task has a specific start and due date in the format: YYYY-MM-DD)

Ensure that every task has a specific start and due date between the project Start Date (${startDate}) and Due Date (${dueDate}), and be thorough in detailing all phases and tasks necessary to complete the assignment. Do not include any tasks that start before ${startDate}.`;

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
                max_tokens: 800, // Increased token limit if necessary
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error.message || 'Error communicating with OpenAI');
        }

        // Parsing the response to create prioritized tasks with task and dueDate
        const content = data.choices[0].message.content;

        // Regular expression to match tasks and due dates
        const taskRegex = /- \*\*(.+?)\*\*: (.+?) - Start (\d{4}-\d{2}-\d{2}) - Due (\d{4}-\d{2}-\d{2})/g;

        const prioritizedTasks = [];
        let match;
        while ((match = taskRegex.exec(content)) !== null) {
            const taskTitle = match[2].trim();
            const taskStartDateStr = match[3].trim();
            const taskDueDateStr = match[4].trim();

            // Parse dates in UTC
            const taskStartDate = moment.utc(taskStartDateStr, 'YYYY-MM-DD', true);
            const taskDueDate = moment.utc(taskDueDateStr, 'YYYY-MM-DD', true);

            // Validate and ensure dates are within project timeline
            if (
                taskStartDate.isValid() &&
                taskDueDate.isValid() &&
                taskStartDate.isSameOrAfter(moment.utc(startDate, 'YYYY-MM-DD', true)) &&
                taskDueDate.isSameOrBefore(moment.utc(dueDate, 'YYYY-MM-DD', true)) &&
                taskDueDate.isSameOrAfter(taskStartDate)
            ) {
                prioritizedTasks.push({
                    task: taskTitle,
                    startDate: taskStartDate.format('YYYY-MM-DD'),
                    dueDate: taskDueDate.format('YYYY-MM-DD'),
                });
            }
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
