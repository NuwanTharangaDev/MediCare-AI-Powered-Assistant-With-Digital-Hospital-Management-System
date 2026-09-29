import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Award, Building, BarChart2, Settings, LogOut, 
  Plus, Edit2, Trash2, Search, Filter, Shield, Moon, Sun, ArrowRight, UserCheck, 
  MessageSquare, FileText, CheckCircle2, AlertCircle, FileCheck, Check, Clock, UserPlus
} from 'lucide-react';
import Modal from '../components/Modal';
import LogoutModal from '../components/LogoutModal';

export default function DoctorDashboard({ user, onLogout, onSwitchAccount, chatNavigationRequest }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showLogout, setShowLogout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Doctor state details
  const [stats, setStats] = useState({
    consultationsToday: 8, totalPatients: 156, pendingReports: 12, newMessages: 5
  });
  const [scheduleList, setScheduleList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [billingStats, setBillingStats] = useState({ todayEarnings: 15500, pendingPayments: 4500, insuranceClaims: 12500, paidConsultations: 24 });
  const [billingHistory, setBillingHistory] = useState([]);
  const [notificationsList, setNotificationsList] = useState([]);
  
  // Custom states
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'diagnose', 'prescription', 'invoice'
  
  // Form elements
  const [diagnosisForm, setDiagnosisForm] = useState({ disease: '', status: 'Admitted', allergies: '', chronic_conditions: '' });
  const [presForm, setPresForm] = useState({ medicines: [{ medicine: '', dosage: '', duration: '', frequency: '' }], instructions: '', follow_up_date: '' });
  const [invoiceForm, setInvoiceForm] = useState({ amount: 1500, status: 'Pending', insurance_claims: 'None' });
  
  // Interactive Chat State
  const [chatContacts, setChatContacts] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (chatNavigationRequest?.tab) setActiveTab(chatNavigationRequest.tab);
  }, [chatNavigationRequest]);

  const fetchData = async () => {
    try {
      const resOverview = await fetch(`${API_BASE}/doctor/overview/${user.id}`);
      if (resOverview.ok) {
        const data = await resOverview.json();
        setStats(data.stats);
        setScheduleList(data.schedule);
      }

      if (activeTab === 'Patients') {
        const res = await fetch(`${API_BASE}/doctor/patients/${user.id}`);
        if (res.ok) setPatientsList(await res.json());
      } else if (activeTab === 'Appointments') {
        const res = await fetch(`${API_BASE}/doctor/schedule/${user.id}`);
        if (res.ok) setScheduleList(await res.json());
      } else if (activeTab === 'Billing') {
        const res = await fetch(`${API_BASE}/doctor/billing/${user.id}`);
        if (res.ok) {
          const bData = await res.json();
          setBillingStats(bData.stats);
          setBillingHistory(bData.billingHistory);
        }
      } else if (activeTab === 'Messages') {
        // Fetch chat contacts
        const resC = await fetch(`${API_BASE}/messages/contacts/${user.id}/doctor`);
        if (resC.ok) {
          const list = await resC.json();
          setChatContacts(list);
          if (list.length > 0 && !activeChat) {
            handleSelectChat(list[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Backend server offline. fallback active.', err.message);
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

  const handleUpdateDiagnosis = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/doctor/patients/diagnosis/${selectedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnosisForm)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('Error updating patient diagnosis!');
    }
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/doctor/prescriptions/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: selectedPatient.id,
          follow_up_date: presForm.follow_up_date,
          instructions: presForm.instructions,
          medicines: presForm.medicines
        })
      });
      if (res.ok) {
        setModalOpen(false);
        alert('Prescription logged successfully!');
      }
    } catch (err) {
      alert('Error compiling prescription!');
    }
  };

  const handleApptAction = async (id, status) => {
    try {
      await fetch(`${API_BASE}/admin/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openFormModal = (type, pat) => {
    setSelectedPatient(pat);
    setModalType(type);
    if (type === 'diagnose') {
      setDiagnosisForm({ disease: pat.disease || '', status: pat.status || 'Admitted', allergies: pat.allergies || 'None', chronic_conditions: pat.chronic_conditions || 'None' });
    } else if (type === 'prescription') {
      setPresForm({ medicines: [{ medicine: '', dosage: '', duration: '', frequency: '' }], instructions: '', follow_up_date: '' });
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
            { name: 'My Schedule', icon: Calendar },
            { name: 'Patients', icon: UserCheck },
            { name: 'Appointments', icon: Clock },
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
            <div style={{fontSize:'0.8rem', fontWeight:'600'}}>Medicare Verified</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>Active specialist license</div>
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
            <span style={{color:'var(--text-secondary)', fontSize:'0.9rem', fontWeight:'500'}}>Specialist • Doctor Panel</span>
            <h1 style={styles.titleText}>
              {activeTab === 'Dashboard' ? `Ayubowan, ${user?.name || 'Dr. Sarath'}! 👋` : `${activeTab}`}
            </h1>
          </div>
          
          <div style={styles.headerProfile}>
            <button style={styles.themeToggle} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} color="orange" /> : <Moon size={18} color="#64748B" />}
            </button>
            <div style={styles.profileInfo}>
              <img src={user?.profile_image} alt="Doctor" style={styles.profileImg} />
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:'700', fontSize:'0.9rem'}}>{user?.name || 'Dr. Sarath Jayasekara'}</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{user?.profile?.specialization || 'Cardiologist'}</div>
              </div>
            </div>
          </div>
        </header>

        {/* 1. Dashboard Tab Overview */}
        {activeTab === 'Dashboard' && (
          <div className="animate-fade" style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            <div className="hms-grid-4">
              {[
                { name: "Today's Consultations", value: stats.consultationsToday, icon: Clock, color: '#0062FF', bg: '#E8F1FF' },
                { name: 'Total Patients', value: stats.totalPatients, icon: UserPlus, color: '#A855F7', bg: '#F3E8FF' },
                { name: 'Pending Reports', value: stats.pendingReports, icon: FileText, color: '#F59E0B', bg: '#FEF3C7' },
                { name: 'New Messages', value: stats.newMessages, icon: MessageSquare, color: '#10B981', bg: '#ECFDF5' }
              ].map((card, idx) => {
                const Icon = card.icon;
                return (
                  <div key={idx} className="card" style={styles.statCard}>
                    <div style={{...styles.statIconContainer, backgroundColor: card.bg}}>
                      <Icon size={24} color={card.color} />
                    </div>
                    <div style={{textAlign:'left'}}>
                      <span style={{fontSize:'0.85rem', color:'var(--text-secondary)'}}>{card.name}</span>
                      <h2 style={{fontSize:'1.8rem', fontWeight:'800', marginTop:'2px'}}>{card.value}</h2>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.chartsGrid}>
              <div className="card" style={{flex: 1.8, textAlign:'left'}}>
                <h3 style={styles.cardTitle}>Today's Schedule</h3>
                <div style={{marginTop:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
                  {scheduleList.length === 0 ? (
                    <div style={{textAlign:'center', padding:'32px', color:'var(--text-muted)'}}>No consultations scheduled for today!</div>
                  ) : (
                    scheduleList.map((item) => (
                      <div key={item.id} style={styles.scheduleItem}>
                        <div style={styles.timeTag}>
                          <Clock size={12} />
                          <span>{item.time.substring(0, 5)}</span>
                        </div>
                        <img src={item.profile_image || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} alt="" style={styles.tableAvatar} />
                        <div style={{flex:1, textAlign:'left'}}>
                          <div style={{fontWeight:'700', fontSize:'0.9rem'}}>{item.patient_name}</div>
                          <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{item.type}</div>
                        </div>
                        <span className={`badge ${item.status === 'Completed' ? 'badge-success' : item.status === 'Confirmed' ? 'badge-info' : 'badge-warning'}`}>{item.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card" style={{flex: 1.2}}>
                <h3 style={styles.cardTitle}>Patient Overview</h3>
                <div style={styles.pieContainer}>
                  <div style={{...styles.pieWrapper, background:'conic-gradient(#0062FF 0% 40%, #10B981 40% 75%, #A855F7 75% 100%)'}}>
                    <div style={styles.donut}></div>
                  </div>
                  <div style={styles.pieLegend}>
                    <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor:'#0062FF'}}></span><span>New Cases (40%)</span></div>
                    <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor:'#10B981'}}></span><span>Follow-up (35%)</span></div>
                    <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor:'#A855F7'}}></span><span>Regular (25%)</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MY SCHEDULE / CALENDAR */}
        {activeTab === 'My Schedule' && (
          <div className="animate-fade">
            <div className="card">
              <h3 style={styles.cardTitle}>Weekly Calendar Planner</h3>
              <div style={styles.calendarGrid}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} style={styles.calendarDayHeader}>
                    <div style={{fontWeight:'700'}}>{day}</div>
                    <div style={styles.calendarDaySlots}>
                      <div style={styles.calendarSlot}>09:00 AM</div>
                      <div style={{...styles.calendarSlot, backgroundColor:'var(--primary-light)', color:'var(--primary)', fontWeight:'600'}}>10:00 AM</div>
                      <div style={styles.calendarSlot}>11:00 AM</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. PATIENTS SECTION */}
        {activeTab === 'Patients' && (
          <div className="animate-fade">
            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient Name</th>
                      <th style={styles.th}>Age / Gender</th>
                      <th style={styles.th}>Known Disease</th>
                      <th style={styles.th}>Allergy Files</th>
                      <th style={styles.th}>Chronic Conditions</th>
                      <th style={styles.th}>Emergency Contact</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsList.map((pat) => (
                      <tr key={pat.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{pat.name}</td>
                        <td style={styles.td}>{pat.age} Years / {pat.gender}</td>
                        <td style={styles.td}>{pat.disease || 'General Diagnosis'}</td>
                        <td style={{...styles.td, color:'var(--error)', fontWeight:'600'}}>{pat.allergies || 'None'}</td>
                        <td style={styles.td}>{pat.chronic_conditions || 'None'}</td>
                        <td style={styles.td}>{pat.emergency_contact || 'None'}</td>
                        <td style={styles.td}>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button className="btn btn-secondary" style={{padding:'6px 10px', fontSize:'0.75rem'}} onClick={() => openFormModal('diagnose', pat)}>
                              Diagnose
                            </button>
                            <button className="btn btn-primary" style={{padding:'6px 10px', fontSize:'0.75rem'}} onClick={() => openFormModal('prescription', pat)}>
                              Prescribe
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. APPOINTMENTS SECTION */}
        {activeTab === 'Appointments' && (
          <div className="animate-fade">
            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Time</th>
                      <th style={styles.th}>Consultation Type</th>
                      <th style={styles.th}>Payment Status</th>
                      <th style={styles.th}>Clinic Status</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scheduleList.map((appt) => (
                      <tr key={appt.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{appt.patient_name}</td>
                        <td style={styles.td}>{new Date(appt.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{appt.time}</td>
                        <td style={styles.td}>{appt.type}</td>
                        <td style={styles.td}>
                          <span className={`badge ${appt.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{appt.payment_status}</span>
                        </td>
                        <td style={styles.td}>
                          <span className={`badge ${appt.status === 'Completed' ? 'badge-success' : appt.status === 'Cancelled' ? 'badge-error' : 'badge-warning'}`}>{appt.status}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button className="btn btn-secondary" style={{padding:'6px 10px', fontSize:'0.75rem'}} onClick={() => handleApptAction(appt.id, 'Confirmed')}>
                              Accept
                            </button>
                            <button className="btn btn-danger" style={{padding:'6px 10px', fontSize:'0.75rem'}} onClick={() => handleApptAction(appt.id, 'Cancelled')}>
                              Reject
                            </button>
                          </div>
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
              <h3 style={styles.cardTitle}>Compile New Patient Prescription</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px'}}>Select a patient from active clinic cases and prescribe required medication doses.</p>
              
              <form onSubmit={handleCreatePrescription} style={styles.form}>
                <label style={styles.label}>Select Patient Registry</label>
                <select className="input-field" required onChange={e => setSelectedPatient({ id: e.target.value })}>
                  <option value="">Choose Patient</option>
                  {patientsList.map(pat => (
                    <option key={pat.id} value={pat.id}>{pat.name}</option>
                  ))}
                </select>

                <div className="hms-grid-2" style={{marginTop:'12px'}}>
                  <div>
                    <label style={styles.label}>Follow Up Date</label>
                    <input type="date" className="input-field" required onChange={e => setPresForm({...presForm, follow_up_date: e.target.value})} />
                  </div>
                  <div>
                    <label style={styles.label}>Generic Clinical Instructions</label>
                    <input type="text" className="input-field" placeholder="e.g. Monitor blood levels daily" onChange={e => setPresForm({...presForm, instructions: e.target.value})} />
                  </div>
                </div>

                <h4 style={{marginTop:'20px', fontWeight:'700'}}>Medicines & Dosage List</h4>
                {presForm.medicines.map((med, idx) => (
                  <div key={idx} style={{display:'flex', gap:'12px', marginTop:'8px'}}>
                    <input 
                      type="text" 
                      placeholder="Medicine (e.g. Lipitor)" 
                      className="input-field" 
                      required 
                      onChange={e => {
                        const newM = [...presForm.medicines];
                        newM[idx].medicine = e.target.value;
                        setPresForm({...presForm, medicines: newM});
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Dosage (e.g. 10mg)" 
                      className="input-field" 
                      required 
                      onChange={e => {
                        const newM = [...presForm.medicines];
                        newM[idx].dosage = e.target.value;
                        setPresForm({...presForm, medicines: newM});
                      }}
                    />
                    <input 
                      type="text" 
                      placeholder="Duration" 
                      className="input-field" 
                      required 
                      onChange={e => {
                        const newM = [...presForm.medicines];
                        newM[idx].duration = e.target.value;
                        setPresForm({...presForm, medicines: newM});
                      }}
                    />
                  </div>
                ))}
                
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{marginTop:'12px', padding:'6px 12px', fontSize:'0.8rem'}}
                  onClick={() => setPresForm({...presForm, medicines: [...presForm.medicines, { medicine: '', dosage: '', duration: '', frequency: '' }]})}
                >
                  <Plus size={14} /> Add Medicine Row
                </button>

                <button type="submit" className="btn btn-primary" style={{marginTop:'24px', width:'200px'}}>
                  Log Prescription
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 6. BILLING SECTION */}
        {activeTab === 'Billing' && (
          <div className="animate-fade" style={{display:'flex', flexDirection:'column', gap:'24px', textAlign:'left'}}>
            <div className="hms-grid-4">
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Today's Earnings</span>
                <h2 style={{fontWeight:'800', marginTop:'4px'}}>LKR {billingStats.todayEarnings}</h2>
              </div>
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Pending Payments</span>
                <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--warning)'}}>LKR {billingStats.pendingPayments}</h2>
              </div>
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Insurance Settlements</span>
                <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--info)'}}>LKR {billingStats.insuranceClaims}</h2>
              </div>
              <div className="card">
                <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Paid Consultations</span>
                <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--success)'}}>{billingStats.paidConsultations}</h2>
              </div>
            </div>

            <div className="card">
              <h3 style={styles.cardTitle}>Invoices History</h3>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Invoice ID</th>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Insurance Settled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.map((inv) => (
                      <tr key={inv.id} style={styles.tr}>
                        <td style={styles.td}>{inv.invoice_id}</td>
                        <td style={{...styles.td, fontWeight:'700'}}>{inv.patient_name}</td>
                        <td style={styles.td}>{new Date(inv.date).toLocaleDateString()}</td>
                        <td style={styles.td}>LKR {inv.amount}</td>
                        <td style={styles.td}>
                          <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span>
                        </td>
                        <td style={styles.td}>{inv.insurance_claims}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. MESSAGES CHAT ROOM */}
        {activeTab === 'Messages' && (
          <div className="card animate-fade" style={styles.chatContainer}>
            <div style={styles.chatSidebar}>
              <h3 style={{...styles.cardTitle, padding:'16px'}}>Contacts List</h3>
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
                      placeholder="Type a clinical message..." 
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
                  Select a doctor or nurse contact to start clinical chat logs.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. PROFILE SECTION */}
        {activeTab === 'Profile' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Professional Medical Profile</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'16px'}}>Manage clinical biography, consultations clocks and certification logs.</p>
              
              <div className="hms-grid-2">
                <div>
                  <label style={styles.label}>Contact Phone</label>
                  <input type="text" className="input-field" defaultValue={user?.profile?.contact || '0771234567'} />
                </div>
                <div>
                  <label style={styles.label}>Consultation Office Hours</label>
                  <input type="text" className="input-field" defaultValue={user?.profile?.consultation_hours || '08:00 AM - 04:00 PM'} />
                </div>
              </div>

              <label style={styles.label}>Biography Details</label>
              <textarea 
                className="input-field" 
                rows="4" 
                defaultValue={user?.profile?.bio || 'Clinical cardiologist dedicated to providing premium care.'} 
              />
              
              <button className="btn btn-primary" style={{marginTop:'20px'}}>
                Save Profile Bio
              </button>
            </div>
          </div>
        )}

        {/* 9. SETTINGS SECTION */}
        {activeTab === 'Settings' && (
          <div className="animate-fade" style={{textAlign:'left', display:'flex', flexDirection:'column', gap:'24px'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Security & Access Rules</h3>
              <label style={styles.label}>Change Hashed Password</label>
              <input type="password" placeholder="Enter new password" className="input-field" style={{maxWidth:'320px'}} />
              <button className="btn btn-primary" style={{marginTop:'12px'}}>Save Password</button>
            </div>
          </div>
        )}
      </main>

      {/* Diagnosis Dialog Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log Clinical Diagnosis">
        {modalType === 'diagnose' && (
          <form onSubmit={handleUpdateDiagnosis} style={styles.form}>
            <label style={styles.label}>Identified Disease / Diagnostic notes</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={diagnosisForm.disease} 
              onChange={e => setDiagnosisForm({...diagnosisForm, disease: e.target.value})} 
            />

            <label style={styles.label}>Allergies</label>
            <input 
              type="text" 
              className="input-field" 
              value={diagnosisForm.allergies} 
              onChange={e => setDiagnosisForm({...diagnosisForm, allergies: e.target.value})} 
            />

            <label style={styles.label}>Chronic Conditions</label>
            <input 
              type="text" 
              className="input-field" 
              value={diagnosisForm.chronic_conditions} 
              onChange={e => setDiagnosisForm({...diagnosisForm, chronic_conditions: e.target.value})} 
            />

            <label style={styles.label}>Clinical Status</label>
            <select 
              className="input-field" 
              value={diagnosisForm.status} 
              onChange={e => setDiagnosisForm({...diagnosisForm, status: e.target.value})}
            >
              <option>Admitted</option>
              <option>Discharged</option>
              <option>Emergency</option>
            </select>

            <button type="submit" className="btn btn-primary" style={{marginTop:'16px'}}>
              Save Diagnostic File
            </button>
          </form>
        )}
      </Modal>

      {/* Logout popup modal */}
      <LogoutModal 
        isOpen={showLogout} 
        onClose={() => setShowLogout(false)} 
        onConfirm={onLogout}
        onSwitchAccount={onSwitchAccount}
        role="doctor"
      />
    </div>
  );
}

// Custom specific styling items for Doctor Dashboard
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
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px'
  },
  statIconContainer: {
    width: '54px',
    height: '54px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
  scheduleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 16px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-sm)'
  },
  timeTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  tableAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  pieContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
    gap: '16px'
  },
  pieWrapper: {
    position: 'relative',
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  donut: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-card)'
  },
  pieLegend: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.85rem'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  dot: {
    display: 'inline-block',
    width: '8px',
    height: '8px',
    borderRadius: '50%'
  },
  calendarGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '12px',
    marginTop: '20px'
  },
  calendarDayHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-sm)',
    textAlign: 'center'
  },
  calendarDaySlots: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  calendarSlot: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    padding: '6px 4px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer'
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
  chatContainer: {
    display: 'flex',
    height: '540px',
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
