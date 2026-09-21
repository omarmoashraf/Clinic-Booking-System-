import type { verification as enVerification } from "../en/verification";

type VerificationSchema = { [K in keyof typeof enVerification]: string };

export const verification: VerificationSchema = {
  sidebarTitle: "معاينة القائمة الجانبية",
  navbarTitle: "معاينة شريط التنقل العلوي",
  formsTitle: "معاينة النماذج",
  dialogsTitle: "معاينة النوافذ المنبثقة",
  tablesTitle: "معاينة الجداول",
  iconsTitle: "معاينة الأيقونات التوجيهية",
  spacingTitle: "معاينة المسافات والمحاذاة",
  patientName: "اسم المريض",
  patientNamePlaceholder: "أدخل الاسم الكامل للمريض",
  selectDoctor: "اختر الطبيب",
  doctorPlaceholder: "اختر الطبيب المختص",
  doctorCardiology: "د. سارة جونسون (أمراض القلب)",
  doctorNeurology: "د. مايكل تشين (طب المخ والأعصاب)",
  openDialog: "فتح النافذة التجريبية",
  dialogTitle: "تفاصيل حجز الموعد",
  dialogDesc: "يرجى مراجعة بيانات الموعد قبل التأكيد النهائي.",
  dialogClose: "إغلاق",
  dialogConfirm: "تأكيد الحجز",
  colDoctor: "الطبيب",
  colSpecialty: "التخصص",
  colDate: "التاريخ",
  colStatus: "الحالة",
  colAction: "الإجراء",
  cardiology: "أمراض القلب",
  pediatrics: "طب الأطفال",
  viewDetails: "عرض التفاصيل",
  next: "التالي",
  previous: "السابق",
};

