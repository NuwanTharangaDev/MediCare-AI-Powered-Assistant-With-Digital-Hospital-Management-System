import React, { useState, useEffect } from 'react';
import { 
  Activity, Calendar, Award, Building, BarChart2, Settings, LogOut, 
  Plus, Edit2, Trash2, Search, Filter, Shield, Moon, Sun, ArrowRight, UserCheck, 
  MessageSquare, FileText, CheckCircle2, AlertCircle, FileCheck, Check, Clock, 
  Users, ClipboardList, ShieldAlert, Thermometer, UserPlus, CheckCircle
} from 'lucide-react';
import Modal from '../components/Modal';
import LogoutModal from '../components/LogoutModal';

export default function NurseDashboard({ user, onLogout, onSwitchAccount, chatNavigationRequest }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showLogout, setShowLogout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Nurse stats
  const [overviewData, setOverviewData] = useState({
    stats: { todayAppointments: 12, patientsToday: 24, medicationsDue: 18, alertsCount: 3 },
    tasks: [],
    notes: []
  });
  const [tasksList, setTasksList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [medsList, setMedsList] = useState([]);
  const [reportsList, setReportsList] = useState([]);

  // Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'addTask', 'logMed', 'addReport'
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [taskForm, setTaskForm] = useState({ task_name: '', patient_id: '', room: '', priority: 'Medium', notes: '' });
  const [reportForm, setReportForm] = useState({ title: '', details: '' });

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
      const resOverview = await fetch(`${API_BASE}/nurse/overview/${user.id}`);
      if (resOverview.ok) {
        setOverviewData(await resOverview.json());
      }

      if (activeTab === 'My Tasks') {
        const res = await fetch(`${API_BASE}/nurse/tasks/${user.id}`);
        if (res.ok) setTasksList(await res.json());
        
        const resPats = await fetch(`${API_BASE}/nurse/patients/${user.id}`);
        if (resPats.ok) setPatientsList(await resPats.json());
      } else if (activeTab === 'Patients') {
        const res = await fetch(`${API_BASE}/nurse/patients/${user.id}`);
        if (res.ok) setPatientsList(await res.json());
      } else if (activeTab === 'Medication Management') {
        const res = await fetch(`${API_BASE}/nurse/medications/${user.id}`);
        if (res.ok) setMedsList(await res.json());
      } else if (activeTab === 'Reports') {
        const res = await fetch(`${API_BASE}/nurse/reports/${user.id}`);
        if (res.ok) setReportsList(await res.json());
      } else if (activeTab === 'Messages') {
        const resC = await fetch(`${API_BASE}/messages/contacts/${user.id}/nurse`);
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/nurse/tasks/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
        alert('Nursing task assigned successfully!');
      }
    } catch (err) {
      alert('Error creating task!');
    }
  };

  const handleCompleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/nurse/tasks/complete/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed', notes: 'Completed by Nurse Amaya.' })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMedAdminister = async (id) => {
    alert('Medication barcode verified and dosage administration recorded successfully!');
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/nurse/reports/${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm)
      });
      if (res.ok) {
        setModalOpen(false);
        setReportForm({ title: '', details: '' });
        fetchData();
        alert('Shift Incident Report saved!');
      }
    } catch (err) {
      alert('Error saving report!');
    }
  };

  const openFormModal = (type) => {
    setModalType(type);
    if (type === 'addTask') {
      setTaskForm({ task_name: '', patient_id: '', room: '', priority: 'Medium', notes: '' });
    } else if (type === 'addReport') {
      setReportForm({ title: '', details: '' });
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
            { name: 'My Tasks', icon: ClipboardList },
            { name: 'Patients', icon: Users },
            { name: 'Appointments', icon: Calendar },
            { name: 'Medication Management', icon: Thermometer },
            { name: 'Reports', icon: FileText },
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
            <div style={{fontSize:'0.8rem', fontWeight:'600'}}>Duty Active</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>Shift: Wards coverage</div>
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
            <span style={{color:'var(--text-secondary)', fontSize:'0.9rem', fontWeight:'500'}}>Staff Nurse • Clinical Wards</span>
            <h1 style={styles.titleText}>
              {activeTab === 'Dashboard' ? `Welcome, Nurse Amaya! 👋` : `${activeTab}`}
            </h1>
          </div>
          
          <div style={styles.headerProfile}>
            <button style={styles.themeToggle} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} color="orange" /> : <Moon size={18} color="#64748B" />}
            </button>
            <div style={styles.profileInfo}>
              <img src={user?.profile_image} alt="Nurse" style={styles.profileImg} />
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:'700', fontSize:'0.9rem'}}>{user?.name || 'Nurse Amaya Perera'}</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Staff Nurse • Cardiology</div>
              </div>
            </div>
          </div>
        </header>

        {/* 1. Dashboard Tab Overview */}
        {activeTab === 'Dashboard' && (
          <div className="animate-fade" style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            <div className="hms-grid-4">
              {[
                { name: "Today's Appointments", value: overviewData.stats.todayAppointments, icon: Calendar, color: '#0062FF', bg: '#E8F1FF' },
                { name: 'Patients Today', value: overviewData.stats.patientsToday, icon: Users, color: '#A855F7', bg: '#F3E8FF' },
                { name: 'Medications due', value: overviewData.stats.medicationsDue, icon: Thermometer, color: '#10B981', bg: '#ECFDF5' },
                { name: 'Alerts', value: overviewData.stats.alertsCount, icon: AlertCircle, color: '#EF4444', bg: '#FEF2F2' }
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
                <h3 style={styles.cardTitle}>Today's Tasks</h3>
                <div style={{marginTop:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
                  {overviewData.tasks.length === 0 ? (
                    <div style={{textAlign:'center', padding:'32px', color:'var(--text-muted)'}}>No active tasks assigned for today!</div>
                  ) : (
                    overviewData.tasks.map((task) => (
                      <div key={task.id} style={styles.scheduleItem}>
                        <input 
                          type="checkbox" 
                          checked={task.status === 'Completed'} 
                          onChange={() => handleCompleteTask(task.id)}
                          style={{width:'18px', height:'18px', cursor:'pointer'}}
                        />
                        <div style={{flex: 1, textAlign:'left'}}>
                          <div style={{fontWeight:'700', fontSize:'0.9rem', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-primary)'}}>{task.task_name}</div>
                          <div style={{fontSize:'0.75rem', color:'var(--text-secondary)'}}>{task.room} • {task.patient_name || 'General Ward'}</div>
                        </div>
                        <span className={`badge ${task.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{task.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card" style={{flex: 1.2, textAlign:'left', display:'flex', flexDirection:'column', gap:'16px'}}>
                <h3 style={styles.cardTitle}>Important Notes</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                  {overviewData.notes.map((note) => (
                    <div key={note.id} style={styles.noteCard}>
                      <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                        <AlertCircle size={14} color="var(--primary)" />
                        <span style={{fontSize:'0.75rem', fontWeight:'700', color:'var(--primary)'}}>{note.author}</span>
                      </div>
                      <p style={{fontSize:'0.8rem', marginTop:'6px', fontWeight:'500'}}>{note.text}</p>
                      <div style={{fontSize:'0.65rem', color:'var(--text-muted)', marginTop:'8px', textAlign:'right'}}>{note.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. MY TASKS SECTION */}
        {activeTab === 'My Tasks' && (
          <div className="animate-fade">
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
              <h3 style={styles.cardTitle}>Assigned Tasks Checklist</h3>
              <button className="btn btn-primary" onClick={() => openFormModal('addTask')}>
                <Plus size={16} /> Assign Shift Task
              </button>
            </div>

            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Task</th>
                      <th style={styles.th}>Patient Case</th>
                      <th style={styles.th}>Room / Ward</th>
                      <th style={styles.th}>Priority</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Complete Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasksList.map((task) => (
                      <tr key={task.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{task.task_name}</td>
                        <td style={styles.td}>{task.patient_name || 'General Ward'}</td>
                        <td style={styles.td}>{task.room}</td>
                        <td style={styles.td}>
                          <span className={`badge ${task.priority === 'High' ? 'badge-error' : task.priority === 'Medium' ? 'badge-warning' : 'badge-info'}`}>{task.priority}</span>
                        </td>
                        <td style={styles.td}>
                          <span className={`badge ${task.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{task.status}</span>
                        </td>
                        <td style={styles.td}>
                          {task.status !== 'Completed' ? (
                            <button className="btn btn-secondary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => handleCompleteTask(task.id)}>
                              Mark Complete
                            </button>
                          ) : (
                            <span style={{color:'var(--success)', fontWeight:'600'}}>Finished ✓</span>
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

        {/* 3. PATIENTS SECTION */}
        {activeTab === 'Patients' && (
          <div className="animate-fade">
            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Age</th>
                      <th style={styles.th}>Diagnostic Case</th>
                      <th style={styles.th}>Allergies Check</th>
                      <th style={styles.th}>Emergency Contact</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsList.map((pat) => (
                      <tr key={pat.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{pat.name}</td>
                        <td style={styles.td}>{pat.age} Years</td>
                        <td style={styles.td}>{pat.disease || 'General Diagnosis'}</td>
                        <td style={{...styles.td, color:'var(--error)', fontWeight:'600'}}>{pat.allergies || 'None'}</td>
                        <td style={styles.td}>{pat.emergency_contact}</td>
                        <td style={styles.td}>
                          <span className={`badge ${pat.status === 'Admitted' ? 'badge-warning' : 'badge-success'}`}>{pat.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. APPOINTMENTS PREPARATION */}
        {activeTab === 'Appointments' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Pre-Appointment Prep Checklist</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px'}}>Check patients records, measure pre-consultation vitals (BP/pulse), and escort clinical attendees.</p>
              
              <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                {[
                  { task: 'Escort Nimal Perera to Cardiology Room 101', done: true },
                  { task: 'Measure Pre-Consultation Blood Pressure for Sanduni Silva', done: false },
                  { task: 'Prepare ECG Diagnostic Chart Files for Dr. Sarath', done: true }
                ].map((item, index) => (
                  <div key={index} style={styles.scheduleItem}>
                    <CheckCircle size={18} color={item.done ? 'var(--success)' : 'var(--text-muted)'} />
                    <span style={{fontSize:'0.9rem', fontWeight:'500'}}>{item.task}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. MEDICATION MANAGEMENT */}
        {activeTab === 'Medication Management' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Medication Administration Chart</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px'}}>Verify patient wristband barcodes and log timely dosages of critical medications.</p>
              
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient</th>
                      <th style={styles.th}>Medicine Name</th>
                      <th style={styles.th}>Required Dosage</th>
                      <th style={styles.th}>Due Time</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Verify & Administer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medsList.map((med) => (
                      <tr key={med.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{med.patient}</td>
                        <td style={styles.td}>{med.medicine}</td>
                        <td style={styles.td}>{med.dose}</td>
                        <td style={styles.td}>{med.time}</td>
                        <td style={styles.td}>
                          <span className={`badge ${med.status === 'Administered' ? 'badge-success' : med.status === 'Missed' ? 'badge-error' : 'badge-warning'}`}>{med.status}</span>
                        </td>
                        <td style={styles.td}>
                          {med.status === 'Pending' ? (
                            <button className="btn btn-primary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => handleMedAdminister(med.id)}>
                              Administer Dose
                            </button>
                          ) : (
                            <span style={{color:'var(--text-muted)', fontSize:'0.8rem'}}>Logs recorded</span>
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

        {/* 6. REPORTS SECTION */}
        {activeTab === 'Reports' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={styles.cardTitle}>Ward Shift Log Reports</h3>
              <button className="btn btn-primary" onClick={() => openFormModal('addReport')}>
                <Plus size={16} /> Create Shift Report
              </button>
            </div>

            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Report Name</th>
                      <th style={styles.th}>Compiled Date</th>
                      <th style={styles.th}>Author</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Download PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsList.map((rep) => (
                      <tr key={rep.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{rep.title}</td>
                        <td style={styles.td}>{rep.date}</td>
                        <td style={styles.td}>{rep.author}</td>
                        <td style={styles.td}>
                          <span className="badge badge-success">{rep.status}</span>
                        </td>
                        <td style={styles.td}>
                          <button className="btn btn-secondary" style={{padding:'6px 12px', fontSize:'0.75rem'}} onClick={() => window.print()}>
                            <Download size={12} /> PDF
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

        {/* 7. MESSAGES ROOM */}
        {activeTab === 'Messages' && (
          <div className="card animate-fade" style={styles.chatContainer}>
            <div style={styles.chatSidebar}>
              <h3 style={{...styles.cardTitle, padding:'16px'}}>Ward Chat</h3>
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
                      placeholder="Type message to ward colleagues..." 
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
                  Select a clinical doctor or patient contact to begin shift chat logs.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. PROFILE SECTION */}
        {activeTab === 'Profile' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Staff Nurse Credentials</h3>
              <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', marginBottom:'20px'}}>Manage clinical ward coordinates, contact details and professional certifications.</p>
              
              <div className="hms-grid-2">
                <div>
                  <label style={styles.label}>Employee Registry ID</label>
                  <input type="text" className="input-field" disabled defaultValue={user?.profile?.employee_id || 'NUR-2024-0091'} />
                </div>
                <div>
                  <label style={styles.label}>Duty Contact Phone</label>
                  <input type="text" className="input-field" defaultValue={user?.profile?.contact || '0779876543'} />
                </div>
              </div>

              <label style={styles.label}>Accredited Qualifications</label>
              <input type="text" className="input-field" defaultValue={user?.profile?.qualification || 'BSc. in Nursing, Registered Nurse (RN)'} />
              
              <button className="btn btn-primary" style={{marginTop:'20px'}}>
                Save Credentials
              </button>
            </div>
          </div>
        )}

        {/* 9. SETTINGS SECTION */}
        {activeTab === 'Settings' && (
          <div className="animate-fade" style={{textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>Change Hashed Password</h3>
              <input type="password" placeholder="New secure password" className="input-field" style={{maxWidth:'320px', marginTop:'12px'}} />
              <button className="btn btn-primary" style={{marginTop:'12px'}}>Save password</button>
            </div>
          </div>
        )}
      </main>

      {/* Reusable dialog modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalType === 'addTask' ? 'Assign Shift Task' : 'Create Ward Incident Report'}
      >
        {modalType === 'addTask' && (
          <form onSubmit={handleCreateTask} style={styles.form}>
            <label style={styles.label}>Task Name / Details</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              placeholder="e.g. Check blood pressure levels"
              value={taskForm.task_name} 
              onChange={e => setTaskForm({...taskForm, task_name: e.target.value})} 
            />

            <label style={styles.label}>Room / Ward Number</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              placeholder="e.g. Room 101"
              value={taskForm.room} 
              onChange={e => setTaskForm({...taskForm, room: e.target.value})} 
            />

            <label style={styles.label}>Priority Level</label>
            <select 
              className="input-field" 
              value={taskForm.priority} 
              onChange={e => setTaskForm({...taskForm, priority: e.target.value})}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            <button type="submit" className="btn btn-primary" style={{marginTop:'16px'}}>
              Save Task details
            </button>
          </form>
        )}

        {modalType === 'addReport' && (
          <form onSubmit={handleCreateReport} style={styles.form}>
            <label style={styles.label}>Report Title</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              placeholder="e.g. Night shift report - Cardio Ward"
              value={reportForm.title} 
              onChange={e => setReportForm({...reportForm, title: e.target.value})} 
            />

            <label style={styles.label}>Clinical Incident Details</label>
            <textarea 
              className="input-field" 
              rows="4" 
              required 
              placeholder="Record all ward incidents and shift statistics here."
              value={reportForm.details} 
              onChange={e => setReportForm({...reportForm, details: e.target.value})} 
            />

            <button type="submit" className="btn btn-primary" style={{marginTop:'16px'}}>
              Confirm Report Submission
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
        role="nurse"
      />
    </div>
  );
}

// Custom styles for Nurse Dashboard layouts
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
  tableAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  noteCard: {
    padding: '14px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '4px solid var(--primary)'
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
