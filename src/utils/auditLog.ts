import axios from 'axios';

/**
 * Ghi lại nhật ký kiểm toán (Audit Trail)
 * @param action Hành động (VD: 'APPROVE_REQUEST', 'UPLOAD_TIMETABLE')
 * @param details Thông tin chi tiết (VD: 'Đã duyệt phiếu mượn PC-501-01')
 * @param userId ID của người thực hiện
 * @param userRole Vai trò của người thực hiện
 */
export const logAudit = async (action: string, details: string, userId: string, userRole: string) => {
  try {
    // userId ở Node.js là number, nhưng trong context cũ có thể là string uid. 
    // Nếu userId lấy từ context mới thì nó là ID số. Nếu thiếu, gán 1 tạm thời.
    await axios.post('/api/audit-logs', {
      action,
      details: `${details} (Thực hiện bởi: ${userRole})`,
      userId: Number(userId) || 1
    });
  } catch (error) {
    console.error('Lỗi khi ghi Audit Log:', error);
  }
};
