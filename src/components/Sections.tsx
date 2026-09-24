import { useEffect, useRef, useState } from 'react'
import { CV_URL, certificates, education, experience, papers, profile, projects, tools, type Dict } from '../content'

type P = { t: Dict }

/** Tear line between sections: the ticket-stub perforation from DESIGN.md. */
function Perf() {
  return <div className="perf wrap" aria-hidden="true" />
}

const ext = { target: '_blank', rel: 'noreferrer' } as const

export function About({ t }: P) {
  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="wrap">
        <h2 id="about-title" className="kicker">
          {t.about.title}
        </h2>
        {/* one large statement carries the section; the facts sit beside it as its evidence */}
        <div className="about-grid">
          <p className="lead">{t.about.lead}</p>
          <ul className="facts">
            {t.about.facts.map((f) => (
              <li key={f.label}>
                <a href={f.href} {...(f.href.startsWith('http') ? ext : {})}>
                  <strong>{f.value}</strong>
                  <span>{f.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <h3 className="now-title">{t.about.nowTitle}</h3>
        <dl className="now">
          {t.about.now.map((n) => (
            <div key={n.k}>
              <dt>{n.k}</dt>
              <dd>{n.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

function Stub({ n, admit }: { n: number; admit: string }) {
  return (
    <div className="stub" aria-hidden="true">
      <span className="stub-no">{String(n).padStart(2, '0')}</span>
      <span className="stub-admit">{admit}</span>
    </div>
  )
}

export function Projects({ t }: P) {
  const [lead, ...rest] = projects
  const pair = rest.slice(0, 2)
  const rows = rest.slice(2)
  return (
    <section id="projects" className="projects" aria-labelledby="projects-title">
      <Perf />
      <div className="wrap">
        <div className="split-head">
          <h2 id="projects-title">{t.projects.title}</h2>
          <p>{t.projects.body}</p>
        </div>

        {/* size follows weight: the product in daily use gets the full ticket, flagships a half, the rest a row */}
        <article className="ticket ticket-lg">
          <div className="ticket-main">
            <p className="ticket-cat">
              {lead.cat}
              {lead.live && <span className="live">{t.projects.live}</span>}
            </p>
            <h3>{lead.name}</h3>
            <p className="ticket-desc">{lead.desc}</p>
            <p className="stack">{lead.stack.join(' / ')}</p>
            <div className="ticket-links">
              {lead.live && (
                <a className="btn" href={lead.live} {...ext}>
                  {t.projects.openLive} <span aria-hidden="true">↗</span>
                </a>
              )}
              <a className="text-link" href={lead.url} {...ext}>
                {t.projects.source}
              </a>
            </div>
          </div>
          <Stub n={1} admit={t.projects.admit} />
        </article>

        <div className="ticket-pair">
          {pair.map((p, i) => (
            <article className="ticket" key={p.name}>
              <div className="ticket-main">
                <p className="ticket-cat">{p.cat}</p>
                <h3>
                  <a href={p.url} {...ext}>
                    {p.name}
                  </a>
                </h3>
                <p className="ticket-desc">{p.desc}</p>
                <p className="stack">{p.stack.join(' / ')}</p>
              </div>
              <Stub n={i + 2} admit={t.projects.admit} />
            </article>
          ))}
        </div>

        <ol className="ticket-rows" start={4}>
          {rows.map((p, i) => (
            <li key={p.name}>
              <span className="row-no" aria-hidden="true">
                {String(i + 4).padStart(2, '0')}
              </span>
              <div className="row-main">
                <h3>
                  <a href={p.url} {...ext}>
                    {p.name}
                  </a>
                </h3>
                <p>{p.desc}</p>
              </div>
              <p className="row-meta">
                {p.cat}
                <br />
                <span className="stack">{p.stack.join(' / ')}</span>
              </p>
            </li>
          ))}
        </ol>

        <div className="more">
          <p>{t.projects.also}</p>
          <a className="text-link" href={`${profile.github}?tab=repositories`} {...ext}>
            {t.projects.all} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export function Research({ t }: P) {
  return (
    <section id="research" className="research" aria-labelledby="research-title">
      <Perf />
      {/* heading column stays put while the papers scroll past it */}
      <div className="wrap research-grid">
        <div className="research-head">
          <h2 id="research-title">{t.research.title}</h2>
          <p>{t.research.body}</p>
        </div>
        <ol className="talks">
          {papers.map((p) => (
            <li key={p.title} className="talk">
              <span className="talk-year" aria-hidden="true">
                {p.year}
              </span>
              <div>
                <p className="talk-when">
                  {p.when} · {p.published ? t.research.published : t.research.submission}
                </p>
                <h3>{p.title}</h3>
                <p className="talk-meta">{p.meta}</p>
                <a className="text-link" href={p.url} {...ext}>
                  {p.published ? t.research.read : t.research.notebooks} <span aria-hidden="true">↗</span>
                </a>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function Experience({ t }: P) {
  const list = useRef<HTMLOListElement>(null)

  // The rule fills up to the middle of the screen, so the reader sees where they are in the chronology.
  useEffect(() => {
    const el = list.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.setProperty('--fill', '1')
      return
    }
    let raf = 0
    const update = () => {
      raf = 0
      const r = el.getBoundingClientRect()
      const f = (window.innerHeight * 0.55 - r.top) / r.height
      el.style.setProperty('--fill', String(Math.min(1, Math.max(0, f))))
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section id="experience" className="timeline" aria-labelledby="experience-title">
      <Perf />
      <div className="wrap">
        <div className="split-head">
          <h2 id="experience-title">{t.experience.title}</h2>
          <p>{t.experience.body}</p>
        </div>
        <ol className="tl" ref={list}>
          {experience.map((j) => (
            <li key={j.title + j.when} className={j.now ? 'is-now' : undefined}>
              <p className="tl-when">
                {j.when}
                {j.now && <span className="tl-now">{t.experience.now}</span>}
              </p>
              <div className="tl-body">
                <h3>{j.title}</h3>
                <p>{j.place}</p>
              </div>
              <p className="tl-track">{t.experience.tracks[j.track]}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** Degrees with the school's crest, then the courses taken alongside. */
export function Education({ t }: P) {
  return (
    <section id="education" className="education" aria-labelledby="education-title">
      <Perf />
      <div className="wrap">
        <div className="split-head">
          <h2 id="education-title">{t.education.title}</h2>
          <p>{t.education.body}</p>
        </div>
        <ul className="schools">
          {education.map((e) => (
            <li key={e.school} className="school">
              {e.logo ? (
                <img className="school-logo" src={e.logo} alt={`${e.school} logo`} width="96" height="96" loading="lazy" />
              ) : (
                // honest placeholder until the owner supplies the official crest
                <span className="school-logo school-logo-pending" title={t.education.logoPending}>
                  {e.initials}
                </span>
              )}
              <div>
                <p className="school-when">
                  {e.when}
                  {e.now && <span className="tl-now">{t.experience.now}</span>}
                </p>
                <h3>{e.degree}</h3>
                <p className="school-name">{e.school}</p>
                <ul className="school-notes">
                  {e.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        <h3 className="courses-title">{t.education.coursesTitle}</h3>
        <ul className="certs">
          {certificates.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function Tools({ t }: P) {
  return (
    <section id="tools" className="tools" aria-labelledby="tools-title">
      <Perf />
      <div className="wrap tools-grid">
        <div>
          <h2 id="tools-title" className="h2-sm">
            {t.tools.title}
          </h2>
          {tools.map((group, i) => (
            <div className="tool-group" key={t.tools.groups[i]}>
              <h3>{t.tools.groups[i]}</h3>
              <ul className="inline-list">
                {group.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

type CopyState = 'idle' | 'copied' | 'failed'

export function Contact({ t }: P) {
  const [copy, setCopy] = useState<CopyState>('idle')
  const onCopy = () => {
    const done = (s: CopyState) => {
      setCopy(s)
      setTimeout(() => setCopy('idle'), 2400)
    }
    if (!navigator.clipboard) return done('failed')
    navigator.clipboard.writeText(profile.email).then(
      () => done('copied'),
      () => done('failed'),
    )
  }
  const links = [
    { k: 'LinkedIn', v: 'ihya-nashirudin-abrar', href: profile.linkedin },
    { k: 'GitHub', v: 'ihyaabrar', href: profile.github },
    { k: 'Instagram', v: '@ihyaabrar', href: profile.instagram },
    { k: 'ORCID', v: profile.orcidId, href: profile.orcid },
  ]
  return (
    <section id="contact" className="contact" aria-labelledby="contact-title">
      <div className="wrap">
        {/* the only dark block on the page: it is the pass itself, the same black as the ID card */}
        <div className="pass">
          <div className="pass-main">
            <h2 id="contact-title">
              {t.contact.title}
              <span>.</span>
            </h2>
            <p>{t.contact.body}</p>
            <div className="pass-email">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <button className="copy" type="button" onClick={onCopy}>
                {copy === 'copied' ? t.contact.copied : t.contact.copy}
              </button>
            </div>
            <a className="text-link pass-cv" href={CV_URL} download>
              {t.contact.cv}
            </a>
            <p className="copy-note" role="status">
              {copy === 'failed' ? t.contact.copyFailed : ''}
            </p>
          </div>
          <ul className="pass-stub">
            {links.map((l) => (
              <li key={l.k}>
                <a href={l.href} {...ext}>
                  <span className="k">{l.k}</span>
                  <span className="v">
                    {l.v} <span aria-hidden="true">↗</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
