export type Role = 'SYSTEM_ADMIN' | 'TESTER_ADMIN' | 'ACADEMIC_ADMIN' | 'FACULTY_MANAGER' | 'TEACHER' | 'STUDENT';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  role: Role;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export interface TimetableClass {
  id?: string;
  tuanHoc: string;
  thu: string;
  ngay: string;
  tietHoc: number[];
  maLop: string;
  tenMon: string;
  giaoVien: string;
  phongHoc: string;
}

export interface AssetItem {
  assetCode: string;
  assetName: string;
  building: string;
  location: string;
  manager: string;
  status: string;
  details?: string;
}

export interface TimetableDocument {
  classes: TimetableClass[];
  updatedAt?: string;
}

export interface AssetDocument {
  items: AssetItem[];
  updatedAt?: string;
}
