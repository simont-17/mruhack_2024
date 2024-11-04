import { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { createEvents } from 'ics';
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

            // Sort the tasks by start date
            const sortedTasks = [...data.prioritizedTasks].sort((a, b) => {
                return new Date(a.startDate) - new Date(b.startDate);
            });

            setPrioritySchedule(sortedTasks); // Update state with sorted tasks

            // Modify the events to appear on the start date
            const newEvents = sortedTasks.map((task) => {
                // Parse the start date in local time and set time to noon
                const taskDate = moment(task.startDate, 'YYYY-MM-DD').set({
                    hour: 12,
                    minute: 0,
                    second: 0,
                    millisecond: 0,
                });

                return {
                    title: task.task,
                    start: taskDate.toDate(),
                    end: taskDate.toDate(),
                    allDay: true,
                };
            });

            setEvents(newEvents); // Update the events state
        } catch (error) {
            console.error('Error fetching data from backend:', error);
        }
    };

    // Function to generate and download the .ics file with all events
    const handleExportICS = () => {
        const eventsForICS = prioritySchedule.map((task) => {
            // Parse the start date in local time and set time to noon
            const taskDate = moment(task.startDate, 'YYYY-MM-DD').set({
                hour: 12,
                minute: 0,
                second: 0,
                millisecond: 0,
            });

            const startDateComponents = [
                taskDate.year(),
                taskDate.month() + 1, // Months are zero-indexed in moment.js
                taskDate.date(),
                taskDate.hour(),
                taskDate.minute(),
            ];

            return {
                start: startDateComponents,
                title: task.task,
                description: `Task: ${task.task}`,
                duration: { hours: 1 },
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
                                className= "asg_instructs"
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
                            <button type="submit" form="assignment_form">
                                Generate Schedule
                            </button>
                        </form>
                    </div>
                </div>

                <div className="home-right">
                    <h1>Prioritized Schedule</h1>
                    <ul className="task-list">
                        {prioritySchedule.map((priority, index) => (
                            <li key={index}>
                                {priority.task} - Start: {priority.startDate} - Due: {priority.dueDate}
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
