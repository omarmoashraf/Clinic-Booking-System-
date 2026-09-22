import type { nav as enNav } from "../en/nav";

type NavSchema = { [K in keyof typeof enNav]: string };

export const nav: NavSchema = {
  home: "الرئيسية",
  doctors: "الأطباء",
  specialties: "التخصصات",
  appointments: "المواعيد",
  myAppointments: "مواعيدي",
  dashboard: "لوحة التحكم",
  profile: "الملف الشخصي",
  availability: "المواعيد المتاحة",
  users: "المستخدمون",
  login: "تسجيل الدخول",
  register: "إنشاء حساب",
  logout: "تسجيل الخروج",
  settings: "الإعدادات",
  notifications: "الإشعارات",
  findDoctors: "البحث عن طبيب",
  backToWebsite: "العودة للموقع الرئيسي",
};

