'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, House, Lightbulb, Menu, MessageCircle, Phone, ShieldCheck, Sparkles, Star, Wrench, X, Zap, Lock, Shield, Loader2 } from 'lucide-react'
import AdminDashboard from '../components/AdminDashboard'
import { submitBookingRequest } from '../lib/api'

const phone = '9025249785'
const waMsg = encodeURIComponent("Hi! I’d like to enquire about your electrical services. Please let me know your availability.")
const wa = `https://wa.me/91${phone}?text=${waMsg}`

const services = [
  { icon: Lightbulb, title: 'House Wiring', text: 'Safe, neat rewiring and new electrical points for every room.' },
  { icon: Wrench, title: 'Repairs & Service', text: 'Fast help for switches, sockets, fans, tripping and short circuits.' },
  { icon: Zap, title: 'Inverter & UPS', text: 'Reliable backup power installation and practical maintenance.' },
  { icon: House, title: 'New Installation', text: 'Complete electrical setup for new homes, shops and offices.' },
]

const gallery = [
  { src: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85', alt: 'Electrician working on a home panel' },
  { src: 'https://images.unsplash.com/photo-1555963966-b7ae5404b6ed?auto=format&fit=crop&w=1200&q=85', alt: 'Electrical tools and wiring' },
  { src: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&w=1200&q=85', alt: 'Professional electrician in safety gear' },
]

const reviews = [
  { quote: 'Balaji came the same evening and fixed the fan wiring without making a mess. Very dependable service.', name: 'Suresh K.', place: 'Manalurpet' },
  { quote: 'Clear pricing, clean work and he explained everything simply. I recommend him for any home electrical work.', name: 'Meena R.', place: 'Nearby village' },
  { quote: 'Our shop wiring was completed on time. A skilled electrician who truly cares about safety.', name: 'Arun M.', place: 'Manalurpet' },
]

function SectionLabel({ children }) { return <p className="eyebrow"><span />{children}</p> }
function AppLink({ href, children, className = '', onClick }) { return <a href={href} className={className} onClick={onClick}>{children}</a> }

export default function Page() {
  const [showAdmin, setShowAdmin] = useState(false)
  const [menu, setMenu] = useState(false)
  const [selected, setSelected] = useState(null)
  const [review, setReview] = useState(0)
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    const close = (e) => e.key === 'Escape' && setSelected(null)
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  async function submit(e) {
    e.preventDefault()
    setApiError('')
    const data = new FormData(e.currentTarget)
    const name = data.get('name')
    const phoneVal = data.get('phone')
    const service = data.get('service')
    const date = data.get('date')

    const next = {}
    if (!name) next.name = 'Please enter your name.'
    if (!/^\d{10}$/.test(String(phoneVal).replace(/\D/g, ''))) next.phone = 'Enter a valid 10-digit number.'
    if (!service) next.service = 'Choose a service.'
    if (!date) next.date = 'Choose a preferred date.'
    setErrors(next)

    if (Object.keys(next).length > 0) return

    setSubmitting(true)

    try {
      // Direct API Submission to Backend Database
      await submitBookingRequest({ name, phone: phoneVal, service, date })
      setSent(true)
    } catch (err) {
      setApiError(err.message || 'Unable to save request to server database. Please check connection.')
    } finally {
      setSubmitting(false)
    }
  }

  if (showAdmin) {
    return <AdminDashboard onNavigateHome={() => setShowAdmin(false)} />
  }

  return <main>
      
    <div className="topbar">
      <div className="container topbar-inner">
        <span><Clock3 size={14} /> Available 7 days a week</span>
        <span className="top-location">Serving Your Area with Reliable Electrical Services</span>
        <AppLink href={`tel:${phone}`}><Phone size={14} /> {phone}</AppLink>
      </div>
    </div>

    <nav className="nav">
      <div className="container nav-inner">
        <AppLink href="#home" className="brand">
          <span className="brand-mark"><Zap size={19} fill="currentColor" /></span>
          <span>Balaji <span>Electrical<span> Solution</span> </span></span>
        </AppLink>
        <button className="menu-btn" onClick={() => setMenu(!menu)} aria-label="Toggle navigation" aria-expanded={menu}>
          {menu ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className={`nav-links ${menu ? 'open' : ''}`}>
          <AppLink href="#services" className="nav-link" onClick={() => setMenu(false)}>Services</AppLink>
          <AppLink href="#about" className="nav-link" onClick={() => setMenu(false)}>About us</AppLink>
          <AppLink href="#work" className="nav-link" onClick={() => setMenu(false)}>Our work</AppLink>
          <AppLink href="#book" className="nav-cta" onClick={() => setMenu(false)}>
            Book a visit <ArrowRight size={16} />
          </AppLink>
        </div>
      </div>
    </nav>

    <section id="home" className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="availability"><span className="pulse" />We’re Available for New Bookings</div>
          <h1>Powering homes.<br /><em>Protecting families.</em></h1>
          <p className="hero-text">Trusted electrical work by <strong>Balaji</strong> — from a quick repair to a complete home wiring, done safely and honestly.</p>
          <div className="hero-actions">
            <AppLink href={`tel:${phone}`} className="button button-primary"><Phone size={17} /> Call now</AppLink>
            <AppLink href={wa} target="_blank" rel="noopener noreferrer" className="button button-secondary"><MessageCircle size={18} /> WhatsApp us</AppLink>
          </div>
          <div className="hero-note">
            <div className="avatar-stack"><span>B</span><span>S</span><span>M</span><span>+</span></div>
            <span><strong>Trusted by 50+ Homes & Shops </strong><br /><small>Safe, reliable, and affordable</small></span>
          </div>
        </div>
        <div className="hero-image-wrap">
          <div className="hero-image"><img src={gallery[0].src} alt={gallery[0].alt} /></div>
          <div className="hero-badge"><ShieldCheck size={22} /><span><strong>Safety first</strong><small>Every job, every time</small></span></div>
          <div className="bolt-deco"><Zap size={36} fill="currentColor" /></div>
        </div>
      </div>
    </section>

    <section className="trust-strip">
      <div className="container trust-grid">
        <div><strong>5+</strong><span>Years of experience</span></div>
        <div><strong>100%</strong><span>Safety focused</span></div>
        <div><strong>24/7</strong><span>Emergency support</span></div>
        <div><strong>5.0 <Star size={16} fill="currentColor" /></strong><span>Customer rating</span></div>
      </div>
    </section>

    <section id="services" className="section services-section">
      <div className="container">
        <div className="section-head">
          <div><SectionLabel>What we do</SectionLabel><h2>Electrical work,<br /><em>done right.</em></h2></div>
          <p>From the first switch to the final connection, we bring careful workmanship and clear advice to every job.</p>
        </div>
        <div className="service-grid">
          {services.map(({ icon: Icon, title, text }) => 
            <article className="service-card" key={title}>
              <div>
                <div className="service-icon"><Icon size={22} /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <AppLink href="#book" className="text-link">Book this service <ArrowRight size={15} /></AppLink>
            </article>
          )}
        </div>
      </div>
    </section>

    <section id="about" className="section about-section">
      <div className="container about-grid">
        <div className="about-photo">
          <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=85" alt="Balaji Electricals technician at work" loading="lazy" />
          <div className="experience-card"><strong>5+</strong><span>years making<br />homes safer</span></div>
        </div>
        <div className="about-copy">
          <SectionLabel>Meet your electrician</SectionLabel>
          <h2>Local hands.<br /><em>Professional standards.</em></h2>
          <p>Hi, I&apos;m Balaji. I started this service because good electrical work should be easy to find, fairly priced, and built to last.</p>
          <p>Whether you&apos;re putting up a new fan or rewiring an entire house, I show up on time, explain what needs doing, and leave your space tidy.</p>
          <ul className="check-list">
            <li><Check size={16} /> Honest, upfront pricing</li>
            <li><Check size={16} /> Quality materials only</li>
            <li><Check size={16} /> Work that follows safety standards</li>
          </ul>
          <AppLink href="#book" className="button button-dark">Work with Balaji <ArrowRight size={17} /></AppLink>
        </div>
      </div>
    </section>

    <section id="work" className="section work-section">
      <div className="container">
        <div className="section-head">
          <div><SectionLabel>Recent work</SectionLabel><h2>A few things we&apos;ve<br /><em>powered up.</em></h2></div>
          <p>Good work speaks for itself. Here&apos;s a look at the care we put into every installation.</p>
        </div>
        <div className="gallery-grid">
          {gallery.map((item, i) => 
            <button className={`gallery-item gallery-${i}`} key={item.src} onClick={() => setSelected(item)} aria-label={`View ${item.alt}`}>
              <img src={item.src} alt={item.alt} loading="lazy" />
              <span>View project <ArrowRight size={14} /></span>
            </button>
          )}
        </div>
      </div>
    </section>

    <section className="review-section">
      <div className="container review-inner">
        <div className="review-mark">“</div>
        <div className="review-content">
          <div className="stars">{[1,2,3,4,5].map((s) => <Star key={s} size={17} fill="currentColor" />)}</div>
          <blockquote>{reviews[review].quote}</blockquote>
          <p className="reviewer"><strong>{reviews[review].name}</strong> <span>·</span> {reviews[review].place}</p>
          <div className="review-controls">
            <button onClick={() => setReview((review + reviews.length - 1) % reviews.length)} aria-label="Previous review"><ChevronLeft /></button>
            <span>{String(review + 1).padStart(2, '0')} / {String(reviews.length).padStart(2, '0')}</span>
            <button onClick={() => setReview((review + 1) % reviews.length)} aria-label="Next review"><ChevronRight /></button>
          </div>
        </div>
      </div>
    </section>

    <section id="book" className="section booking-section">
      <div className="container booking-grid">
        <div className="booking-intro">
          <SectionLabel>Let&apos;s get it sorted</SectionLabel>
          <h2>Need a hand<br />with something?</h2>
          <p>Tell us a little about the job and we&apos;ll get back to you to confirm a convenient time.</p>
          <div className="contact-line">
            <Phone size={18} />
            <span>Prefer to talk?<br /><AppLink href={`tel:${phone}`}><strong>{phone}</strong></AppLink></span>
          </div>
        </div>
        <div className="form-card">
          {sent ? (
            <div className="success">
              <div className="success-icon"><Check size={28} /></div>
              <h3>Request received.</h3>
              <p>Thanks for reaching out. Balaji will call you shortly to confirm your visit.</p>
              <button className="button button-dark" onClick={() => setSent(false)}>Send another request</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {apiError && <div style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem', backgroundColor: '#fef2f2', padding: '0.6rem 0.85rem', borderRadius: '0.375rem', border: '1px solid #fca5a5' }}>{apiError}</div>}
              <div className="form-row">
                <label>Name<input name="name" placeholder="Your name" />{errors.name && <small className="error">{errors.name}</small>}</label>
                <label>Phone<input name="phone" inputMode="numeric" placeholder="10-digit number" />{errors.phone && <small className="error">{errors.phone}</small>}</label>
              </div>
              <label>What do you need help with?
                <select name="service" defaultValue="">
                  <option value="" disabled>Select a service</option>
                  {services.map((s) => <option key={s.title}>{s.title}</option>)}
                  <option>Something else</option>
                </select>
                {errors.service && <small className="error">{errors.service}</small>}
              </label>
              <label>Preferred date<input name="date" type="date" />{errors.date && <small className="error">{errors.date}</small>}</label>
              <button className="button button-primary submit" type="submit" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={16} className="spin" /> Submitting...
                  </span>
                ) : (
                  <>Request a visit <ArrowRight size={17} /></>
                )}
              </button>
              <p className="form-foot">No obligation. We&apos;ll confirm availability by phone.</p>
            </form>
          )}
        </div>
      </div>
    </section>

    <footer className="footer">
      <div className="container footer-top">
        <div>
          <AppLink href="#home" className="brand footer-brand">
            <span className="brand-mark"><Zap size={19} fill="currentColor" /></span>
            <span>Balaji<span> Electrical<span> Solution</span></span></span>
          </AppLink>
          <p>Professional electrical solutions<br />for homes and businesses.</p>
        </div>
        <div className="footer-contact">
          <span>Get in touch</span>
          <AppLink href={`tel:${phone}`}>{phone}</AppLink>
          <AppLink href={wa} target="_blank" rel="noopener noreferrer">WhatsApp us <ArrowUpRight size={15} /></AppLink>
        </div>
        <div className="footer-contact">
          <span>Admin Portal</span>
          <button 
            onClick={() => setShowAdmin(true)}
            style={{ background: 'none', border: 'none', color: '#38bdf8', padding: 0, fontSize: '13px', cursor: 'pointer', display: 'flex', items: 'center', gap: '6px', fontWeight: 'bold' }}
          >
            <Shield size={14} /> Open Admin Dashboard
          </button>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Balaji Electrical Services</span>
        <span>Designed & Developed by Baskar <Zap size={13} fill="currentColor" /></span>
      </div>
    </footer>

    {selected && (
      <div className="modal" role="dialog" aria-modal="true" aria-label="Project image" onClick={() => setSelected(null)}>
        <button className="modal-close" onClick={() => setSelected(null)} aria-label="Close image"><X size={20} /></button>
        <img src={selected.src} alt={selected.alt} onClick={(e) => e.stopPropagation()} />
      </div>
    )}

    {/* Floating WhatsApp Button in Bottom Right Corner */}
    <a 
      href={wa} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="floating-wa-btn" 
      aria-label="Chat on WhatsApp"
      title="Chat directly with Balaji on WhatsApp"
    >
      <WhatsAppLogo size={24} />
      <span className="wa-text">WhatsApp Us</span>
      <span className="wa-pulse-dot" />
    </a>
  </main>
}

function WhatsAppLogo({ size = 22, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.572-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

function ArrowUpRight({ size = 16 }) { return <ArrowRight size={size} className="arrow-up" /> }
