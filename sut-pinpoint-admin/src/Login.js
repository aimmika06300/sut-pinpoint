import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // ตรวจสอบข้อมูลเข้าสู่ระบบของ Admin (สามารถปรับเปลี่ยนหรือเชื่อมต่อ Backend Auth ได้)
    if (username === 'admin' && password === '123456') {
      setErrorMsg('');
      onLoginSuccess();
    } else {
      setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header / Logo */}
        <div style={styles.headerBox}>
          <h1 style={styles.brandTitle}>SUT PIN POINT</h1>
          <p style={styles.brandSubtitle}>Admin Management Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.formTitle}>ลงชื่อเข้าใช้สำหรับผู้ดูแลระบบ</h2>

          {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

          {/* Username Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="#8C7A6B" />
              <input
                type="text"
                required
                placeholder="กรอกชื่อผู้ใช้งาน"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} color="#8C7A6B" />
              <input
                type="password"
                required
                placeholder="กรอกรหัสผ่าน"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" style={styles.loginBtn}>
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#FFF8E7',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    width: '400px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(90, 56, 37, 0.12)',
  },
  headerBox: {
    backgroundColor: '#E88147',
    padding: '30px 20px',
    textAlign: 'center',
  },
  brandTitle: {
    margin: 0,
    color: '#FFFFFF',
    fontSize: '26px',
    fontWeight: '900',
    letterSpacing: '1.5px',
  },
  brandSubtitle: {
    margin: '6px 0 0',
    color: '#FFF8E7',
    fontSize: '13px',
  },
  form: {
    padding: '30px',
  },
  formTitle: {
    margin: '0 0 20px',
    fontSize: '18px',
    color: '#5A3825',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '15px',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#5A3825',
    marginBottom: '6px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #D1C7BD',
    borderRadius: '8px',
    padding: '0 12px',
    backgroundColor: '#FAF7F2',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '12px 10px',
    backgroundColor: 'transparent',
    fontSize: '14px',
    color: '#222',
  },
  loginBtn: {
    width: '100%',
    backgroundColor: '#5A3825',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
  },
};