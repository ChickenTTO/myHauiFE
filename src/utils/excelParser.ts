import * as XLSX from 'xlsx/xlsx.mjs';

export const parseTimetableExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        // Use raw: false to let xlsx convert dates to formatted strings
        const workbook = XLSX.read(data, { type: 'binary', raw: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to 2D array
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });
        
        const parsedClasses = [];
        const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
        
        let lastMaLop = '';
        let lastTenMon = '';
        let lastGiaoVien = '';

        // Dữ liệu bắt đầu từ dòng số 8 (index 8)
        for (let i = 8; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue; // Skip truly empty rows
          
          // Nhận diện dữ liệu chính. Nếu cột trống (bị merge), lấy giá trị dòng trước đó
          const currentMaLop = (row[3] !== undefined && row[3] !== null) ? String(row[3]).trim() : '';
          const currentTenMon = (row[4] !== undefined && row[4] !== null) ? String(row[4]).trim() : '';
          // Hàm làm sạch dữ liệu Tên Giảng viên
          const cleanTeacherName = (name) => {
            if (!name) return '';
            let cleaned = String(name);
            // Xóa dấu xuống dòng và khoảng trắng thừa
            cleaned = cleaned.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
            if (cleaned.toLowerCase() === 'chưa xếp') return 'Chưa xếp';
            // Loại bỏ các chức danh (ThS, TS, PGS, GS...) để gom nhóm chính xác 1 người
            cleaned = cleaned.replace(/^(ThS|TS|PGS|GS|CV)\.?\s*(TS)?\.?\s*/i, '');
            // Loại bỏ số đếm ở đầu (VD: "1. Nguyễn Văn A")
            cleaned = cleaned.replace(/^\d+\.\s*/, '');
            // Chuẩn hóa dấu phẩy nếu có nhiều giảng viên
            cleaned = cleaned.replace(/\s*,\s*/g, ', ');
            return cleaned.trim();
          };

          const rawGiaoVien = (row[28] !== undefined && row[28] !== null) ? String(row[28]) : '';
          const currentGiaoVien = cleanTeacherName(rawGiaoVien);

          if (currentMaLop) lastMaLop = currentMaLop;
          if (currentTenMon) lastTenMon = currentTenMon;
          if (currentGiaoVien) lastGiaoVien = currentGiaoVien;

          // Nếu dòng không có bất kỳ thông tin nào, bỏ qua
          if (!lastMaLop && !lastTenMon) continue;
          
          // Bỏ qua các dòng ghi chú gộp
          if (lastTenMon.replace(/\s/g, '') === "Khôngcậpnhậtcahọc,quyđổitheosốtiếthọc") continue;

          // Lặp qua 7 ngày trong tuần
          let hasScheduleInRow = false;
          for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
            const colStart = 7 + (dayIdx * 3);
            const tietHocRaw = row[colStart];
            const phongHocRaw = row[colStart + 1];
            const buoiHocRaw = row[colStart + 2];
            
            if (tietHocRaw && String(tietHocRaw).trim() !== '') {
              hasScheduleInRow = true;
              // Chuẩn hóa tiết học
              let tietHocArr = [];
              const tietStr = String(tietHocRaw).replace(/\s/g, '');
              if (tietStr.includes('-')) {
                const parts = tietStr.split('-');
                const start = parseInt(parts[0]);
                const end = parseInt(parts[1]);
                for(let t = start; t <= end; t++) tietHocArr.push(t);
              } else if (tietStr.includes(',')) {
                tietHocArr = tietStr.split(',').map(t => parseInt(t));
              } else {
                tietHocArr = [parseInt(tietStr)];
              }

              // Chuẩn hóa phòng học (Viết hoa toàn bộ, xóa khoảng trắng)
              const phongHoc = phongHocRaw ? String(phongHocRaw).toUpperCase().replace(/\s/g, '') : 'CHƯA_XẾP';
              
              parsedClasses.push({
                maLop: lastMaLop,
                tenMon: lastTenMon,
                giaoVien: lastGiaoVien || 'Chưa xếp',
                ngay: days[dayIdx],
                tietHoc: tietHocArr,
                phongHoc,
                buoiHoc: buoiHocRaw || '',
                raw_row: i
              });
            }
          }
          
          // Nếu dòng này không có lịch học nào và có Mã lớp mới, có thể là dòng lỗi hoặc chỉ chứa thông tin tĩnh, cứ bỏ qua
        }
        resolve(parsedClasses);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
