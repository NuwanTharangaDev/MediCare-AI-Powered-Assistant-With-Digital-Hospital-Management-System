import React from 'react';
import { 
  Heart, Activity, Users, Phone, ArrowRight, User, FlaskConical, Pill, ShieldAlert,
  Monitor, UserCheck, CreditCard, Sparkles
} from 'lucide-react';

export default function Services({ onContactUs }) {
  const services = [
    {
      title: 'General Medicine',
      desc: 'Complete primary healthcare services for all ages.',
      icon: User,
      color: '#0062FF',
      bg: 'rgba(0, 98, 255, 0.08)'
    },
    {
      title: 'Cardiology',
      desc: 'Advanced heart care and treatment services.',
      icon: Heart,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.08)'
    },
    {
      title: 'Neurology',
      desc: 'Expert care for brain, spine and nervous system.',
      icon: Activity,
      color: '#A855F7',
      bg: 'rgba(168, 85, 247, 0.08)'
    },
    {
      title: 'Pediatrics',
      desc: 'Specialized healthcare services for children and adolescents.',
      icon: Users,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.08)'
    },
    {
      title: 'Orthopedics',
      desc: 'Bone, joint and muscle care and treatment.',
      icon: Sparkles,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.08)'
    },
    {
      title: 'Laboratory',
      desc: 'Advanced diagnostic and laboratory testing services.',
      icon: FlaskConical,
      color: '#6366F1',
      bg: 'rgba(99, 102, 241, 0.08)'
    },
    {
      title: 'Pharmacy',
      desc: 'Quality medicines and health products available.',
      icon: Pill,
      color: '#14B8A6',
      bg: 'rgba(20, 184, 166, 0.08)'
    },
    {
      title: 'Emergency',
      desc: '24/7 emergency care and trauma services.',
      icon: ShieldAlert,
      color: '#EC4899',
      bg: 'rgba(236, 72, 153, 0.08)'
    }
  ];

  const features = [
    {
      title: 'Advanced Technology',
      desc: 'State of the art medical technology',
      icon: Monitor,
      color: '#3B82F6'
    },
    {
      title: 'Expert Doctors',
      desc: 'Highly qualified and experienced doctors',
      icon: UserCheck,
      color: '#10B981'
    },
    {
      title: 'Patient Care',
      desc: 'Personalized care for every patient',
      icon: Heart,
      color: '#3B82F6'
    },
    {
      title: 'Affordable Pricing',
      desc: 'Quality healthcare at affordable costs',
      icon: CreditCard,
      color: '#3B82F6'
    }
  ];

  return (
    <div style={styles.container} className="animate-fade">
      {/* 1. HERO BANNER */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Our Services</h1>
          <div style={styles.breadcrumb}>
            <span>Home</span>
            <span style={styles.breadcrumbSeparator}>&gt;</span>
            <span style={styles.breadcrumbActive}>Services</span>
          </div>
        </div>
      </section>

      {/* 2. COMPREHENSIVE HEALTHCARE TITLE */}
      <section style={styles.titleSection}>
        <h2 style={styles.sectionHeader}>Comprehensive Healthcare Services</h2>
        <div style={styles.pulseContainer}>
          <svg viewBox="0 0 100 20" style={styles.pulseSvg}>
            <path 
              d="M0,10 h35 l3,-6 l4,12 l3,-9 l2,3 h53" 
              fill="none" 
              stroke="#0062FF" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>
        <p style={styles.sectionSubtitle}>
          We provide a wide range of medical services to ensure your health and well-being.
        </p>
      </section>

      {/* 3. SERVICES GRID */}
      <section style={styles.gridSection}>
        <div style={styles.servicesGrid}>
          {services.map((svc, idx) => {
            const Icon = svc.icon;
            return (
              <div key={idx} className="card" style={styles.serviceCard}>
                <div style={{ ...styles.iconContainer, backgroundColor: svc.bg }}>
                  <Icon size={24} color={svc.color} />
                </div>
                <h3 style={styles.serviceTitle}>{svc.title}</h3>
                <p style={styles.serviceDesc}>{svc.desc}</p>
                <div style={{ ...styles.highlightLine, backgroundColor: svc.color }}></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. EMERGENCY BANNER */}
      <section style={styles.emergencySection}>
        <div style={styles.emergencyCard}>
          {/* Emergency Case info */}
          <div style={styles.emergencyCallInfo}>
            <div style={styles.phoneIconCircle}>
              <Phone size={24} color="var(--primary)" />
            </div>
            <div>
              <span style={styles.emergencyLabel}>Emergency Case</span>
              <h3 style={styles.emergencyPhone}>0112752049</h3>
              <span style={styles.emergencySub}>We are available 24/7 for emergency services.</span>
            </div>
          </div>

          {/* Need Help info */}
          <div style={styles.emergencyHelpInfo}>
            <h3 style={styles.helpTitle}>Need Help? We Are Available 24/7</h3>
            <p style={styles.helpText}>Our emergency team is always ready to provide you the best medical care.</p>
            <button style={styles.contactUsBtn} onClick={onContactUs}>
              <span>Contact Us</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Ambulance image */}
          <div style={styles.ambulanceWrapper}>
            <img 
              src="https://images.unsplash.com/photo-1587350859728-1115984aa599?w=400&auto=format&fit=crop&q=80" 
              alt="Medicare Ambulance" 
              style={styles.ambulanceImg} 
            />
          </div>
        </div>
      </section>

      {/* 5. BOTTOM FEATURES ROW */}
      <section style={styles.featuresSection}>
        <div style={styles.featuresGrid}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} style={styles.featureCard}>
                <div style={styles.featureIconContainer}>
                  <Icon size={32} color={feat.color} />
                </div>
                <h4 style={styles.featureTitle}>{feat.title}</h4>
                <p style={styles.featureDesc}>{feat.desc}</p>
              </div>
            );
          })}
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
    backgroundImage: 'url("https://images.unsplash.com/photo-1586773860418-d3b3da96a3ef?w=1600&auto=format&fit=crop&q=80")',
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
    color: 'rgba(255, 255, 255, 0.6)',
    margin: '0 2px'
  },
  breadcrumbActive: {
    color: '#3B82F6'
  },
  titleSection: {
    padding: '60px 40px 20px 40px',
    textAlign: 'center'
  },
  sectionHeader: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '12px'
  },
  pulseContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    width: '120px',
    height: '24px'
  },
  pulseSvg: {
    width: '100%',
    height: '100%'
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  gridSection: {
    padding: '40px 40px 80px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  servicesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '30px'
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    padding: '36px 28px',
    borderRadius: '16px',
    border: '1px solid var(--border-light)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: 'var(--shadow-lg)'
    }
  },
  iconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  serviceTitle: {
    fontSize: '1.3rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '12px'
  },
  serviceDesc: {
    fontSize: '0.92rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    marginBottom: '16px'
  },
  highlightLine: {
    width: '40px',
    height: '3px',
    borderRadius: '2px',
    position: 'absolute',
    bottom: '20px',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  emergencySection: {
    padding: '0 40px 80px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  emergencyCard: {
    backgroundColor: '#0062FF',
    borderRadius: '20px',
    padding: '48px 40px',
    color: '#FFFFFF',
    display: 'grid',
    gridTemplateColumns: '1.2fr 1.3fr 0.9fr',
    gap: '36px',
    alignItems: 'center',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 25px -5px rgba(0, 98, 255, 0.15)',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
      padding: '36px'
    }
  },
  emergencyCallInfo: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  phoneIconCircle: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  emergencyLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  emergencyPhone: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#FFFFFF',
    margin: '4px 0 2px 0',
    lineHeight: '1.2'
  },
  emergencySub: {
    fontSize: '0.78rem',
    color: 'rgba(255, 255, 255, 0.75)',
    display: 'block'
  },
  emergencyHelpInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  helpTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '8px'
  },
  helpText: {
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '20px',
    lineHeight: '1.4'
  },
  contactUsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    color: 'var(--primary)',
    fontWeight: '800',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.92rem',
    transition: 'all 0.2s'
  },
  ambulanceWrapper: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    '@media (max-width: 1024px)': {
      display: 'none'
    }
  },
  ambulanceImg: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '12px'
  },
  featuresSection: {
    padding: '60px 40px',
    borderTop: '1px solid var(--border-light)',
    width: '100%'
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '36px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  featureIconContainer: {
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '48px'
  },
  featureTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  featureDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4'
  }
};
