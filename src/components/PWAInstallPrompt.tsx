import React, { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Detect iOS (Safari/Chrome on iPhone/iPad)
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };

    // Detect if app is already installed/running in standalone mode
    const isInStandaloneMode = () => {
      return ('standalone' in window.navigator && (window.navigator as any).standalone) 
             || window.matchMedia('(display-mode: standalone)').matches;
    };

    // Show prompt if iOS and not installed, and hasn't been dismissed recently
    if (isIos() && !isInStandaloneMode()) {
      const hasDismissed = localStorage.getItem('pwa_prompt_dismissed');
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for 7 days
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setTimeout(() => {
      localStorage.removeItem('pwa_prompt_dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (!showPrompt) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '16px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: '2px solid #0d3b66'
    }}>
      <div style={{ position: 'absolute', top: '10px', right: '10px', cursor: 'pointer', fontWeight: 'bold', color: '#888' }} onClick={handleDismiss}>
        ✕
      </div>
      <h3 style={{ margin: '0 0 10px 0', color: '#0d3b66', textAlign: 'center' }}>Cài đặt Ứng dụng MyHaUI</h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#555', textAlign: 'center' }}>
        Cài đặt ứng dụng vào màn hình chính để trải nghiệm mượt mà hơn và truy cập nhanh chóng.
      </p>
      
      <div style={{ background: '#f4f7f6', padding: '15px', borderRadius: '8px', width: '100%', fontSize: '0.85rem' }}>
        <strong>Hướng dẫn cho iOS:</strong>
        <ol style={{ paddingLeft: '20px', margin: '10px 0 0 0' }}>
          <li style={{ marginBottom: '8px' }}>Chạm vào biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh công cụ dưới cùng của Safari. <span style={{fontSize:'1.2rem'}}>⍐</span></li>
          <li>Chọn <strong>"Thêm vào MH chính"</strong> (Add to Home Screen) <span style={{fontSize:'1.2rem'}}>+</span></li>
        </ol>
      </div>
    </div>
  );
}
