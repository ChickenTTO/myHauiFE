import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import axios from 'axios';

export default function Dashboard() {
  const [multiWeekData, setMultiWeekData] = useState({});
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [subTab, setSubTab] = useState('charts'); // 'charts' or 'leaderboard'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        const response = await axios.get('/api/timetables');
        const timetables = response.data;
        const fetchedData: any = {};
        timetables.forEach((docSnap: any) => {
          fetchedData[docSnap.weekName] = typeof docSnap.classes === 'string' ? JSON.parse(docSnap.classes) : docSnap.classes;
        });
        setMultiWeekData(fetchedData);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu thống kê từ máy chủ:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTimetables();
  }, []);

  const weeksAvailable = Object.keys(multiWeekData).sort();

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h3>Đang tải dữ liệu từ máy chủ...</h3>
      </div>
    );
  }

  if (weeksAvailable.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--haui-red)' }}>
        <h3>Chưa có dữ liệu. Vui lòng tải lên file Excel ở phần Quản lý TKB (Admin) trước.</h3>
      </div>
    );
  }

  // Determine timetable array based on selection
  let timetable = [];
  let numberOfWeeks = 1;

  if (selectedWeek === 'all') {
    Object.values(multiWeekData).forEach(weekData => {
      timetable = timetable.concat(weekData);
    });
    numberOfWeeks = weeksAvailable.length;
  } else {
    timetable = multiWeekData[selectedWeek] || [];
    numberOfWeeks = 1;
  }

  // 1. Data Aggregation
  const teacherMap = {};
  const subjectMap = {};
  const roomMap = {};
  
  const uniqueClasses = new Set();
  const uniqueTeachers = new Set();
  const uniqueRooms = new Set();

  timetable.forEach(item => {
    uniqueClasses.add(item.maLop);
    if(item.giaoVien && item.giaoVien !== 'Chưa xếp') uniqueTeachers.add(item.giaoVien);
    if(item.phongHoc && item.phongHoc !== 'CHƯA_XẾP') uniqueRooms.add(item.phongHoc);

    if (item.giaoVien && item.giaoVien !== 'Chưa xếp') {
      if (!teacherMap[item.giaoVien]) teacherMap[item.giaoVien] = 0;
      teacherMap[item.giaoVien] += item.tietHoc.length;
    }

    if (item.tenMon) {
      if (!subjectMap[item.tenMon]) subjectMap[item.tenMon] = new Set();
      subjectMap[item.tenMon].add(item.maLop);
    }

    if (item.phongHoc && item.phongHoc !== 'CHƯA_XẾP') {
      if (!roomMap[item.phongHoc]) roomMap[item.phongHoc] = 0;
      roomMap[item.phongHoc] += item.tietHoc.length;
    }
  });

  const teacherData = Object.keys(teacherMap).map(k => ({ name: k, periods: teacherMap[k] }))
    .sort((a, b) => b.periods - a.periods);

  const subjectData = Object.keys(subjectMap).map(k => ({ name: k, count: subjectMap[k].size }))
    .sort((a, b) => b.count - a.count).slice(0, 10);

  const MAX_PERIODS_PER_WEEK = 119;
  const totalPeriodsCapacity = MAX_PERIODS_PER_WEEK * numberOfWeeks;

  const roomData = Object.keys(roomMap).map(k => {
    const percent = parseFloat(((roomMap[k] / totalPeriodsCapacity) * 100).toFixed(1));
    let color = '#ffc300';
    if (percent > 80) color = '#cd2026';
    if (percent < 40) color = '#00C49F';
    return { name: k, used: roomMap[k], percent, color };
  }).sort((a, b) => b.percent - a.percent);

  const COLORS = ['#1e376f', '#cd2026', '#ffc300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#8dd1e1', '#a4de6c'];

  const RoomBar = (props) => {
    const { fill, x, y, width, height, percent } = props;
    return <rect x={x} y={y} width={width} height={height} fill={props.color} rx={4} ry={4} />;
  };

  return (
    <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7f6' }}>
      
      {/* Header & Controls (Fixed Height) */}
      <div style={{ padding: '20px', backgroundColor: 'white', borderBottom: '1px solid #ddd', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ color: 'var(--haui-blue)', margin: 0 }}>Dashboard Thống kê Tổng quan</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--haui-yellow)', padding: '8px 15px', borderRadius: '8px' }}>
            <label style={{ fontWeight: 'bold', color: 'var(--haui-blue)', fontSize: '0.9rem' }}>📊 Chế độ Báo cáo:</label>
            <select 
              value={selectedWeek} 
              onChange={(e) => setSelectedWeek(e.target.value)}
              style={{ padding: '5px', borderRadius: '4px', border: 'none', fontWeight: 'bold', color: 'var(--haui-blue)' }}
            >
              <option value="all">Tổng quan Tất Cả Các Tuần</option>
              {weeksAvailable.map(w => <option key={w} value={w}>Chỉ báo cáo {w}</option>)}
            </select>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div style={{ display: 'flex', gap: '20px', borderBottom: '2px solid #eee' }}>
          <button 
            onClick={() => setSubTab('charts')}
            style={{ 
              background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              color: subTab === 'charts' ? 'var(--haui-red)' : '#666',
              borderBottom: subTab === 'charts' ? '3px solid var(--haui-red)' : 'none',
              marginBottom: '-2px'
            }}>
            Biểu đồ Tổng quan
          </button>
          <button 
            onClick={() => setSubTab('leaderboard')}
            style={{ 
              background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              color: subTab === 'leaderboard' ? 'var(--haui-red)' : '#666',
              borderBottom: subTab === 'leaderboard' ? '3px solid var(--haui-red)' : 'none',
              marginBottom: '-2px'
            }}>
            Bảng xếp hạng Giảng viên
          </button>
        </div>
      </div>

      {/* Content Area (Scrollable within limits) */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        
        {selectedWeek === 'all' && (
          <div style={{ background: '#e6f2ff', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px', color: 'var(--haui-blue)', fontWeight: 'bold' }}>
            Đang tổng hợp dữ liệu từ {numberOfWeeks} tuần. Công suất phòng học chuẩn: {totalPeriodsCapacity} tiết.
          </div>
        )}

        {/* Summary Cards (Always visible at the top of content) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid var(--haui-blue)' }}>
            <h4 style={{ color: '#666', margin: 0 }}>Tổng số Giảng viên</h4>
            <h2 style={{ color: 'var(--haui-blue)', margin: '10px 0 0 0', fontSize: '2.5rem' }}>{uniqueTeachers.size}</h2>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid var(--haui-red)' }}>
            <h4 style={{ color: '#666', margin: 0 }}>Tổng số Lớp học</h4>
            <h2 style={{ color: 'var(--haui-red)', margin: '10px 0 0 0', fontSize: '2.5rem' }}>{uniqueClasses.size}</h2>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', borderLeft: '5px solid var(--haui-yellow)' }}>
            <h4 style={{ color: '#666', margin: 0 }}>Phòng học đang sử dụng</h4>
            <h2 style={{ color: '#e6a800', margin: '10px 0 0 0', fontSize: '2.5rem' }}>{uniqueRooms.size}</h2>
          </div>
        </div>

        {/* Sub-Tab Content: Charts */}
        {subTab === 'charts' && (
          <div className="dashboard-charts-grid">
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', minHeight: '400px' }}>
              <h3 style={{ color: 'var(--haui-blue)', marginBottom: '20px', textAlign: 'center' }}>Top 10 Môn học có lượng lớp cao nhất</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%" cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Lớp`, 'Số lượng lớp']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', minHeight: '400px' }}>
              <h3 style={{ color: 'var(--haui-blue)', marginBottom: '5px', textAlign: 'center' }}>Công suất Phòng học (Top 15 cao nhất)</h3>
              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666', marginBottom: '20px' }}>(Đỏ: &gt;80% | Vàng: Tối ưu | Xanh: &lt;40%)</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomData.slice(0, 15)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{fontSize: 12}} />
                  <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                  <Tooltip formatter={(value, name, props) => [`${value}% (${props.payload.used}/${totalPeriodsCapacity} tiết)`, 'Công suất']} />
                  <Bar dataKey="percent" shape={<RoomBar />} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Sub-Tab Content: Leaderboard */}
        {subTab === 'leaderboard' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: 'var(--haui-blue)', marginBottom: '20px' }}>Bảng xếp hạng Khối lượng Giảng dạy</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f4f8', color: 'var(--haui-blue)' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '10%' }}>Hạng</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '60%' }}>Họ tên Giảng viên</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', width: '30%' }}>Tổng số tiết ({selectedWeek === 'all' ? 'Tất cả các tuần' : 'Tuần chọn'})</th>
                </tr>
              </thead>
              <tbody>
                {teacherData.map((teacher, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: idx < 3 ? 'var(--haui-red)' : '#666' }}>
                      #{idx + 1}
                    </td>
                    <td style={{ padding: '12px', fontWeight: idx < 3 ? 'bold' : 'normal' }}>{teacher.name}</td>
                    <td style={{ padding: '12px', color: 'var(--haui-blue)', fontWeight: 'bold' }}>{teacher.periods} tiết</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
