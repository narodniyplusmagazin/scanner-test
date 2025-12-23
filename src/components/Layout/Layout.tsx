import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export default function Layout({ children, title }: LayoutProps) {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-content">
          <Link to="/" className="layout-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span>Magazin Admin</span>
          </Link>
          <nav className="layout-nav">
            <Link 
              to="/admin/users" 
              className={`layout-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
            >
              Users
            </Link>
            <Link 
              to="/admin/subscription" 
              className={`layout-nav-link ${isActive('/admin/subscription') ? 'active' : ''}`}
            >
              Subscription Plan
            </Link>
            <Link 
              to="/qr" 
              className={`layout-nav-link ${isActive('/qr') ? 'active' : ''}`}
            >
              QR Scanner
            </Link>
          </nav>
        </div>
      </header>
      <main className="layout-main">
        {title && <h1 className="layout-title">{title}</h1>}
        {children}
      </main>
    </div>
  )
}
