import {useState} from 'react';

export default function Home() {
    const[tasks, setTasks] = useState([])
    const[taskInput, setTaskInput] = useState('')
    const[taskDate, setTaskDate] = useState('')


    const handleSubmit = async (e) => {
        console.log(e)
    }

    const addTask = () => {
        if (taskInput.trim() && taskDate) {
            const newTask = {description: taskInput, date:taskDate}
            setTasks([...tasks, newTask])
            setTaskInput('')
            setTaskDate('')

        }
    }

    return(
        <>
            <div className="card-container">
                <div className="home-left">
                    <h1>Task scheduler</h1>
                    <div className="form-container">
                        <form onSubmit={handleSubmit} id="task_form">
                            <textarea 
                                name="user_input"  
                                placeholder="Enter task here..." 
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                                required></textarea>
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
                    <h1>Current tasks</h1>
                    <ul>
                        {tasks.map((task, index) => (
                            <li key={index}>
                                {task.description} - <strong>{task.date}</strong>
                            </li>
                        ))}
                    </ul>
                </div>
                
            </div>
        </>
    )

}