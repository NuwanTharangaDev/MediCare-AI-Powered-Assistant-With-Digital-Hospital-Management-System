import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, Calendar, Award, Building, BarChart2, Settings, LogOut, 
  Plus, Edit2, Trash2, Search, Filter, Shield, Moon, Sun, ArrowRight, UserCheck, 
  UserPlus, UserMinus, ShieldAlert, CreditCard, ChevronRight, FileText, Download, Check
} from 'lucide-react';
import Modal from '../components/Modal';
import LogoutModal from '../components/LogoutModal';

export default function AdminDashboard({ user, onLogout, onSwitchAccount, chatNavigationRequest }) {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showLogout, setShowLogout] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Real-time states
  const [stats, setStats] = useState({
    totalPatients: 542, totalDoctors: 48, totalAppointments: 2543, totalDepartments: 892,
    totalUsers: 620, activeUsers: 480, suspendedUsers: 140, newUsersThisMonth: 15
  });
  const [usersList, setUsersList] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [patientsList, setPatientsList] = useState([]);
  const [appointmentsList, setAppointmentsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  
  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'user', 'doctor', 'patient', 'appointment', 'department'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form fields
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'Patient', status: 'Active' });
  const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', specialization: '', experience: 5, department_id: '', contact: '', consultation_hours: '', qualification: '', availability: 'Available' });
  const [patientForm, setPatientForm] = useState({ name: '', email: '', age: 30, gender: 'Male', address: '', phone: '', blood_group: 'A+', allergies: '', chronic_conditions: '', emergency_contact: '', status: 'Admitted' });
  const [apptForm, setApptForm] = useState({ patient_id: '', doctor_id: '', date: '', time: '', type: 'Consultation', notes: '' });
  const [deptForm, setDeptForm] = useState({ name: '', room_count: 10, staff_count: 5, description: '' });

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (chatNavigationRequest?.tab) setActiveTab(chatNavigationRequest.tab);
  }, [chatNavigationRequest]);

  const fetchData = async () => {
    try {
      // 1. Fetch dashboard status overview
      const resOverview = await fetch(`${API_BASE}/admin/overview`);
      if (resOverview.ok) {
        const data = await resOverview.json();
        setStats(data.stats);
        setRecentActivities(data.recentActivities);
      }
      
      // 2. Fetch Section specific tables
      if (activeTab === 'Users') {
        const res = await fetch(`${API_BASE}/admin/users`);
        if (res.ok) setUsersList(await res.json());
      } else if (activeTab === 'Doctors') {
        const res = await fetch(`${API_BASE}/admin/doctors`);
        if (res.ok) setDoctorsList(await res.json());
        
        const resDepts = await fetch(`${API_BASE}/admin/departments`);
        if (resDepts.ok) setDepartmentsList(await resDepts.json());
      } else if (activeTab === 'Patients') {
        const res = await fetch(`${API_BASE}/admin/patients`);
        if (res.ok) setPatientsList(await res.json());
      } else if (activeTab === 'Appointments') {
        const res = await fetch(`${API_BASE}/admin/appointments`);
        if (res.ok) setAppointmentsList(await res.json());
        
        const resPats = await fetch(`${API_BASE}/admin/patients`);
        if (resPats.ok) setPatientsList(await resPats.json());
        
        const resDocs = await fetch(`${API_BASE}/admin/doctors`);
        if (resDocs.ok) setDoctorsList(await resDocs.json());
      } else if (activeTab === 'Departments') {
        const res = await fetch(`${API_BASE}/admin/departments`);
        if (res.ok) setDepartmentsList(await res.json());
      }
    } catch (err) {
      console.warn('Backend server offline, using fallback persistent local cache.', err.message);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const isEdit = selectedItem !== null;
      const url = isEdit ? `${API_BASE}/admin/users/${selectedItem.id}` : `${API_BASE}/admin/users`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        setModalOpen(false);
        setSelectedItem(null);
        fetchData();
      }
    } catch (err) {
      alert('Error saving user: ' + err.message);
    }
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      const isEdit = selectedItem !== null;
      const url = isEdit ? `${API_BASE}/admin/doctors/${selectedItem.id}` : `${API_BASE}/admin/doctors`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorForm)
      });
      if (res.ok) {
        setModalOpen(false);
        setSelectedItem(null);
        fetchData();
      }
    } catch (err) {
      alert('Error saving doctor details!');
    }
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientForm)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('Error registering patient!');
    }
  };

  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/admin/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apptForm)
      });
      if (res.ok) {
        setModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert('Error booking appointment!');
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      const isEdit = selectedItem !== null;
      const url = isEdit ? `${API_BASE}/admin/departments/${selectedItem.id}` : `${API_BASE}/admin/departments`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptForm)
      });
      if (res.ok) {
        setModalOpen(false);
        setSelectedItem(null);
        fetchData();
      }
    } catch (err) {
      alert('Error saving department details!');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const openAddModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    if (type === 'user') {
      if (item) {
        setUserForm({ name: item.name, email: item.email, password: '', role: item.role, status: item.status });
      } else {
        setUserForm({ name: '', email: '', password: '', role: 'Patient', status: 'Active' });
      }
    } else if (type === 'doctor') {
      if (item) {
        setDoctorForm({ ...item });
      } else {
        setDoctorForm({ name: '', email: '', password: '', specialization: '', experience: 5, department_id: '', contact: '', consultation_hours: '08:00 AM - 04:00 PM', qualification: 'MBBS', availability: 'Available' });
      }
    } else if (type === 'patient') {
      setPatientForm({ name: '', email: '', age: 30, gender: 'Male', address: '', phone: '', blood_group: 'O+', allergies: 'None', chronic_conditions: 'None', emergency_contact: '', status: 'Admitted', assigned_doctor_id: '' });
    } else if (type === 'appointment') {
      setApptForm({ patient_id: '', doctor_id: '', date: '', time: '', type: 'Consultation', notes: '' });
    } else if (type === 'department') {
      if (item) {
        setDeptForm({ name: item.name, room_count: item.room_count, staff_count: item.staff_count, description: item.description });
      } else {
        setDeptForm({ name: '', room_count: 10, staff_count: 5, description: '' });
      }
    }
    setModalOpen(true);
  };

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <div style={styles.dashboardContainer} data-theme={darkMode ? 'dark' : 'light'}>
      {/* Sidebar Section */}
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
            { name: 'Users', icon: Users },
            { name: 'Doctors', icon: Award },
            { name: 'Patients', icon: Users },
            { name: 'Appointments', icon: Calendar },
            { name: 'Departments', icon: Building },
            { name: 'Reports', icon: BarChart2 },
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
            <div style={{fontSize:'0.8rem', fontWeight:'600'}}>System Secure</div>
            <div style={{fontSize:'0.7rem', color:'var(--text-muted)'}}>Your system is up to date</div>
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
            <span style={{color:'var(--text-secondary)', fontSize:'0.9rem', fontWeight:'500'}}>Overview • Admin Panel</span>
            <h1 style={styles.titleText}>{activeTab === 'Dashboard' ? 'Welcome, Admin! 👋' : `${activeTab} Management`}</h1>
          </div>
          
          <div style={styles.headerProfile}>
            <button style={styles.themeToggle} onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun size={18} color="orange" /> : <Moon size={18} color="#64748B" />}
            </button>
            <div style={styles.profileInfo}>
              <img src={user?.profile_image} alt="Admin" style={styles.profileImg} />
              <div style={{textAlign:'left'}}>
                <div style={{fontWeight:'700', fontSize:'0.9rem'}}>{user?.name || 'Admin Lakmal Perera'}</div>
                <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>Administrator</div>
              </div>
            </div>
          </div>
        </header>

        {/* 1. Dashboard Tab Overview */}
        {activeTab === 'Dashboard' && (
          <div className="animate-fade" style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            <div className="hms-grid-4">
              {[
                { name: 'Total Patients', value: stats.totalPatients, icon: Users, color: '#0062FF', bg: '#E8F1FF' },
                { name: 'Doctors', value: stats.totalDoctors, icon: Award, color: '#A855F7', bg: '#F3E8FF' },
                { name: 'Appointments', value: stats.totalAppointments, icon: Calendar, color: '#10B981', bg: '#ECFDF5' },
                { name: 'Departments', value: stats.totalDepartments, icon: Building, color: '#F97316', bg: '#FFEDD5' }
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

            {/* Custom Interactive Line and Donut Charts */}
            <div style={styles.chartsGrid}>
              <div className="card" style={{flex: 2}}>
                <h3 style={styles.cardTitle}>Appointments Overview</h3>
                <div style={styles.mockLineChart}>
                  {/* Beautiful SVG Line graph simulating analytical trends */}
                  <svg viewBox="0 0 500 200" style={{width:'100%', height:'100%'}}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0062FF" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0062FF" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 30,150 Q 110,90 190,110 T 350,60 T 470,120" fill="none" stroke="#0062FF" strokeWidth="3" />
                    <path d="M 30,150 Q 110,90 190,110 T 350,60 T 470,120 L 470,190 L 30,190 Z" fill="url(#chartGrad)" />
                    <circle cx="190" cy="110" r="5" fill="#0062FF" />
                    <circle cx="350" cy="60" r="5" fill="#0062FF" />
                    <text x="180" y="95" fill="var(--text-primary)" fontSize="10" fontWeight="700">156 Appts</text>
                    <text x="340" y="45" fill="var(--text-primary)" fontSize="10" fontWeight="700">240 Appts</text>
                    <line x1="30" y1="190" x2="470" y2="190" stroke="var(--border-light)" strokeWidth="1" />
                    <text x="30" y="200" fill="var(--text-muted)" fontSize="8">Mon</text>
                    <text x="110" y="200" fill="var(--text-muted)" fontSize="8">Tue</text>
                    <text x="190" y="200" fill="var(--text-muted)" fontSize="8">Wed</text>
                    <text x="270" y="200" fill="var(--text-muted)" fontSize="8">Thu</text>
                    <text x="350" y="200" fill="var(--text-muted)" fontSize="8">Fri</text>
                    <text x="430" y="200" fill="var(--text-muted)" fontSize="8">Sat</text>
                  </svg>
                </div>
              </div>

              <div className="card" style={{flex: 1.2}}>
                <h3 style={styles.cardTitle}>System Statistics</h3>
                <div style={styles.pieContainer}>
                  {/* Clean responsive pie graph */}
                  <div style={styles.pieWrapper}>
                    <div style={styles.donut}></div>
                  </div>
                  <div style={styles.pieLegend}>
                    <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor:'#0062FF'}}></span><span>Active Users (60%)</span></div>
                    <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor:'#10B981'}}></span><span>Inactive Users (20%)</span></div>
                    <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor:'#A855F7'}}></span><span>New Users (10%)</span></div>
                    <div style={styles.legendItem}><span style={{...styles.dot, backgroundColor:'#F97316'}}></span><span>New Today (10%)</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities Section */}
            <div className="card" style={{textAlign:'left'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
                <h3 style={styles.cardTitle}>Recent Activities</h3>
                <button className="btn btn-secondary" style={{padding:'6px 12px', fontSize:'0.8rem'}}>View All</button>
              </div>
              <div style={styles.activitiesList}>
                {recentActivities.map((act) => (
                  <div key={act.id} style={styles.activityItem}>
                    <div style={styles.activityIndicator}>
                      <span className="secure-indicator" style={{backgroundColor: act.type === 'patient' ? '#0062FF' : act.type === 'appointment' ? '#10B981' : '#A855F7'}}></span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:'600', fontSize:'0.9rem'}}>{act.text}</div>
                      <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{act.date} • {act.time}</div>
                    </div>
                    <ChevronRight size={16} color="var(--text-muted)" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. USERS SECTION PAGE */}
        {activeTab === 'Users' && (
          <div className="animate-fade">
            <div className="hms-grid-4" style={{marginBottom:'24px'}}>
              <div className="card" style={styles.miniStatCard}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Total Users</span>
                    <h2 style={{fontWeight:'800', marginTop:'4px'}}>{stats.totalUsers}</h2>
                  </div>
                  <Users size={20} color="var(--primary)" />
                </div>
              </div>
              <div className="card" style={styles.miniStatCard}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Active Users</span>
                    <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--success)'}}>{stats.activeUsers}</h2>
                  </div>
                  <UserCheck size={20} color="var(--success)" />
                </div>
              </div>
              <div className="card" style={styles.miniStatCard}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>Suspended Users</span>
                    <h2 style={{fontWeight:'800', marginTop:'4px', color:'var(--error)'}}>{stats.suspendedUsers}</h2>
                  </div>
                  <UserMinus size={20} color="var(--error)" />
                </div>
              </div>
              <div className="card" style={styles.miniStatCard}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <span style={{fontSize:'0.8rem', color:'var(--text-secondary)'}}>New This Month</span>
                    <h2 style={{fontWeight:'800', marginTop:'4px'}}>{stats.newUsersThisMonth}</h2>
                  </div>
                  <UserPlus size={20} color="var(--info)" />
                </div>
              </div>
            </div>

            <div className="card">
              <div style={styles.tableToolbar}>
                <div style={styles.searchContainer}>
                  <Search size={18} color="var(--text-muted)" />
                  <input 
                    type="text" 
                    placeholder="Search users..." 
                    style={styles.searchInput}
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                </div>
                <div style={{display:'flex', gap:'12px'}}>
                  <div style={styles.filterGroup}>
                    <Filter size={14} />
                    <select style={styles.selectFilter} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                      <option value="All">All Roles</option>
                      <option value="Admin">Admin</option>
                      <option value="Doctor">Doctor</option>
                      <option value="Patient">Patient</option>
                      <option value="Nurse">Nurse</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" onClick={() => openAddModal('user')}>
                    <Plus size={16} /> Add New User
                  </button>
                </div>
              </div>

              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Profile Image</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Last Login</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((item) => (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.td}>
                          <img src={item.profile_image} alt={item.name} style={styles.tableAvatar} />
                        </td>
                        <td style={{...styles.td, fontWeight:'700'}}>{item.name}</td>
                        <td style={styles.td}>{item.email}</td>
                        <td style={styles.td}>
                          <span style={styles.roleTag(item.role)}>{item.role}</span>
                        </td>
                        <td style={styles.td}>
                          <span className={`badge ${item.status === 'Active' ? 'badge-success' : 'badge-error'}`}>{item.status}</span>
                        </td>
                        <td style={styles.td}>{item.last_login ? new Date(item.last_login).toLocaleString() : 'Never'}</td>
                        <td style={styles.td}>
                          <div style={{display:'flex', gap:'8px'}}>
                            <button style={styles.actionIconBtn} onClick={() => openAddModal('user', item)}>
                              <Edit2 size={14} color="var(--primary)" />
                            </button>
                            <button style={styles.actionIconBtn} onClick={() => handleDeleteUser(item.id)}>
                              <Trash2 size={14} color="var(--error)" />
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

        {/* 3. DOCTORS SECTION PAGE */}
        {activeTab === 'Doctors' && (
          <div className="animate-fade">
            <div style={{display:'flex', justifyBetween:'center', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={styles.cardTitle}>Hospital Medical Specialist Staff</h3>
              <button className="btn btn-primary" onClick={() => openAddModal('doctor')}>
                <Plus size={16} /> Register Doctor Specialist
              </button>
            </div>
            
            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Doctor Name</th>
                      <th style={styles.th}>Department</th>
                      <th style={styles.th}>Specialization</th>
                      <th style={styles.th}>Experience</th>
                      <th style={styles.th}>Availability</th>
                      <th style={styles.th}>Contact</th>
                      <th style={styles.th}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorsList.map((doc) => (
                      <tr key={doc.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{doc.name}</td>
                        <td style={styles.td}>{doc.department_name || 'General Ward'}</td>
                        <td style={styles.td}>{doc.specialization}</td>
                        <td style={styles.td}>{doc.experience} Years</td>
                        <td style={styles.td}>
                          <span className={`badge ${doc.availability === 'Available' ? 'badge-success' : 'badge-warning'}`}>{doc.availability}</span>
                        </td>
                        <td style={styles.td}>{doc.contact}</td>
                        <td style={{...styles.td, color:'var(--warning)', fontWeight:'700'}}>★ {doc.rating}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. PATIENTS SECTION PAGE */}
        {activeTab === 'Patients' && (
          <div className="animate-fade">
            <div style={{display:'flex', justifyBetween:'center', alignItems:'center', marginBottom:'20px'}}>
              <h3 style={styles.cardTitle}>Patients Registry</h3>
              <button className="btn btn-primary" onClick={() => openAddModal('patient')}>
                <Plus size={16} /> Register Patient Case
              </button>
            </div>

            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient ID</th>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Age / Gender</th>
                      <th style={styles.th}>Disease</th>
                      <th style={styles.th}>Blood Group</th>
                      <th style={styles.th}>Assigned Doctor</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsList.map((pat) => (
                      <tr key={pat.id} style={styles.tr}>
                        <td style={styles.td}>PAT-{1000 + pat.id}</td>
                        <td style={{...styles.td, fontWeight:'700'}}>{pat.name}</td>
                        <td style={styles.td}>{pat.age} Years / {pat.gender}</td>
                        <td style={styles.td}>{pat.disease || 'General Diagnosis'}</td>
                        <td style={{...styles.td, fontWeight:'700', color:'var(--error)'}}>{pat.blood_group || 'O+'}</td>
                        <td style={styles.td}>{pat.doctor_name || 'Dr. Sarath Jayasekara'}</td>
                        <td style={styles.td}>
                          <span className={`badge ${pat.status === 'Admitted' ? 'badge-warning' : pat.status === 'Discharged' ? 'badge-success' : 'badge-error'}`}>{pat.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. APPOINTMENTS SECTION PAGE */}
        {activeTab === 'Appointments' && (
          <div className="animate-fade">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom:'24px'}}>
              <h3 style={styles.cardTitle}>Clinic Schedule Operations</h3>
              <button className="btn btn-primary" onClick={() => openAddModal('appointment')}>
                <Plus size={16} /> Book Appointment
              </button>
            </div>

            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Patient Name</th>
                      <th style={styles.th}>Specialist Doctor</th>
                      <th style={styles.th}>Scheduled Date</th>
                      <th style={styles.th}>Time</th>
                      <th style={styles.th}>Consultation Type</th>
                      <th style={styles.th}>Payment status</th>
                      <th style={styles.th}>Clinic Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointmentsList.map((appt) => (
                      <tr key={appt.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700'}}>{appt.patient_name}</td>
                        <td style={styles.td}>{appt.doctor_name}</td>
                        <td style={styles.td}>{new Date(appt.date).toLocaleDateString()}</td>
                        <td style={styles.td}>{appt.time}</td>
                        <td style={styles.td}>{appt.type}</td>
                        <td style={styles.td}>
                          <span className={`badge ${appt.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>{appt.payment_status}</span>
                        </td>
                        <td style={styles.td}>
                          <span className={`badge ${appt.status === 'Upcoming' ? 'badge-info' : appt.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{appt.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. DEPARTMENTS SECTION */}
        {activeTab === 'Departments' && (
          <div className="animate-fade">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom:'24px'}}>
              <h3 style={styles.cardTitle}>Clinical Departments</h3>
              <button className="btn btn-primary" onClick={() => openAddModal('department')}>
                <Plus size={16} /> Add Clinical Department
              </button>
            </div>

            <div className="card">
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Department Name</th>
                      <th style={styles.th}>Head Doctor Specialist</th>
                      <th style={styles.th}>Ward Rooms</th>
                      <th style={styles.th}>Assigned Staff</th>
                      <th style={styles.th}>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentsList.map((dept) => (
                      <tr key={dept.id} style={styles.tr}>
                        <td style={{...styles.td, fontWeight:'700', color:'var(--primary)'}}>{dept.name}</td>
                        <td style={styles.td}>{dept.head_doctor_name || 'Dr. Sarath Jayasekara'}</td>
                        <td style={styles.td}>{dept.room_count} Rooms</td>
                        <td style={styles.td}>{dept.staff_count} Members</td>
                        <td style={{...styles.td, fontSize:'0.8rem'}}>{dept.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 7. REPORTS SECTION */}
        {activeTab === 'Reports' && (
          <div className="animate-fade" style={{display:'flex', flexDirection:'column', gap:'30px'}}>
            <div className="hms-grid-2">
              <div className="card" style={{textAlign:'left'}}>
                <h3 style={styles.cardTitle}>Hospital Financial Reports</h3>
                <p style={{color:'var(--text-secondary)', fontSize:'0.85rem', marginBottom:'16px'}}>Generate consolidated medical audits, payments logs and inventories status reports.</p>
                <div style={styles.reportsGroup}>
                  {[
                    { title: 'Revenue Growth Audit - May 2026', cat: 'Revenue Reports' },
                    { title: 'Specialist Performance Metric', cat: 'Doctor Reports' },
                    { title: 'Monthly Clinic Appointment Audits', cat: 'Appointment Reports' }
                  ].map((rep, index) => (
                    <div key={index} style={styles.reportRow}>
                      <div>
                        <div style={{fontWeight:'700', fontSize:'0.9rem'}}>{rep.title}</div>
                        <div style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{rep.cat}</div>
                      </div>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button style={styles.actionBtnOutline}><Download size={14} /> PDF</button>
                        <button style={styles.actionBtnOutline}><Download size={14} /> CSV</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card" style={{textAlign:'left'}}>
                <h3 style={styles.cardTitle}>Patient Analytical Stats</h3>
                <div style={{height:'180px', display:'flex', alignItems:'flex-end', gap:'12px', paddingBottom:'16px'}}>
                  <div style={styles.barCol}><div style={{...styles.bar, height:'60%', backgroundColor:'#0062FF'}}></div><span style={styles.barLabel}>Mon</span></div>
                  <div style={styles.barCol}><div style={{...styles.bar, height:'85%', backgroundColor:'#0062FF'}}></div><span style={styles.barLabel}>Tue</span></div>
                  <div style={styles.barCol}><div style={{...styles.bar, height:'45%', backgroundColor:'#0062FF'}}></div><span style={styles.barLabel}>Wed</span></div>
                  <div style={styles.barCol}><div style={{...styles.bar, height:'95%', backgroundColor:'#10B981'}}></div><span style={styles.barLabel}>Thu</span></div>
                  <div style={styles.barCol}><div style={{...styles.bar, height:'70%', backgroundColor:'#0062FF'}}></div><span style={styles.barLabel}>Fri</span></div>
                </div>
                <div style={{textAlign:'center', fontSize:'0.8rem', color:'var(--text-muted)'}}>Consolidated Patient Admissions Chart</div>
              </div>
            </div>
          </div>
        )}

        {/* 8. SETTINGS SECTION */}
        {activeTab === 'Settings' && (
          <div className="animate-fade" style={{display:'flex', flexDirection:'column', gap:'24px', textAlign:'left'}}>
            <div className="card">
              <h3 style={styles.cardTitle}>General Hospital Configurations</h3>
              <div className="hms-grid-2" style={{marginTop:'16px'}}>
                <div>
                  <label style={styles.label}>Hospital Name</label>
                  <input type="text" className="input-field" defaultValue="Medicare Hospital" />
                </div>
                <div>
                  <label style={styles.label}>Contact Phone</label>
                  <input type="text" className="input-field" defaultValue="0112752049" />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 style={styles.cardTitle}>System Security & Alerts</h3>
              <div style={{marginTop:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked />
                  <span>Enable Realtime SMS Alerts notification service</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" defaultChecked />
                  <span>Enable Email Diagnostics reports sync service</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dynamic Modal Renderer */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={selectedItem ? `Edit ${modalType}` : `Create New ${modalType}`}
      >
        {modalType === 'user' && (
          <form onSubmit={handleSaveUser} style={styles.form}>
            <label style={styles.label}>Name</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={userForm.name} 
              onChange={e => setUserForm({...userForm, name: e.target.value})} 
            />
            
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              required 
              value={userForm.email} 
              onChange={e => setUserForm({...userForm, email: e.target.value})} 
            />
            
            {!selectedItem && (
              <>
                <label style={styles.label}>Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  required 
                  value={userForm.password} 
                  onChange={e => setUserForm({...userForm, password: e.target.value})} 
                />
              </>
            )}
            
            <label style={styles.label}>Role</label>
            <select 
              className="input-field" 
              value={userForm.role} 
              onChange={e => setUserForm({...userForm, role: e.target.value})}
            >
              <option>Admin</option>
              <option>Doctor</option>
              <option>Patient</option>
              <option>Nurse</option>
            </select>
            
            <label style={styles.label}>Status</label>
            <select 
              className="input-field" 
              value={userForm.status} 
              onChange={e => setUserForm({...userForm, status: e.target.value})}
            >
              <option>Active</option>
              <option>Suspended</option>
            </select>
            
            <button className="btn btn-primary" type="submit" style={{marginTop:'16px'}}>
              Save User Profile
            </button>
          </form>
        )}

        {modalType === 'doctor' && (
          <form onSubmit={handleSaveDoctor} style={{...styles.form, maxHeight:'70vh', overflowY:'auto'}}>
            <label style={styles.label}>Doctor Name</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={doctorForm.name} 
              onChange={e => setDoctorForm({...doctorForm, name: e.target.value})} 
            />
            
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              required 
              value={doctorForm.email} 
              onChange={e => setDoctorForm({...doctorForm, email: e.target.value})} 
            />
            
            {!selectedItem && (
              <>
                <label style={styles.label}>Password</label>
                <input 
                  type="password" 
                  className="input-field" 
                  required 
                  value={doctorForm.password} 
                  onChange={e => setDoctorForm({...doctorForm, password: e.target.value})} 
                />
              </>
            )}
            
            <label style={styles.label}>Specialization</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              placeholder="e.g. Cardiologist"
              value={doctorForm.specialization} 
              onChange={e => setDoctorForm({...doctorForm, specialization: e.target.value})} 
            />
            
            <label style={styles.label}>Department</label>
            <select 
              className="input-field" 
              value={doctorForm.department_id} 
              onChange={e => setDoctorForm({...doctorForm, department_id: e.target.value})}
            >
              <option value="">Select Department</option>
              {departmentsList.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            
            <label style={styles.label}>Availability</label>
            <select 
              className="input-field" 
              value={doctorForm.availability} 
              onChange={e => setDoctorForm({...doctorForm, availability: e.target.value})}
            >
              <option>Available</option>
              <option>On Leave</option>
            </select>
            
            <label style={styles.label}>Contact Phone</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={doctorForm.contact} 
              onChange={e => setDoctorForm({...doctorForm, contact: e.target.value})} 
            />
            
            <button className="btn btn-primary" type="submit" style={{marginTop:'16px'}}>
              Save Doctor Specialist
            </button>
          </form>
        )}

        {modalType === 'patient' && (
          <form onSubmit={handleSavePatient} style={{...styles.form, maxHeight:'70vh', overflowY:'auto'}}>
            <label style={styles.label}>Patient Name</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={patientForm.name} 
              onChange={e => setPatientForm({...patientForm, name: e.target.value})} 
            />
            
            <label style={styles.label}>Email</label>
            <input 
              type="email" 
              className="input-field" 
              required 
              value={patientForm.email} 
              onChange={e => setPatientForm({...patientForm, email: e.target.value})} 
            />
            
            <div className="hms-grid-2">
              <div>
                <label style={styles.label}>Age</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={patientForm.age} 
                  onChange={e => setPatientForm({...patientForm, age: e.target.value})} 
                />
              </div>
              <div>
                <label style={styles.label}>Gender</label>
                <select 
                  className="input-field" 
                  value={patientForm.gender} 
                  onChange={e => setPatientForm({...patientForm, gender: e.target.value})}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
            </div>
            
            <label style={styles.label}>Address</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={patientForm.address} 
              onChange={e => setPatientForm({...patientForm, address: e.target.value})} 
            />
            
            <label style={styles.label}>Phone</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={patientForm.phone} 
              onChange={e => setPatientForm({...patientForm, phone: e.target.value})} 
            />
            
            <label style={styles.label}>Clinical Status</label>
            <select 
              className="input-field" 
              value={patientForm.status} 
              onChange={e => setPatientForm({...patientForm, status: e.target.value})}
            >
              <option>Admitted</option>
              <option>Discharged</option>
              <option>Emergency</option>
            </select>
            
            <button className="btn btn-primary" type="submit" style={{marginTop:'16px'}}>
              Register Patient Case
            </button>
          </form>
        )}

        {modalType === 'appointment' && (
          <form onSubmit={handleSaveAppointment} style={styles.form}>
            <label style={styles.label}>Select Patient</label>
            <select 
              className="input-field" 
              required 
              value={apptForm.patient_id} 
              onChange={e => setApptForm({...apptForm, patient_id: e.target.value})}
            >
              <option value="">Choose Patient</option>
              {patientsList.map(pat => (
                <option key={pat.id} value={pat.id}>{pat.name}</option>
              ))}
            </select>
            
            <label style={styles.label}>Select Doctor Specialist</label>
            <select 
              className="input-field" 
              required 
              value={apptForm.doctor_id} 
              onChange={e => setApptForm({...apptForm, doctor_id: e.target.value})}
            >
              <option value="">Choose Specialist</option>
              {doctorsList.map(doc => (
                <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization}</option>
              ))}
            </select>

            <div className="hms-grid-2">
              <div>
                <label style={styles.label}>Date</label>
                <input 
                  type="date" 
                  className="input-field" 
                  required 
                  value={apptForm.date} 
                  onChange={e => setApptForm({...apptForm, date: e.target.value})} 
                />
              </div>
              <div>
                <label style={styles.label}>Time Slot</label>
                <input 
                  type="time" 
                  className="input-field" 
                  required 
                  value={apptForm.time} 
                  onChange={e => setApptForm({...apptForm, time: e.target.value})} 
                />
              </div>
            </div>
            
            <label style={styles.label}>Consultation Type</label>
            <select 
              className="input-field" 
              value={apptForm.type} 
              onChange={e => setApptForm({...apptForm, type: e.target.value})}
            >
              <option>Consultation</option>
              <option>Follow-up Visit</option>
              <option>ECG Test</option>
            </select>
            
            <button className="btn btn-primary" type="submit" style={{marginTop:'16px'}}>
              Confirm Booking
            </button>
          </form>
        )}

        {modalType === 'department' && (
          <form onSubmit={handleSaveDepartment} style={styles.form}>
            <label style={styles.label}>Department Name</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              value={deptForm.name} 
              onChange={e => setDeptForm({...deptForm, name: e.target.value})} 
            />
            
            <div className="hms-grid-2">
              <div>
                <label style={styles.label}>Ward Room Count</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={deptForm.room_count} 
                  onChange={e => setDeptForm({...deptForm, room_count: e.target.value})} 
                />
              </div>
              <div>
                <label style={styles.label}>Assigned Staff</label>
                <input 
                  type="number" 
                  className="input-field" 
                  required 
                  value={deptForm.staff_count} 
                  onChange={e => setDeptForm({...deptForm, staff_count: e.target.value})} 
                />
              </div>
            </div>
            
            <label style={styles.label}>Department description</label>
            <textarea 
              className="input-field" 
              rows="3"
              value={deptForm.description} 
              onChange={e => setDeptForm({...deptForm, description: e.target.value})} 
            />
            
            <button className="btn btn-primary" type="submit" style={{marginTop:'16px'}}>
              Save Department Details
            </button>
          </form>
        )}
      </Modal>

      {/* Customized Logout Confirmation Popup */}
      <LogoutModal 
        isOpen={showLogout} 
        onClose={() => setShowLogout(false)} 
        onConfirm={onLogout}
        onSwitchAccount={onSwitchAccount}
        role="admin"
      />
    </div>
  );
}

// Inline Styles Object representing pixel-perfect dashboard layouts
const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    fontFamily: 'var(--font-body)',
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
  mockLineChart: {
    height: '200px',
    marginTop: '20px'
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
    background: 'conic-gradient(#0062FF 0% 60%, #10B981 60% 80%, #A855F7 80% 90%, #F97316 90% 100%)',
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
  activitiesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid var(--border-light)'
  },
  activityIndicator: {
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center'
  },
  miniStatCard: {
    padding: '16px'
  },
  tableToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px'
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-light)',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    width: '280px'
  },
  searchInput: {
    border: 'none',
    background: 'none',
    width: '100%',
    color: 'var(--text-primary)',
    fontSize: '0.85rem'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem'
  },
  selectFilter: {
    border: 'none',
    background: 'none',
    color: 'var(--text-primary)',
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
  tableAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  roleTag: (role) => {
    const isDoc = role?.toLowerCase() === 'doctor';
    const isAdmin = role?.toLowerCase() === 'admin';
    const isNurse = role?.toLowerCase() === 'nurse';
    return {
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      backgroundColor: isAdmin ? '#FFE4E6' : isDoc ? '#E8F1FF' : isNurse ? '#F3E8FF' : '#F1F5F9',
      color: isAdmin ? '#E11D48' : isDoc ? '#0062FF' : isNurse ? '#A855F7' : '#475569'
    };
  },
  actionIconBtn: {
    border: 'none',
    backgroundColor: 'var(--bg-main)',
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  },
  reportsGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  reportRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-sm)'
  },
  actionBtnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-light)',
    borderRadius: '6px',
    cursor: 'pointer',
    color: 'var(--text-secondary)'
  },
  barCol: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  bar: {
    width: '18px',
    borderRadius: '4px 4px 0 0'
  },
  barLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginTop: '6px'
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }
};
