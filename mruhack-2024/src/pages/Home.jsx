import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function Home() {
    const [tasks, setTasks] = useState([]);
    const [taskInput, setTaskInput] = useState('');
    const [taskDate, setTaskDate] = useState('');
    const [prioritySchedule, setPrioritySchedule] = useState([]);
    const [events, setEvents] = useState([]);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            const response = await fetch('http://localhost:5001/api/prioritize-tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tasks }), // Send tasks as the body
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setPrioritySchedule(data.prioritizedTasks); // Update state with prioritized tasks
        } catch (error) {
            console.error('Error fetching data from backend:', error);
        }
    };

    const addTask = () => {
        if (taskInput.trim() && taskDate) {
            const newTask = { description: taskInput, date: taskDate };
            setTasks([...tasks, newTask]);
            setTaskInput('');
            setTaskDate('');

            // Add new task to calendar events
            const newEvent = {
                title: newTask.description,
                start: new Date(newTask.date),
                end: new Date(newTask.date),
                allDay: true,
            };
            setEvents((prevEvents) => [...prevEvents, newEvent]);
        }
    };

    return (
        <div className="home-container">
            <div className="card-container">
                <div className="home-left">
                    <h1>Task Scheduler</h1>
                    <div className="form-container">
                        <form onSubmit={handleSubmit} id="task_form">
                            <textarea
                                name="user_input"
                                placeholder="Enter task here..."
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                                required
                            ></textarea>
                            <label htmlFor="task-deadline">Enter task deadline</label>
                            <input
                                type="date"
                                name="task-deadline"
                                id="task-deadline"
                                value={taskDate}
                                onChange={(e) => setTaskDate(e.target.value)}
                                required
                            />
                            <button type="button" onClick={addTask}>Add task</button>
                            <button type="submit" form="task_form">Generate schedule</button>
                        </form>
                    </div>
                </div>

                <div className="home-right">
                    <h1>Current Tasks</h1>
                    <ul>
                        {tasks.map((task, index) => (
                            <li key={index}>
                                {task.description} - <strong>{task.date}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="schedule-container">
                <h1>Prioritized Schedule</h1>
                <ul>
                    {prioritySchedule.map((priority, index) => (
                        <li key={index}>{priority}</li>
                    ))}
                </ul>
            </div>

            <div className="calendar-container">
                <h1>Task Calendar</h1>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 500 }}
                />
            </div>
        </div>
    );
}
