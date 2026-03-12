
import React from 'react';

interface ToastProps {
  message: string;
  icon: string;
  color: string;
  onClose: () => void;
  onClick?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, icon, color, onClose, onClick }) => {
  return (
    <div
      onClick={onClick}
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
        animation: 'slideDown 0.3s ease',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease'
      }}
      className={onClick ? 'active:scale-95 hover:bg-slate-50' : ''}
    >
      <span className="material-icons-round" style={{ color: color, fontSize: '24px' }}>{icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: '800', color: '#111827', flex: 1, letterSpacing: '-0.025em' }}>{message}</span>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }} 
        style={{ 
          background: '#f1f5f9', 
          border: 'none', 
          cursor: 'pointer', 
          color: '#94a3b8',
          width: '24px',
          height: '24px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <span className="material-icons-round" style={{ fontSize: '14px' }}>close</span>
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
