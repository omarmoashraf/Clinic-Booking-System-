import type { patients as enPatients } from "../en/patients";

type PatientsSchema = { [K in keyof typeof enPatients]: string };

export const patients: PatientsSchema = {
  title: "بوابة المريض",
  profile: "الملف الشخصي للمريض",
  personalInfo: "المعلومات الشخصية",
  contactInfo: "معلومات الاتصال",
  medicalHistory: "السجل الطبي",
  emergencyContact: "جهة اتصال الطوارئ",
  bloodGroup: "فصيلة الدم",
  dateOfBirth: "تاريخ الميلاد",
  gender: "الجنس",
  male: "ذكر",
  female: "أنثى",
  other: "آخر",
  updateProfile: "تحديث الملف الشخصي",
  profileUpdated: "تم تحديث الملف الشخصي بنجاح",
};

