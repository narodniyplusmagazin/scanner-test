import './App.css'

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import UsersList from './admin/UsersList'
import SubscriptionPlanEdit from './admin/SubscriptionPlanEdit'
import QRScanner from './components/QRScanner/QRScanner'

function Home() {
  return (
    <main>
      <h1>Hello</h1>
      <p>
        <Link to="/admin/users">Open Admin — Users List</Link>
      </p>
      <p>
        <Link to="/admin/subscription">Open Admin — Edit Subscription Plan</Link>
      </p>
      <p>
        <Link to="/qr">Open QR Scanner</Link>
      </p>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/users" element={<UsersList />} />
        <Route path="/admin/subscription" element={<SubscriptionPlanEdit />} />
        <Route path="/qr" element={<QRScanner />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
