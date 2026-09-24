import { Component, lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { CV_URL, type Dict } from '../content'
import { CARD_ANCHOR, CARD_H, CARD_W, CLASP, RAIL_INSET, RIG_DEPTH, REACH, SHADOW_SHIFT, STRAP_W, drawFront, loadCardAssets } from '../lib/cardArt'

const Lanyard = lazy(() => import('./Lanyard'))

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The card drawn flat, placed where the 3D rig hangs it at rest, with the shadow the rig's light
 * throws. It shows instantly and stays as the fallback if WebGL fails.
 */
function Poster({ x, ppu, sub, location, hidden }: { x: number; ppu: number; sub: string; location: string; hidden: boolean }) {
  const card = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let alive = true
    loadCardAssets().then((img) => {
      if (!alive || !card.current) return
      card.current.replaceChildren(drawFront(img, sub, location))
    })
    return () => {
      alive = false
    }
  }, [sub, location])
  const u = (n: number) => `${n * ppu}px`
  const tie = RAIL_INSET + REACH // strap end, top of the clamp
  const y = (local: number) => u(tie + CARD_ANCHOR - local) // card-local height → px from the top
  const c = CLASP
  const shadow = `drop-shadow(${u(SHADOW_SHIFT.x)} ${u(-SHADOW_SHIFT.y)} ${u(0.14)} rgba(0, 0, 0, 0.26))`
  return (
    <div className={'poster' + (hidden ? ' is-hidden' : '')} style={{ left: x }}>
      <div className="poster-strap" style={{ top: u(RAIL_INSET), height: u(REACH + 0.01), width: u(STRAP_W) }} />
      <div className="poster-ring" style={{ top: y(c.ringY), height: u(c.ringR), width: u(c.ringR * 2) }} />
      <div className="poster-clamp" style={{ top: y(c.clampY + c.clampH / 2), height: u(c.clampH), width: u(STRAP_W + 0.02) }} />
      <div className="poster-swivel" style={{ top: y(c.swivelTop), height: u(c.swivelTop - c.swivelBottom), width: u(0.044) }} />
      <div className="poster-card" ref={card} style={{ top: y(CARD_H / 2), width: u(CARD_W), height: u(CARD_H), filter: shadow }} />
      {/* the hook shank lies on the card's face and disappears into the slot */}
      <div className="poster-hook" style={{ top: y(c.swivelBottom), height: u(c.swivelBottom - c.hookBottom + 0.02), width: u(0.026) }} />
    </div>
  )
}

type Status = 'poster' | 'ready' | 'failed'

export default function Hero({ t, dark }: { t: Dict; dark: boolean }) {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const [anchor, setAnchor] = useState({ frac: 0.72, px: 0 })
  const [ppu, setPpu] = useState(168)
  const [active, setActive] = useState(true)
  const [flipped, setFlipped] = useState(false)
  const [status, setStatus] = useState<Status>(() => (webglAvailable() ? 'poster' : 'failed'))
  const [load3d, setLoad3d] = useState(false)

  // Align the strap with the card slot in the layout, and size the card per breakpoint.
  useEffect(() => {
    const box = canvasRef.current
    const slot = slotRef.current
    const hero = heroRef.current
    const cta = ctaRef.current
    if (!box || !slot || !hero || !cta) return
    let raf = 0
    const measure = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        // the canvas reaches up behind the header to the top of the page
        hero.style.setProperty('--lift', `${hero.offsetTop}px`)
        const b = box.getBoundingClientRect()
        const s = slot.getBoundingClientRect()
        const c = cta.getBoundingClientRect()
        // the hint under the card sits on the same line as the buttons
        slot.style.setProperty('--hint-top', `${c.top - s.top}px`)
        const frac = Math.round(((s.left + s.width / 2 - b.left) / b.width) * 200) / 200
        setAnchor({ frac, px: frac * b.width })
        // phones and tablets: as large as fits the card area; laptops: as large as fits above the buttons
        const room = b.width < 900 ? s.bottom - b.top - 56 : c.top - b.top - 36
        setPpu(Math.round(Math.min(b.width < 560 ? 124 : b.width < 900 ? 138 : 200, Math.max(90, room / RIG_DEPTH))))
      })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    ro.observe(cta.parentElement!) // the copy reflows when its fonts arrive
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  // The 3D chunk (three.js + Rapier, about 1 MB) waits until the page has loaded and the browser is idle.
  useEffect(() => {
    if (status === 'failed') return
    const hasIdle = typeof window.requestIdleCallback === 'function' // missing in Safari
    let idle = 0
    const start = () => {
      idle = hasIdle ? requestIdleCallback(() => setLoad3d(true), { timeout: 2500 }) : window.setTimeout(() => setLoad3d(true), 300)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      window.removeEventListener('load', start)
      if (hasIdle) cancelIdleCallback(idle)
      else clearTimeout(idle)
    }
  }, [])

  // Stop rendering while the hero is scrolled away.
  useEffect(() => {
    const box = canvasRef.current
    if (!box) return
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { rootMargin: '100px' })
    io.observe(box)
    return () => io.disconnect()
  }, [])

  return (
    <section className="hero" ref={heroRef} aria-labelledby="hero-name">
      {/* the card repeats the contact details below, so it stays out of the accessibility tree */}
      <div
        className="hero-canvas"
        ref={canvasRef}
        aria-hidden="true"
        // centre of the resting card: the dark theme's spotlight is aimed here
        style={{ '--spot-x': `${anchor.px}px`, '--spot-y': `${(RAIL_INSET + REACH + CARD_ANCHOR) * ppu}px` } as CSSProperties}
      >
        {load3d && status !== 'failed' && (
          <Boundary onError={() => setStatus('failed')}>
            <Suspense fallback={null}>
              <Lanyard
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
                onReady={() => setStatus('ready')}
                sub={t.card.sub}
                location={t.card.location}
                anchorX={anchor.frac}
                dark={dark}
                ppu={ppu}
                active={active}
              />
            </Suspense>
          </Boundary>
        )}
        {anchor.px > 0 && <Poster x={anchor.px} ppu={ppu} sub={t.card.sub} location={t.card.location} hidden={status === 'ready'} />}
      </div>

      <div className="wrap hero-grid">
        <div className="hero-copy">
          {/* the name is the headline; the full stop takes the logo's orange */}
          <h1 id="hero-name" className="hero-name">
            <span>Ihya' Nashirudin</span>{' '}
            <span>
              Abrar<i>.</i>
            </span>
          </h1>
          <p className="hero-title">
            {t.hero.titleA}
            <em>{t.hero.titleB}</em>
          </p>
          <p className="hero-body">{t.hero.body}</p>
          <p className="hero-status">{t.hero.status}</p>
          <div className="cta" ref={ctaRef}>
            <a className="btn" href="#projects">
              {t.hero.ctaPrimary}
            </a>
            <a className="text-link" href={CV_URL} download>
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>

        {/* instructions live under the card they describe */}
        <div className="card-slot" ref={slotRef}>
          {status === 'ready' && (
            <div className="hint-row">
              <p className="hint">{t.hero.hint}</p>
              {/* keyboard route to the flip; it only becomes visible when focused */}
              <button className="flip-btn" type="button" aria-pressed={flipped} onClick={() => setFlipped((f) => !f)}>
                {t.hero.flip}
              </button>
            </div>
          )}
          {status === 'failed' && <p className="hint hint-row">{t.hero.failed}</p>}
        </div>
      </div>
    </section>
  )
}
