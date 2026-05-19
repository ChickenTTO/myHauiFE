import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ResearchDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeBorrows: 0,
    brokenAssets: 0,
    submittedReports: 0
  });
  
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch Assets stats
        const assetRes = await axios.get('http://localhost:8080/api/assets');
        const assets = assetRes.data;
        const broken = assets.filter((a: any) => a.status?.toLowerCase().includes('hỏng')).length;

        // Fetch Requests stats
        const reqRes = await axios.get('http://localhost:8080/api/borrow-requests');
        const requests = reqRes.data;
        const active = requests.filter((r: any) => r.status === 'APPROVED' || r.status === 'ACTIVE').length;
        
        // Fetch Reports
        const repRes = await axios.get('http://localhost:8080/api/research-reports');
        const reps = repRes.data;

        setStats({
          totalRequests: requests.length,
          activeBorrows: active,
          brokenAssets: broken,
          submittedReports: reps.length
        });
        
        setReports(reps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải dữ liệu báo cáo...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
         <h2 style={{ color: '#0d3b66', margin: 0 }}>Báo cáo Tổng hợp & Hiện trạng Mượn máy NCKH</h2>
         <button onClick={() => window.location.href='/research'} style={{ padding: '8px 15px', borderRadius: '5px', border: '1px solid #ccc', cursor: 'pointer' }}>Quay lại</button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'linear-gradient(135deg, #2196F3, #1976D2)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Tổng Yêu cầu Mượn</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.totalRequests}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #4CAF50, #388E3C)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Máy Đang Hoạt Động</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.activeBorrows}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #F44336, #D32F2F)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Tài sản Hỏng/Sự cố</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.brokenAssets}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #FF9800, #F57C00)', color: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>Báo cáo NCKH Đã Thu</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{stats.submittedReports}</div>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Danh sách Báo cáo Đề tài đã Nộp</h3>
        {reports.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center' }}>Chưa có báo cáo nào được nộp.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
              <thead style={{ backgroundColor: '#f4f7f6' }}>
                <tr>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Người nộp</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Tên Báo cáo / Đề tài</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Thời gian nộp</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd', textAlign: 'center' }}>Tải xuống / Link</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(rep => (
                  <tr key={rep.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{rep.User?.fullName}</td>
                    <td style={{ padding: '12px', color: '#0d3b66' }}>{rep.content}</td>
                    <td style={{ padding: '12px' }}>{new Date(rep.submittedAt).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {rep.fileUrl && (
                          <a href={rep.fileUrl} target="_blank" rel="noreferrer" style={{ background: '#0d3b66', color: 'white', padding: '5px 15px', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem' }}>Link Drive / Tệp</a>
                        )}
                      </div>
                    </td>
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
