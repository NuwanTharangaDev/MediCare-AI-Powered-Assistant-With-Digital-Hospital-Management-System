import React from 'react';
import { 
  Heart, Eye, Users, Phone, ArrowRight, Check, Clock, Award
} from 'lucide-react';

export default function AboutUs({ onBookAppointment, onViewDoctors, onContactUs }) {
  const team = [
    {
      name: 'Yeshani Perera',
      role: 'Chief Medical Officer',
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Nuwan Tharanga',
      role: 'Cardiologist',
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Tharuka De Silva',
      role: 'Neurologist',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80'
    },
    {
      name: 'Gayan Perera',
      role: 'Orthopedic Surgeon',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80'
    }
  ];

  return (
    <div style={styles.container} className="about-page animate-fade">
      {/* 1. HERO BANNER */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>About Us</h1>
          <div style={styles.breadcrumb}>
            <span>Home</span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbActive}>About Us</span>
          </div>
        </div>
      </section>

      {/* 2. WHO WE ARE */}
      <section style={styles.whoWeAreSection}>
        <div className="whoWeAreGrid" style={styles.whoWeAreGrid}>
          <div style={styles.whoWeAreText}>
            <span style={styles.sectionBadge}>WHO WE ARE</span>
            <h2 style={styles.sectionTitle}>Who We Are</h2>
            <p style={styles.paragraph}>
              MediCare Hospital is a leading healthcare provider, offering world-class medical services with compassion, innovation and excellence.
            </p>
            <div style={styles.checklist}>
              {[
                'Advanced Medical Technology',
                'Experienced & Caring Doctors',
                'Patient-Centered Approach',
                '24/7 Emergency Support'
              ].map((item, idx) => (
                <div key={idx} style={styles.checkItem}>
                  <div style={styles.checkCircle}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span style={styles.checkText}>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={styles.whoWeAreImageContainer}>
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80" 
              alt="Our Medical Team" 
              style={styles.whoWeAreImage}
            />
          </div>
        </div>
      </section>

      {/* 3. MISSION, VISION, VALUES */}
      <section style={styles.mvvSection}>
        <div className="mvvGrid" style={styles.mvvGrid}>
          <div className="card about-mvv-card" style={styles.mvvCard}>
            <div style={styles.mvvIconContainer}>
              <Heart size={24} color="var(--primary)" />
            </div>
            <h3 style={styles.mvvTitle}>Our Mission</h3>
            <p style={styles.mvvText}>
              To provide exceptional healthcare services with compassion and integrity.
            </p>
          </div>

          <div className="card about-mvv-card" style={styles.mvvCard}>
            <div style={styles.mvvIconContainer}>
              <Eye size={24} color="var(--primary)" />
            </div>
            <h3 style={styles.mvvTitle}>Our Vision</h3>
            <p style={styles.mvvText}>
              To be the most trusted healthcare provider in the community.
            </p>
          </div>

          <div className="card about-mvv-card" style={styles.mvvCard}>
            <div style={styles.mvvIconContainer}>
              <Users size={24} color="var(--primary)" />
            </div>
            <h3 style={styles.mvvTitle}>Our Values</h3>
            <p style={styles.mvvText}>
              Care, Integrity, Excellence and innovation in every service we provide.
            </p>
          </div>
        </div>
      </section>

      {/* 4. OUR EXPERT TEAM */}
      <section style={styles.teamSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.teamTitle}>Our Expert Team</h2>
          <p style={styles.teamSubtitle}>Meet our highly qualified and experienced healthcare professionals.</p>
        </div>
        
        <div className="teamGrid" style={styles.teamGrid}>
          {team.map((doc, idx) => (
            <div key={idx} className="card" style={styles.teamCard}>
              <div style={styles.teamImageWrapper}>
                <img src={doc.image} alt={doc.name} style={styles.teamImage} />
              </div>
              <h4 style={styles.docName}>{doc.name}</h4>
              <span style={styles.docRole}>{doc.role}</span>
            </div>
          ))}
        </div>

        <div style={styles.teamAction}>
          <button style={styles.viewDoctorsBtn} onClick={onViewDoctors}>
            <span>View All Doctors</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 5. STATS BAR */}
      <section style={styles.statsBar}>
        <div style={styles.statsGrid}>
          <div className="about-stat-card" style={styles.statItem}>
            <Clock size={24} style={styles.statIcon} />
            <div>
            <h3 style={styles.statValue}>15+</h3>
            <span style={styles.statLabel}>Years of Experience</span>
            </div>
          </div>
          <div className="about-stat-card" style={styles.statItem}>
            <Users size={24} style={styles.statIcon} />
            <div>
            <h3 style={styles.statValue}>25,000+</h3>
            <span style={styles.statLabel}>Happy Patients</span>
            </div>
          </div>
          <div className="about-stat-card" style={styles.statItem}>
            <Award size={24} style={styles.statIcon} />
            <div>
            <h3 style={styles.statValue}>100+</h3>
            <span style={styles.statLabel}>Awards Won</span>
            </div>
          </div>
          <div className="about-stat-card" style={styles.statItem}>
            <Phone size={24} style={styles.statIcon} />
            <div>
            <h3 style={styles.statValue}>24/7</h3>
            <span style={styles.statLabel}>Support Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. EMERGENCY BANNER */}
      <section style={styles.emergencySection}>
        <div className="about-care-grid" style={styles.emergencyGrid}>
          <div style={styles.emergencyCard}>
            <div style={styles.emergencyCallInfo}>
              <div style={styles.phoneIconCircle}>
                <Phone size={24} color="var(--primary)" />
              </div>
              <div>
                <span style={styles.emergencyLabel}>Emergency Care</span>
                <h3 style={styles.emergencyPhone}>0112752049</h3>
                <span style={styles.emergencySub}>Available 24/7 for urgent medical support.</span>
              </div>
            </div>

            <div style={styles.emergencyHelpInfo}>
              <h3 style={styles.helpTitle}>Need help now?</h3>
              <p style={styles.helpText}>Our emergency team is ready to provide immediate care.</p>
              <button style={styles.contactUsBtn} onClick={onContactUs}>
                <span>Contact Us</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={styles.ambulanceWrapper}>
              <img
                src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=500&auto=format&fit=crop&q=85"
                alt="Medicare Ambulance"
                style={styles.ambulanceImg}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>

          <div style={styles.liveUpdateCard}>
            <div style={styles.liveUpdateHeader}>
              <div>
                <span style={styles.liveUpdateEyebrow}>SYSTEM STATUS</span>
                <h3 style={styles.liveUpdateTitle}>Live Hospital Updates</h3>
              </div>
              <span style={styles.liveStatus}><span style={styles.liveStatusDot} /> Live</span>
            </div>
            <div style={styles.updateList}>
              <div style={styles.updateItem}><span style={styles.updateIcon}>+</span><span>Emergency unit is open 24/7</span></div>
              <div style={styles.updateItem}><span style={styles.updateIcon}>+</span><span>Doctor consultations available today</span></div>
              <div style={styles.updateItem}><span style={styles.updateIcon}>+</span><span>Patient support team is online</span></div>
            </div>
            <span style={styles.updatedAt}>Updated just now</span>
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
    backgroundColor: '#FFFFFF',
    color: '#10204a'
  },
  heroSection: {
    height: '220px',
    backgroundImage: 'url("https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600&auto=format&fit=crop&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'left',
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
    color: '#FFFFFF',
    width: '100%',
    maxWidth: '1200px',
    padding: '0 55px'
  },
  heroTitle: {
    fontSize: '2.7rem',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '8px'
  },
  breadcrumb: {
    display: 'flex',
    justifyContent: 'flex-start',
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
  whoWeAreSection: {
    padding: '52px 55px 34px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  whoWeAreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '54px',
    alignItems: 'stretch'
  },
  whoWeAreText: {
    width: '100%',
    height: '100%',
    padding: '30px',
    textAlign: 'left',
    border: '1px solid #e4ebf4',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 28px -24px rgba(15, 23, 42, 0.42)'
  },
  sectionBadge: {
    color: 'var(--primary)',
    fontSize: '0.8rem',
    fontWeight: '800',
    letterSpacing: '1px',
    marginBottom: '12px',
    display: 'block'
  },
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '14px'
  },
  paragraph: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '20px'
  },
  checklist: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  checkCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#3B82F6',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkText: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  whoWeAreImageContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '260px',
    overflow: 'hidden',
    border: '1px solid #e4ebf4',
    borderRadius: '12px',
    backgroundColor: '#e8f1ff',
    boxShadow: '0 10px 28px -24px rgba(15, 23, 42, 0.42)'
  },
  whoWeAreImage: {
    width: '100%',
    maxWidth: 'none',
    borderRadius: '0',
    boxShadow: 'none',
    objectFit: 'cover',
    height: '100%'
  },
  mvvSection: {
    padding: '16px 55px 34px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  mvvGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '0'
  },
  mvvCard: {
    textAlign: 'center',
    minHeight: '164px',
    padding: '10px 36px 14px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: 'none',
    borderRadius: '0',
    boxShadow: 'none'
  },
  mvvIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  mvvTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  mvvText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5'
  },
  teamSection: {
    padding: '28px 55px 20px',
    backgroundColor: '#FFFFFF',
    width: '100%'
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: '600px',
    margin: '0 auto 22px auto'
  },
  teamTitle: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '4px'
  },
  teamSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.75rem'
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '12px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  teamCard: {
    backgroundColor: '#FFFFFF',
    minHeight: '198px',
    padding: '8px',
    borderRadius: '9px',
    border: '1px solid var(--border-light)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 4px 16px -12px rgba(15, 23, 42, 0.3)'
  },
  teamImageWrapper: {
    width: '100%',
    height: '150px',
    borderRadius: '7px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  teamImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  docName: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '2px'
  },
  docRole: {
    fontSize: '0.68rem',
    color: 'var(--text-secondary)',
    fontWeight: '500'
  },
  teamAction: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '12px'
  },
  viewDoctorsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 22px',
    borderRadius: '5px',
    border: '1px solid var(--primary)',
    backgroundColor: 'transparent',
    color: 'var(--primary)',
    fontWeight: '700',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.2s'
  },
  statsBar: {
    backgroundColor: '#0062FF',
    padding: '12px',
    color: '#FFFFFF',
    width: 'calc(100% - 110px)',
    maxWidth: '1200px',
    margin: '0 auto',
    borderRadius: '8px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '10px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    minHeight: '72px',
    padding: '10px 14px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  statIcon: {
    color: '#FFFFFF',
    flexShrink: 0,
    opacity: 0.95
  },
  statValue: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: '1.1',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '0.62rem',
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500'
  },
  emergencySection: {
    padding: '12px 55px 28px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  emergencyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '18px',
    alignItems: 'stretch'
  },
  emergencyCard: {
    backgroundColor: '#0062FF',
    borderRadius: '10px',
    minHeight: '230px',
    padding: '18px 22px',
    color: '#FFFFFF',
    display: 'grid',
    gridTemplateColumns: '1.15fr 1.35fr 0.8fr',
    gap: '18px',
    alignItems: 'center',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 14px 28px -18px rgba(0, 98, 255, 0.4)'
  },
  emergencyCallInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  phoneIconCircle: {
    width: '56px',
    height: '56px',
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
    fontSize: '1.35rem',
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
    fontSize: '1.05rem',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '4px'
  },
  helpText: {
    fontSize: '0.7rem',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: '10px',
    lineHeight: '1.35'
  },
  contactUsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '7px 14px',
    borderRadius: '999px',
    backgroundColor: '#FFFFFF',
    color: 'var(--primary)',
    fontWeight: '800',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.7rem',
    transition: 'all 0.2s'
  },
  ambulanceWrapper: {
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    minHeight: '112px'
  },
  ambulanceImg: {
    width: '100%',
    height: '112px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  liveUpdateCard: {
    minHeight: '230px',
    padding: '24px',
    borderRadius: '10px',
    border: '1px solid #dce7f5',
    background: '#f8fbff',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 14px 28px -22px rgba(15, 23, 42, 0.35)'
  },
  liveUpdateHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px'
  },
  liveUpdateEyebrow: {
    color: 'var(--primary)',
    fontSize: '0.67rem',
    fontWeight: '800',
    letterSpacing: '0.12em'
  },
  liveUpdateTitle: {
    color: '#10204a',
    fontSize: '1.2rem',
    fontWeight: '800',
    marginTop: '6px'
  },
  liveStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#059669',
    background: '#ecfdf5',
    borderRadius: '999px',
    padding: '6px 10px',
    fontSize: '0.7rem',
    fontWeight: '800'
  },
  liveStatusDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#10b981'
  },
  updateList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '24px'
  },
  updateItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#334155',
    fontSize: '0.78rem'
  },
  updateIcon: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#e8f1ff',
    color: 'var(--primary)',
    fontWeight: '800'
  },
  updatedAt: {
    color: '#94a3b8',
    fontSize: '0.68rem',
    marginTop: 'auto'
  }
};
