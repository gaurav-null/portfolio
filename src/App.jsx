import { useEffect, useMemo, useRef, useState } from 'react'
import BounceCards from './BounceCards'
import './App.css'

const START_MENU_ICONS = {
  technologies: '/icons/start/technologies.png',
  home: '/icons/start/home.png',
  photos: '/icons/start/photos.png',
  contact: '/icons/start/contact.png',
  options: '/icons/start/options.png',
  thispc: '/icons/start/thispc.png',
}

const TECHNOLOGY_ITEMS = [
  { id: 'java', label: 'Java', icon: '/icons/tech/java.png', fallback: 'J' },
  { id: 'javascript', label: 'JavaScript', icon: '/icons/tech/javascript.png', fallback: 'JS' },
  { id: 'aws', label: 'AWS', icon: '/icons/tech/aws.png', fallback: 'A' },
  { id: 'jenkins', label: 'Jenkins', icon: '/icons/tech/jenkins.png', fallback: 'J' },
  { id: 'docker', label: 'Docker', icon: '/icons/tech/docker.png', fallback: 'D' },
  { id: 'terraform', label: 'Terraform', icon: '/icons/tech/terraform.png', fallback: 'T' },
  { id: 'linux', label: 'Linux', icon: '/icons/tech/linux.png', fallback: 'L' },
]

const CONTACT_OPTIONS = [
  { id: 'email', label: 'Email', href: 'mailto:you@example.com', icon: '/icons/options/email.png', fallback: 'E' },
  { id: 'github', label: 'GitHub', href: 'https://github.com', icon: '/icons/options/github.png', fallback: 'G' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com', icon: '/icons/options/linkedin.png', fallback: 'In' },
]

function App() {
  const startMenuRef = useRef(null)
  const startButtonRef = useRef(null)
  const windowRef = useRef(null)

  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return hash === 'photos' || hash === 'contact' || hash === 'thispc' ? hash : 'home'
  })
  const [isWindowOpen, setIsWindowOpen] = useState(() => {
    const hash = window.location.hash.replace('#', '')
    return hash === 'photos' || hash === 'contact' || hash === 'thispc'
  })
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false)
  const [isTechMenuOpen, setIsTechMenuOpen] = useState(false)
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false)
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  )
  const [windowPos, setWindowPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [brokenIcons, setBrokenIcons] = useState({})

  const photoImages = useMemo(
    () => [
      'https://picsum.photos/640/640?random=11',
      'https://picsum.photos/640/640?random=12',
      'https://picsum.photos/640/640?random=13',
      'https://picsum.photos/640/640?random=14',
      'https://picsum.photos/640/640?random=15',
    ],
    [],
  )

  const photoTransforms = useMemo(
    () => [
      'rotate(5deg) translate(-150px)',
      'rotate(0deg) translate(-70px)',
      'rotate(-5deg)',
      'rotate(5deg) translate(70px)',
      'rotate(-5deg) translate(150px)',
    ],
    [],
  )

  const playUiSound = (kind = 'click') => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    const context = new AudioContextClass()
    const gain = context.createGain()
    gain.connect(context.destination)
    gain.gain.value = 0.04

    const makeTone = (frequency, duration, delay = 0) => {
      const oscillator = context.createOscillator()
      oscillator.type = 'square'
      oscillator.frequency.value = frequency
      oscillator.connect(gain)

      const startAt = context.currentTime + delay
      const stopAt = startAt + duration

      oscillator.start(startAt)
      oscillator.stop(stopAt)
      gain.gain.setValueAtTime(0.04, startAt)
      gain.gain.exponentialRampToValueAtTime(0.001, stopAt)
    }

    if (kind === 'open') {
      makeTone(730, 0.08, 0)
      makeTone(920, 0.12, 0.08)
    } else if (kind === 'close') {
      makeTone(760, 0.08, 0)
      makeTone(560, 0.1, 0.08)
    } else {
      makeTone(660, 0.06, 0)
    }

    window.setTimeout(() => context.close(), 240)
  }

  const handleMouseDown = (e) => {
    if (!windowRef.current) return
    setIsDragging(true)
    const rect = windowRef.current.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      setWindowPos({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash === 'photos' || hash === 'contact' || hash === 'thispc') {
        setActivePage(hash)
        setIsWindowOpen(true)
        return
      }

      if (hash === 'home') {
        setActivePage('home')
        setIsWindowOpen(true)
        return
      }

      setIsWindowOpen(false)
    }

    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!isStartMenuOpen) return

      const clickedStartMenu = startMenuRef.current?.contains(event.target)
      const clickedStartButton = startButtonRef.current?.contains(event.target)

      if (!clickedStartMenu && !clickedStartButton) {
        setIsStartMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    return () => window.removeEventListener('mousedown', handlePointerDown)
  }, [isStartMenuOpen])

  const launchPage = (page) => {
    setActivePage(page)
    setIsWindowOpen(true)
    setIsStartMenuOpen(false)
    setIsTechMenuOpen(false)
    setIsOptionsMenuOpen(false)
    window.location.hash = page
    playUiSound('open')
  }

  const closeWindow = () => {
    setIsWindowOpen(false)
    setIsStartMenuOpen(false)
    setIsTechMenuOpen(false)
    setIsOptionsMenuOpen(false)
    window.location.hash = ''
    playUiSound('close')
  }

  const toggleStart = () => {
    setIsStartMenuOpen((current) => {
      const next = !current
      if (!next) {
        setIsTechMenuOpen(false)
        setIsOptionsMenuOpen(false)
      }
      return next
    })
    playUiSound('click')
  }

  const toggleTechnologiesMenu = () => {
    setIsTechMenuOpen((current) => {
      const next = !current
      if (next) {
        setIsOptionsMenuOpen(false)
      }
      return next
    })
    playUiSound('click')
  }

  const toggleOptionsMenu = () => {
    setIsOptionsMenuOpen((current) => {
      const next = !current
      if (next) {
        setIsTechMenuOpen(false)
      }
      return next
    })
    playUiSound('click')
  }

  const markIconAsBroken = (key) => {
    setBrokenIcons((current) => {
      if (current[key]) return current
      return { ...current, [key]: true }
    })
  }

  const renderMenuIcon = (iconKey, src, fallback) => (
    <span className="start-item__icon-wrap" aria-hidden="true">
      {brokenIcons[iconKey] ? (
        <span className="start-item__fallback">{fallback}</span>
      ) : (
        <img
          className="start-item__icon"
          src={src}
          alt=""
          onError={() => markIconAsBroken(iconKey)}
        />
      )}
    </span>
  )

  const title = activePage === 'home' ? 'Home' : activePage === 'photos' ? 'Photos' : activePage === 'thispc' ? 'This PC' : 'Contact'

  return (
    <div className="win95-shell">
      <div className="win95-desktop">
        <main className="desktop-main">
          <section className="desktop-icons" aria-label="Desktop shortcuts">
            <button type="button" className="desktop-icon" onClick={() => launchPage('thispc')}>
              <span className="desktop-icon__glyph" aria-hidden="true">
                PC
              </span>
              <span>This PC</span>
            </button>
          </section>

          {isWindowOpen && (
            <section className="win95-window win95-outset" role="region" aria-label="Active page window" ref={windowRef} style={{ left: `${windowPos.x}px`, top: `${windowPos.y}px` }}>
              <header className="win95-window__titlebar" onMouseDown={handleMouseDown}>
                <p>{title}</p>
                <div className="win95-window__controls" aria-hidden="true">
                  <button type="button" className="win95-btn win95-btn--title" onClick={() => playUiSound('click')}>
                    _
                  </button>
                  <button type="button" className="win95-btn win95-btn--title" onClick={() => playUiSound('click')}>
                    []
                  </button>
                  <button type="button" className="win95-btn win95-btn--title" onClick={closeWindow}>
                    X
                  </button>
                </div>
              </header>

              <div className="win95-window__content win95-inset">
                {activePage === 'home' && (
                  <div className="win95-page">
                    <h1>Welcome To My Portfolio</h1>
                    <p>Click desktop shortcuts or Start menu items to launch pages like Windows 95.</p>
                    <div className="win95-grid">
                      <article className="win95-outset">
                        <h2>About</h2>
                        <p>Creative developer building clean and practical web apps.</p>
                      </article>
                      <article className="win95-outset">
                        <h2>Projects</h2>
                        <p>Frontend, backend and data work from personal and college projects.</p>
                      </article>
                      <article className="win95-outset">
                        <h2>Photos</h2>
                        <p>Open Photos to view the animated card gallery.</p>
                      </article>
                    </div>
                  </div>
                )}

                {activePage === 'photos' && (
                  <div className="win95-page win95-page--photos">
                    <h1>Photo Gallery</h1>
                    <p>Hover the cards to spread the stack.</p>
                    <div className="win95-photos-stage win95-inset">
                      <BounceCards
                        className="custom-bounceCards"
                        images={photoImages}
                        containerWidth={500}
                        containerHeight={260}
                        animationDelay={0.8}
                        animationStagger={0.15}
                        easeType="elastic.out(1, 0.6)"
                        transformStyles={photoTransforms}
                        enableHover
                      />
                    </div>
                  </div>
                )}

                {activePage === 'thispc' && (
                  <div className="win95-page win95-page--thispc">
                    <div className="thispc-header">
                      <h1>Welcome to <span className="windows-bold">Windows <span className="text-white">95</span></span>!</h1>
                    </div>
                    <div className="thispc-layout">
                      <div className="thispc-left">
                        <div className="thispc-tip-icon">💡</div>
                        <div className="thispc-tip-content">
                          <h3>System Specifications</h3>
                          <p>Here's your PC setup with professional peripherals for optimal performance and comfort.</p>
                        </div>
                      </div>

                      <div className="thispc-center">
                        <div className="monitor-frame">
                          <img src="https://via.placeholder.com/300x220?text=Your+PC+Setup" alt="PC Setup" className="monitor-screen" />
                        </div>
                      </div>

                      <div className="thispc-right">
                        <div className="specs-card">
                          <h3>CPU</h3>
                          <p>AMD Ryzen 7 6800H</p>
                        </div>
                        <div className="specs-card">
                          <h3>GPU</h3>
                          <p>NVIDIA RTX 3050 (4GB)</p>
                        </div>
                        <div className="specs-card">
                          <h3>Memory</h3>
                          <p>16GB DDR5 RAM</p>
                        </div>
                        <div className="specs-card">
                          <h3>Keyboard</h3>
                          <p>Cosmic Byte Atheris</p>
                        </div>
                        <div className="specs-card">
                          <h3>Mouse</h3>
                          <p>Razer Orochi V2</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activePage === 'contact' && (
                  <div className="win95-page">
                    <h1>Contact</h1>
                    <p>Choose one option below.</p>
                    <ul className="contact-list">
                      <li>
                        <a className="win95-outset" href="mailto:you@example.com">
                          Email
                        </a>
                      </li>
                      <li>
                        <a className="win95-outset" href="https://github.com" target="_blank" rel="noreferrer">
                          GitHub
                        </a>
                      </li>
                      <li>
                        <a className="win95-outset" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
                          LinkedIn
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>

        {isStartMenuOpen && (
          <section className="start-menu win95-outset" ref={startMenuRef} aria-label="Start menu">
            <header className="start-menu__header">
              <p>
                <span className="start-menu__brand-main">Windows</span>
                <span className="start-menu__brand-sub">95</span>
              </p>
            </header>
            <div className="start-menu__items">
              <div className="start-item-group">
                <button
                  type="button"
                  className={`start-item start-item--submenu ${isTechMenuOpen ? 'start-item--active' : ''}`}
                  onClick={toggleTechnologiesMenu}
                  aria-haspopup="menu"
                  aria-expanded={isTechMenuOpen}
                >
                  <span className="start-item__content">
                    {renderMenuIcon('menu-technologies', START_MENU_ICONS.technologies, 'T')}
                    <span>Technologies</span>
                  </span>
                  <span className="start-item__arrow" aria-hidden="true">
                    {'>'}
                  </span>
                </button>

                {isTechMenuOpen && (
                  <aside className="tech-submenu win95-outset" aria-label="Technologies menu">
                    <ul>
                      {TECHNOLOGY_ITEMS.map((item) => (
                        <li key={item.id}>
                          <span className="tech-submenu__item">
                            {renderMenuIcon(`tech-${item.id}`, item.icon, item.fallback)}
                            <span>{item.label}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
              </div>

              <button type="button" className="start-item" onClick={() => launchPage('home')}>
                <span className="start-item__content">
                  {renderMenuIcon('menu-home', START_MENU_ICONS.home, 'H')}
                  <span>Home</span>
                </span>
              </button>
              <button type="button" className="start-item" onClick={() => launchPage('photos')}>
                <span className="start-item__content">
                  {renderMenuIcon('menu-photos', START_MENU_ICONS.photos, 'P')}
                  <span>Photos</span>
                </span>
              </button>
              <button type="button" className="start-item" onClick={() => launchPage('contact')}>
                <span className="start-item__content">
                  {renderMenuIcon('menu-contact', START_MENU_ICONS.contact, 'C')}
                  <span>Contact</span>
                </span>
              </button>

              <div className="start-item-group">
                <button
                  type="button"
                  className={`start-item start-item--submenu ${isOptionsMenuOpen ? 'start-item--active' : ''}`}
                  onClick={toggleOptionsMenu}
                  aria-haspopup="menu"
                  aria-expanded={isOptionsMenuOpen}
                >
                  <span className="start-item__content">
                    {renderMenuIcon('menu-options', START_MENU_ICONS.options, 'O')}
                    <span>Options</span>
                  </span>
                  <span className="start-item__arrow" aria-hidden="true">
                    {'>'}
                  </span>
                </button>

                {isOptionsMenuOpen && (
                  <aside className="options-submenu win95-outset" aria-label="Options menu">
                    <ul>
                      {CONTACT_OPTIONS.map((option) => (
                        <li key={option.id}>
                          <a
                            className="options-submenu__item"
                            href={option.href}
                            target={option.href.startsWith('http') ? '_blank' : undefined}
                            rel={option.href.startsWith('http') ? 'noreferrer' : undefined}
                          >
                            {renderMenuIcon(`option-${option.id}`, option.icon, option.fallback)}
                            <span>{option.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
              </div>

              <div className="start-menu__separator" aria-hidden="true" />

              <button type="button" className="start-item" onClick={() => launchPage('thispc')}>
                <span className="start-item__content">
                  {renderMenuIcon('menu-thispc', START_MENU_ICONS.thispc, 'PC')}
                  <span>This PC</span>
                </span>
              </button>
            </div>
          </section>
        )}

        <footer className="win95-taskbar win95-outset">
          <button
            type="button"
            ref={startButtonRef}
            className={`start-button win95-btn ${isStartMenuOpen ? 'start-button--active win95-inset' : 'win95-outset'}`}
            onClick={toggleStart}
          >
            Start
          </button>

          <div className="taskbar-tabs" aria-label="Open pages">
            {isWindowOpen && (
              <button type="button" className="task-tab win95-inset" onClick={() => playUiSound('click')}>
                {title}
              </button>
            )}
          </div>

          <div className="taskbar-clock win95-inset" aria-label="System clock">
            {clock}
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App