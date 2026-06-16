import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Sentinelle</h2>

        <nav>
          <Link to="/">Dashboard</Link>
          <Link to="/upload">Upload Video</Link>
          <Link to="/jobs">Video Jobs</Link>
        </nav>

        <div className="user-box">
          <p>{user?.name}</p>
          <small>{user?.role}</small>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout