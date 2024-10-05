// backend/server.js
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
    const { tasks } = req.body;

    try {
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
                        content: `Here are my tasks: ${JSON.stringify(tasks)}. Please prioritize them.`
                    }
                ],
                max_tokens: 150,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error communicating with OpenAI');
        }

        const prioritizedTasks = data.choices[0].message.content.split('\n');
        res.json({ prioritizedTasks });
    } catch (error) {
        console.error('Error fetching data from OpenAI:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
