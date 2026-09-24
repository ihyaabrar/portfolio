import { useEffect, useRef, useState } from 'react'
import { content as t } from './content'
import Hero from './components/Hero'
import { About, Contact, Education, Experience, Projects, Research, Tools } from './components/Sections'

type Theme = 'light' | 'dark'
// index.html sets data-theme before first paint (saved choice, else the system setting)
const initialTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9Z" fill="currentColor" />
  </svg>
)

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" fill="currentColor" stroke="none" />
    <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
  </svg>
)

export default function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // the header stays pinned; it is see-through at the top (the lanyard hangs behind it) and gets a
  // backdrop once the page moves so the links stay readable over content
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const menuButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121211' : '#f1f1ee')
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuButton.current?.focus()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const links = [
    ['#about', t.nav.about],
    ['#projects', t.nav.projects],
    ['#research', t.nav.research],
    ['#education', t.nav.education],
    ['#experience', t.nav.experience],
    ['#contact', t.nav.contact],
  ]

  return (
    <>
      <a className="skip" href="#main">
        {t.nav.skip}
      </a>
      <header className={'bar-shell' + (scrolled || menuOpen ? ' is-scrolled' : '')}>
        <div className="bar wrap">
        <a className="logo" href="#top" id="top" aria-label="Ihya', back to top">
          ihya<span>.</span>
        </a>
        <nav className="nav" aria-label="Sections">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="bar-end">
          {/* the icon shows where the button takes you: a moon in the light theme, a sun in the dark one */}
          <button
            className="theme-btn"
            type="button"
            aria-label={theme === 'dark' ? t.nav.toLight : t.nav.toDark}
            title={theme === 'dark' ? t.nav.toLight : t.nav.toDark}
            onClick={() => setTheme((m) => (m === 'dark' ? 'light' : 'dark'))}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            ref={menuButton}
            className="menu-btn"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? t.nav.close : t.nav.menu}
          </button>
        </div>
        <nav id="mobile-menu" className="mobile-menu" aria-label="Sections" hidden={!menuOpen}>
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
        </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <Hero t={t} dark={theme === 'dark'} />
        <About t={t} />
        <Projects t={t} />
        <Research t={t} />
        <Education t={t} />
        <Experience t={t} />
        <Tools t={t} />
        <Contact t={t} />
      </main>

      <footer className="wrap">
        <span>© 2026 Ihya' Nashirudin Abrar, Pontianak</span>
        <span>{t.footer}</span>
      </footer>
    </>
  )
}
