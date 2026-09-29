import React, { useState, useEffect } from 'react';
import { 
  Search, Star, Calendar, Phone, ArrowRight, User
} from 'lucide-react';

export default function Doctors({ onBookAppointment }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackDoctors = [
    {
      id: 'fb-1',
      name: 'Yeshani Perera',
      specialization: 'General Medicine',
      experience: 15,
      qualification: 'MBBS, MD (General Medicine)',
      rating: 5.0,
      consultation_hours: '08:00 AM - 04:00 PM',
      profile_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
      bio: 'Providing outstanding primary patient care and administrative leadership.'
    },
    {
      id: 'fb-2',
      name: 'Nuwan Tharanga',
      specialization: 'Cardiology',
      experience: 12,
      qualification: 'MD, FACC, Board Certified Cardiologist',
      rating: 4.9,
      consultation_hours: '09:00 AM - 05:00 PM',
      profile_image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      bio: 'Expert in interventional cardiovascular surgeries and arrhythmia diagnostics.'
    },
    {
      id: 'fb-3',
      name: 'Tharuka De Silva',
      specialization: 'Neurology',
      experience: 10,
      qualification: 'MD, PhD (Clinical Neurology)',
      rating: 4.8,
      consultation_hours: '08:00 AM - 03:00 PM',
      profile_image: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=300&auto=format&fit=crop&q=80',
      bio: 'Specialist in neuromuscular health, brain scans, and sleep cycle disorders.'
    },
    {
      id: 'fb-4',
      name: 'Gayan Perera',
      specialization: 'Orthopedics',
      experience: 14,
      qualification: 'MBBS, MS (Orthopedic Surgery)',
      rating: 4.9,
      consultation_hours: '10:00 AM - 06:00 PM',
      profile_image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
      bio: 'Focused on joint replacement surgeries, athletic injuries, and bone health.'
    }
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // We hit the backend route. It works with any dummy userId
      const res = await fetch('/api/patient/doctors/any');
      if (res.ok) {
        const dbDocs = await res.json();
        
        // Map database fields to standard UI fields
        const formattedDbDocs = dbDocs.map(doc => ({
          id: doc.id,
          name: doc.name,
          specialization: doc.specialization || 'Cardiology',
          experience: doc.experience || 10,
          qualification: doc.qualification || 'MBBS',
          rating: parseFloat(doc.rating) || 4.9,
          consultation_hours: doc.consultation_hours || '09:00 AM - 05:00 PM',
          profile_image: doc.profile_image || 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300',
          bio: doc.bio || 'Medical professional dedicated to hospital healthcare.'
        }));

        // Merge database doctors with fallbacks, prioritizing database ones and avoiding duplicates
        const merged = [...formattedDbDocs];
        fallbackDoctors.forEach(fb => {
          if (!merged.some(m => m.name.toLowerCase() === fb.name.toLowerCase())) {
            merged.push(fb);
          }
        });
        setDoctors(merged);
      } else {
        setDoctors(fallbackDoctors);
      }
    } catch (err) {
      console.warn('Backend server offline. Falling back to static expert doctors list.', err.message);
      setDoctors(fallbackDoctors);
    } finally {
      setLoading(false);
    }
  };

  const specialties = ['All', 'General Medicine', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics'];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = selectedSpecialty === 'All' || 
                            doc.specialization.toLowerCase() === selectedSpecialty.toLowerCase();
    
    return matchesSearch && matchesSpecialty;
  });

  const getSpecialtyColor = (spec) => {
    const colors = {
      'cardiology': '#EF4444',
      'neurology': '#A855F7',
      'pediatrics': '#F59E0B',
      'orthopedics': '#10B981',
      'general medicine': '#0062FF'
    };
    return colors[spec.toLowerCase()] || '#64748B';
  };

  return (
    <div style={styles.container} className="animate-fade">
      {/* 1. HERO BANNER */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Our Doctors</h1>
          <div style={styles.breadcrumb}>
            <span>Home</span>
            <span style={styles.breadcrumbSeparator}>/</span>
            <span style={styles.breadcrumbActive}>Doctors</span>
          </div>
        </div>
      </section>

      {/* 2. DIRECTORY TITLE */}
      <section style={styles.titleSection}>
        <h2 style={styles.sectionHeader}>Meet Our Specialists</h2>
        <p style={styles.sectionSubtitle}>
          Browse through our team of highly qualified and experienced medical professionals.
        </p>
      </section>

      {/* 3. SEARCH AND FILTERS */}
      <section style={styles.controlsSection}>
        <div style={styles.controlsWrapper}>
          {/* Search bar */}
          <div style={styles.searchBar}>
            <Search size={18} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Search by name, specialty, or qualification..." 
              style={styles.searchInput}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Specialty Filters */}
          <div style={styles.filterPills}>
            {specialties.map(spec => (
              <button 
                key={spec}
                onClick={() => setSelectedSpecialty(spec)}
                style={{
                  ...styles.filterPill,
                  backgroundColor: selectedSpecialty === spec ? 'var(--primary)' : '#FFFFFF',
                  color: selectedSpecialty === spec ? '#FFFFFF' : 'var(--text-secondary)',
                  borderColor: selectedSpecialty === spec ? 'var(--primary)' : 'var(--border-light)'
                }}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DOCTORS GRID */}
      <section style={styles.gridSection}>
        {loading ? (
          <div style={styles.loadingSpinner}>Loading our expert team...</div>
        ) : filteredDoctors.length > 0 ? (
          <div style={styles.doctorsGrid}>
            {filteredDoctors.map(doc => (
              <div key={doc.id} className="card" style={styles.doctorCard}>
                <div style={styles.docImgWrapper}>
                  <img src={doc.profile_image} alt={doc.name} style={styles.docImg} />
                </div>
                <div style={styles.docBody}>
                  {/* Rating block */}
                  <div style={styles.ratingBlock}>
                    <Star size={14} fill="#F59E0B" color="#F59E0B" />
                    <span style={styles.ratingVal}>{doc.rating.toFixed(1)}</span>
                  </div>

                  <h3 style={styles.docName}>{doc.name}</h3>
                  
                  {/* Specialization Badge */}
                  <div style={styles.badgesRow}>
                    <span style={{ 
                      ...styles.specBadge, 
                      backgroundColor: getSpecialtyColor(doc.specialization) + '15',
                      color: getSpecialtyColor(doc.specialization)
                    }}>
                      {doc.specialization}
                    </span>
                    <span style={styles.expBadge}>{doc.experience} Years Exp</span>
                  </div>

                  <p style={styles.docDegree}>{doc.qualification}</p>
                  <p style={styles.docBio}>{doc.bio}</p>

                  <div style={styles.divider}></div>

                  {/* Hours Block */}
                  <div style={styles.hoursBlock}>
                    <Calendar size={14} color="var(--text-secondary)" />
                    <span style={styles.hoursText}>{doc.consultation_hours}</span>
                  </div>

                  {/* Action Buttons */}
                  <div style={styles.actionButtons}>
                    <button 
                      className="btn btn-primary" 
                      style={styles.bookBtn}
                      onClick={() => onBookAppointment(doc)}
                    >
                      <span>Book Slot</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <User size={48} color="var(--text-muted)" />
            <h3 style={styles.emptyTitle}>No Doctors Found</h3>
            <p style={styles.emptyText}>We couldn't find any specialists matching your search or filters.</p>
          </div>
        )}
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
    backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop&q=80")',
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
  titleSection: {
    padding: '60px 40px 10px 40px',
    textAlign: 'center'
  },
  sectionHeader: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '12px'
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6'
  },
  controlsSection: {
    padding: '20px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  controlsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    border: '1px solid var(--border-light)',
    borderRadius: '12px',
    maxWidth: '560px',
    width: '100%',
    backgroundColor: '#FFFFFF',
    boxShadow: 'var(--shadow-sm)'
  },
  searchInput: {
    border: 'none',
    width: '100%',
    fontSize: '0.92rem',
    color: 'var(--text-primary)',
    outline: 'none',
    backgroundColor: 'transparent'
  },
  filterPills: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  filterPill: {
    padding: '8px 18px',
    borderRadius: 'var(--radius-pill)',
    border: '1px solid',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  gridSection: {
    padding: '40px 40px 80px 40px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  doctorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '30px'
  },
  doctorCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left'
  },
  docImgWrapper: {
    width: '100%',
    height: '240px',
    backgroundColor: 'var(--bg-main)'
  },
  docImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  docBody: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  ratingBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    alignSelf: 'flex-start',
    marginBottom: '10px'
  },
  ratingVal: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--text-primary)'
  },
  docName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  badgesRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  specBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '4px 10px',
    borderRadius: '6px'
  },
  expBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '4px 10px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    borderRadius: '6px'
  },
  docDegree: {
    fontSize: '0.85rem',
    color: 'var(--primary)',
    fontWeight: '700',
    marginBottom: '8px'
  },
  docBio: {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    marginBottom: '20px',
    flex: 1
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-light)',
    margin: '0 -24px 16px -24px'
  },
  hoursBlock: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  hoursText: {
    fontSize: '0.82rem',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'flex',
    gap: '12px'
  },
  bookBtn: {
    flex: 1,
    padding: '10px 16px',
    fontSize: '0.88rem',
    fontWeight: '700',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  loadingSpinner: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-secondary)',
    textAlign: 'center',
    padding: '40px'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 40px',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginTop: '16px',
    marginBottom: '6px'
  },
  emptyText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    maxWidth: '360px',
    lineHeight: '1.4'
  }
};
