import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { HiOutlinePhotograph, HiOutlineMail, HiOutlineLogout, HiOutlinePencilAlt } from 'react-icons/hi'

export default function AdminDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/admin/login')
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <a href="/" className="admin-brand">Art by Tvesa</a>
          <span className="admin-role">Admin Panel</span>
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin/artworks" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <HiOutlinePhotograph /> Artworks
          </NavLink>
          <NavLink to="/admin/messages" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <HiOutlineMail /> Messages
          </NavLink>
          <NavLink to="/admin/content" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <HiOutlinePencilAlt /> Content
          </NavLink>
        </nav>
        <div className="admin-sidebar-footer">
          <div className="admin-user">
            {user?.photoURL && <img src={user.photoURL} alt="" className="admin-avatar" />}
            <span className="admin-user-name">{user?.displayName}</span>
          </div>
          <button className="admin-signout" onClick={handleSignOut}>
            <HiOutlineLogout /> Sign Out
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
