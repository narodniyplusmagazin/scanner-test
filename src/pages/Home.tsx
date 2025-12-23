import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  return (
    <div className="home">
      <div className="home-content">
        <div className="home-header">
          <div className="home-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </div>
          <h1 className="home-title">Magazin Admin</h1>
          <p className="home-subtitle">Manage subscriptions, users, and QR codes</p>
        </div>

        <div className="home-cards">
          <Link to="/admin/users" className="home-card">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="card-title">Users</h3>
            <p className="card-description">View and manage all users and their subscriptions</p>
            <div className="card-arrow">→</div>
          </Link>

          <Link to="/admin/subscription" className="home-card">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <h3 className="card-title">Subscription Plan</h3>
            <p className="card-description">Create and edit subscription plan details</p>
            <div className="card-arrow">→</div>
          </Link>

          <Link to="/qr" className="home-card">
            <div className="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            <h3 className="card-title">QR Scanner</h3>
            <p className="card-description">Scan and validate subscription QR codes</p>
            <div className="card-arrow">→</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
