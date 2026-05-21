import * as XLSX from 'xlsx/xlsx.mjs';

export const parseAssetExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Lấy dữ liệu thô dạng mảng 2 chiều
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Dữ liệu tài sản bắt đầu từ dòng 5 (index 4) trong file
        const parsedAssets = [];
        
        for (let i = 4; i < rawData.length; i++) {
          const row = rawData[i];
          
          // Bỏ qua nếu cột Mã tài sản trống
          if (!row[0]) continue;

          parsedAssets.push({
            assetCode: row[0] || '',
            assetName: row[2] || '',
            details: row[3] || '',
            department: row[8] || '',
            location: row[9] || '',
            building: row[10] || '',
            manager: row[12] || '',
            status: row[15] || 'Chưa rõ'
          });
        }

        resolve(parsedAssets);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
};
