import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import '@/styles/landing.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Community', href: '#community' },
  { label: 'About', href: '#about' },
]

interface Testimonial {
  quote: string
  accent: string
  name: string
  role: string
  avatarClass: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "ConnectUni opened doors I didn't even know existed. My mentor helped me land my first tech role straight out of university.",
    accent: "opened doors I didn't even know existed",
    name: 'Aisha Mensah',
    role: 'CS Graduate · University of Ghana',
    avatarClass: 'lp-av-1',
  },
  {
    quote: 'As an alumni, giving back through ConnectUni has been seamless and impactful. I love watching students grow through mentorship.',
    accent: 'seamless and impactful',
    name: 'James Okonkwo',
    role: 'Software Engineer · Alumni Mentor',
    avatarClass: 'lp-av-2',
  },
  {
    quote: 'The community and events features completely transformed how I network. I got my internship through a connection I made on ConnectUni.',
    accent: 'completely transformed',
    name: 'Priya Sharma',
    role: 'Engineering Student · University of Lagos',
    avatarClass: 'lp-av-3',
  },
]

const BAR_HEIGHTS = [38, 62, 44, 88, 68, 28, 52]
const BAR_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateWorldDots(): Array<{ x: number; y: number }> {
  const dots: Array<{ x: number; y: number }> = []
  const sp = 30

  // [xMin, xMax, yMin, yMax] in a 1200×600 coordinate space
  const regions: [number, number, number, number][] = [
    [95, 315, 75, 275],   // North America
    [185, 295, 305, 545], // South America
    [425, 580, 70, 210],  // Europe
    [435, 625, 205, 495], // Africa
    [575, 690, 155, 310], // Middle East
    [665, 795, 165, 335], // South Asia
    [745, 970, 60, 300],  // East Asia
    [785, 935, 295, 420], // SE Asia
    [845, 1010, 365, 520],// Australia
    [295, 410, 30, 130],  // Greenland
    [610, 970, 30, 200],  // Russia / Siberia
  ]

  for (const [x0, x1, y0, y1] of regions) {
    for (let x = x0; x <= x1; x += sp) {
      for (let y = y0; y <= y1; y += sp) {
        const jx = (Math.abs(x * 7 + y * 3) % 10) - 5
        const jy = (Math.abs(x * 5 + y * 11) % 10) - 5
        dots.push({ x: x + jx, y: y + jy })
      }
    }
  }

  return dots
}

function highlightAccent(quote: string, accent: string): ReactNode {
  const idx = quote.indexOf(accent)
  if (idx === -1) return quote
  return (
    <>
      {quote.slice(0, idx)}
      <span className="accent">{accent}</span>
      {quote.slice(idx + accent.length)}
    </>
  )
}

// ─── SVG Inline icons ─────────────────────────────────────────────────────────

function IconArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 13L13 3M13 3H6M13 3V10" />
    </svg>
  )
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3l5 5-5 5" />
    </svg>
  )
}

function IconMenu({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [tIdx, setTIdx] = useState(0)
  const [tState, setTState] = useState<'idle' | 'exiting' | 'entering'>('idle')
  const [whyPage, setWhyPage] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const whyRef = useRef<HTMLDivElement>(null)

  // ── Nav scroll effect ──────────────────────────────────────────────────────
  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handle, { passive: true })
    return () => window.removeEventListener('scroll', handle)
  }, [])

  // ── Scroll-triggered reveal animations ────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    )

    container.querySelectorAll('.lp-reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // ── Close drawer on desktop resize ────────────────────────────────────────
  useEffect(() => {
    const handle = () => { if (window.innerWidth > 768) setMobileOpen(false) }
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  // ── Why section scroll page tracking ──────────────────────────────────────
  useEffect(() => {
    const el = whyRef.current
    if (!el) return
    const handle = () => {
      const cardW = 400
      setWhyPage(Math.min(4, Math.round(el.scrollLeft / cardW)))
    }
    el.addEventListener('scroll', handle, { passive: true })
    return () => el.removeEventListener('scroll', handle)
  }, [])

  // ── Testimonial cycling ────────────────────────────────────────────────────
  const cycleTestimonial = useCallback(
    (dir: 1 | -1) => {
      if (tState !== 'idle') return
      setTState('exiting')
      setTimeout(() => {
        setTIdx((i) => (i + dir + TESTIMONIALS.length) % TESTIMONIALS.length)
        setTState('entering')
        requestAnimationFrame(() => requestAnimationFrame(() => setTState('idle')))
      }, 280)
    },
    [tState],
  )

  // ── Why section scroll ────────────────────────────────────────────────────
  const scrollWhy = useCallback((dir: 1 | -1) => {
    whyRef.current?.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }, [])

  const worldDots = useMemo(() => generateWorldDots(), [])

  const t = TESTIMONIALS[tIdx]
  const tClass = [
    'lp-testimonial-transition',
    tState === 'exiting' ? 'exiting' : tState === 'entering' ? 'entering' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="lp" ref={containerRef}>

      {/* ═══ Nav ═══════════════════════════════════════════════════════════ */}
      <header className="lp-nav-wrap">
        <nav
          className={`lp-nav${scrolled ? ' scrolled' : ''}`}
          aria-label="Main navigation"
        >
          <a href="#" className="lp-logo" aria-label="ConnectUni home">
            <span className="lp-logo-mark" aria-hidden="true" />
            ConnectUni
          </a>

          <ul className="lp-nav-links" role="list">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="lp-nav-right">
            <Link to="/login" className="lp-btn lp-btn-ghost">
              Sign in
            </Link>
            <Link to="/signup" className="lp-btn lp-btn-primary">
              Get started
              <span className="lp-arrow-circle" aria-hidden="true">
                <IconArrowUpRight className="lp-icon lp-icon-sm" />
              </span>
            </Link>
            <button
              className="lp-mobile-menu-btn"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-drawer"
              onClick={() => setMobileOpen(true)}
            >
              <IconMenu className="lp-icon" />
            </button>
          </div>
        </nav>
      </header>

      <main>

        {/* ═══ Hero ══════════════════════════════════════════════════════════ */}
        <section className="lp-hero" id="hero" aria-labelledby="hero-heading">
          <div className="lp-wrap">
            <div className="lp-hero-grid">

              {/* Left — copy */}
              <div>
                <span className="lp-eyebrow lp-reveal">Your university, connected</span>

                <h1
                  className="lp-display-xl lp-reveal lp-reveal-delay-1"
                  id="hero-heading"
                >
                  Where students<br />
                  <span className="accent">meet the alumni</span><br />
                  who came before
                </h1>

                <p className="lp-hero-sub lp-reveal lp-reveal-delay-2">
                  ConnectUni bridges the gap between students and alumni — enabling
                  mentorship, career guidance, and community across universities.
                </p>

                <div className="lp-hero-ctas lp-reveal lp-reveal-delay-3">
                  <Link to="/signup" className="lp-btn lp-btn-primary">
                    Join ConnectUni
                    <span className="lp-arrow-circle" aria-hidden="true">
                      <IconArrowUpRight className="lp-icon lp-icon-sm" />
                    </span>
                  </Link>
                  <a href="#features" className="lp-btn lp-btn-outline">
                    See how it works
                  </a>
                </div>

                <div className="lp-hero-meta lp-reveal lp-reveal-delay-4">
                  <div>
                    <div className="lp-stat-num">12k+</div>
                    <span className="lp-stat-unit">Students connected</span>
                  </div>
                  <div>
                    <div className="lp-stat-num">3.5k</div>
                    <span className="lp-stat-unit">Alumni mentors</span>
                  </div>
                  <div>
                    <div className="lp-stat-num">47</div>
                    <span className="lp-stat-unit">Universities</span>
                  </div>
                </div>
              </div>

              {/* Right — image placeholder with floating UI cards */}
              <div style={{ position: 'relative' }}>
                <div className="lp-hero-image lp-reveal" role="img" aria-label="Platform preview">
                  <div className="ph-stripes" aria-hidden="true" />
                  <div className="ph-label lp-mono" aria-hidden="true">
                    student × alumni<br />connection platform
                  </div>
                </div>

                {/* Floating stat card */}
                <div className="lp-floating-stat" aria-hidden="true">
                  <div className="row">
                    <span className="num">84</span>
                    <span className="tag">+12% this month</span>
                  </div>
                  <div className="label">Mentorship sessions this week</div>
                  <div className="lp-seg-bar">
                    {[false, false, true, true, true, false, false].map((on, i) => (
                      <div key={i} className={`lp-seg${on ? ' on' : ''}`} />
                    ))}
                  </div>
                  <div className="week-labels">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                </div>

                {/* Floating members pill */}
                <div className="lp-floating-members" aria-hidden="true">
                  <div className="lp-avatar-stack">
                    <div className="lp-av lp-av-1" />
                    <div className="lp-av lp-av-2" />
                    <div className="lp-av lp-av-3" />
                    <div className="lp-av lp-av-4" />
                    <div className="lp-av lp-av-5">+</div>
                  </div>
                  <div className="text">
                    2,400+ active
                    <small>this week</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ About ═════════════════════════════════════════════════════════ */}
        <section className="lp-about" id="about" aria-labelledby="about-heading">
          <div className="lp-wrap">
            <div className="lp-about-grid">

              {/* Left — stats */}
              <div>
                <span className="lp-eyebrow lp-reveal">By the numbers</span>

                <div className="lp-reveal lp-reveal-delay-1" style={{ marginTop: '28px' }}>
                  <div className="lp-stat-num">89%</div>
                  <span className="lp-stat-unit" style={{ marginTop: '8px', display: 'block' }}>
                    of mentored students report improved career clarity
                  </span>
                </div>

                <div className="lp-divider lp-reveal lp-reveal-delay-2">
                  Platform launched 2023
                </div>

                <div className="lp-reveal lp-reveal-delay-3">
                  <div className="lp-stat-num">
                    4.8
                    <span style={{ fontSize: '28px', fontWeight: 700 }}>★</span>
                  </div>
                  <span className="lp-stat-unit" style={{ marginTop: '8px', display: 'block' }}>
                    Average mentor rating
                  </span>
                </div>
              </div>

              {/* Right — description */}
              <div>
                <span className="lp-eyebrow lp-reveal">What is ConnectUni?</span>

                <h2
                  className="lp-display-m lp-reveal lp-reveal-delay-1"
                  id="about-heading"
                  style={{ marginTop: '16px' }}
                >
                  The platform built to close the gap between university and career
                </h2>

                <p className="lp-body-l lp-reveal lp-reveal-delay-2" style={{ marginTop: '20px' }}>
                  ConnectUni is a structured mentorship and networking platform
                  designed specifically for African university students and alumni.
                  We make it easy for students to find the right mentor, connect
                  with professionals in their field, and participate in a vibrant
                  alumni community.
                </p>

                <p className="lp-body lp-reveal lp-reveal-delay-3" style={{ marginTop: '16px' }}>
                  From one-on-one mentorship to community events and career
                  resources — everything students need to transition confidently
                  from campus to career is in one place.
                </p>

                <div className="lp-reveal lp-reveal-delay-4" style={{ marginTop: '32px' }}>
                  <Link to="/signup" className="lp-btn lp-btn-outline">
                    Start for free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Roles ═════════════════════════════════════════════════════════ */}
        <section
          className="lp-roles"
          id="features"
          aria-labelledby="roles-heading"
        >
          <div className="lp-wrap">
            <div className="lp-roles-header">
              <div>
                <span className="lp-eyebrow lp-reveal">Who it's for</span>
                <h2
                  className="lp-display-l lp-reveal lp-reveal-delay-1"
                  id="roles-heading"
                  style={{ marginTop: '12px' }}
                >
                  Built for every<br />university role
                </h2>
              </div>
              <p className="lp-body-l lp-reveal lp-reveal-delay-2">
                Whether you're starting out, giving back, or managing your
                institution — ConnectUni adapts to your role.
              </p>
            </div>

            <div className="lp-roles-grid">
              {/* Students */}
              <article className="lp-role-card photo lp-reveal" tabIndex={0}>
                <div className="ph-bg lp-ph-students" aria-hidden="true">
                  <div className="lp-ph-stripes" />
                </div>
                <div className="top">
                  <span className="index lp-mono">01</span>
                  <button className="lp-plus-btn" aria-label="Learn more about Students" tabIndex={-1}>
                    <IconPlus className="lp-icon" />
                  </button>
                </div>
                <div className="bottom">
                  <div className="count lp-mono">8,200+ students</div>
                  <div className="role-name">Students</div>
                  <p className="role-desc">
                    Find mentors, explore careers, join events and build your
                    professional network before graduation.
                  </p>
                </div>
              </article>

              {/* Alumni */}
              <article className="lp-role-card photo lp-reveal lp-reveal-delay-1" tabIndex={0}>
                <div className="ph-bg lp-ph-alumni" aria-hidden="true">
                  <div className="lp-ph-stripes" />
                </div>
                <div className="top">
                  <span className="index lp-mono">02</span>
                  <button className="lp-plus-btn" aria-label="Learn more about Alumni" tabIndex={-1}>
                    <IconPlus className="lp-icon" />
                  </button>
                </div>
                <div className="bottom">
                  <div className="count lp-mono">3,500+ alumni</div>
                  <div className="role-name">Alumni</div>
                  <p className="role-desc">
                    Share your journey, mentor the next generation, and stay
                    connected to your university community.
                  </p>
                </div>
              </article>

              {/* Professionals */}
              <article className="lp-role-card photo lp-reveal lp-reveal-delay-2" tabIndex={0}>
                <div className="ph-bg lp-ph-pros" aria-hidden="true">
                  <div className="lp-ph-stripes" />
                </div>
                <div className="top">
                  <span className="index lp-mono">03</span>
                  <button className="lp-plus-btn" aria-label="Learn more about Professionals" tabIndex={-1}>
                    <IconPlus className="lp-icon" />
                  </button>
                </div>
                <div className="bottom">
                  <div className="count lp-mono">1,200+ professionals</div>
                  <div className="role-name">Professionals</div>
                  <p className="role-desc">
                    Recruit top emerging talent, engage with universities, and
                    build a pipeline of future hires.
                  </p>
                </div>
              </article>

              {/* Admins */}
              <article className="lp-role-card mint lp-reveal lp-reveal-delay-3" tabIndex={0}>
                <div className="top">
                  <span className="index lp-mono">04</span>
                  <button className="lp-plus-btn" aria-label="Learn more about Admins" tabIndex={-1}>
                    <IconPlus className="lp-icon" />
                  </button>
                </div>
                <div className="bottom">
                  <div className="count lp-mono">47 institutions</div>
                  <div className="role-name">Admins</div>
                  <p className="role-desc">
                    Manage your institution's presence, oversee mentorship
                    programmes, and track outcomes across your community.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* ═══ Why ═══════════════════════════════════════════════════════════ */}
        <section
          className="lp-why"
          id="how-it-works"
          aria-labelledby="why-heading"
        >
          <div className="lp-wrap">
            <div className="lp-why-header">
              <div>
                <span className="lp-eyebrow lp-reveal">Why ConnectUni</span>
                <h2
                  className="lp-display-l lp-reveal lp-reveal-delay-1"
                  id="why-heading"
                  style={{ marginTop: '12px' }}
                >
                  Everything you need<br />in one place
                </h2>
              </div>

              <div
                className="lp-why-pagination lp-reveal lp-reveal-delay-2"
                role="group"
                aria-label="Feature navigation"
              >
                <span className="lp-page-counter" aria-live="polite" aria-atomic="true">
                  <span className="current">{String(whyPage + 1).padStart(2, '0')}</span>
                  {' / 05'}
                </span>
                <div className="lp-pag-arrows">
                  <button
                    className="lp-arrow-btn neutral prev"
                    onClick={() => scrollWhy(-1)}
                    aria-label="Previous feature"
                  >
                    <IconChevronLeft className="lp-icon lp-icon-sm" />
                  </button>
                  <button
                    className="lp-arrow-btn"
                    onClick={() => scrollWhy(1)}
                    aria-label="Next feature"
                  >
                    <IconChevronRight className="lp-icon lp-icon-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="lp-why-scroll"
            ref={whyRef}
            role="list"
            aria-label="Platform features"
          >
            {/* Card A — Verified Mentors */}
            <div className="lp-why-card a lp-reveal" role="listitem">
              <div className="top">
                <div className="lp-icon-box" aria-hidden="true">
                  <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="8" cy="8" r="3" />
                    <path d="M4 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
                    <circle cx="16" cy="8" r="3" />
                    <path d="M12 20c0-2.2 1.8-4 4-4s4 1.8 4 4" />
                  </svg>
                </div>
                <span className="lp-tag-pill">Mentorship</span>
              </div>
              <div>
                <h3>Verified Mentors from Industry</h3>
                <p>
                  Every mentor is a verified professional or alumni. Browse by
                  industry, role, and availability to find your perfect career
                  guide.
                </p>
              </div>
            </div>

            {/* Card B — Careers (dark) */}
            <div className="lp-why-card b lp-reveal lp-reveal-delay-1" role="listitem">
              <div className="top">
                <div className="lp-icon-box" aria-hidden="true">
                  <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 12v4M10 14h4" />
                  </svg>
                </div>
                <span className="lp-tag-pill filled">Careers</span>
              </div>
              <div>
                <h3 style={{ color: 'var(--lp-white)' }}>Job Board &amp; Career Resources</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Browse curated job listings, access industry guides, and get
                  your CV reviewed — all tailored for African university
                  graduates.
                </p>
              </div>
            </div>

            {/* Card C — Events (mint) */}
            <div className="lp-why-card c lp-reveal lp-reveal-delay-2" role="listitem">
              <div className="top">
                <div className="lp-icon-box" aria-hidden="true">
                  <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <span className="lp-tag-pill">Events</span>
              </div>
              <div>
                <h3>Online &amp; Campus Events</h3>
                <p>
                  Discover workshops, networking sessions, and alumni talks.
                  RSVP, get reminders, and connect with attendees before the
                  event.
                </p>
              </div>
            </div>

            {/* Card D — Community (white border) */}
            <div className="lp-why-card d lp-reveal lp-reveal-delay-3" role="listitem">
              <div className="top">
                <div className="lp-icon-box" aria-hidden="true">
                  <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <span className="lp-tag-pill">Community</span>
              </div>
              <div>
                <h3>Thriving Alumni Community</h3>
                <p>
                  Post updates, share opportunities, ask questions, and build
                  lasting connections in your university's alumni network.
                </p>
              </div>
            </div>

            {/* Card E — Notifications */}
            <div className="lp-why-card e lp-reveal lp-reveal-delay-4" role="listitem">
              <div className="top">
                <div className="lp-icon-box" aria-hidden="true">
                  <svg className="lp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <span className="lp-tag-pill">Smart Alerts</span>
              </div>
              <div>
                <h3>Real-time Notifications</h3>
                <p>
                  Never miss a mentorship reply, event update, or community
                  post. Smart notifications keep you connected without the
                  noise.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Dashboard Preview ═════════════════════════════════════════════ */}
        <section className="lp-dash-preview" aria-labelledby="dashboard-heading">
          <div className="lp-wrap">
            <div className="lp-dash-preview-header lp-reveal">
              <span className="lp-eyebrow">The platform</span>
              <h2
                className="lp-display-l"
                id="dashboard-heading"
                style={{ marginTop: '12px' }}
              >
                A dashboard built for growth
              </h2>
              <p
                className="lp-body-l"
                style={{ maxWidth: '480px', margin: '16px auto 0' }}
              >
                Track mentorship progress, upcoming events, and community
                engagement in a clean, focused interface.
              </p>
            </div>

            <div style={{ position: 'relative' }}>
              <div className="lp-dash-wrap lp-reveal lp-reveal-delay-1">
                <div className="lp-dash-inner">
                  <div className="lp-dash-header-row">
                    <div className="lp-dash-title">
                      Student Dashboard
                      <small>April 2026</small>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="lp-tag-pill">4 active sessions</span>
                      <span className="lp-tag-pill filled">2 new matches</span>
                    </div>
                  </div>

                  <div className="lp-dash-body">
                    {/* Bar chart */}
                    <div className="lp-dash-chart-box">
                      <div
                        className="lp-small"
                        style={{ color: 'var(--lp-t2)', marginBottom: '4px' }}
                      >
                        Mentorship activity
                      </div>
                      <div className="lp-stat-num" style={{ fontSize: '28px' }}>
                        84 sessions
                      </div>
                      <div className="lp-bar-chart" aria-hidden="true">
                        {BAR_HEIGHTS.map((h, i) => (
                          <div
                            key={i}
                            className={`lp-bar${i === 3 ? ' on' : i === 4 ? ' mint-bar' : ''}`}
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="lp-bar-labels" aria-hidden="true">
                        {BAR_LABELS.map((l) => (
                          <span key={l}>{l}</span>
                        ))}
                      </div>
                    </div>

                    {/* Upcoming sessions */}
                    <div className="lp-dash-panel">
                      <div
                        className="lp-small"
                        style={{ color: 'var(--lp-t2)', marginBottom: '16px' }}
                      >
                        Upcoming sessions
                      </div>
                      <div className="lp-mini-rows">
                        {[
                          { name: 'Career Strategy', time: '2:00 PM', dot: '' },
                          { name: 'CV Review', time: '4:30 PM', dot: 'mint' },
                          { name: 'Industry Chat', time: 'Tomorrow', dot: 'lav' },
                        ].map((item) => (
                          <div key={item.name} className="lp-mini-row">
                            <div
                              className={`lp-dot${item.dot ? ` ${item.dot}` : ''}`}
                              aria-hidden="true"
                            />
                            <span className="lp-dot-name">{item.name}</span>
                            <span className="lp-dot-time">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active mentors — dark */}
                    <div className="lp-dash-panel dark">
                      <div
                        className="lp-small"
                        style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '16px' }}
                      >
                        Active mentors
                      </div>
                      <div className="lp-mini-rows">
                        {[
                          { name: 'Dr. K. Asante', time: 'Online' },
                          { name: 'M. Okonkwo', time: '1h ago' },
                          { name: 'P. Sharma', time: '3h ago' },
                        ].map((item) => (
                          <div key={item.name} className="lp-mini-row">
                            <div className="lp-dot" aria-hidden="true" />
                            <span className="lp-dot-name">{item.name}</span>
                            <span className="lp-dot-time">{item.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating match-score badge */}
              <div
                className="lp-floating-dash-stat lp-reveal lp-reveal-delay-2"
                aria-hidden="true"
              >
                <div
                  className="lp-small"
                  style={{ color: 'var(--lp-t2)', marginBottom: '8px' }}
                >
                  Match score
                </div>
                <div className="lp-stat-num" style={{ fontSize: '36px' }}>96%</div>
                <div className="lp-seg-bar" style={{ marginTop: '12px' }}>
                  {[true, true, true, true, true, false, false].map((on, i) => (
                    <div key={i} className={`lp-seg${on ? ' on' : ''}`} />
                  ))}
                </div>
                <div
                  className="lp-small"
                  style={{ marginTop: '8px', color: 'var(--lp-t2)' }}
                >
                  Mentor compatibility
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ Mission ═══════════════════════════════════════════════════════ */}
        <section className="lp-mission" aria-labelledby="mission-heading">
          <div className="lp-wrap">
            <div className="lp-mission-card lp-reveal">
              <span className="lp-eyebrow">Our mission</span>
              <div className="lp-divider-dot" aria-hidden="true" />
              <h2 className="lp-display-l" id="mission-heading">
                Every student deserves a<br />mentor who's been there
              </h2>
              <p className="lp-body-l">
                We believe the best career advice comes from people who've walked
                the same path. ConnectUni makes that connection happen — at scale.
              </p>
              <Link to="/signup" className="lp-pill-btn">
                Join ConnectUni today
                <span className="lp-arrow-circle" aria-hidden="true">
                  <IconArrowUpRight className="lp-icon lp-icon-sm" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ Testimonials ══════════════════════════════════════════════════ */}
        <section
          className="lp-testimonials"
          id="community"
          aria-labelledby="testimonials-heading"
        >
          {/* World map SVG background */}
          <svg
            className="lp-map-bg"
            viewBox="0 0 1200 600"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
          >
            {worldDots.map((d, i) => (
              <circle
                key={i}
                cx={d.x}
                cy={d.y}
                r="2"
                fill="var(--lp-charcoal)"
                opacity="0.12"
              />
            ))}
          </svg>

          {/* Decorative scattered avatars */}
          {[
            { style: { top: '15%', left: '8%' }, bg: 'linear-gradient(135deg,#f4c7a8,#d89a6b)' },
            { style: { top: '25%', right: '12%' }, bg: 'linear-gradient(135deg,#c8b8e0,#9985c2)' },
            { style: { bottom: '30%', left: '15%' }, bg: 'linear-gradient(135deg,#d4e8b8,#a3c572)' },
            { style: { bottom: '20%', right: '8%' }, bg: 'linear-gradient(135deg,#f7d4c9,#e08b6f)' },
            { style: { top: '55%', left: '5%' }, bg: 'linear-gradient(135deg,#b8d4e8,#6b9ac2)' },
            { style: { top: '40%', right: '5%' }, bg: 'linear-gradient(135deg,#e8d4b8,#c29a6b)' },
          ].map((av, i) => (
            <div
              key={i}
              className="lp-scatter-av"
              style={{ ...av.style, background: av.bg }}
              aria-hidden="true"
            />
          ))}

          <div className="lp-testimonials-content">
            <div className="lp-wrap">
              <div className="lp-testimonials-header lp-reveal">
                <span className="lp-eyebrow">Community voices</span>
                <h2
                  className="lp-display-l"
                  id="testimonials-heading"
                  style={{ marginTop: '12px' }}
                >
                  What our community says
                </h2>
              </div>

              <div className={tClass} aria-live="polite" aria-atomic="true">
                <div className="lp-quote-card">
                  <div className="stars" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M8 1l1.8 3.6L14 5.5l-3 2.9.7 4.1L8 10.4l-3.7 2.1.7-4.1L2 5.5l4.2-.9L8 1z" />
                      </svg>
                    ))}
                  </div>

                  <blockquote>
                    "{highlightAccent(t.quote, t.accent)}"
                  </blockquote>

                  <div className="lp-qfoot">
                    <div className="person">
                      <div
                        className={`lp-av ${t.avatarClass}`}
                        style={{ width: '40px', height: '40px' }}
                        aria-hidden="true"
                      />
                      <div>
                        <div className="n">{t.name}</div>
                        <div className="r">{t.role}</div>
                      </div>
                    </div>

                    <div className="pagination">
                      <button
                        className="lp-arrow-btn neutral prev"
                        onClick={() => cycleTestimonial(-1)}
                        aria-label="Previous testimonial"
                        style={{ width: '36px', height: '36px' }}
                      >
                        <IconChevronLeft className="lp-icon lp-icon-sm" />
                      </button>
                      <span aria-label={`Testimonial ${tIdx + 1} of ${TESTIMONIALS.length}`}>
                        {String(tIdx + 1).padStart(2, '0')} / {String(TESTIMONIALS.length).padStart(2, '0')}
                      </span>
                      <button
                        className="lp-arrow-btn"
                        onClick={() => cycleTestimonial(1)}
                        aria-label="Next testimonial"
                        style={{ width: '36px', height: '36px' }}
                      >
                        <IconChevronRight className="lp-icon lp-icon-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ═══ Footer ════════════════════════════════════════════════════════ */}
      <footer className="lp-footer" aria-label="Site footer">
        <div className="lp-wrap">
          <div className="lp-footer-grid">

            {/* Brand */}
            <div className="lp-footer-brand">
              <a href="#" className="lp-logo" aria-label="ConnectUni home">
                <span className="lp-logo-mark" aria-hidden="true" />
                ConnectUni
              </a>
              <p>
                Bridging the gap between students and alumni across African
                universities.
              </p>
              <div
                className="lp-socials"
                style={{ marginTop: '24px' }}
                aria-label="Social media links"
              >
                <a href="#" aria-label="Follow on Twitter / X">
                  <svg className="lp-icon lp-icon-sm" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" aria-label="Follow on LinkedIn">
                  <svg className="lp-icon lp-icon-sm" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" aria-label="Follow on Instagram">
                  <svg className="lp-icon lp-icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Platform */}
            <nav className="lp-footer-col" aria-label="Platform links">
              <h4>Platform</h4>
              <ul>
                <li><Link to="/login">Sign in</Link></li>
                <li><Link to="/signup">Sign up</Link></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#how-it-works">How it works</a></li>
              </ul>
            </nav>

            {/* For you */}
            <nav className="lp-footer-col" aria-label="Role links">
              <h4>For you</h4>
              <ul>
                <li><a href="#features">Students</a></li>
                <li><a href="#features">Alumni</a></li>
                <li><a href="#features">Professionals</a></li>
                <li><a href="#features">Institutions</a></li>
              </ul>
            </nav>

            {/* Company */}
            <nav className="lp-footer-col" aria-label="Company links">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#community">Community</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact</a></li>
              </ul>
            </nav>

            {/* Newsletter */}
            <div className="lp-footer-col">
              <span className="lp-newsletter-label" id="newsletter-label">
                Stay in the loop
              </span>
              <form
                className="lp-newsletter"
                onSubmit={(e) => e.preventDefault()}
                aria-labelledby="newsletter-label"
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  aria-label="Email address for newsletter"
                />
                <button
                  type="submit"
                  className="lp-arrow-btn"
                  style={{ width: '40px', height: '40px' }}
                  aria-label="Subscribe to newsletter"
                >
                  <IconArrowUpRight className="lp-icon lp-icon-sm" />
                </button>
              </form>
            </div>
          </div>

          <div className="lp-footer-bot">
            <span>© 2026 ConnectUni. All rights reserved.</span>
            <div className="lp-footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ Mobile Drawer ═════════════════════════════════════════════════ */}
      {mobileOpen && (
        <div
          id="mobile-drawer"
          className="lp-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="lp-mobile-drawer-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="lp-mobile-drawer-panel">
            <div className="lp-mobile-drawer-header">
              <a
                href="#"
                className="lp-logo"
                onClick={() => setMobileOpen(false)}
              >
                <span className="lp-logo-mark" aria-hidden="true" />
                ConnectUni
              </a>
              <button
                className="lp-mobile-menu-btn"
                style={{ display: 'inline-flex' }}
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <IconClose className="lp-icon" />
              </button>
            </div>

            <ul className="lp-mobile-nav-links" role="list">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="lp-mobile-drawer-actions">
              <Link
                to="/login"
                className="lp-btn lp-btn-outline"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="lp-btn lp-btn-primary"
                onClick={() => setMobileOpen(false)}
              >
                Get started
                <span className="lp-arrow-circle" aria-hidden="true">
                  <IconArrowUpRight className="lp-icon lp-icon-sm" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
