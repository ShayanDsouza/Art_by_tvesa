import { useState, useEffect } from 'react'

export default function DarkModeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', String(dark))
  }, [dark])

  // Also apply on mount for persistence
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return (
    <button
      className="dark-mode-toggle"
      onClick={() => setDark(d => !d)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
    >
      <img
        src={dark ? '/new lamp dark mode.png' : '/new lamp light mode.png'}
        alt={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="dark-mode-toggle-img"
      />
    </button>
  )
}
