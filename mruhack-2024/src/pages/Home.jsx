import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { saveAs } from 'file-saver'; // Correct import
import { createEvents } from 'ics'; // Correct import for creating multiple events
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

export default function Home() {
    const [assignmentInstructions, setAssignmentInstructions] = useState('');
    const [groupMemberCount, setGroupMemberCount] = useState(1); // Default to 1 member
    const [dueDate, setDueDate] = useState('');
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
                body: JSON.stringify({
                    instructions: assignmentInstructions,
                    memberCount: groupMemberCount,
                    dueDate: dueDate,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setPrioritySchedule(data.prioritizedTasks);

            // Transform prioritizedTasks into events for the calendar
            const newEvents = data.prioritizedTasks.map((task) => {
                const taskDate = moment(task.dueDate, 'YYYY-MM-DD');
                return {
                    title: task.task,
                    start: taskDate.toDate(),
                    end: taskDate.toDate(),
                    allDay: true,
                };
            });

            setEvents(newEvents);
        } catch (error) {
            console.error('Error fetching data from backend:', error);
        }
    };

    // Function to generate and download the .ics file with all events
    const handleExportICS = () => {
        const eventsForICS = prioritySchedule.map((task) => {
            const taskDate = moment(task.dueDate, 'YYYY-MM-DD').toDate();
            return {
                start: [taskDate.getFullYear(), taskDate.getMonth() + 1, taskDate.getDate()],
                title: task.task,
                description: `Task: ${task.task}`,
                duration: { hours: 1 }, // Assuming a 1-hour duration for each task
            };
        });

        createEvents(eventsForICS, (error, value) => {
            if (error) {
                console.error('Error creating events:', error);
                return;
            }

            // Create a Blob and use file-saver to download the combined .ics file
            const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
            saveAs(blob, 'Schedule.ics');
        });
    };

    return (
        <div className="home-container">
            <div className="card-container">
                <div className="home-left">
                    <h1>Assignment Scheduler</h1>
                    <div className="form-container">
                        <form onSubmit={handleSubmit} id="assignment_form">
                            <textarea
                                name="assignment_instructions"
                                placeholder="Enter assignment instructions here..."
                                value={assignmentInstructions}
                                onChange={(e) => setAssignmentInstructions(e.target.value)}
                                required
                            ></textarea>
                            <label htmlFor="group-member-count">Group Member Count</label>
                            <input
                                type="number"
                                name="group-member-count"
                                id="group-member-count"
                                min="1"
                                value={groupMemberCount}
                                onChange={(e) => setGroupMemberCount(e.target.value)}
                                required
                            />
                            <label htmlFor="due-date">Enter Project Deadline</label>
                            <input
                                type="date"
                                name="due-date"
                                id="due-date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                required
                            />
                            <button type="submit" form="assignment_form">Generate Schedule</button>
                        </form>
                    </div>
                </div>

                <div className="home-right">
                    <h1>Prioritized Schedule</h1>
                    <ul>
                        {prioritySchedule.map((priority, index) => (
                            <li key={index}>
                                {priority.task} - Due: {priority.dueDate}
                            </li>
                        ))}
                    </ul>
                </div>
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
                <button onClick={handleExportICS}>Export to .ics</button>
            </div>
        </div>
    );
}

