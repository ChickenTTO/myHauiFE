import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function RoomLayout() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState('');
  
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/assets');
        const items = response.data;
        const regex = /(pc|laptop|máy tính|vi tính|máy chủ)/i;
        const computers = items.filter((item: any) => regex.test(item.assetName));
        setAssets(computers);
        
        // Auto select first room
        const rooms = [...new Set(computers.map((a: any) => a.location?.split('-')[0].trim()))].filter(Boolean);
        if(rooms.length > 0) setSelectedRoom(rooms[0] as string);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const rooms = [...new Set(assets.map(a => a.location?.split('-')[0].trim()))].filter(Boolean);
  
  // Get assets for selected room
  const roomAssets = assets.filter(a => a.location?.split('-')[0].trim() === selectedRoom);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <h2 style={{ color: '#0d3b66', margin: 0 }}>
          Sơ đồ Thiết bị Phòng Máy (Giám sát Real-time)
        </h2>
        <button 
          disabled
          title="Tính năng đang được phát triển"
          style={{ padding: '8px 15px', backgroundColor: '#e3f2fd', color: '#1565c0', borderRadius: '4px', cursor: 'not-allowed', border: '1px solid #90caf9', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          📡 Tích hợp IoT Định vị tài sản (Sắp ra mắt)
        </button>
      </div>

      {loading ? (
        <p>Đang tải sơ đồ phòng...</p>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontWeight: 'bold', marginRight: '15px' }}>Chọn Phòng:</label>
            <select 
              value={selectedRoom} 
              onChange={e => setSelectedRoom(e.target.value)}
              style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              {rooms.map(r => <option key={r as string} value={r as string}>Phòng {r}</option>)}
            </select>
          </div>

          <div style={{ 
            background: 'white', padding: '30px', borderRadius: '12px', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)', minHeight: '500px' 
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '20px' }}>
              {roomAssets.map((asset, idx) => {
                const isBroken = asset.status?.toLowerCase().includes('hỏng') || asset.status?.toLowerCase().includes('thanh lý');
                // Simulate Active usage for demo
                const isActive = false; 

                return (
                  <div 
                    key={idx} 
                    style={{
                      border: `2px solid ${isBroken ? '#ef5350' : (isActive ? '#66bb6a' : '#ccc')}`,
                      backgroundColor: isBroken ? '#ffebee' : (isActive ? '#e8f5e9' : '#f4f7f6'),
                      borderRadius: '8px',
                      padding: '15px 10px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💻</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0d3b66' }}>{asset.assetCode}</div>
                    
                    {isBroken && <div style={{ color: '#c62828', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '5px' }}>ĐANG HỎNG</div>}
                    {isActive && <div style={{ color: '#2e7d32', fontSize: '0.7rem', fontWeight: 'bold', marginTop: '5px' }}>ĐANG DÙNG</div>}
                    {!isBroken && !isActive && <div style={{ color: '#666', fontSize: '0.7rem', marginTop: '5px' }}>TRỐNG</div>}
                  </div>
                )
              })}
            </div>
            
            {roomAssets.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>Không có thiết bị trong phòng này.</p>}
          </div>
        </>
      )}
    </div>
  );
}
