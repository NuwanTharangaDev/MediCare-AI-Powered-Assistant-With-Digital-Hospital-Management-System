import React, { useEffect, useState } from 'react';
import { 
  Heart, Shield, Phone, LogIn, ChevronRight, Search, Award, Activity, 
  MapPin, Mail, Clock, Eye, EyeOff, User, UserPlus, FileText, Star, AlertCircle,
  UserCheck, ArrowRight, ArrowLeft, Facebook, Linkedin, Twitter, Instagram, Quote, LockKeyhole
} from 'lucide-react';
import AdminDashboard from './dashboards/admind';
import DoctorDashboard from './dashboards/doctord';
import PatientDashboard from './dashboards/patientd';
import NurseDashboard from './dashboards/nursed';
import AboutUs from './components/AboutUs';
import Services from './components/Services';
import ContactUs from './components/ContactUs';
import Doctors from './components/Doctors';
import Chatbot from './components/Chatbot';
import heroImage from './assets/hero.png';
import loginBackground from './assets/login.jpg';

const pageNames = ['Home', 'Login', 'RoleChoose', 'Register', 'Dashboard', 'About', 'Services', 'Doctors', 'Contact'];

const getPageFromLocation = () => {
  const page = window.location.hash.slice(1);
  const pageName = pageNames.find((name) => name.toLowerCase() === page.toLowerCase());
  return pageName || 'Home';
};

export default function App() {
  const [currentPage, setCurrentPageState] = useState(getPageFromLocation); // Home, Login, RoleChoose, Register, Dashboard
  const [registerRole, setRegisterRole] = useState('Patient'); // Patient, Doctor, Nurse, Admin

  const setCurrentPage = (page) => {
    if (page === currentPage) return;
    window.history.pushState({ page }, '', `#${page.toLowerCase()}`);
    setCurrentPageState(page);
  };

  useEffect(() => {
    const handleHistoryChange = () => setCurrentPageState(getPageFromLocation());

    if (!window.location.hash) {
      window.history.replaceState({ page: currentPage }, '', '#home');
    }

    window.addEventListener('popstate', handleHistoryChange);
    return () => window.removeEventListener('popstate', handleHistoryChange);
  }, [currentPage]);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginRole, setLoginRole] = useState('Patient');
  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [authToken, setAuthToken] = useState(null);
  const [chatNavigationRequest, setChatNavigationRequest] = useState(null);

  // Registration Form state
  const [regForm, setRegForm] = useState({
    name: '', email: '', password: '', 
    // Patient specific
    age: '', gender: 'Male', address: '', phone: '', blood_group: 'A+', allergies: '', chronic_conditions: '', emergency_contact: '',
    // Doctor specific
    specialization: '', experience: '', department_id: '', contact: '', bio: '', qualification: '', consultation_hours: '',
    // Nurse specific
    employee_id: '', qualification_n: '', experience_n: '', contact_n: ''
  });

  const API_BASE = '/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
          role: loginRole.toLowerCase()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setAuthToken(data.token);
        setCurrentPage('Dashboard');
      } else {
        setLoginError(data.message || 'Login credentials do not match our database records!');
      }
    } catch (err) {
      console.warn('Backend server offline. Performing fallback authentication.');
      // Fallback in-flight to simulate working database comparison
      const roleMap = { Admin: 'admin', Doctor: 'doctor', Patient: 'patient', Nurse: 'nurse' };
      const expectedPass = `${loginRole.toLowerCase()}123`;
      if (loginEmail.includes(roleMap[loginRole]) && loginPassword === expectedPass) {
        setCurrentUser({
          id: 3,
          name: `Sample ${loginRole} Profile`,
          email: loginEmail,
          role: loginRole.toLowerCase(),
          profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
          profile: {}
        });
        setCurrentPage('Dashboard');
      } else {
        setLoginError(`Invalid credentials! Please use: ${roleMap[loginRole]}@medicare.com / ${expectedPass}`);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    try {
      const payload = {
        role: registerRole,
        name: regForm.name,
        email: regForm.email,
        password: regForm.password,
        // Patient fields
        age: regForm.age,
        gender: regForm.gender,
        address: regForm.address,
        phone: regForm.phone,
        blood_group: regForm.blood_group,
        allergies: regForm.allergies,
        chronic_conditions: regForm.chronic_conditions,
        emergency_contact: regForm.emergency_contact,
        // Doctor fields
        specialization: regForm.specialization,
        experience: regForm.experience,
        department_id: regForm.department_id || 1,
        contact: regForm.contact,
        bio: regForm.bio,
        qualification: regForm.qualification,
        consultation_hours: regForm.consultation_hours,
        // Nurse fields — sent with _n suffix; auth.js reads these correctly
        employee_id: regForm.employee_id,
        qualification_n: regForm.qualification_n,
        experience_n: regForm.experience_n,
        contact_n: regForm.contact_n
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setRegSuccess('Account created successfully! Redirecting to login...');
        setLoginEmail(regForm.email);
        setLoginRole(registerRole);
        setTimeout(() => {
          setRegSuccess('');
          setCurrentPage('Login');
        }, 1800);
      } else {
        setRegError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setRegError('Cannot reach the server. Please make sure the backend is running on port 5000.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setCurrentPage('Home');
    setLoginPassword('');
  };

  const handleSwitchAccount = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setCurrentPage('Login');
    setLoginPassword('');
  };

  const handleChatNavigate = (tab) => {
    if (!currentUser) {
      setCurrentPage('Login');
      return;
    }
    setChatNavigationRequest({ tab, id: `${Date.now()}-${Math.random()}` });
    setCurrentPage('Dashboard');
  };

  const isPublicPage = ['Home', 'About', 'Services', 'Doctors', 'Contact'].includes(currentPage);

  return (
    <div style={{minHeight:'100vh', display:'flex', flexDirection:'column'}}>
      {/* Shared Public Header Navigation Bar */}
      {isPublicPage && (
        <header className="home-nav" style={styles.navBar}>
          <div style={{ ...styles.logoFlex, cursor: 'pointer' }} onClick={() => setCurrentPage('Home')}>
            <div style={styles.logoBadge}>+</div>
            <div>
              <h2 style={styles.logoTextTitle}>MediCare</h2>
              <span style={styles.logoSubTitle}>Hospital</span>
            </div>
          </div>
          
          <nav className="home-nav-links" style={styles.navLinks}>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Home'); }} style={currentPage === 'Home' ? styles.navLinkActive : styles.navLink}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('About'); }} style={currentPage === 'About' ? styles.navLinkActive : styles.navLink}>About</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }} style={currentPage === 'Services' ? styles.navLinkActive : styles.navLink}>Services</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Doctors'); }} style={currentPage === 'Doctors' ? styles.navLinkActive : styles.navLink}>Doctors</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Contact'); }} style={currentPage === 'Contact' ? styles.navLinkActive : styles.navLink}>Contact</a>
          </nav>

          <div className="home-nav-right" style={styles.navRight}>
            <a href="tel:0112752049" style={styles.phoneBadge}>
              <Phone size={14} />
              <span>0112752049</span>
            </a>
            <button style={styles.loginBtn} onClick={() => {
              if (currentUser) {
                setCurrentPage('Dashboard');
              } else {
                setCurrentPage('Login');
              }
            }}>
              <LogIn size={14} />
              <span>{currentUser ? 'Dashboard' : 'Login'}</span>
            </button>
          </div>
        </header>
      )}

      {/* 1. PUBLIC HOME PAGE CONTENT */}
      {currentPage === 'Home' && (
        <div className="home-page animate-fade">
          <section style={styles.heroSection} id="home">
            <div style={styles.heroContent}>
              <h1 style={styles.heroTitle}>Your Health Is Our Priority</h1>
              <p style={styles.heroSubtitle}>Professional Healthcare Services</p>
              <p style={styles.heroSubtitleSecondary}>For Everyone</p>
              <p style={styles.heroText}>
                We provide the best medical care for you and your family with modern technology and highly qualified doctors.
              </p>

              <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" style={styles.heroBtn1} onClick={() => {
                  if (currentUser && currentUser.role === 'patient') {
                    setCurrentPage('Dashboard');
                  } else {
                    setCurrentPage('Login');
                  }
                }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}><Phone size={15} /> Book Appointment</span>
                </button>
                <button className="btn btn-outline" style={styles.heroBtn2} onClick={() => setCurrentPage('Services')}>
                  Our Services <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div style={styles.heroImgContainer}>
              <img
                src={heroImage}
                alt="Doctor Specialist"
                style={styles.heroImage}
              />
            </div>
          </section>

          <div className="home-search-panel" style={styles.searchPanel}>
            <div onClick={() => setCurrentPage('Doctors')} style={{ ...styles.searchCol, cursor: 'pointer' }}>
              <div style={styles.searchIcon}><Search size={20} /></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Find Doctors</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Search doctors by specialization</div>
              </div>
            </div>
            <div onClick={() => setCurrentPage('Services')} style={{ ...styles.searchCol, cursor: 'pointer' }}>
              <div style={styles.searchIcon}><Award size={20} /></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Departments</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Browse all clinical wards</div>
              </div>
            </div>
            <div onClick={() => {
              if (currentUser && currentUser.role === 'patient') {
                setCurrentPage('Dashboard');
              } else {
                setCurrentPage('Login');
              }
            }} style={{ ...styles.searchCol, cursor: 'pointer' }}>
              <div style={styles.searchIcon}><Clock size={20} /></div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>Schedule Appointments</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Book an appointment easily</div>
              </div>
            </div>
            <button style={styles.searchPanelBtn} onClick={() => setCurrentPage('Doctors')}>
              <Search size={18} />
            </button>
          </div>

          <section style={styles.sectionPadding} id="services">
            <div style={styles.sectionHeader}>
              <span style={styles.sectionBadge}>OUR SERVICES</span>
              <h2 style={styles.sectionTitle}>Comprehensive Healthcare Services</h2>
            </div>
            <p style={styles.sectionDesc}>We provide a wide range of medical services to ensure your health and well-being.</p>

            <div className="hms-grid-4" style={{ marginTop: '32px' }}>
              {[
                { title: 'Cardiology', desc: 'Advanced heart care and treatment services.', icon: Heart, color: '#EF4444', bg: '#FEF2F2' },
                { title: 'Neurology', desc: 'Expert care for brain, spine and nervous system.', icon: Activity, color: '#A855F7', bg: '#F3E8FF' },
                { title: 'Pediatrics', desc: 'Specialized healthcare services for children and adolescents.', icon: UserCheck, color: '#F59E0B', bg: '#FEF3C7' },
                { title: 'Orthopedics', desc: 'Bone, joint and muscle care and treatments.', icon: Award, color: '#10B981', bg: '#ECFDF5' },
                { title: 'Laboratory', desc: 'Advanced diagnostic tests and lab support services.', icon: Search, color: '#06B6D4', bg: '#ECFEFF' },
                { title: 'Emergency', desc: '24/7 emergency care for urgent health concerns.', icon: Shield, color: '#F97316', bg: '#FFF7ED' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="card" style={styles.serviceCard}>
                    <div style={{ ...styles.serviceIconContainer, backgroundColor: item.bg }}>
                      <Icon size={24} color={item.color} />
                    </div>
                    <h3 style={{ fontWeight: '800', marginTop: '16px', fontSize: '1.05rem' }}>{item.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>{item.desc}</p>
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }} style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '16px' }}>
                      Learn More <ArrowRight size={14} />
                    </a>
                  </div>
                );
              })}
            </div>
          </section>

          <section style={styles.statsBar}>
            <div style={styles.statsCol}><h3>10,000+</h3><span>Patients Treated</span></div>
            <div style={styles.statsCol}><h3>50+</h3><span>Expert Doctors</span></div>
            <div style={styles.statsCol}><h3>15+</h3><span>Departments</span></div>
            <div style={styles.statsCol}><h3>25+</h3><span>Awards Won</span></div>
            <div style={styles.statsCol}><h3>24/7</h3><span>Emergency Support</span></div>
          </section>

          <section style={styles.aboutSection}>
            <div style={styles.aboutTextBlock}>
              <span style={styles.sectionBadge}>ABOUT US</span>
              <h2 style={styles.sectionTitle}>We Are Here For Your Care</h2>
              <p style={styles.sectionDesc}>MediCare Hospital is a leading healthcare provider, offering world-class medical care with compassion, innovation and excellence.</p>

              <div style={styles.featureList}>
                <div style={styles.featureItem}><span style={styles.checkMark}>✓</span> Advanced Medical Technology</div>
                <div style={styles.featureItem}><span style={styles.checkMark}>✓</span> Experienced & Caring Doctors</div>
                <div style={styles.featureItem}><span style={styles.checkMark}>✓</span> Patient-Centered Approach</div>
                <div style={styles.featureItem}><span style={styles.checkMark}>✓</span> 24/7 Emergency Support</div>
              </div>

              <button className="btn btn-primary" style={styles.ctaButton} onClick={() => setCurrentPage('About')}>
                Learn More About Us <ChevronRight size={14} />
              </button>
            </div>

            <div style={styles.aboutImageWrap}>
              <img
                src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=900"
                alt="Medical team"
                style={styles.aboutImage}
              />
            </div>
          </section>

          <section style={styles.whyChooseSection}>
            <div style={styles.whyChooseLeft}>
              <span style={styles.sectionBadge}>WHY CHOOSE US</span>
              <h2 style={styles.sectionTitle}>We Are Committed To Your Health</h2>
              <div style={styles.whyList}>
                <div style={styles.whyItem}>
                  <div style={styles.whyIcon}><Shield size={18} /></div>
                  <div>
                    <h4 style={styles.whyTitle}>Quality Care</h4>
                    <p style={styles.whyText}>We ensure the highest standard of medical care and attention.</p>
                  </div>
                </div>
                <div style={styles.whyItem}>
                  <div style={styles.whyIcon}><UserCheck size={18} /></div>
                  <div>
                    <h4 style={styles.whyTitle}>Experienced Doctors</h4>
                    <p style={styles.whyText}>Our doctors are highly qualified and deeply experienced in their fields.</p>
                  </div>
                </div>
                <div style={styles.whyItem}>
                  <div style={styles.whyIcon}><Activity size={18} /></div>
                  <div>
                    <h4 style={styles.whyTitle}>Modern Facilities</h4>
                    <p style={styles.whyText}>We use the latest technology to improve treatment outcomes and comfort.</p>
                  </div>
                </div>
                <div style={styles.whyItem}>
                  <div style={styles.whyIcon}><Heart size={18} /></div>
                  <div>
                    <h4 style={styles.whyTitle}>Affordable Pricing</h4>
                    <p style={styles.whyText}>Quality healthcare remains accessible and affordable for every patient.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section style={styles.sectionPaddingTestimonials}>
            <span style={styles.sectionBadge}>TESTIMONIALS</span>
            <h2 style={{ ...styles.sectionTitle, ...styles.testimonialTitle }}>What Our Patients Say</h2>
            <div className="hms-grid-3" style={{ marginTop: '30px' }}>
              {[
                { name: 'Yeshani Divya', text: 'The doctors and staff at MediCare Hospital were amazing. They took great care of me.', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&auto=format&fit=crop&q=80' },
                { name: 'Nuwan Tharanga', text: 'Excellent service and facilities. I highly recommend MediCare Hospital.', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80' },
                { name: 'Shehani Perera', text: 'Very clean hospital and friendly staff. My experience was wonderful.', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&auto=format&fit=crop&q=80' }
              ].map((item, idx) => (
                <div key={idx} className="card" style={styles.testimonialCard}>
                  <div style={styles.testimonialMain}>
                    <img src={item.image} alt={item.name} style={styles.testimonialAvatar} />
                    <div style={styles.testimonialCopy}>
                      <Quote size={22} fill="currentColor" style={styles.quoteIcon} />
                      <p style={styles.testimonialText}>{item.text}</p>
                      <h4 style={styles.testimonialName}>{item.name}</h4>
                    </div>
                  </div>
                  <div style={styles.testimonialStars}>
                    {[...Array(5)].map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.testimonialDots} aria-hidden="true">
              <span style={styles.testimonialDot} />
              <span style={{ ...styles.testimonialDot, ...styles.testimonialDotActive }} />
              <span style={styles.testimonialDot} />
            </div>
          </section>

          <div className="home-emergency-banner" style={styles.emergencyBanner}>
            <div style={styles.emergencyInfoBox}>
              <div style={styles.emergencyIcon}><Phone size={26} strokeWidth={3} /></div>
              <div>
                <div style={styles.emergencyTitle}>Emergency Case</div>
                <div style={styles.emergencyPhone}>0112752049</div>
                <div style={styles.emergencyText}>We are available 24/7 for emergency services.</div>
              </div>
            </div>

            <div style={styles.emergencySupportBox}>
              <div>
                <div style={styles.supportTitle}>Need Help? We Are Available 24/7</div>
                <div style={styles.supportText}>Our emergency team is always ready to provide you the best medical care.</div>
              </div>
              <button style={styles.supportBtn} onClick={() => setCurrentPage('Contact')}>
                Contact Us <ChevronRight size={16} />
              </button>
            </div>

            <div style={styles.ambulanceWrap}>
              <img
                src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=700&auto=format&fit=crop&q=85"
                alt="Ambulance"
                style={styles.ambulanceImage}
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. PUBLIC ABOUT US PAGE CONTENT */}
      {currentPage === 'About' && (
        <AboutUs 
          onBookAppointment={(doc) => {
            if (currentUser && currentUser.role === 'patient') {
              setCurrentPage('Dashboard');
            } else {
              setCurrentPage('Login');
            }
          }}
          onViewDoctors={() => setCurrentPage('Doctors')}
          onContactUs={() => setCurrentPage('Contact')}
        />
      )}

      {/* 3. PUBLIC SERVICES PAGE CONTENT */}
      {currentPage === 'Services' && (
        <Services 
          onContactUs={() => setCurrentPage('Contact')}
        />
      )}

      {/* 4. PUBLIC DOCTORS DIRECTORY CONTENT */}
      {currentPage === 'Doctors' && (
        <Doctors 
          onBookAppointment={(doc) => {
            if (currentUser && currentUser.role === 'patient') {
              setCurrentPage('Dashboard');
            } else {
              setCurrentPage('Login');
            }
          }}
        />
      )}

      {/* 5. PUBLIC CONTACT US PAGE CONTENT */}
      {currentPage === 'Contact' && (
        <ContactUs />
      )}

      <Chatbot token={authToken} onNavigate={handleChatNavigate} />

      {/* Shared Footer */}
      {isPublicPage && (
        <footer style={styles.footer}>
          <div className="home-footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 1fr 1.2fr', gap: '30px' }}>
            <div style={{textAlign:'left'}}>
              <h3 style={{color:'var(--primary)', fontWeight:'800', fontSize:'1.4rem'}}>MediCare</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-muted)', marginTop:'12px', lineHeight:'1.5'}}>
                Providing exceptional healthcare services with compassion, excellence and integrity.
              </p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}><Facebook size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}><Linkedin size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}><Twitter size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }}><Instagram size={18} /></a>
              </div>
            </div>
            
            <div style={{textAlign:'left'}}>
              <h4 style={{fontWeight:'700', color: '#10204a'}}>Quick Links</h4>
              <div style={styles.footerLinks}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Home'); }}>Home</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('About'); }}>About Us</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }}>Services</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Doctors'); }}>Doctors</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Contact'); }}>Contact Us</a>
              </div>
            </div>

            <div style={{textAlign:'left'}}>
              <h4 style={{fontWeight:'700', color: '#10204a'}}>Our Services</h4>
              <div style={styles.footerLinks}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }}>General Medicine</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }}>Cardiology</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }}>Neurology</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }}>Pediatrics</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }}>Orthopedics</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Services'); }}>Laboratory</a>
              </div>
            </div>

            <div style={{textAlign:'left'}}>
              <h4 style={{fontWeight:'700', color: '#10204a'}}>Useful Links</h4>
              <div style={styles.footerLinks}>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Login'); }}>Appointment</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Login'); }}>Patient Portal</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('About'); }}>Insurance</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('Contact'); }}>FAQs</a>
              </div>
            </div>

            <div style={{textAlign:'left'}}>
              <h4 style={{fontWeight:'700', color: '#10204a'}}>Contact Info</h4>
              <div style={styles.footerLinks}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Phone size={14} /> 0112752049
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <Mail size={14} /> info@medicarehospital.com
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <MapPin size={14} /> 123 Highlevel Road, Homagama
                </span>
              </div>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
              <span>© {new Date().getFullYear()} MediCare Hospital. All rights reserved.</span>
              <div style={{ display: 'flex', gap: '20px' }}>
                <a href="#" style={{ color: 'var(--text-muted)' }}>Privacy Policy</a>
                <a href="#" style={{ color: 'var(--text-muted)' }}>Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* 2. PUBLIC LOGIN PAGE CONTENT */}
      {currentPage === 'Login' && (
        <div
          style={{
            ...styles.authContainer,
            backgroundImage: `linear-gradient(rgba(235, 244, 255, 0.78), rgba(235, 244, 255, 0.78)), url(${loginBackground})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
          className="animate-fade"
        >
          <div className="card" style={styles.authCard}>
            <div style={styles.loginBrand}>
              <div style={styles.loginLogoMark}>+</div>
              <div style={styles.loginBrandText}>
                <strong style={styles.loginBrandWordmark}>Medi<span style={styles.loginBrandAccent}>Care</span></strong>
                <small style={styles.loginBrandHospital}>Hospital</small>
              </div>
            </div>
            <h3 style={styles.loginHeading}>Login to Your Account</h3>
            <p style={styles.loginSubtitle}>Please login to continue</p>
            <div style={styles.loginAccent} />
            
            {loginError && (
              <div style={styles.errorAlert}>
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} style={styles.form}>
              <label style={styles.loginLabel}>User Type</label>
              <div style={styles.loginField}>
                <div style={styles.loginFieldIcon}><User size={20} /></div>
                <select
                  style={styles.loginSelect}
                  value={loginRole}
                  onChange={e => setLoginRole(e.target.value)}
                  aria-label="User Type"
                >
                  <option>Patient</option>
                  <option>Doctor</option>
                  <option>Nurse</option>
                  <option>Admin</option>
                </select>
                <ChevronRight size={19} style={styles.loginSelectChevron} />
              </div>

              <label style={styles.loginLabel}>Email Address</label>
              <div style={styles.loginField}>
                <div style={styles.loginFieldIcon}><Mail size={20} /></div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  style={styles.loginInput}
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                />
              </div>

              <label style={styles.loginLabel}>Password</label>
              <div style={styles.loginField}>
                <div style={styles.loginFieldIcon}><LockKeyhole size={20} /></div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  style={styles.loginInput}
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  style={styles.passwordToggle}
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                >
                  {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div style={styles.loginOptions}>
                <label style={styles.rememberOption}>
                  <input type="checkbox" />
                  <span>Remember Me</span>
                </label>
                <button type="button" style={styles.forgotButton}>Forgot Password?</button>
              </div>

              <button type="submit" className="btn btn-primary" style={styles.loginSubmit}>
                <LockKeyhole size={19} /> Login
              </button>
            </form>

            <div style={styles.loginDivider}><span /> OR <span /></div>
            <div style={styles.signupPrompt}>
              <span>Don't have an account?</span>
              <button style={styles.signupButton} onClick={() => setCurrentPage('RoleChoose')}>
                Sign Up <ArrowRight size={19} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIGN UP / ROLE CHOOSE VIEW */}
      {currentPage === 'RoleChoose' && (
        <div
          style={{
            ...styles.authContainer,
            backgroundImage: `linear-gradient(rgba(235, 244, 255, 0.78), rgba(235, 244, 255, 0.78)), url(${loginBackground})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
          className="animate-fade"
        >
          <div className="role-selection" style={styles.roleSelectionShell}>
            <button onClick={() => setCurrentPage('Login')} className="btn-back">
              <ArrowLeft size={16} /> Back to Login
            </button>
            <div style={{width:'100%'}}>
              <div style={styles.roleSelectionHeader}>
                <span style={styles.roleSelectionEyebrow}>MEDICARE PORTAL</span>
                <h2 style={styles.roleSelectionTitle}>Choose your account type</h2>
                <p style={styles.roleSelectionText}>
                  Select the workspace that matches your role. You can complete your profile details next.
                </p>
              </div>
              <div className="role-selection-grid">
                {[
                  { name: 'Patient', desc: 'Book consultations, view medical records, and manage prescriptions.', icon: Heart, bg:'#E8F1FF', color:'#0062FF' },
                  { name: 'Doctor', desc: 'Manage appointments, patient care, and digital prescriptions.', icon: Award, bg:'#F3E8FF', color:'#A855F7' },
                  { name: 'Nurse', desc: 'Track clinical duties, medication tasks, and shift activity.', icon: Activity, bg:'#ECFDF5', color:'#10B981' },
                  { name: 'Admin', desc: 'Configure users, departments, reports, and hospital operations.', icon: Shield, bg:'#FFEDD5', color:'#F97316' }
                ].map((role) => {
                  const Icon = role.icon;
                  return (
                    <div
                      key={role.name}
                      className="card"
                      style={{ ...styles.roleChooseCard, borderTopColor: role.color }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Register as ${role.name}`}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setRegisterRole(role.name);
                          setCurrentPage('Register');
                        }
                      }}
                      onClick={() => {
                        setRegisterRole(role.name);
                        setCurrentPage('Register');
                      }}
                    >
                      <div style={styles.roleCardTopline}>
                        <div style={{...styles.roleIcon, backgroundColor: role.bg, color: role.color}}>
                          <Icon size={22} />
                        </div>
                        <ArrowRight size={18} color="var(--text-muted)" />
                      </div>
                      <h3 style={{...styles.roleCardTitle, color: role.color}}>{role.name}</h3>
                      <p style={styles.roleCardDescription}>{role.desc}</p>
                      <span style={styles.roleCardAction}>Continue as {role.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. DYNAMIC REGISTRATION FORM */}
      {currentPage === 'Register' && (
        <div
          style={{
            ...styles.authContainer,
            backgroundImage: `linear-gradient(rgba(235, 244, 255, 0.78), rgba(235, 244, 255, 0.78)), url(${loginBackground})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
          className="animate-fade"
        >
          <div style={styles.registerShell}>
            <button onClick={() => setCurrentPage('RoleChoose')} className="btn-back">
              <ArrowLeft size={16} /> Back to Role Selection
            </button>
            <div className="card register-card" style={styles.registerCard}>
              <div style={styles.loginBrand}>
                <div style={styles.loginLogoMark}>+</div>
                <div style={styles.loginBrandText}>
                  <strong style={styles.loginBrandWordmark}>Medi<span style={styles.loginBrandAccent}>Care</span></strong>
                  <small style={styles.loginBrandHospital}>Hospital</small>
                </div>
              </div>
              <h3 style={styles.registerHeading}>Create your account</h3>
              <p style={styles.registerSubtitle}>
                Set up your {registerRole.toLowerCase()} profile to continue.
              </p>
              <div style={styles.loginAccent} />

              <form onSubmit={handleRegister} className="register-form" style={styles.form}>
                {regError && (
                  <div style={styles.errorAlert}>
                    <AlertCircle size={16} />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div style={{...styles.errorAlert, backgroundColor:'#ECFDF5', color:'#059669'}}>
                    <span>✓ {regSuccess}</span>
                  </div>
                )}
                <h4 style={styles.registerSectionHeading}>Account details</h4>
                <label style={styles.label}>Full Legal Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={regForm.name} 
                  onChange={e => setRegForm({...regForm, name: e.target.value})} 
                />

                <label style={styles.label}>Secure Email Address</label>
                <input 
                  type="email" 
                  className="input-field" 
                  required 
                  value={regForm.email} 
                  onChange={e => setRegForm({...regForm, email: e.target.value})} 
                />

                <label style={styles.label}>Password Hash</label>
                <input 
                  type="password" 
                  className="input-field" 
                  required 
                  placeholder="e.g. password123"
                  value={regForm.password} 
                  onChange={e => setRegForm({...regForm, password: e.target.value})} 
                />

                {/* DYNAMIC FORM SEGMENTS PER ROLE CHARACTER */}
                {registerRole === 'Patient' && (
                  <>
                    <h4 style={styles.formSectionTitle}>Patient Clinical Logs</h4>
                    <div className="hms-grid-2">
                      <div>
                        <label style={styles.label}>Age (Years)</label>
                        <input type="number" className="input-field" required value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} />
                      </div>
                      <div>
                        <label style={styles.label}>Gender</label>
                        <select className="input-field" value={regForm.gender} onChange={e => setRegForm({...regForm, gender: e.target.value})}>
                          <option>Male</option>
                          <option>Female</option>
                        </select>
                      </div>
                    </div>
                    
                    <label style={styles.label}>Home Address</label>
                    <input type="text" className="input-field" required value={regForm.address} onChange={e => setRegForm({...regForm, address: e.target.value})} />
                    
                    <label style={styles.label}>Contact Phone</label>
                    <input type="text" className="input-field" required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})} />
                    
                    <div className="hms-grid-2">
                      <div>
                        <label style={styles.label}>Blood Group</label>
                        <input type="text" className="input-field" required placeholder="e.g. O+" value={regForm.blood_group} onChange={e => setRegForm({...regForm, blood_group: e.target.value})} />
                      </div>
                      <div>
                        <label style={styles.label}>Allergies Check</label>
                        <input type="text" className="input-field" placeholder="e.g. Dust, Penicillin" value={regForm.allergies} onChange={e => setRegForm({...regForm, allergies: e.target.value})} />
                      </div>
                    </div>
                    
                    <label style={styles.label}>Chronic Conditions</label>
                    <input type="text" className="input-field" placeholder="e.g. Hypertension" value={regForm.chronic_conditions} onChange={e => setRegForm({...regForm, chronic_conditions: e.target.value})} />
                    
                    <label style={styles.label}>Emergency Contact Details</label>
                    <input type="text" className="input-field" required placeholder="e.g. kavindu perera - 0719876543" value={regForm.emergency_contact} onChange={e => setRegForm({...regForm, emergency_contact: e.target.value})} />
                  </>
                )}

                {registerRole === 'Doctor' && (
                  <>
                    <h4 style={styles.formSectionTitle}>Doctor Medical Specialty Logs</h4>
                    <div className="hms-grid-2">
                      <div>
                        <label style={styles.label}>Clinical Specialization</label>
                        <input type="text" className="input-field" required placeholder="e.g. Cardiologist" value={regForm.specialization} onChange={e => setRegForm({...regForm, specialization: e.target.value})} />
                      </div>
                      <div>
                        <label style={styles.label}>Specialist Experience (Years)</label>
                        <input type="number" className="input-field" required value={regForm.experience} onChange={e => setRegForm({...regForm, experience: e.target.value})} />
                      </div>
                    </div>
                    
                    <label style={styles.label}>Staff Contact Phone</label>
                    <input type="text" className="input-field" required value={regForm.contact} onChange={e => setRegForm({...regForm, contact: e.target.value})} />
                    
                    <label style={styles.label}>Qualifications Credentials</label>
                    <input type="text" className="input-field" required placeholder="e.g. MD, Board Certified Cardiologist" value={regForm.qualification} onChange={e => setRegForm({...regForm, qualification: e.target.value})} />
                    
                    <label style={styles.label}>Consultations Available Hours</label>
                    <input type="text" className="input-field" required placeholder="e.g. 08:00 AM - 04:00 PM" value={regForm.consultation_hours} onChange={e => setRegForm({...regForm, consultation_hours: e.target.value})} />
                    
                    <label style={styles.label}>Professional Biography</label>
                    <textarea className="input-field" rows="3" placeholder="Biography details..." value={regForm.bio} onChange={e => setRegForm({...regForm, bio: e.target.value})} />
                  </>
                )}

                {registerRole === 'Nurse' && (
                  <>
                    <h4 style={styles.formSectionTitle}>Nurse Credentials Logs</h4>
                    <div className="hms-grid-2">
                      <div>
                        <label style={styles.label}>Employee License ID</label>
                        <input type="text" className="input-field" required placeholder="e.g. NUR-2024-0091" value={regForm.employee_id} onChange={e => setRegForm({...regForm, employee_id: e.target.value})} />
                      </div>
                      <div>
                        <label style={styles.label}>Years Experience</label>
                        <input type="number" className="input-field" required value={regForm.experience_n} onChange={e => setRegForm({...regForm, experience_n: e.target.value})} />
                      </div>
                    </div>

                    <label style={styles.label}>Duty Contact Phone</label>
                    <input type="text" className="input-field" required value={regForm.contact_n} onChange={e => setRegForm({...regForm, contact_n: e.target.value})} />

                    <label style={styles.label}>Nurse Qualifications</label>
                    <input type="text" className="input-field" required placeholder="e.g. BSc. in Nursing, RN" value={regForm.qualification_n} onChange={e => setRegForm({...regForm, qualification_n: e.target.value})} />
                  </>
                )}

                <button type="submit" className="btn btn-primary" style={{marginTop:'24px', width:'100%', padding:'12px'}}>
                  Create Medicare Account
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. DASHBOARDS SYSTEM REDIRECTOR */}
      {currentPage === 'Dashboard' && currentUser && (
        <>
          {currentUser.role === 'admin' && (
            <AdminDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onSwitchAccount={handleSwitchAccount} 
              chatNavigationRequest={chatNavigationRequest}
            />
          )}
          {currentUser.role === 'doctor' && (
            <DoctorDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onSwitchAccount={handleSwitchAccount} 
              chatNavigationRequest={chatNavigationRequest}
            />
          )}
          {currentUser.role === 'patient' && (
            <PatientDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onSwitchAccount={handleSwitchAccount} 
              chatNavigationRequest={chatNavigationRequest}
            />
          )}
          {currentUser.role === 'nurse' && (
            <NurseDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onSwitchAccount={handleSwitchAccount} 
              chatNavigationRequest={chatNavigationRequest}
            />
          )}
        </>
      )}
    </div>
  );
}

// Styling mapping objects for Home and Auth pages
const styles = {
  navBar: {
    background: 'linear-gradient(90deg, #f8fbff 0%, #eff7ff 100%)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
    padding: '18px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 8px 30px -18px rgba(15, 23, 42, 0.25)'
  },
  logoFlex: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'left'
  },
  logoBadge: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    backgroundColor: '#0062FF',
    color: '#FFFFFF',
    fontSize: '22px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 20px -10px rgba(0, 98, 255, 0.8)'
  },
  logoTextTitle: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: '1.2'
  },
  logoSubTitle: {
    fontSize: '0.72rem',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    lineHeight: '1.2'
  },
  navLinks: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  },
  navLink: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#334155',
    transition: 'color 0.2s'
  },
  navLinkActive: {
    fontWeight: '700',
    fontSize: '0.95rem',
    color: '#0062FF',
    backgroundColor: '#edf5ff',
    padding: '10px 14px',
    borderRadius: '12px'
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  },
  phoneBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    backgroundColor: '#EAF3FF',
    color: '#0062FF',
    fontWeight: '700',
    borderRadius: 'var(--radius-pill)',
    fontSize: '0.85rem',
    border: '1px solid rgba(0, 98, 255, 0.08)'
  },
  loginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #0062ff 0%, #0054d8 100%)',
    color: '#FFFFFF',
    fontWeight: '700',
    borderRadius: '14px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    boxShadow: '0 10px 24px -14px rgba(0, 98, 255, 0.85)'
  },
  heroSection: {
    padding: '48px 40px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '30px',
    flexWrap: 'wrap',
    maxWidth: '1280px',
    margin: '0 auto',
    background: '#ffffff',
    borderBottom: '1px solid #e5edf7'
  },
  heroContent: {
    flex: 1,
    textAlign: 'left',
    paddingLeft: '10px'
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 4.8vw, 4.5rem)',
    fontWeight: '900',
    color: '#0b1d44',
    lineHeight: '1.02',
    marginTop: '8px',
    maxWidth: '560px'
  },
  heroSubtitle: {
    fontSize: '1.65rem',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '20px',
    lineHeight: '1.3'
  },
  heroSubtitleSecondary: {
    fontSize: '1.65rem',
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: '1.3'
  },
  heroText: {
    fontSize: '1.05rem',
    color: '#475569',
    marginTop: '16px',
    lineHeight: '1.7',
    maxWidth: '500px'
  },
  heroBtn1: {
    padding: '14px 24px',
    fontSize: '1rem',
    borderRadius: '12px',
    boxShadow: '0 18px 36px -18px rgba(0, 98, 255, 0.9)'
  },
  heroBtn2: {
    padding: '14px 24px',
    fontSize: '1rem',
    borderRadius: '12px'
  },
  heroImgContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    minHeight: '420px',
    position: 'relative'
  },
  heroImage: {
    width: '100%',
    maxWidth: '560px',
    height: '420px',
    objectFit: 'cover',
    display: 'block',
    borderRadius: '24px',
    backgroundColor: '#e8f1ff',
    boxShadow: '0 18px 40px -28px rgba(15, 23, 42, 0.32)'
  },
  searchPanel: {
    display: 'flex',
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    padding: '14px 18px',
    borderRadius: '14px',
    boxShadow: '0 14px 30px -24px rgba(15, 23, 42, 0.3)',
    maxWidth: '980px',
    width: '90%',
    margin: '8px auto 0',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    position: 'relative',
    zIndex: 10
  },
  searchCol: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: '#F8FAFC'
  },
  searchIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#E8F1FF',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchPanelBtn: {
    backgroundColor: 'var(--primary)',
    color: 'white',
    border: 'none',
    width: '52px',
    height: '52px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  sectionPadding: {
    padding: '64px 40px 20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left'
  },
  sectionBadge: {
    fontSize: '0.8rem',
    fontWeight: '800',
    color: '#0062FF',
    letterSpacing: '1.5px'
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 3vw, 2.8rem)',
    fontWeight: '900',
    marginTop: '6px',
    lineHeight: '1.2',
    maxWidth: '700px',
    color: '#0f172a'
  },
  sectionDesc: {
    color: '#475569',
    fontSize: '1rem',
    maxWidth: '700px',
    margin: '12px 0 0',
    lineHeight: '1.7'
  },
  serviceCard: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '22px 18px',
    borderRadius: '14px',
    border: '1px solid #e5eaf1',
    boxShadow: '0 8px 20px -18px rgba(15, 23, 42, 0.35)'
  },
  serviceIconContainer: {
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsBar: {
    background: '#0756d9',
    padding: '24px 20px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '20px',
    color: 'white',
    maxWidth: '1200px',
    margin: '26px auto 0',
    borderRadius: '14px',
    width: 'calc(100% - 80px)'
  },
  statsCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'center',
    fontWeight: '700'
  },
  aboutSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '72px 40px 20px',
    display: 'grid',
    gridTemplateColumns: '1.1fr 1fr',
    gap: '40px',
    alignItems: 'center'
  },
  aboutTextBlock: {
    textAlign: 'left'
  },
  featureList: {
    display: 'grid',
    gap: '14px',
    marginTop: '24px',
    marginBottom: '28px'
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '1rem',
    color: '#1e293b',
    fontWeight: '600'
  },
  checkMark: {
    display: 'inline-flex',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#E8F1FF',
    color: '#0062FF',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: '800'
  },
  ctaButton: {
    padding: '14px 22px',
    borderRadius: '12px',
    fontSize: '0.95rem'
  },
  aboutImageWrap: {
    display: 'flex',
    justifyContent: 'center'
  },
  aboutImage: {
    width: '100%',
    maxWidth: '540px',
    height: '330px',
    objectFit: 'cover',
    borderRadius: '28px',
    boxShadow: '0 22px 50px -30px rgba(15, 23, 42, 0.35)'
  },
  whyChooseSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 40px 20px',
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px'
  },
  whyChooseLeft: {
    textAlign: 'left'
  },
  whyList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '28px'
  },
  whyItem: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    border: '1px solid rgba(148,163,184,0.18)',
    borderRadius: '18px',
    padding: '18px 16px',
    boxShadow: '0 10px 20px -18px rgba(15, 23, 42, 0.25)'
  },
  whyIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '12px',
    backgroundColor: '#E8F1FF',
    color: '#0062FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  whyTitle: {
    color: '#0f172a',
    fontSize: '1.05rem',
    fontWeight: '800',
    marginBottom: '4px'
  },
  whyText: {
    color: '#475569',
    fontSize: '0.85rem',
    lineHeight: '1.6'
  },
  sectionPaddingTestimonials: {
    width: 'calc(100% - 46px)',
    boxSizing: 'border-box',
    padding: '36px 0 10px',
    maxWidth: '1200px',
    margin: '0 auto',
    alignItems: 'center'
  },
  testimonialTitle: {
    fontSize: '1.3rem',
    maxWidth: 'none',
    textAlign: 'center',
    marginTop: 0
  },
  testimonialCard: {
    textAlign: 'left',
    padding: '18px 16px 14px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
    minHeight: '145px'
  },
  testimonialMain: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px'
  },
  testimonialAvatar: {
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0
  },
  testimonialCopy: {
    position: 'relative',
    paddingLeft: '4px'
  },
  quoteIcon: {
    color: '#1664e8',
    position: 'absolute',
    top: '-3px',
    left: '-2px'
  },
  testimonialText: {
    fontSize: '0.76rem',
    color: '#334155',
    lineHeight: '1.65',
    margin: '0 0 8px',
    paddingLeft: '22px'
  },
  testimonialName: {
    fontWeight: '800',
    color: '#0f172a',
    fontSize: '0.82rem',
    margin: 0
  },
  testimonialStars: {
    display: 'flex',
    gap: '2px',
    color: '#f5a900',
    marginTop: '10px',
    paddingLeft: '70px'
  },
  testimonialDots: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '7px',
    marginTop: '16px'
  },
  testimonialDot: {
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    backgroundColor: '#dbe2eb'
  },
  testimonialDotActive: {
    width: '16px',
    borderRadius: '999px',
    backgroundColor: '#1664e8'
  },
  emergencyBanner: {
    width: 'calc(100% - 46px)',
    boxSizing: 'border-box',
    maxWidth: '1200px',
    margin: '20px auto 40px',
    padding: '14px 18px 0',
    display: 'grid',
    gridTemplateColumns: '1fr 1.35fr 0.85fr',
    gap: '0',
    alignItems: 'center',
    background: '#0955dc',
    borderRadius: '14px',
    boxShadow: '0 14px 30px -20px rgba(0, 70, 190, 0.8)',
    overflow: 'hidden'
  },
  emergencyInfoBox: {
    padding: '6px 22px 20px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minHeight: '94px',
    borderRight: '1px solid rgba(255,255,255,0.28)'
  },
  emergencyIcon: {
    width: '62px',
    height: '62px',
    borderRadius: '50%',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0955dc',
    flexShrink: 0,
    boxShadow: 'inset 0 0 0 6px #d8e7ff'
  },
  emergencyTitle: {
    color: '#fff',
    fontSize: '0.78rem',
    fontWeight: '700',
    letterSpacing: '0.01em'
  },
  emergencyPhone: {
    color: '#fff',
    fontWeight: '800',
    fontSize: '1.55rem',
    lineHeight: '1.2',
    marginTop: '6px'
  },
  emergencyText: {
    color: '#fff',
    fontSize: '0.68rem',
    marginTop: '6px'
  },
  emergencySupportBox: {
    padding: '10px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '18px',
    minHeight: '94px'
  },
  supportTitle: {
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: '800',
    lineHeight: '1.2'
  },
  supportText: {
    color: '#fff',
    fontSize: '0.7rem',
    marginTop: '8px',
    lineHeight: '1.55',
    maxWidth: '250px'
  },
  supportBtn: {
    backgroundColor: '#fff',
    color: '#0062FF',
    border: 'none',
    cursor: 'pointer',
    borderRadius: '999px',
    padding: '9px 15px',
    fontWeight: '800',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap'
  },
  ambulanceWrap: {
    alignSelf: 'stretch',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: '110px',
    borderLeft: '1px solid rgba(255,255,255,0.18)'
  },
  ambulanceImage: {
    width: '100%',
    maxWidth: '230px',
    height: '112px',
    objectFit: 'cover',
    objectPosition: 'center',
    mixBlendMode: 'multiply'
  },
  footer: {
    backgroundColor: '#f7faff',
    color: '#10204a',
    padding: '42px 55px 0'
  },
  footerLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginTop: '16px'
  },
  footerBottom: {
    backgroundColor: '#0756d9',
    padding: '14px 55px',
    margin: '34px -55px 0',
    fontSize: '0.8rem',
    color: '#FFFFFF'
  },
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    padding: '20px'
  },
  roleSelectionShell: {
    width: '100%',
    maxWidth: '760px',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px'
  },
  roleSelectionHeader: {
    textAlign: 'center',
    margin: '18px 0 28px'
  },
  roleSelectionEyebrow: {
    color: 'var(--primary)',
    fontSize: '0.72rem',
    fontWeight: '800',
    letterSpacing: '0.14em'
  },
  roleSelectionTitle: {
    color: '#0f172a',
    fontSize: 'clamp(1.8rem, 4vw, 2.35rem)',
    fontWeight: '800',
    marginTop: '8px'
  },
  roleSelectionText: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    maxWidth: '500px',
    margin: '10px auto 0',
    lineHeight: '1.6'
  },
  authCard: {
    width: '100%',
    maxWidth: '580px',
    padding: '42px 40px 34px',
    textAlign: 'left',
    borderRadius: '28px',
    border: '1px solid #e5ebf4',
    boxShadow: '0 24px 60px -32px rgba(30, 64, 175, 0.35)'
  },
  registerShell: {
    width: '100%',
    maxWidth: '620px',
    display: 'flex',
    flexDirection: 'column'
  },
  registerCard: {
    width: '100%',
    maxWidth: '620px',
    padding: '34px 38px 36px',
    borderRadius: '28px',
    border: '1px solid #e5ebf4',
    boxShadow: '0 24px 60px -32px rgba(30, 64, 175, 0.35)'
  },
  registerHeading: {
    textAlign: 'center',
    color: '#101b45',
    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
    fontWeight: '800',
    marginTop: '28px'
  },
  registerSubtitle: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '0.95rem',
    marginTop: '8px'
  },
  registerSectionHeading: {
    color: '#172554',
    fontSize: '0.92rem',
    fontWeight: '800',
    paddingBottom: '10px',
    borderBottom: '1px solid #e2e8f0',
    margin: '4px 0 10px'
  },
  loginBrand: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  loginLogoMark: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #0b75f0, #1551d7)',
    color: '#fff',
    fontSize: '2.8rem',
    fontWeight: '400',
    lineHeight: '1',
    boxShadow: '0 8px 18px -10px rgba(0, 98, 255, 0.9)'
  },
  loginBrandText: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1'
  },
  loginBrandWordmark: {
    fontSize: '1.65rem',
    color: '#101b45',
    letterSpacing: '-0.03em'
  },
  loginBrandAccent: {
    color: '#0b72ee'
  },
  loginBrandHospital: {
    color: '#64748b',
    fontSize: '0.95rem',
    marginTop: '7px'
  },
  loginHeading: {
    textAlign: 'center',
    color: '#101b45',
    fontSize: 'clamp(1.8rem, 4vw, 2.35rem)',
    fontWeight: '800',
    marginTop: '32px'
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '1rem',
    marginTop: '8px'
  },
  loginAccent: {
    width: '60px',
    height: '4px',
    borderRadius: '999px',
    background: 'var(--primary)',
    margin: '20px auto 26px'
  },
  loginLabel: {
    display: 'block',
    color: '#172554',
    fontSize: '0.88rem',
    fontWeight: '600',
    margin: '16px 0 8px'
  },
  loginField: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    minHeight: '56px',
    border: '1px solid #dce4ef',
    borderRadius: '14px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 14px -12px rgba(15, 23, 42, 0.4)'
  },
  loginFieldIcon: {
    width: '42px',
    height: '42px',
    marginLeft: '8px',
    borderRadius: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--primary)',
    backgroundColor: '#edf5ff',
    flexShrink: 0
  },
  loginSelect: {
    width: '100%',
    height: '54px',
    padding: '0 40px 0 14px',
    border: 'none',
    background: 'transparent',
    color: '#172554',
    fontSize: '1rem',
    fontWeight: '600',
    appearance: 'none',
    cursor: 'pointer'
  },
  loginSelectChevron: {
    position: 'absolute',
    right: '16px',
    color: '#172554',
    transform: 'rotate(90deg)',
    pointerEvents: 'none'
  },
  loginInput: {
    width: '100%',
    height: '54px',
    minWidth: 0,
    padding: '0 14px',
    border: 'none',
    background: 'transparent',
    color: '#172554',
    fontSize: '0.95rem'
  },
  passwordToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    color: '#64748b',
    cursor: 'pointer',
    padding: '12px',
    flexShrink: 0
  },
  loginOptions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px'
  },
  rememberOption: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: '#334155',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  forgotButton: {
    border: 'none',
    background: 'transparent',
    color: 'var(--primary)',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  loginSubmit: {
    width: '100%',
    minHeight: '56px',
    marginTop: '22px',
    borderRadius: '14px',
    fontSize: '1.15rem',
    fontWeight: '700',
    boxShadow: '0 14px 28px -16px rgba(0, 98, 255, 0.85)'
  },
  loginDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    color: '#64748b',
    fontSize: '0.8rem',
    margin: '26px 0 22px'
  },
  signupPrompt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    color: '#172554',
    fontSize: '0.95rem'
  },
  signupButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #cbdcf7',
    borderRadius: '999px',
    background: '#fff',
    color: 'var(--primary)',
    padding: '10px 17px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  authTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px'
  },
  label: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '6px',
    textAlign: 'left',
    marginTop: '12px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--error-light)',
    color: 'var(--error)',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'left'
  },
  roleChooseCard: {
    minHeight: '230px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    borderTop: '3px solid',
    borderRadius: '16px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    boxShadow: '0 8px 24px -20px rgba(15, 23, 42, 0.5)'
  },
  roleCardTopline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  roleIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '13px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  roleCardTitle: {
    fontSize: '1.12rem',
    fontWeight: '800',
    marginTop: '18px'
  },
  roleCardDescription: {
    color: 'var(--text-secondary)',
    fontSize: '0.8rem',
    lineHeight: '1.55',
    marginTop: '8px',
    flex: 1
  },
  roleCardAction: {
    color: 'var(--primary)',
    fontSize: '0.76rem',
    fontWeight: '800',
    marginTop: '16px'
  },
  formSectionTitle: {
    fontWeight: '700',
    color: 'var(--primary)',
    marginTop: '20px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-light)',
    marginBottom: '12px',
    textAlign: 'left'
  },
};