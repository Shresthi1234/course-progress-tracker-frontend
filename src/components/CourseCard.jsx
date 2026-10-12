import { useState } from 'react';

export default function CourseCard({ course, onAddTask, onToggleTask, onDeleteTask }) {
  const [taskTitle, setTaskTitle] = useState('');
  const percent = course.progressPercent ?? 0;
  const submitTask = async (event) => {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    await onAddTask(course.id, title);
    setTaskTitle('');
  };

  return (
    <article className="course-card">
      <div className="course-heading">
        <div>
          <p className="eyebrow">COURSE</p>
          <h2>{course.name}</h2>
          <p className="course-description">{course.description || 'Keep moving forward, one task at a time.'}</p>
        </div>
        <span className="percent">{percent}%</span>
      </div>
      <div className="progress-track" aria-label={`${percent}% complete`}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-meta">
        <span>{course.completedTasks} of {course.totalTasks} tasks complete</span>
        {course.targetDate && <span>Target: {course.targetDate}</span>}
      </div>

      <div className="task-list">
        {(course.tasks || []).map((task) => (
          <div className={`task-row ${task.completed ? 'is-complete' : ''}`} key={task.id}>
            <label className="task-label">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(event) => onToggleTask(course.id, task.id, event.target.checked)}
              />
              <span>{task.title}</span>
            </label>
            <button className="icon-button" onClick={() => onDeleteTask(course.id, task.id)} aria-label={`Delete ${task.title}`}>×</button>
          </div>
        ))}
        {(!course.tasks || course.tasks.length === 0) && (
          <p className="empty-tasks">No work items yet. Add the next thing you need to finish.</p>
        )}
      </div>

      <form className="add-task-form" onSubmit={submitTask}>
        <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Add remaining work…" aria-label="New work item" />
        <button type="submit" className="small-button">Add task</button>
      </form>
    </article>
  );
}
