import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'

const authState = vi.hoisted(() => ({ user: null, loading: false }))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => authState,
}))

describe('ProtectedRoute', () => {
  it('shows loading UI while auth state is pending', () => {
    authState.loading = true
    authState.user = null

    const { container } = render(
      <MemoryRouter initialEntries={['/admin']}>
        <ProtectedRoute>
          <div>admin content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(container.querySelector('.admin-loading')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to admin login', () => {
    authState.loading = false
    authState.user = null

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div>admin content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>
    )

    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('renders protected content for authenticated users', () => {
    authState.loading = false
    authState.user = { uid: '1' }

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>admin content</div>
        </ProtectedRoute>
      </MemoryRouter>
    )

    expect(screen.getByText('admin content')).toBeInTheDocument()
  })
})
