import React, { useState, useEffect } from 'react';
import { parseAssetExcel } from '../../utils/assetParser';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Virtuoso } from 'react-virtuoso';

export default function AssetManagement() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { userRole, isManagement } = useAuth();
  
  // Filters
  const [filterBuilding, setFilterBuilding] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8080/api/assets');
      setAssets(res.data);
    } catch (err) {
      console.error('Lỗi khi tải tài sản:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: any) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      let newlyParsed: any[] = [];
      for(let i=0; i<files.length; i++) {
         const file = files[i];
         const parsedData = await parseAssetExcel(file);
         newlyParsed = [...newlyParsed, ...parsedData];
      }
      
      // Upload mảng tài sản lên backend
      await axios.post('http://localhost:8080/api/assets', newlyParsed);
      
      alert(`Đã upload thành công dữ liệu lên hệ thống!`);
      fetchAssets(); // Tải lại toàn bộ
    } catch (err: any) {
      alert('Lỗi khi tải file: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleDeleteAll = async () => {
      if(!window.confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA TOÀN BỘ CƠ SỞ DỮ LIỆU TÀI SẢN?")) return;
      
      try {
         await axios.delete('http://localhost:8080/api/assets/all');
         setAssets([]);
         alert("Đã xóa sạch cơ sở dữ liệu!");
      } catch (err: any) {
         if (err.response && err.response.status === 403) {
             alert('Bạn không có quyền thực hiện chức năng này!');
         } else {
             console.error(err);
         }
      }
  };

  // Derived state cho Filter dropdowns
  const uniqueBuildings = [...new Set(assets.map(a => a.building))].filter(Boolean);
  const uniqueStatuses = [...new Set(assets.map(a => a.status))].filter(Boolean);

  const filteredAssets = assets.filter(a => {
      const matchBuilding = filterBuilding === 'ALL' || a.building === filterBuilding;
      const matchStatus = filterStatus === 'ALL' || a.status === filterStatus;
      const matchSearch = a.assetCode.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          a.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBuilding && matchStatus && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
         <h2 style={{ color: '#0d3b66', margin: 0 }}>Danh mục Tài sản & Cơ sở vật chất</h2>
         <div style={{ display: 'flex', gap: '10px' }}>
           <button 
             disabled
             title="Tính năng đang được phát triển"
             style={{ padding: '8px 15px', backgroundColor: '#e0e0e0', color: '#9e9e9e', borderRadius: '4px', cursor: 'not-allowed', border: '1px solid #ccc', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}
           >
             🤖 AI Cảnh báo Bảo trì Dự đoán (Sắp ra mắt)
           </button>
           <button onClick={() => window.location.href='/teacher/facilities'} style={{ padding: '5px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>Quay lại Bảng ĐK</button>
         </div>
      </div>

      {/* Admin Controls */}
      {isManagement && (
        <div style={{ background: '#e6f2ff', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0' }}>[Admin] Cập nhật CSDL Tài sản (Excel)</h4>
            <input type="file" accept=".xlsx" multiple onChange={handleFileUpload} disabled={uploading} />
            {uploading && <span style={{ marginLeft: '10px', color: 'var(--haui-yellow)' }}>Đang đồng bộ lên máy chủ...</span>}
          </div>
          <button style={{ marginLeft: 'auto', background: 'var(--haui-red)', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }} onClick={handleDeleteAll}>
             Làm sạch CSDL
          </button>
        </div>
      )}

      {/* Thống kê nhanh */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <div style={{ flex: 1, background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '4px solid #0d3b66' }}>
             <h4 style={{ margin: 0, color: '#666' }}>Tổng số tài sản</h4>
             <h2 style={{ margin: '10px 0 0 0', color: '#0d3b66' }}>{assets.length}</h2>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--haui-red)' }}>
             <h4 style={{ margin: 0, color: '#666' }}>Báo hỏng / Thanh lý</h4>
             <h2 style={{ margin: '10px 0 0 0', color: 'var(--haui-red)' }}>{assets.filter(a => a.status.toLowerCase().includes('hỏng') || a.status.toLowerCase().includes('thanh lý')).length}</h2>
          </div>
      </div>

      {/* Bộ lọc */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
         <input 
            type="text" 
            placeholder="Tìm theo Mã, Tên, Số phòng..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
         />
         <select value={filterBuilding} onChange={e => setFilterBuilding(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="ALL">-- Tất cả Tòa nhà --</option>
            {uniqueBuildings.map(b => <option key={b} value={b}>{b}</option>)}
         </select>
         <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
            <option value="ALL">-- Tất cả Trạng thái --</option>
            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
         </select>
      </div>

      {/* Bảng dữ liệu */}
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        {loading ? (
           <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải CSDL Tài sản...</div>
        ) : filteredAssets.length === 0 ? (
           <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>Không tìm thấy tài sản nào phù hợp.</div>
        ) : (
          <div className="table-responsive" style={{ height: '600px', overflowY: 'hidden' }}>
            {/* Tiêu đề Bảng cố định */}
            <div style={{ display: 'flex', backgroundColor: '#f4f7f6', fontWeight: 'bold', padding: '12px 10px', borderBottom: '2px solid #ddd' }}>
               <div style={{ width: '15%' }}>Mã TS</div>
               <div style={{ width: '35%' }}>Tên Tài sản</div>
               <div style={{ width: '10%' }}>Tòa nhà</div>
               <div style={{ width: '15%' }}>Vị trí (Phòng)</div>
               <div style={{ width: '15%' }}>Người Quản lý</div>
               <div style={{ width: '10%' }}>Tình trạng</div>
            </div>
            
            {/* Nội dung Bảng được Virtualized */}
            <Virtuoso
              style={{ height: '550px', width: '100%' }}
              totalCount={filteredAssets.length}
              itemContent={index => {
                const asset = filteredAssets[index];
                return (
                  <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #eee', padding: '10px', fontSize: '0.9rem', backgroundColor: 'white' }}>
                    <div style={{ width: '15%', fontWeight: 'bold' }}>{asset.assetCode}</div>
                    <div style={{ width: '35%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '10px' }} title={asset.details}>
                       {asset.assetName}
                    </div>
                    <div style={{ width: '10%' }}>{asset.building}</div>
                    <div style={{ width: '15%', color: '#0d3b66', fontWeight: 'bold' }}>{asset.location.split('-')[0].trim()}</div>
                    <div style={{ width: '15%' }}>{asset.manager.split('(')[0].trim()}</div>
                    <div style={{ width: '10%' }}>
                       <span style={{ 
                          padding: '3px 8px', borderRadius: '12px', fontSize: '0.8rem',
                          backgroundColor: asset.status.includes('hỏng') ? '#ffebee' : '#e8f5e9',
                          color: asset.status.includes('hỏng') ? '#c62828' : '#2e7d32'
                       }}>
                          {asset.status}
                       </span>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
