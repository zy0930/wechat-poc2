import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookingForm from './BookingForm';
import { getUserInfo, initiateWeChatAuth, UserInfo } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState<string[]>([]);

  const addDebug = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      // Check if we have authorized=true in URL params (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const authorized = urlParams.get('authorized');
      const openid = urlParams.get('openid');

      addDebug(`URL: ${window.location.href}`);
      addDebug(`Path: ${window.location.pathname}`);
      addDebug(`Params: authorized=${authorized}, openid=${openid}`);

      if (authorized === 'true' && openid) {
        addDebug('OAuth callback detected, getting user info...');
        // Get user info from session
        const userInfo = await getUserInfo();
        addDebug(`User info received: ${userInfo ? 'SUCCESS' : 'FAILED'}`);
        setUser(userInfo);
      } else {
        addDebug('No OAuth callback, trying existing session...');
        // Try to get existing user info from session
        const userInfo = await getUserInfo();
        addDebug(`Existing session: ${userInfo ? 'SUCCESS' : 'FAILED'}`);
        setUser(userInfo);
      }
    } catch (err) {
      addDebug(`Authorization failed: ${err}`);
      setError('需要微信授权');
    } finally {
      addDebug('Loading complete');
      setLoading(false);
    }
  };

  const handleAuthorize = () => {
    initiateWeChatAuth();
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <h2>加载中...</h2>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>微信预约系统</h1>
        </header>

        <Routes>
          <Route path="/" element={
            <div className="main-container">
              {!user ? (
                <div className="auth-container">
                  <h2>欢迎使用预约系统</h2>
                  <p>请先授权登录</p>
                  <button 
                    onClick={handleAuthorize}
                    className="auth-button"
                  >
                    微信授权登录
                  </button>
                  {error && <p className="error-text">{error}</p>}
                </div>
              ) : (
                <div className="user-info">
                  <img 
                    src={user.headimgurl} 
                    alt={user.nickname}
                    className="user-avatar"
                  />
                  <h3>欢迎, {user.nickname}</h3>
                  <p>OpenID: {user.openid}</p>
                </div>
              )}
            </div>
          } />

          <Route path="/booking" element={
            loading ? (
              <div className="loading-container">
                <h2>加载中...</h2>
              </div>
            ) : user ? (
              <BookingForm openid={user.openid} />
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>

        {user && window.location.pathname === '/' && (
          <div className="navigation">
            <button 
              onClick={() => window.location.href = '/booking'}
              className="nav-button"
            >
              前往预约
            </button>
          </div>
        )}

        {/* Debug info - visible in WeChat */}
        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          background: '#f0f0f0', 
          padding: '10px', 
          fontSize: '12px',
          maxHeight: '200px',
          overflowY: 'auto',
          borderTop: '1px solid #ccc'
        }}>
          <strong>Debug Info:</strong>
          {debug.map((msg, i) => (
            <div key={i}>{msg}</div>
          ))}
        </div>
      </div>
    </Router>
  );
}

export default App;