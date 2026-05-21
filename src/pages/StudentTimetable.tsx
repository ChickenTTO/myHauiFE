import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { exportToICS } from '../utils/icsExport';

export default function StudentTimetable() {
  const [multiWeekData, setMultiWeekData] = useState<any>({});
  const [selectedWeek, setSelectedWeek] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [filterType, setFilterType] = useState('all'); 
  const [filterValue, setFilterValue] = useState('');

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const response = await axios.get('/api/timetables');
        const rawData = response.data;
        
        // Group classes by tuanHoc
        const fetchedData: any = {};
        rawData.forEach((item: any) => {
           const week = item.tuanHoc;
           if (!fetchedData[week]) fetchedData[week] = [];
           // Convert tietHoc JSON string to array if needed
           let parsedTietHoc = item.tietHoc;
           if (typeof parsedTietHoc === 'string') {
              try { parsedTietHoc = JSON.parse(parsedTietHoc); } catch(e){}
           }
           fetchedData[week].push({ ...item, tietHoc: parsedTietHoc });
        });
        
        setMultiWeekData(fetchedData);
        
        const weeks = Object.keys(fetchedData).sort();
        if (weeks.length > 0) {
          setSelectedWeek(weeks[weeks.length - 1]);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu TKB từ máy chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimetables();
  }, []);

  const weeksAvailable = Object.keys(multiWeekData).sort();
  const timetable = selectedWeek && multiWeekData[selectedWeek] ? multiWeekData[selectedWeek] : [];

  const filteredData = timetable.filter((item) => {
    if (filterType === 'all' || filterType === 'conflict' || !filterValue.trim()) return true;
    const searchStr = filterValue.toLowerCase().replace(/\s+/g, ' ').trim();
    if (filterType === 'class') return item.maLop && item.maLop.toLowerCase().includes(searchStr);
    if (filterType === 'subject') return item.tenMon && item.tenMon.toLowerCase().includes(searchStr);
    if (filterType === 'teacher') return item.giaoVien && item.giaoVien.toLowerCase().includes(searchStr);
    if (filterType === 'room') {
      const roomSearchStr = filterValue.toUpperCase().replace(/\s/g, '');
      return item.phongHoc && item.phongHoc.includes(roomSearchStr);
    }
    return true;
  });

  const getConflicts = () => {
    const conflictsMap = {};
    timetable.forEach(item => {
       if (item.phongHoc === 'CHƯA_XẾP') return;
       const key = `${item.phongHoc}-${item.ngay}`;
       if (!conflictsMap[key]) conflictsMap[key] = [];
       conflictsMap[key].push(item);
    });

    const finalConflicts = [];
    Object.values(conflictsMap).forEach(classesInRoomDay => {
       if (classesInRoomDay.length <= 1) return;
       for(let i=0; i<classesInRoomDay.length; i++) {
         for(let j=i+1; j<classesInRoomDay.length; j++) {
            const c1 = classesInRoomDay[i];
            const c2 = classesInRoomDay[j];
            if (c1.maLop === c2.maLop) continue; 
            
            const intersection = c1.tietHoc.filter(t => c2.tietHoc.includes(t));
            if (intersection.length > 0) {
                finalConflicts.push({ phong: c1.phongHoc, ngay: c1.ngay, tietTrung: intersection, lop1: c1, lop2: c2 });
            }
         }
       }
    });
    return finalConflicts;
  };

  const daysOfWeek = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  const getClassAt = (day, period) => {
    return filteredData.find(item => item.ngay === day && item.tietHoc.includes(period));
  };

  const renderConflictReport = () => {
    const conflicts = getConflicts();
    if (conflicts.length === 0) {
      return (
        <div style={{ background: '#e6ffe6', padding: '20px', borderRadius: '8px', color: 'green', border: '1px solid green' }}>
          <h3 style={{ margin: 0 }}>✅ Tuyệt vời! Không phát hiện trùng phòng học nào trong {selectedWeek}.</h3>
        </div>
      );
    }
    return (
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', padding: '20px' }}>
        <h3 style={{ color: 'var(--haui-red)', marginBottom: '15px' }}>🚨 Phát hiện {conflicts.length} trường hợp xếp TRÙNG PHÒNG HỌC ({selectedWeek}):</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--haui-red)', color: 'white' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Ngày</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phòng Học</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tiết Trùng</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Lớp thứ nhất</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Lớp thứ hai</th>
            </tr>
          </thead>
          <tbody>
            {conflicts.map((c, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#fff5f5' : 'white' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold' }}>{c.ngay}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: 'var(--haui-blue)' }}>{c.phong}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: 'red', fontWeight: 'bold' }}>Tiết {c.tietTrung.join(', ')}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <strong>{c.lop1.maLop}</strong><br/><span style={{color: '#555'}}>{c.lop1.tenMon}</span><br/><small>GV: {c.lop1.giaoVien}</small>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <strong>{c.lop2.maLop}</strong><br/><span style={{color: '#555'}}>{c.lop2.tenMon}</span><br/><small>GV: {c.lop2.giaoVien}</small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Cố định Header Của TKB (Filter Bar) */}
      <div style={{ padding: '20px', backgroundColor: '#f4f7f6', borderBottom: '1px solid #ddd', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: 'var(--haui-blue)', margin: 0 }}>Tra cứu & Báo cáo TKB</h2>
          
          {weeksAvailable.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--haui-yellow)', padding: '6px 15px', borderRadius: '8px' }}>
              <label style={{ fontWeight: 'bold', color: 'var(--haui-blue)', fontSize: '0.9rem' }}>📅 Chọn Tuần:</label>
              <select 
                value={selectedWeek} 
                onChange={(e) => setSelectedWeek(e.target.value)}
                style={{ padding: '5px', borderRadius: '4px', border: 'none', fontWeight: 'bold', color: 'var(--haui-blue)' }}
              >
                {weeksAvailable.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
              <button 
                onClick={() => exportToICS(filteredData, `TKB_${selectedWeek}.ics`)}
                style={{ marginLeft: '10px', background: '#4CAF50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
              >
                📥 Tải Lịch (ICS)
              </button>
            </div>
          )}
        </div>

        {weeksAvailable.length > 0 && (
          <div style={{ display: 'flex', gap: '15px', background: 'white', padding: '10px 15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div>
              <label style={{ fontWeight: 'bold', marginRight: '10px', fontSize: '0.9rem' }}>Chế độ xem / Lọc theo:</label>
              <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setFilterValue(''); }} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9rem' }}>
                <option value="all">Tất cả lớp học (Chưa lọc)</option>
                <option value="class">Mã Lớp</option>
                <option value="subject">Học phần / Môn học</option>
                <option value="teacher">Giảng viên</option>
                <option value="room">Phòng học (Tìm phòng trống)</option>
                <option value="conflict">🚨 Báo cáo trùng phòng học</option>
              </select>
            </div>
            {filterType !== 'all' && filterType !== 'conflict' && (
              <div>
                <input type="text" placeholder={`Nhập ${filterType}...`} value={filterValue} onChange={(e) => setFilterValue(e.target.value)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px', fontSize: '0.9rem' }} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vùng Lưới TKB */}
      <div style={{ padding: '0 20px 20px 20px', backgroundColor: '#f4f7f6' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
            <h3>Đang tải dữ liệu Thời khóa biểu từ Máy chủ...</h3>
          </div>
        ) : weeksAvailable.length === 0 ? (
          <div style={{ background: 'white', padding: '40px', textAlign: 'center', borderRadius: '8px', color: 'var(--haui-red)' }}>
            <h3>Chưa có dữ liệu Thời khóa biểu.</h3>
            <p>Vui lòng yêu cầu Phòng đào tạo (Admin) cập nhật file TKB mới nhất.</p>
          </div>
        ) : filterType === 'conflict' ? (
          renderConflictReport()
        ) : (
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', minWidth: '900px' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ backgroundColor: 'var(--haui-blue)', color: 'white' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd', width: '8%' }}>Ca / Tiết</th>
                    {daysOfWeek.map(day => <th key={day} style={{ padding: '10px', border: '1px solid #ddd', width: '13%' }}>{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {periods.map(period => (
                    <tr key={period} style={{ 
                      borderBottom: period === 6 || period === 12 ? '4px solid var(--haui-red)' : '1px solid #ddd',
                      backgroundColor: period > 12 ? '#f0f4f8' : (period > 6 ? '#fafafa' : 'white')
                    }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd', fontWeight: 'bold', color: 'var(--haui-blue)' }}>
                      Tiết {period}
                      {period === 1 && <div style={{fontSize: '10px', color: '#666'}}>Ca Sáng</div>}
                      {period === 7 && <div style={{fontSize: '10px', color: '#666'}}>Ca Chiều</div>}
                      {period === 13 && <div style={{fontSize: '10px', color: '#666'}}>Ca Tối</div>}
                    </td>
                    
                    {daysOfWeek.map(day => {
                      const classInfo = getClassAt(day, period);
                      return (
                        <td key={`${day}-${period}`} style={{ 
                          border: '1px solid #ddd', padding: '5px',
                          backgroundColor: classInfo ? '#e6f2ff' : 'transparent', verticalAlign: 'top'
                        }}>
                          {classInfo ? (
                            <div style={{ textAlign: 'left', fontSize: '0.85rem' }}>
                              <div style={{ fontWeight: 'bold', color: 'var(--haui-blue)', marginBottom: '4px' }}>{classInfo.tenMon}</div>
                              <div style={{ color: 'var(--haui-red)', fontSize: '0.8rem' }}>P: {classInfo.phongHoc}</div>
                              <div style={{ color: '#555', fontSize: '0.8rem' }}>GV: {classInfo.giaoVien}</div>
                              <div style={{ color: '#888', fontSize: '0.75rem' }}>{classInfo.maLop}</div>
                            </div>
                          ) : (
                            (filterType === 'room' && filterValue.trim() !== '') ? <span style={{color: 'green', fontSize: '0.8rem'}}>Trống</span> : null
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
