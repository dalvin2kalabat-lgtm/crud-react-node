import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error();
      setTasks(await res.json());
      setError('');
    } catch {
      setError('Could not reach the API. Is the backend running on port 3000?');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks([...tasks, created]);
      setTitle('');
    } else {
      setError('Could not add the task.');
    }
  }

  async function updateTask(id, changes) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    if (res.ok) {
      const updated = await res.json();
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    } else {
      setError('Could not update the task.');
    }
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) return;
    await updateTask(id, { title: editTitle });
    setEditingId(null);
  }

  async function deleteTask(id) {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setTasks(tasks.filter((t) => t.id !== id));
    } else {
      setError('Could not delete the task.');
    }
  }

  return (
    <main className="app">
      <h1>Task Manager</h1>
      <p className="sub">React frontend talking to a Node/Express API.</p>

      <form className="add" onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="New task title"
        />
        <button type="submit">Add task</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      {loading && <p className="muted">Loading tasks...</p>}
      {!loading && !error && tasks.length === 0 && (
        <p className="muted">No tasks yet. Add your first one above.</p>
      )}

      <ul className="list">
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => updateTask(task.id, { done: !task.done })}
              aria-label={`Mark ${task.title} as done`}
            />

            {editingId === task.id ? (
              <>
                <input
                  className="edit"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  aria-label="Edit task title"
                  autoFocus
                />
                <button onClick={() => saveEdit(task.id)}>Save</button>
                <button className="ghost" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="title">{task.title}</span>
                <button
                  className="ghost"
                  onClick={() => {
                    setEditingId(task.id);
                    setEditTitle(task.title);
                  }}
                >
                  Edit
                </button>
                <button className="danger" onClick={() => deleteTask(task.id)}>
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
