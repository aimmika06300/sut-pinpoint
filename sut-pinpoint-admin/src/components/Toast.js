// ระบบแจ้งเตือนไร้การบล็อกหน้าจอ
import React from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { colors } from '../styles/themeStyles';

export default function Toast({ toasts, removeToast }) {
  return (
    <div style={toastStyles.wrapper}>
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            style={{
              ...toastStyles.toastItem,
              borderLeft: `5px solid ${isSuccess ? colors.success : isError ? colors.danger : colors.primary}`,
            }}
          >
            {isSuccess && <CheckCircle2 color={colors.success} size={20} />}
            {isError && <AlertCircle color={colors.danger} size={20} />}
            {!isSuccess && !isError && <Info color={colors.primary} size={20} />}

            <span style={toastStyles.toastText}>{toast.message}</span>

            <button style={toastStyles.closeBtn} onClick={() => removeToast(toast.id)}>
              <X size={16} color={colors.subText} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

const toastStyles = {
  wrapper: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    maxWidth: '360px',
    width: '100%',
  },
  toastItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: colors.white,
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    animation: 'slideIn 0.2s ease-out',
  },
  toastText: {
    flex: 1,
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
};