import './App.css'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import UsersList from './admin/UsersList'
import SubscriptionPlanEdit from './admin/SubscriptionPlanEdit'
import QRScanner from './components/QRScanner/QRScanner'
import Home from './pages/Home'

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
