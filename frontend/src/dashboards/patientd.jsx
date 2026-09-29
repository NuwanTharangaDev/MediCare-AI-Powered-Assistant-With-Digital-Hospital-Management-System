import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Award, Building, BarChart2, Settings, LogOut, 
  Plus, Edit2, Trash2, Search, Filter, Shield, Moon, Sun, ArrowRight, UserCheck, 
  MessageSquare, FileText, CheckCircle2, AlertCircle, FileCheck, Check, Clock, 
  Heart, ShieldAlert, CreditCard, ChevronRight, UserPlus, Download
} from 'lucide-react';
import Modal from '../components/Modal';
import LogoutModal from '../components/LogoutModal';

export default function PatientDashboard({ user, onLogout, onSwitchAccount, chatNavigationRequest }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showLogout, setShowLogout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Real-time patient states
  const [overviewData, setOverviewData] = useState({
    upcoming: { date: 'May 31, 2026', time: '10:00 AM', doctor_name: 'Dr. Sarath Jayasekara', department_name: 'Cardiology' },
    stats: { healthStatus: 'Good', activeMedications: 2 },
    recentAppointments: []
  });
  const [doctorsList, setDoctorsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [recordsList, setRecordsList] = useState([]);
  const [prescriptionsList, setPrescriptionsList] = useState([]);
  const [billsList, setBillsList] = useState([]);
  
  // Interactive Chat State
  const [chatContacts, setChatContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'book', 'pay'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form fields
  const [bookForm, setBookForm] = useState({ doctor_id: '', date: '', time: '', notes: '', type: 'Consultation' });
  const [cardForm, setCardForm] = useState({ cardNumber: '', expiry: '', cvv: '' });

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (chatNavigationRequest?.tab) setActiveTab(chatNavigationRequest.tab);
  }, [chatNavigationRequest]);

  const fetchData = async () => {
    try {
      const resOverview = await fetch(`${API_BASE}/patient/overview/${user.id}`);
      if (resOverview.ok) {
        setOverviewData(await resOverview.json());
      }
      
      if (activeTab === 'Appointments') {
        const res = await fetch(`${API_BASE}/patient/appointments/${user.id}`);
        if (res.ok) setAppointmentsList(await res.json());
        
        const resDocs = await fetch(`${API_BASE}/patient/doctors/${user.id}`);
        if (resDocs.ok) setDoctorsList(await resDocs.json());
      } else if (activeTab === 'My Doctors') {
        const res = await fetch(`${API_BASE}/patient/doctors/${user.id}`);
        if (res.ok) setDoctorsList(await res.json());
      } else if (activeTab === 'Medical Records') {
        const res = await fetch(`${API_BASE}/patient/records/${user.id}`);
        if (res.ok) setRecordsList(await res.json());
      } else if (activeTab === 'Prescriptions') {
        const res = await fetch(`${API_BASE}/patient/prescriptions/${user.id}`);
        if (res.ok) setPrescriptionsList(await res.json());
      } else if (activeTab === 'Billing') {
        const res = await fetch(`${API_BASE}/patient/billing/${user.id}`);
        if (res.ok) setBillsList(await res.json());
      } else if (activeTab === 'Messages') {
        const resC = await fetch(`${API_BASE}/messages/contacts/${user.id}/patient`);
        if (resC.ok) {
          const list = await resC.json();
          setChatContacts(list);
          if (list.length > 0 && !activeChat) {
            handleSelectChat(list[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Backend server offline. falling back to state details.', err.message);
    }
  };

  const handleSelectChat = async (contact) => {
    setActiveChat(contact);
    try {
      const res = await fetch(`${API_BASE}/messages/history/${user.id}/${contact.id}`);
      if (res.ok) setChatMessages(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      const res = await fetch(`${API_BASE}/messages/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: activeChat.id,
          content: newMessage,
          is_emergency: false
        })
      });
      if (res.ok) {
        setNewMessage('');
        handleSelectChat(activeChat);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patient/appointments/book/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookForm)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
        alert('Appointment requested successfully!');
      }
    } catch (err) {
      alert('Error requesting appointment booking!');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!confirm('Are you sure you want to cancel this appointment slot?')) return;
    try {
      const res = await fetch(`${API_BASE}/patient/appointments/cancel/${id}`, { method: 'PUT' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestRefill = async () => {
    alert('Medication refill request successfully submitted to pharmacy ward!');
  };

  const handlePayOnline = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/patient/billing/pay/${selectedItem.id}`, {
        method: 'PUT'
      });
      if (res.ok) {
        setModalOpen(false);
        setSelectedItem(null);
        fetchData();
        alert('Payment settled successfully via Medicare Secure Gateway!');
      }
    } catch (err) {
      alert('Online payment transaction failed!');
    }
  };

  const openFormModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === 'book') {
      setBookForm({ doctor_id: '', date: '', time: '', notes: '', type: 'Consultation' });
    } else if (type === 'pay') {
      setCardForm({ cardNumber: '', expiry: '', cvv: '' });
    }
    setModalOpen(true);
  };

  return (
    <div style={styles.dashboardContainer} data-theme={darkMode ? 'dark' : 'light'}>
      {/* Sidebar Navigation */}
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>+</div>
          <div>
            <h2 style={styles.logoText}>MediCare</h2>
            <span style={styles.logoSub}>Hospital</span>
          </div>
        </div>
        
        <nav style={styles.navigation}>
          {[
            { name: 'Dashboard', icon: Activity },
            { name: 'Appointments', icon: Calendar },
            { name: 'My Doctors', icon: Heart },
            { name: 'Medical Records', icon: FileText },
            { name: 'Prescriptions', icon: FileCheck },
            { name: 'Billing', icon: Building },
            { name: 'Messages', icon: MessageSquare },
            { name: 'Profile', icon: Award },
            { name: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`nav-pill ${activeTab === tab.name ? 'active' : ''}`}
                style={styles.navButton}
              >
                <Icon size={18} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
        
        <div style={styles.sidebarFooter}>
          <div style={styles.secureCard}>
            <span className="secure-indicator"></span>
            <div style={{fontSize:'0.8rem', fontWeight:'600'}}>Health Overview</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>Status: stable medical trace</div>
          </div>
          
          <button style={styles.logoutBtn} onClick={() => setShowLogout(true)}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main style={styles.mainContent}>
        <header style={styles.header}>
          <div>
            <span style={{color:'var(--text-secondary)', fontSize:'0.9rem', fontWeight:'500'}}>Patient Portal • MediCare Hospital</span>
            <h1 style={styles.titleText}>
              {activeTab === 'Dashboard' ? `Welcome, ${user?.name || 'Oshan'}! 👋` : `${activeTab}`}
            </h1>
          </div>
          
          <div style={styles.headerProfile}>
            <button style={styles.themeToggle} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} color="orange" /> : <Moon size={18} color="#64748B" />}
            </button>
            <div style={styles.profileInfo}>
              <img src={user?.profile_image} alt="Patient" style={styles.profileImg} />
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:'700', fontSize:'0.9rem'}}>{user?.name || 'Oshan Perera'}</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Patient Client</div>
              </div>
            </div>
          </div>
        </header>

        {/* 1. Dashboard Tab Overview */}
        {activeTab === 'Dashboard' && (
          <div className="animate-fade" style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            <div className="hms-grid-2">
              <div className="card" style={{display:'flex', gap:'20px', textAlign:'left'}}>
                <div style={styles.upcomingApptIcon}>
                  <Calendar size={28} color="var(--primary)" />
                </div>
                <div style={{flex: 1}}>
                  <h4 style={{fontWeight:'800', color:'var(--text-primary)'}}>Upcoming Appointment</h4>
                  <div style={{marginTop:'12px', fontSize:'0.9rem'}}>
                    <div style={{fontWeight:'700', color:'var(--primary)'}}>{overviewData.upcoming.doctor_name}</div>
                    <div style={{color:'var(--text-secondary)', fontSize:'0.8rem'}}>{overviewData.upcoming.department_name} Specialist</div>
                    <div style={{marginTop:'8px', fontWeight:'600', color:'var(--text-primary)'}}>{overviewData.upcoming.date} • {overviewData.upcoming.time}</div>
                  </div>
                  <button className="btn btn-secondary" style={{marginTop:'16px', padding:'8px 16px'}} onClick={() => openFormModal('book')}>
                    Book/Reschedule
                  </button>
                </div>
              </div>

              <div className="card" style={{display:'flex', flexDirection:'column', justifyContent:'space-between', textAlign:'left'}}>
                <div>
                  <h4 style={{fontWeight:'800', color:'var(--text-primary)'}}>Health Status</h4>
                  <div style={{fontSize:'2.2rem', fontWeight:'800', color:'var(--success)', marginTop:'8px'}}>
                    {overviewData.stats.healthStatus}
                  </div>
                  <p style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Your health metrics are looking stable and well this month.</p>
                </div>
                <div style={{display:'flex', gap:'12px', marginTop:'16px'}}>
                  <div style={styles.miniBadge}>Active Meds: {overviewData.stats.activeMedications}</div>
                  <div style={styles.miniBadge}>Blood Group: {user?.profile?.blood_group || 'A+'}</div>
                </div>
              </div>
            </div>

            <div style={styles.chartsGrid}>
              <div className="card" style={{flex: 1.8, textAlign:'left'}}>
                <h3 style={styles.cardTitle}>Recent Clinic Appointments</h3>
                <div style={styles.tableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Doctor</th>
                        <th style={styles.th}>Scheduled Date</th>
                        <th style={styles.th}>Clinic Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overviewData.recentAppointments.map((appt) => (
                        <tr key={appt.id} style={styles.tr}>
                          <td style={{...styles.td, fontWeight:'700'}}>{appt.doctor_name}</td>
                          <td style={styles.td}>{new Date(appt.date).toLocaleDateString()}</td>
                          <td style={styles.td}>
                            <span className={`badge ${appt.status === 'Completed' ? 'badge-success' : appt.status === 'Cancelled' ? 'badge-error' : 'badge-warning'}`}>{appt.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="card" style={{flex: 1.2, textAlign:'left', display:'flex', flexDirection:'column', gap:'12px'}}>
                <h3 style={styles.cardTitle}>Daily Health Tip</h3>
                <div style={styles.tipImageCard}>
                  <Heart size={36} color="var(--error)" />
                  <h4 style={{fontWeight:'800', marginTop:'12px'}}>Stay Hydrated Daily</h4>
                  <p style={{fontSize:'0.8rem', color:'var(--text-secondary)', textAlign:'center', marginTop:'8px'}}>Drink plenty of pure water and maintain an active cardio workout regimen for strong heart muscles.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. APPOINTMENTS SECTION */}
        {activeTab === 'Appointments' && (
          <div className="animate-fade">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
              <h3 style={styles.cardTitle}>Scheduled Clinic Visits</h3>
              <button className="btn btn-primary" onClick={() => openFormModal('book')}>
                <Plus size={16} /> Request Consultation Slot
              </button>
            </div>

            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Doctor Specialist</th>
                      <th style={styles.th}>Clinic Department</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Time</th>
                      <th style={styles.th}>Booking status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsList.map((appt) => (
                      <tr key={appt.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{appt.doctor_name}</td>
                        <td style={styles.td}>{appt.department_name || 'General Ward'}</td>
                        <td style={styles.td}>{new Date(appt.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{appt.time}</td>
                        <td style={styles.td}>
                          <span className={`badge ${appt.status === 'Upcoming' ? 'badge-info' : appt.status === 'Completed' ? 'badge-success' : appt.status === 'Cancelled' ? 'badge-error' : 'badge-warning'}`}>{appt.status}</span>
                        </td>
                        <td style={styles.td}>
                          {appt.status === 'Pending' || appt.status === 'Upcoming' ? (
                            <button className="btn btn-danger" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => handleCancelAppointment(appt.id)}>
                              Cancel
                            </button>
                          ) : (
                            <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>No actions available</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. MY DOCTORS SECTION */}
        {activeTab === 'My Doctors' && (
          <div className="animate-fade">
            <h3 style={{...styles.cardTitle, marginBottom:'20px'}}>Specialists Directory</h3>
            <div className="hms-grid-2">
              {doctorsList.map((doc) => (
                <div key={doc.id} className="card" style={{display:'flex', gap:'20px', textAlign:'left'}}>
                  <img src={doc.profile_image} alt="" style={{width:'80px', height:'80px', borderRadius:'14px', objectFit:'cover'}} />
                  <div style={{flex: 1}}>
                    <h4 style={{fontWeight:'800'}}>{doc.name}</h4>
                    <div style={{fontSize:'0.8rem', color:'var(--primary)', fontWeight:'600'}}>{doc.specialization}</div>
                    <div style={{fontSize:'0.75rem', color:'var(--text-secondary)', marginTop:'4px'}}>Hospital: MediCare Hospital</div>
                    <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>Hours: {doc.consultation_hours}</div>
                    <div style={{display:'flex', gap:'8px', marginTop:'16px'}}>
                      <button className="btn btn-primary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => setActiveTab('Messages')}>
                        Send Message
                      </button>
                      <button className="btn btn-secondary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => openFormModal('book')}>
                        Book Slot
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. MEDICAL RECORDS */}
        {activeTab === 'Medical Records' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Clinical Diagnostic Files</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px'}}>Secure hospital record database detailing heart traces, ECG scans and medical diagnostics reviews.</p>
              
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Report Name</th>
                      <th style={styles.th}>Compiled Date</th>
                      <th style={styles.th}>Diagnosing Doctor</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Print/Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordsList.map((rec) => (
                      <tr key={rec.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{rec.record_name}</td>
                        <td style={styles.td}>{new Date(rec.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{rec.doctor_name}</td>
                        <td style={styles.td}>
                          <span className="badge badge-success">{rec.status}</span>
                        </td>
                        <td style={styles.td}>
                          <button className="btn btn-secondary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => window.print()}>
                            <Download size={12} /> Download PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. PRESCRIPTIONS SECTION */}
        {activeTab === 'Prescriptions' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Active Pharmacy Orders</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px'}}>Check ongoing daily medication prescriptions. You can click refill request to submit triggers directly.</p>
              
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Medicine Name</th>
                      <th style={styles.th}>Prescribed Date</th>
                      <th style={styles.th}>Clinic Specialist</th>
                      <th style={styles.th}>Generic Instructions</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptionsList.map((pres) => (
                      <tr key={pres.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700', color:'var(--primary)'}}>{pres.medicines}</td>
                        <td style={styles.td}>{new Date(pres.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{pres.doctor_name}</td>
                        <td style={styles.td}>{pres.instructions || 'Take post-meals.'}</td>
                        <td style={styles.td}>
                          <button className="btn btn-primary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={handleRequestRefill}>
                            Request Refill
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. BILLING SECTION */}
        {activeTab === 'Billing' && (
          <div className="animate-fade" style={{textAlign:'left', display:'flex', flexDirection:'column', gap:'24px'}}>
            <div className="hms-grid-4">
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Total Bills</span>
                <h2 style={{fontWeight:'800', marginTop:'4px'}}>LKR 19,000.00</h2>
              </div>
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Pending Payments</span>
                <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--warning)'}}>LKR 1,500.00</h2>
              </div>
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Insurance Settled</span>
                <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--info)'}}>LKR 15,000.00</h2>
              </div>
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Paid Bills</span>
                <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--success)'}}>4 Wards</h2>
              </div>
            </div>

            <div className="card">
              <h3 style={styles.cardTitle}>Clinic Transactions Records</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Invoice ID</th>
                      <th style={styles.th}>Billing Date</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Online Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billsList.map((inv) => (
                      <tr key={inv.id} style={styles.tr}>
                        <td style={styles.td}>{inv.invoice_id}</td>
                        <td style={styles.td}>{new Date(inv.date).toLocaleDateString()}</td>
                        <td style={{...styles.td, fontWeight:'700'}}>LKR {inv.amount}</td>
                        <td style={styles.td}>
                          <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span>
                        </td>
                        <td style={styles.td}>
                          {inv.status === 'Pending' ? (
                            <button className="btn btn-primary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => openFormModal('pay', inv)}>
                              Pay Now
                            </button>
                          ) : (
                            <span style={{color:'var(--success)', fontWeight:'600'}}>Completed ✓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. MESSAGES CHAT */}
        {activeTab === 'Messages' && (
          <div className="card animate-fade" style={styles.chatContainer}>
            <div style={styles.chatSidebar}>
              <h3 style={{...styles.cardTitle, padding:'16px'}}>Clinic Chat</h3>
              <div style={styles.contactsWrapper}>
                {chatContacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    onClick={() => handleSelectChat(contact)}
                    style={{
                      ...styles.contactItem,
                      backgroundColor: activeChat?.id === contact.id ? 'var(--primary-light)' : 'transparent',
                    }}
                  >
                    <img src={contact.profile_image} alt="" style={styles.tableAvatar} />
                    <div style={{textAlign:'left'}}>
                      <div style={{fontWeight:'700', fontSize:'0.85rem'}}>{contact.name}</div>
                      <div style={{fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'capitalize'}}>{contact.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.chatMain}>
              {activeChat ? (
                <>
                  <div style={styles.chatHeader}>
                    <img src={activeChat.profile_image} alt="" style={styles.tableAvatar} />
                    <div style={{textAlign:'left'}}>
                      <h4 style={{fontWeight:'800', fontSize:'0.95rem'}}>{activeChat.name}</h4>
                      <span style={{fontSize:'0.7rem', color:'var(--success)', fontWeight:'600'}}>● Connected Live</span>
                    </div>
                  </div>
                  
                  <div style={styles.chatMessagesWrapper}>
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        style={{
                          ...styles.msgBubbleContainer,
                          justifyContent: msg.sender_id === user.id ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div 
                          style={{
                            ...styles.msgBubble,
                            backgroundColor: msg.sender_id === user.id ? 'var(--primary)' : 'var(--bg-main)',
                            color: msg.sender_id === user.id ? 'white' : 'var(--text-primary)',
                            borderRadius: msg.sender_id === user.id ? '12px 12px 0 12px' : '12px 12px 12px 0'
                          }}
                        >
                          <div>{msg.content}</div>
                          <span style={{fontSize:'0.6rem', opacity: 0.7, marginTop:'4px', display:'block', textAlign:'right'}}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} style={styles.chatInputArea}>
                    <input 
                      type="text" 
                      placeholder="Type message to doctor/nurse..." 
                      className="input-field" 
                      style={{borderRadius:'20px'}}
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{borderRadius:'50%', width:'40px', height:'40px', padding:0}}>
                      ➔
                    </button>
                  </form>
                </>
              ) : (
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)'}}>
                  Select a clinical specialist contact to begin chat logs.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. PROFILE SECTION */}
        {activeTab === 'Profile' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Client Medical Profile</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'16px'}}>Manage details of allergies, blood types, emergency contacts and medical coordinates.</p>
              
              <div className="hms-grid-2">
                <div>
                  <label style={styles.label}>Blood Type</label>
                  <input type="text" className="input-field" defaultValue={user?.profile?.blood_group || 'A+'} />
                </div>
                <div>
                  <label style={styles.label}>Primary Allergies</label>
                  <input type="text" className="input-field" defaultValue={user?.profile?.allergies || 'Dust, Penicillin'} />
                </div>
              </div>

              <div className="hms-grid-2" style={{marginTop:'12px'}}>
                <div>
                  <label style={styles.label}>Chronic Conditions</label>
                  <input type="text" className="input-field" defaultValue={user?.profile?.chronic_conditions || 'None'} />
                </div>
                <div>
                  <label style={styles.label}>Emergency Emergency Contact</label>
                  <input type="text" className="input-field" defaultValue={user?.profile?.emergency_contact || 'Kavindu Perera (Brother) - 0719876543'} />
                </div>
              </div>
              
              <button className="btn btn-primary" style={{marginTop:'24px'}}>
                Save Medical Profile
              </button>
            </div>
          </div>
        )}

        {/* 9. SETTINGS SECTION */}
        {activeTab === 'Settings' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Security Configurations</h3>
              <label style={styles.label}>Change Password</label>
              <input type="password" placeholder="Enter new password" className="input-field" style={{maxWidth:'320px'}} />
              <button className="btn btn-primary" style={{marginTop:'12px'}}>Update Security</button>
            </div>
          </div>
        )}
      </main>

      {/* Booking Form Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalType === 'book' ? 'Request Appointment' : 'Secure Online Payment Gateway'}>
        {modalType === 'book' && (
          <form onSubmit={handleBookAppointment} style={styles.form}>
            <label style={styles.label}>Select Medical Specialist</label>
            <select 
              className="input-field" 
              required 
              value={bookForm.doctor_id} 
              onChange={e => setBookForm({...bookForm, doctor_id: e.target.value})}
            >
              <option value="">Choose Specialist</option>
              {doctorsList.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
              ))}
            </select>

            <div className="hms-grid-2" style={{marginTop:'12px'}}>
              <div>
                <label style={styles.label}>Select Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  required 
                  value={bookForm.date} 
                  onChange={e => setBookForm({...bookForm, date: e.target.value})} 
                />
              </div>
              <div>
                <label style={styles.label}>Select Time</label>
                <input 
                  type="time" 
                  className="input-field" 
                  required 
                  value={bookForm.time} 
                  onChange={e => setBookForm({...bookForm, time: e.target.value})} 
                />
              </div>
            </div>

            <label style={styles.label}>Diagnostic Symptoms Description</label>
            <textarea 
              className="input-field" 
              rows="3" 
              placeholder="e.g. Mild chest pains or regular heart checkup."
              value={bookForm.notes} 
              onChange={e => setBookForm({...bookForm, notes: e.target.value})} 
            />

            <button type="submit" className="btn btn-primary" style={{marginTop:'16px'}}>
              Confirm Appointment Booking
            </button>
          </form>
        )}

        {modalType === 'pay' && (
          <form onSubmit={handlePayOnline} style={styles.form}>
            <div style={{backgroundColor:'var(--bg-main)', padding:'14px', borderRadius:'8px', marginBottom:'16px'}}>
              <div style={{fontWeight:'700'}}>Invoice Summary</div>
              <div style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:'4px'}}>Amount Due: LKR {selectedItem?.amount}</div>
              <div style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>Invoice: {selectedItem?.invoice_id}</div>
            </div>

            <label style={styles.label}>Card Number</label>
            <input 
              type="text" 
              placeholder="4000 1234 5678 9010" 
              className="input-field" 
              required 
              value={cardForm.cardNumber} 
              onChange={e => setCardForm({...cardForm, cardNumber: e.target.value})} 
            />

            <div className="hms-grid-2" style={{marginTop:'12px'}}>
              <div>
                <label style={styles.label}>Expiry Date</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="input-field" 
                  required 
                  value={cardForm.expiry} 
                  onChange={e => setCardForm({...cardForm, expiry: e.target.value})} 
                />
              </div>
              <div>
                <label style={styles.label}>Secure CVV</label>
                <input 
                  type="password" 
                  placeholder="***" 
                  className="input-field" 
                  required 
                  value={cardForm.cvv} 
                  onChange={e => setCardForm({...cardForm, cvv: e.target.value})} 
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{marginTop:'20px'}}>
              Settle LKR {selectedItem?.amount} securely
            </button>
          </form>
        )}
      </Modal>

      {/* Logout popups modal */}
      <LogoutModal 
        isOpen={showLogout} 
        onClose={() => setShowLogout(false)} 
        onConfirm={onLogout}
        onSwitchAccount={onSwitchAccount}
        role="patient"
      />
    </div>
  );
}

// Styling items mapping for Patient Dashboard
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    color: 'var(--text-primary)'
  },
  sidebar: {
    width: '260px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-light)',
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    position: 'sticky',
    top: 0,
    height: '100vh'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border-light)',
    marginBottom: '20px',
    textAlign: 'left'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: '#0062FF',
    color: 'white',
    fontSize: '24px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--primary)',
    lineHeight: '1'
  },
  logoSub: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    fontWeight: '600'
  },
  navigation: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1
  },
  navButton: {
    border: 'none',
    background: 'none',
    width: '100%',
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.95rem',
    transition: 'all 0.2s'
  },
  sidebarFooter: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  secureCard: {
    backgroundColor: 'var(--primary-light)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '10px',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    fontWeight: '600',
    cursor: 'pointer'
  },
  mainContent: {
    flex: 1,
    padding: '40px',
    overflowY: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px'
  },
  titleText: {
    fontSize: '2rem',
    fontWeight: '800',
    marginTop: '4px'
  },
  headerProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px'
  },
  themeToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '4px 12px',
    backgroundColor: 'var(--bg-sidebar)',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-pill)'
  },
  profileImg: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  upcomingApptIcon: {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    backgroundColor: 'var(--primary-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  miniBadge: {
    backgroundColor: 'var(--bg-main)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600'
  },
  chartsGrid: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  },
  cardTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    textAlign: 'left'
  },
  tableWrapper: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    padding: '16px',
    borderBottom: '2px solid var(--border-light)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: '700'
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid var(--border-light)',
    fontSize: '0.9rem'
  },
  tr: {
    transition: 'background-color 0.2s'
  },
  tipImageCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--error-light)',
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    flex: 1
  },
  tableAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  chatContainer: {
    display: 'flex',
    height: '500px',
    padding: 0,
    overflow: 'hidden'
  },
  chatSidebar: {
    width: '240px',
    borderRight: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column'
  },
  contactsWrapper: {
    flex: 1,
    overflowY: 'auto'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--border-light)',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  chatMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  chatHeader: {
    padding: '14px 20px',
    borderBottom: '1px solid var(--border-light)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  chatMessagesWrapper: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  msgBubbleContainer: {
    display: 'flex',
    width: '100%'
  },
  msgBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    fontSize: '0.85rem',
    textAlign: 'left'
  },
  chatInputArea: {
    padding: '14px 20px',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
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
  }
};
