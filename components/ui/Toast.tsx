
import React from 'react';

interface ToastProps {
  message: string;
  icon: string;
  color: string;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, icon, color, onClose }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '60px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        maxWidth: '380px',
        width: '90%',
        background: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderLeft: `4px solid ${color}`,
        animation: 'slideDown 0.3s ease'
      }}
    >
      <span className="material-icons-round" style={{ color: color, fontSize: '22px' }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
        <span className="material-icons-round" style={{ fontSize: '18px' }}>close</span>
      </button>
      <style>{`
        @keyframes slideDown { 
          from { opacity:0; transform:translateX(-50%) translateY(-16px); } 
          to { opacity:1; transform:translateX(-50%) translateY(0); } 
        }
      `}</style>
    </div>
  );
};

export default Toast;
