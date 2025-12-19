import React, { useEffect, useState } from 'react'
import './Admin.css'

type User = {
  id: string
  fio: string
  phone: string
  email?: string
  gender?: string
  is_active?: boolean
}

const MOCK: User[] = [
  { id: 'u1', fio: 'Иван Иванов', phone: '+79000000001', email: 'ivan@example.com', gender: 'M', is_active: true },
  { id: 'u2', fio: 'Мария Петрова', phone: '+79000000002', email: 'maria@example.com', gender: 'F', is_active: false },
]

export default function UsersList() {
  const [users, setUsers] = useState<User[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch('/api/users')
      .then(r => { if (!r.ok) throw new Error('bad') ; return r.json() })
      .then(data => { if (mounted) setUsers(data) })
      .catch(() => { if (mounted) setUsers(MOCK) })
    return () => { mounted = false }
  }, [])

  if (!users) return <div style={{ padding: 24 }}>Loading users...</div>

  return (
    <div className="admin-root" style={{ padding: 24 }}>
      <h2>Users</h2>
      <table>
        <thead>
          <tr><th>FIO</th><th>Phone</th><th>Email</th><th>Gender</th><th>Active</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.fio}</td>
              <td>{u.phone}</td>
              <td>{u.email || '—'}</td>
              <td>{u.gender || '—'}</td>
              <td>{u.is_active ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
