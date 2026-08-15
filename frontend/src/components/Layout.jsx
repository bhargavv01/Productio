import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/day', label: 'Day', icon: '☀️' },
  { to: '/week', label: 'Week', icon: '📊' },
  { to: '/month', label: 'Month', icon: '📅' },
  { to: '/goals', label: 'Goals', icon: '🎯' },
]

export default function Layout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <nav
        style={{
          width: '220px',
          flexShrink: 0,
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          padding: '24px 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            padding: '0 20px 24px',
            borderBottom: '1px solid var(--color-border)',
            marginBottom: '16px',
          }}
        >
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--color-text)',
            }}
          >
            Productio
          </h1>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--color-text-tertiary)',
              marginTop: '4px',
              letterSpacing: '0.02em',
            }}
          >
            Day Tracker
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                background: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                transition: 'all 0.15s ease',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'var(--color-surface-alt)'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main
        style={{
          flex: 1,
          padding: '32px 40px',
          maxWidth: '960px',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
