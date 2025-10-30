import React, { useEffect, useState } from 'react'

type Task = {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

const API = 'http://localhost:5098/api/tasks'

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    setLoading(true)
    try {
      const res = await fetch(API)
      const data = await res.json()
      setTasks(data)
    } catch (err) {
      alert('Failed to fetch tasks')
    } finally { setLoading(false) }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { alert('Title is required'); return }
    await fetch(API, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ title, description })
    })
    setTitle(''); setDescription('')
    fetchTasks()
  }

  async function toggleTask(id: number) {
    await fetch(`${API}/${id}/toggle`, { method: 'PUT' })
    fetchTasks()
  }

  async function deleteTask(id: number) {
    if (!confirm('Delete this task?')) return
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    fetchTasks()
  }

  return (
    <div style={{ maxWidth:720, margin:'20px auto', fontFamily:'system-ui, sans-serif' }}>
      <h1>Basic Task Manager</h1>

      <form onSubmit={addTask} style={{ marginBottom:16 }}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={{ width:'100%', padding:8, marginBottom:8 }} />
        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description (optional)" style={{ width:'100%', padding:8, marginBottom:8 }} />
        <div>
          <button type="submit" style={{ padding:'8px 12px' }}>Add Task</button>
        </div>
      </form>

      <div style={{ marginBottom:12 }}>
        <strong>Tasks</strong>
      </div>

      {loading ? <div>Loading...</div> : (
        tasks.length === 0 ? <div>No tasks yet.</div> : tasks.map(t => (
          <div key={t.id} style={{ border:'1px solid #ddd', padding:12, marginBottom:8, borderRadius:6, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontWeight:600 }}>{t.title} {t.isCompleted ? '✅' : ''}</div>
              <div style={{ fontSize:13, color:'#555' }}>{t.description}</div>
              <div style={{ fontSize:12, color:'#888' }}>Created: {new Date(t.createdAt).toLocaleString()}</div>
            </div>
            <div>
              <button onClick={()=>toggleTask(t.id)} style={{ marginRight:8 }}>Toggle</button>
              <button onClick={()=>deleteTask(t.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
