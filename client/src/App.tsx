import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookingForm from './BookingForm';
import { getUserInfo, initiateWeChatAuth, UserInfo } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      // Check if we have authorized=true in URL params (from OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const authorized = urlParams.get('authorized');
      const openid = urlParams.get('openid');

      if (authorized === 'true' && openid) {
        // Get user info from session
        const userInfo = await getUserInfo();
        setUser(userInfo);
      } else {
        // Try to get existing user info from session
        const userInfo = await getUserInfo();
        setUser(userInfo);
      }
    } catch (err) {
      console.log('Not authorized yet');
      setError('需要微信授权');
    } finally {
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
      </div>
    </Router>
  );
}

export default App;