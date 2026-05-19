import React, { useState, useEffect } from 'react';
import { parseTimetableExcel } from '../utils/excelParser';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function AdminTimetable() {
  const [multiWeekData, setMultiWeekData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pendingData, setPendingData] = useState<any>(null);
  const [detectedWeek, setDetectedWeek] = useState('');
  
  const { currentUser, userRole, isAdmin1, isAdmin2 } = useAuth();

  const fetchTimetables = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/timetables');
      const rawData = response.data;
      
      const fetchedData: any = {};
      rawData.forEach((item: any) => {
         const week = item.tuanHoc;
         if (!fetchedData[week]) fetchedData[week] = [];
         let parsedTietHoc = item.tietHoc;
         if (typeof parsedTietHoc === 'string') {
            try { parsedTietHoc = JSON.parse(parsedTietHoc); } catch(e){}
         }
         fetchedData[week].push({ ...item, tietHoc: parsedTietHoc });
      });
      setMultiWeekData(fetchedData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu TKB:', err);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setPendingData(null);
    
    let autoWeek = 'Tuần Mới'; 
    const match = file.name.match(/T(\d+)/i);
    if (match && match[1]) {
       autoWeek = `Tuần ${match[1]}`;
    }
    setDetectedWeek(autoWeek);
    
    try {
      const parsedData = await parseTimetableExcel(file);
      setPendingData(parsedData);
    } catch (err) {
      setError('Lỗi khi đọc file Excel. Vui lòng kiểm tra lại định dạng.');
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const checkConflict = (newData: any) => {
    // Quét toàn bộ dữ liệu TKB hiện có để kiểm tra trùng lịch (Phòng + Thứ + Ca)
    const existingClasses = Object.values(multiWeekData).flat() as any[];
    for (const cls of newData) {
      const conflict = existingClasses.find(existing => 
        existing.room === cls.room && 
        existing.day === cls.day && 
        existing.shift === cls.shift
      );
      if (conflict) {
        return `Phát hiện xung đột tài nguyên: ${cls.subjectName} (Phòng ${cls.room}, ${cls.day}, ${cls.shift}) trùng với lớp ${conflict.subjectName}!`;
      }
    }
    return null;
  };

  const handleSaveWeek = async () => {
    if (!pendingData || !detectedWeek.trim()) return;
    const weekKey = detectedWeek.trim();
    
    const conflictMsg = checkConflict(pendingData);
    if (conflictMsg) {
      alert(`❌ XUNG ĐỘT TÀI NGUYÊN:\n${conflictMsg}\nVui lòng điều chỉnh lại lịch học để tránh trùng lặp phòng máy.`);
      return;
    }

    setLoading(true);
    try {
      if (multiWeekData[weekKey]) {
        alert(`❌ Dữ liệu của [${weekKey}] đã tồn tại trên Máy chủ! Hệ thống chặn tải đè.`);
        setLoading(false);
        return;
      }

      // Map pendingData to match Prisma schema
      const formattedData = pendingData.map((cls: any) => ({
         tuanHoc: weekKey,
         thu: cls.day || '',
         ngay: cls.day || '', // You might need a real date mapping here
         tietHoc: cls.shift ? (cls.shift === 'Sáng' ? [1,2,3,4,5] : [7,8,9,10,11]) : [],
         maLop: cls.classId || cls.subjectName || '',
         tenMon: cls.subjectName || '',
         giaoVien: cls.teacher || '',
         phongHoc: cls.room || 'CHƯA_XẾP'
      }));

      await axios.post('http://localhost:8080/api/timetables', formattedData);
      
      alert(`✅ Đã lưu thành công dữ liệu cho ${weekKey}!`);
      fetchTimetables();
      setPendingData(null);
      setDetectedWeek('');
    } catch (err: any) {
      alert('Lỗi khi lưu lên Máy chủ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeek = async (weekKey: string) => {
    if (!isAdmin1) {
       alert("Chỉ ADMIN1 mới có quyền xóa dữ liệu Thời khóa biểu.");
       return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn dữ liệu ${weekKey}?`)) return;
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8080/api/timetables/${weekKey}`);
      
      const updated = { ...multiWeekData };
      delete updated[weekKey];
      setMultiWeekData(updated);
      alert(`Đã xóa thành công ${weekKey}`);
    } catch (err: any) {
      alert('Lỗi khi xóa: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(multiWeekData, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "TKB_All_Weeks_Export.json";
    link.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f6', gap: '20px' }}>
      
      {/* Khối tĩnh (Fixed Header) */}
      <div style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ color: 'var(--haui-blue)', margin: '0 0 15px 0' }}>Quản lý Thời khóa biểu Trực tuyến (Admin)</h2>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Tải lên TKB Tuần Mới (Tự động đồng bộ lên Đám mây)</h4>
            <input 
              type="file" 
              accept=".xlsx, .xls" 
              onChange={handleFileUpload} 
              disabled={loading}
            />
            {loading && <span style={{ marginLeft: '10px', color: 'var(--haui-yellow)' }}>Đang giao tiếp với Máy chủ...</span>}
            {error && <span style={{ marginLeft: '10px', color: 'var(--haui-red)' }}>{error}</span>}
          </div>

          {/* Confirmation Box */}
          {pendingData && (
            <div style={{ flex: 1, padding: '15px', background: '#e6f2ff', border: '1px solid var(--haui-blue)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>Lưu vào:</label>
                <input 
                  type="text" 
                  value={detectedWeek} 
                  onChange={(e) => setDetectedWeek(e.target.value)}
                  style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
                />
                <button className="btn btn-primary" style={{ padding: '6px 15px' }} onClick={handleSaveWeek} disabled={loading}>
                  {loading ? 'Đang lưu...' : 'Xác nhận Lưu Cloud'}
                </button>
                <button className="btn btn-secondary" style={{ padding: '6px 15px' }} onClick={() => setPendingData(null)} disabled={loading}>Hủy</button>
              </div>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>Hệ thống đọc được <strong>{pendingData.length}</strong> lớp học sẵn sàng đồng bộ.</p>
            </div>
          )}
        </div>
      </div>

      {/* Vùng Bảng Danh sách */}
      <div style={{ padding: '0 20px 20px 20px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Dữ liệu TKB đang có trên Máy chủ</h3>
            {Object.keys(multiWeekData).length > 0 && (
              <button className="btn btn-secondary" onClick={handleExport}>Backup Dữ Liệu (JSON)</button>
            )}
          </div>

        {Object.keys(multiWeekData).length === 0 ? (
          <p style={{ color: '#666' }}>Máy chủ hiện chưa có dữ liệu của tuần nào.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--haui-blue)', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tên Tuần (ID Đồng bộ)</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Số lượng Lớp học</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd', width: '150px', textAlign: 'center' }}>Thao tác Máy chủ</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(multiWeekData).map((weekKey, idx) => (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: 'var(--haui-blue)' }}>{weekKey}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{multiWeekData[weekKey].length} lớp</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button style={{ backgroundColor: 'var(--haui-red)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }} onClick={() => handleDeleteWeek(weekKey)}>Xóa từ Cloud</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
