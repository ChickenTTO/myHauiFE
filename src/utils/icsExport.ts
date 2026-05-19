/**
 * Chuyển đổi dữ liệu Thời khóa biểu thành định dạng .ics để nhập vào Google Calendar
 */
export const exportToICS = (classes: any[], fileName: string = 'timetable.ics') => {
  let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MyHaUI ERP//Timetable//VI\n";

  classes.forEach((cls) => {
    // Parser cơ bản: chuyển "Thứ 2" -> Date, "Ca 1" -> Giờ
    // Do hệ thống lưu TKB theo Tuần, chúng ta tạo một mốc thời gian giả định trong tuần hiện tại
    // hoặc có thể export dưới dạng sự kiện không định ngày cụ thể (Dùng cho template).
    // Ở đây, tạo một sự kiện mẫu đại diện cho lịch học.
    
    // Giả định ngày bắt đầu tuần là thứ 2 tuần này
    const today = new Date();
    const dayOffset = getDayOffset(cls.day);
    const eventDate = new Date(today);
    eventDate.setDate(today.getDate() - today.getDay() + dayOffset); // Dời về đúng thứ trong tuần
    
    const { startHour, endHour } = getShiftHours(cls.shift);
    
    const startStr = formatDateToICS(eventDate, startHour);
    const endStr = formatDateToICS(eventDate, endHour);

    icsContent += "BEGIN:VEVENT\n";
    icsContent += `UID:${Math.random().toString(36).substring(2)}@myhaui.com\n`;
    icsContent += `DTSTAMP:${formatDateToICS(new Date(), "00:00")}\n`;
    icsContent += `DTSTART:${startStr}\n`;
    icsContent += `DTEND:${endStr}\n`;
    icsContent += `SUMMARY:${cls.subjectName} (${cls.classCode})\n`;
    icsContent += `LOCATION:Phòng ${cls.room}\n`;
    icsContent += `DESCRIPTION:Giảng viên: ${cls.teacherName}\\nSố TC: ${cls.credits}\n`;
    icsContent += "END:VEVENT\n";
  });

  icsContent += "END:VCALENDAR";

  // Trigger download
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const getDayOffset = (dayStr: string) => {
  const match = dayStr.match(/(\d+)/);
  if (match) return parseInt(match[1], 10);
  if (dayStr.toLowerCase().includes('chủ nhật')) return 8;
  return 2; // Default thứ 2
};

const getShiftHours = (shiftStr: string) => {
  if (shiftStr.includes('1')) return { startHour: "07:00", endHour: "09:30" };
  if (shiftStr.includes('2')) return { startHour: "09:30", endHour: "11:50" };
  if (shiftStr.includes('3')) return { startHour: "13:00", endHour: "15:30" };
  if (shiftStr.includes('4')) return { startHour: "15:30", endHour: "17:50" };
  if (shiftStr.includes('5')) return { startHour: "18:00", endHour: "20:30" };
  return { startHour: "07:00", endHour: "09:30" };
};

const formatDateToICS = (date: Date, timeStr: string) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = timeStr.replace(':', '');
  return `${year}${month}${day}T${hours}00Z`;
};
