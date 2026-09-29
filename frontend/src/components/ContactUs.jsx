import React, { useState } from 'react';
import { 
  Phone, Mail, MapPin, Clock, AlertTriangle, Send, ExternalLink
} from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      // Clear alert after 4 seconds
      setTimeout(() => setSubmitSuccess(false), 4000);
    }, 1200);
  };

  const contactInfo = [
    {
      title: 'Phone',
      value: '0112752049',
      icon: Phone,
      color: '#0062FF',
      bg: 'rgba(0, 98, 255, 0.08)'
    },
    {
      title: 'Email',
      value: 'info@medicarehospital.com',
      icon: Mail,
      color: '#0062FF',
      bg: 'rgba(0, 98, 255, 0.08)'
    },
    {
      title: 'Address',
      value: '123 Highlevel Road, Homagama',
      icon: MapPin,
      color: '#0062FF',
      bg: 'rgba(0, 98, 255, 0.08)'
    },
    {
      title: 'Emergency',
      value: '0112752049 (24/7)',
      icon: AlertTriangle,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)'
    },
    {
      title: 'Working Hours',
      value: 'Monday - Sunday\n24/7 Emergency Support',
      icon: Clock,
      color: '#0062FF',
      bg: 'rgba(0, 98, 255, 0.08)'
    }
  ];

  return (
    <div style={styles.container} className="animate-fade">
      {/* 1. HERO BANNER */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Contact Us</h1>
          <div style={styles.breadcrumb}>
            <span>Home</span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbActive}>Contact Us</span>
          </div>
        </div>
      </section>

      {/* 2. CONTACT DETAILS & FORM */}
      <section style={styles.mainSection}>
        <div style={styles.columnsGrid}>
          {/* Left: Info details */}
          <div style={styles.infoColumn}>
            <h2 style={styles.columnTitle}>Get In Touch</h2>
            <p style={styles.columnDesc}>
              We are here to help you. Contact us for any queries or appointments.
            </p>
            <div style={styles.cardsStack}>
              {contactInfo.map((info, idx) => {
                const Icon = info.icon;
                return (
                  <div key={idx} className="card" style={styles.infoCard}>
                    <div style={{ ...styles.iconCircle, backgroundColor: info.bg }}>
                      <Icon size={20} color={info.color} />
                    </div>
                    <div style={styles.infoTextWrapper}>
                      <span style={styles.infoTitle}>{info.title}</span>
                      <span style={styles.infoValue}>{info.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="card" style={styles.formCard}>
            <h2 style={styles.formTitle}>Send Us a Message</h2>
            <p style={styles.formSubtitle}>
              Fill out the form below and we will get back to you as soon as possible.
            </p>
            
            {submitSuccess && (
              <div style={styles.successAlert}>
                <span>✓ Thank you! Your message has been sent successfully. We will contact you soon.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="input-field" 
                    required 
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <input 
                    type="email" 
                    placeholder="Your Email" 
                    className="input-field" 
                    required 
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <input 
                type="tel" 
                placeholder="Phone Number" 
                className="input-field" 
                required 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
              <input 
                type="text" 
                placeholder="Subject" 
                className="input-field" 
                required 
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
              />
              <textarea 
                placeholder="Your Message" 
                className="input-field" 
                rows="5" 
                required 
                value={formData.message}
                onChange={e => setFormData({ ...formData, message: e.target.value })}
              />
              <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={styles.submitBtn}>
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. MAP mockups */}
      <section style={styles.mapSection}>
        <div style={styles.mapContainer}>
          {/* Mockup Map Image */}
          <div style={styles.mapImageWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&auto=format&fit=crop&q=80" 
              alt="MediCare Hospital Location Map" 
              style={styles.mapImg} 
            />
          </div>
          {/* Floating Details Overlay Card */}
          <div className="card" style={styles.mapFloatingCard}>
            <h4 style={styles.mapCardHeader}>Visit Us</h4>
            <h3 style={styles.mapHospitalName}>MediCare Hospital</h3>
            <p style={styles.mapAddress}>123 Highlevel Road, Homagama</p>
            <a 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.directionsLink}
            >
              <span>Get Directions</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#FFFFFF'
  },
  heroSection: {
    height: '280px',
    backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    clipPath: 'polygon(0 0, 100% 0, 100% 88%, 0% 100%)'
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)'
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    color: '#FFFFFF'
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '8px'
  },
  breadcrumb: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: '500'
  },
  breadcrumbSeparator: {
    color: 'rgba(255, 255, 255, 0.6)'
  },
  breadcrumbActive: {
    color: '#3B82F6'
  },
  mainSection: {
    padding: '80px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1.3fr',
    gap: '60px',
    alignItems: 'start',
    '@media (max-width: 960px)': {
      gridTemplateColumns: '1fr',
      gap: '40px'
    }
  },
  infoColumn: {
    textAlign: 'left'
  },
  columnTitle: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '12px'
  },
  columnDesc: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '32px'
  },
  cardsStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'var(--shadow-sm)'
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  infoTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  infoTitle: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  infoValue: {
    fontSize: '0.98rem',
    color: 'var(--text-primary)',
    fontWeight: '700',
    marginTop: '2px',
    whiteSpace: 'pre-line',
    textAlign: 'left'
  },
  formCard: {
    padding: '40px 36px',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    boxShadow: 'var(--shadow-md)'
  },
  formTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    textAlign: 'left'
  },
  formSubtitle: {
    fontSize: '0.92rem',
    color: 'var(--text-secondary)',
    marginBottom: '28px',
    textAlign: 'left'
  },
  successAlert: {
    backgroundColor: '#ECFDF5',
    color: '#047857',
    border: '1px solid #A7F3D0',
    padding: '14px 16px',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'left'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      gap: '16px'
    }
  },
  formGroup: {
    flex: 1
  },
  submitBtn: {
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 28px',
    fontWeight: '700',
    backgroundColor: 'var(--primary)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s',
    marginTop: '8px'
  },
  mapSection: {
    padding: '0 40px 80px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  mapContainer: {
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
    height: '420px',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-sm)'
  },
  mapImageWrapper: {
    width: '100%',
    height: '100%'
  },
  mapImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    filter: 'brightness(0.95) contrast(1.05)'
  },
  mapFloatingCard: {
    position: 'absolute',
    top: '40px',
    left: '40px',
    zIndex: 10,
    backgroundColor: '#FFFFFF',
    padding: '30px 24px',
    borderRadius: '16px',
    maxWidth: '300px',
    width: 'calc(100% - 80px)',
    textAlign: 'left',
    boxShadow: 'var(--shadow-lg)',
    border: '1px solid var(--border-light)'
  },
  mapCardHeader: {
    color: 'var(--primary)',
    fontSize: '0.8rem',
    fontWeight: '800',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  mapHospitalName: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  mapAddress: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '20px'
  },
  directionsLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--primary)',
    fontSize: '0.88rem',
    fontWeight: '700',
    textDecoration: 'none'
  }
};
