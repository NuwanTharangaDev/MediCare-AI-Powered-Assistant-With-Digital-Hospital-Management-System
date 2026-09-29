import React, { useState } from 'react';
import { LogOut, RefreshCw, Lock, Save, ShieldAlert } from 'lucide-react';

export default function LogoutModal({ isOpen, onClose, onConfirm, onSwitchAccount, role }) {
  if (!isOpen) return null;

  const [saveSession, setSaveSession] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const handleConfirm = () => {
    if (saveSession) {
      localStorage.setItem('saved_session_user', localStorage.getItem('currentUser'));
    } else {
      localStorage.removeItem('saved_session_user');
    }
    onConfirm();
  };

  return (
    <div style={styles.overlay} onClick={onClose} className="animate-fade">
      <div style={styles.modal} onClick={e => e.stopPropagation()} className="animate-slide">
        <div style={styles.iconContainer}>
          <ShieldAlert size={48} color="var(--error)" />
        </div>
        
        <h3 style={styles.title}>Confirm Logout</h3>
        <p style={styles.subtitle}>Are you sure you want to exit your Medicare secure session?</p>
        
        <div style={styles.optionsGroup}>
          <label style={styles.optionLabel}>
            <input 
              type="checkbox" 
              checked={saveSession} 
              onChange={e => setSaveSession(e.target.checked)} 
              style={styles.checkbox}
            />
            <div style={styles.optionTextContainer}>
              <span style={styles.optionTitle}><Save size={14} style={{verticalAlign:'middle', marginRight:'4px'}} /> Save current session state</span>
              <span style={styles.optionDesc}>Keep items cache on local browser storage.</span>
            </div>
          </label>

          {role === 'patient' && (
            <label style={styles.optionLabel}>
              <input 
                type="checkbox" 
                checked={rememberDevice} 
                onChange={e => setRememberDevice(e.target.checked)} 
                style={styles.checkbox}
              />
              <div style={styles.optionTextContainer}>
                <span style={styles.optionTitle}>Remember Device</span>
                <span style={styles.optionDesc}>Skip security checks on next connection.</span>
              </div>
            </label>
          )}

          {role === 'nurse' && (
            <button style={styles.actionBtnOutline} onClick={() => setIsLocked(true)}>
              <Lock size={16} />
              <span>Lock Screen instead</span>
            </button>
          )}
        </div>

        {isLocked ? (
          <div style={styles.lockOverlay}>
            <Lock size={36} color="var(--primary)" />
            <h4 style={{marginTop:'12px', fontWeight:'700'}}>Screen Locked</h4>
            <p style={{fontSize:'0.85rem', color:'var(--text-secondary)', textAlign:'center', margin:'8px 0 16px 0'}}>Enter credentials to quickly unlock your nursing session.</p>
            <button className="btn btn-primary" onClick={() => setIsLocked(false)}>Unlock Session</button>
          </div>
        ) : (
          <div style={styles.actions}>
            <button className="btn btn-danger" style={styles.logoutBtn} onClick={handleConfirm}>
              <LogOut size={16} />
              Confirm Logout
            </button>
            
            <button style={styles.switchBtn} onClick={onSwitchAccount}>
              <RefreshCw size={16} />
              Switch Account
            </button>
            
            <button style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-light)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxWidth: '400px',
    padding: '32px 24px',
    textAlign: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconContainer: {
    backgroundColor: 'var(--error-light)',
    padding: '16px',
    borderRadius: '50%',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
    marginBottom: '20px'
  },
  optionsGroup: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    textAlign: 'left',
    marginBottom: '24px',
    padding: '12px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-sm)'
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    cursor: 'pointer'
  },
  checkbox: {
    marginTop: '3px'
  },
  optionTextContainer: {
    display: 'flex',
    flexDirection: 'column'
  },
  optionTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-primary)'
  },
  optionDesc: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)'
  },
  actionBtnOutline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '8px',
    backgroundColor: 'var(--bg-card)',
    border: '1px dashed var(--border-light)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    marginTop: '4px'
  },
  actions: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  logoutBtn: {
    padding: '12px',
    fontSize: '0.95rem',
    width: '100%'
  },
  switchBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-light)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  cancelBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 10
  }
};
