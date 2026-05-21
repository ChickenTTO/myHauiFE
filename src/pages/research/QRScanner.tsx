import React, { useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function QRScanner() {
  const { currentUser } = useAuth();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'INFO' | 'CHECKIN' | 'CHECKOUT'>('INFO');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Html5QrcodeScanner initialization
  React.useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);
    scanner.render((decodedText) => {
      setScanResult(decodedText);
      scanner.clear(); // Dừng quét sau khi thành công
    }, (err) => {
      // ignore
    });

    return () => {
      scanner.clear().catch(e => console.error(e));
    };
  }, []);

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitCheckinOut = async () => {
    if (!scanResult) return;
    
    setLoading(true);
    try {
      // Gửi trực tiếp base64 image (hoặc có thể bỏ qua image nếu backend không hỗ trợ)
      await axios.post('/api/usage-logs', {
        assetCode: scanResult,
        action: actionType,
        status: photoData ? 'REPORTED' : 'CLEAN',
        evidenceImage: photoData // Base64 string
      });

      alert(`✅ Đã xác nhận ${actionType} thành công cho thiết bị ${scanResult}!`);
      setScanResult(null);
      setPhotoData(null);
    } catch (err: any) {
      alert('Lỗi khi gửi dữ liệu: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
      <h2 style={{ color: '#0d3b66', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px', textAlign: 'center' }}>
        Camera Quét mã QR & Giám sát 5S
      </h2>

      {!scanResult ? (
        <div>
          <div id="qr-reader" style={{ width: '100%', marginBottom: '20px' }}></div>
          <p style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>Đưa camera sát vào mã QR dán trên máy tính / tài sản.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#e6f2ff', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
            <h3 style={{ color: '#0d3b66', margin: '0 0 10px 0' }}>Đã quét thành công!</h3>
            <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Mã Tài Sản: {scanResult}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Mục đích quét:</label>
            <select 
              value={actionType} 
              onChange={e => setActionType(e.target.value as any)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="INFO">🔎 Xem thông tin / Lịch sử sửa chữa</option>
              <option value="CHECKIN">🟢 Check-in (Bắt đầu sử dụng)</option>
              <option value="CHECKOUT">🔴 Check-out (Trả máy & Báo cáo 5S)</option>
            </select>
          </div>

          {(actionType === 'CHECKIN' || actionType === 'CHECKOUT') && (
            <div style={{ border: '1px dashed #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>📸 Chụp ảnh hiện trạng (5S)</h4>
              <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>Bắt buộc chụp ảnh màn hình, bàn phím để làm bằng chứng bảo vệ bạn nếu máy bị hỏng.</p>
              
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                onChange={handlePhotoCapture}
                style={{ display: 'block', margin: '0 auto 15px auto' }}
              />
              
              {photoData && <img src={photoData} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }} />}
            </div>
          )}

          {actionType === 'INFO' ? (
             <button onClick={() => alert("Tính năng tra cứu hồ sơ đang được tích hợp ERP.")} style={{ backgroundColor: 'var(--haui-blue)', color: 'white', padding: '15px', borderRadius: '6px', border: 'none', fontWeight: 'bold' }}>
               Tra cứu Hồ sơ Máy
             </button>
          ) : (
             <button 
               onClick={submitCheckinOut}
               disabled={loading || !photoData}
               style={{ backgroundColor: photoData ? 'var(--haui-yellow)' : '#ccc', color: '#0d3b66', padding: '15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: photoData ? 'pointer' : 'not-allowed' }}
             >
               {loading ? 'Đang gửi...' : `Xác nhận ${actionType} & Ký Cam kết`}
             </button>
          )}

          <button onClick={() => { setScanResult(null); setPhotoData(null); }} style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '6px' }}>Quét lại mã khác</button>
        </div>
      )}
    </div>
  );
}
