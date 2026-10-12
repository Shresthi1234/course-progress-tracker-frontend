import { useEffect, useMemo, useState } from 'react';
import { api } from './services/api.js';
import CourseCard from './components/CourseCard.jsx';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');

  async function refresh() {
    try {
      setError('');
      setCourses(await api.getCourses());
    } catch (err) {
      setError(`${err.message}. Check that the Spring Boot backend is running and the API URL is correct.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  const totals = useMemo(() => {
    const completed = courses.reduce((sum, c) => sum + (c.completedTasks || 0), 0);
    const tasks = courses.reduce((sum, c) => sum + (c.totalTasks || 0), 0);
    return {
      courses: courses.length,
      completed,
      remaining: Math.max(tasks - completed, 0),
      progress: tasks ? Math.round((completed / tasks) * 100) : 0
    };
  }, [courses]);

  async function createCourse(event) {
    event.preventDefault();
    if (!courseName.trim()) return;
    try {
      await api.createCourse({ name: courseName.trim(), description: description.trim(), targetDate: targetDate || null });
      setCourseName('');
      setDescription('');
      setTargetDate('');
      await refresh();
    } catch (err) { setError(err.message); }
  }

  async function perform(action) {
    try {
      setError('');
      await action();
      await refresh();
    } catch (err) { setError(err.message); }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="Course progress tracker home">
          <span className="brand-mark">✓</span>
          <span>Trackwise</span>
        </a>
        <span className="topbar-note">YOUR LEARNING, IN FOCUS</span>
      </header>

      <section className="hero">
        <p className="eyebrow">STAY ON TRACK</p>
        <h1>Make progress.<br /><span>One task at a time.</span></h1>
        <p className="hero-copy">Your courses, completed work, and next steps — all in one calm space.</p>
      </section>

      <section className="stats-grid" aria-label="Learning summary">
        <div className="stat-card"><span className="stat-label">Courses</span><strong>{totals.courses}</strong><span className="stat-foot">in your workspace</span></div>
        <div className="stat-card"><span className="stat-label">Tasks completed</span><strong>{totals.completed}</strong><span className="stat-foot">small wins add up</span></div>
        <div className="stat-card"><span className="stat-label">Remaining work</span><strong>{totals.remaining}</strong><span className="stat-foot">your next steps</span></div>
        <div className="stat-card"><span className="stat-label">Overall progress</span><strong>{totals.progress}%</strong><span className="stat-foot">across all tasks</span></div>
      </section>

      <section className="section-heading">
        <div><p className="eyebrow">YOUR WORKSPACE</p><h2>Course progress</h2></div>
        <span className="section-count">{courses.length} {courses.length === 1 ? 'course' : 'courses'}</span>
      </section>

      <section className="workspace-grid">
        <div className="courses-column">
          {loading ? <div className="message-card">Loading your courses…</div> : (
            courses.length ? courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onAddTask={(id, title) => perform(() => api.addTask(id, title))}
                onToggleTask={(courseId, taskId, completed) => perform(() => api.updateTask(courseId, taskId, { completed }))}
                onDeleteTask={(courseId, taskId) => perform(() => api.deleteTask(courseId, taskId))}
              />
            )) : <div className="message-card"><h3>Your tracker starts here</h3><p>Add your first course, then list the work you still need to finish.</p></div>
          )}
        </div>

        <aside className="add-course-card">
          <p className="eyebrow">NEW COURSE</p>
          <h2>Plan your next win.</h2>
          <p className="muted">Create a course and break it into manageable tasks.</p>
          <form onSubmit={createCourse} className="course-form">
            <label>Course name<input required value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="e.g. Java Fundamentals" /></label>
            <label>Description <span className="optional">(optional)</span><textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="What are you learning?" /></label>
            <label>Target date <span className="optional">(optional)</span><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} /></label>
            <button className="primary-button" type="submit">+ Create course</button>
          </form>
        </aside>
      </section>
      {error && <div className="error-banner" role="alert"><span>{error}</span><button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
      <footer>Trackwise <span>·</span> Progress over perfection.</footer>
    </main>
  );
}
