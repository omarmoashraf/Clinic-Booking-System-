import type { admin as enAdmin } from "../en/admin";

type AdminSchema = { [K in keyof typeof enAdmin]: string };

export const admin: AdminSchema = {
  title: "إدارة النظام",
  overview: "نظرة عامة على النظام",
  manageUsers: "إدارة المستخدمين",
  manageDoctors: "إدارة الأطباء",
  manageSpecialties: "إدارة التخصصات",
  allAppointments: "جميع المواعيد",
  pendingApprovals: "طلبات بانتظار الموافقة",
  totalPatients: "إجمالي المرضى",
  totalDoctors: "إجمالي الأطباء",
  totalAppointments: "إجمالي المواعيد",
  activeSpecialties: "التخصصات المفعلة",
  addSpecialty: "إضافة تخصص",
  editSpecialty: "تعديل تخصص",
  deleteSpecialty: "حذف تخصص",
  confirmDeleteSpecialty: "هل أنت متأكد من رغبتك في حذف هذا التخصص؟",
  userRole: "الدور",
  status: "الحالة",
  active: "نشط",
  inactive: "غير نشط",
  actions: "الإجراءات",
};

