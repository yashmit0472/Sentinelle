import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navClassName = ({ isActive }) =>
  `sidebar__link${isActive ? ' sidebar__link--active' : ''}`

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
          <NavLink end to="/" className={navClassName}>
            Dashboard
          </NavLink>
          <NavLink to="/upload" className={navClassName}>
            Upload Video
          </NavLink>
          <NavLink to="/jobs" className={navClassName}>
            Video Jobs
          </NavLink>
          <NavLink to="/incidents" className={navClassName}>
            Incidents
          </NavLink>
          <NavLink to="/reports" className={navClassName}>
            Reports
          </NavLink>
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
