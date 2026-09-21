import type { common as enCommon } from "../en/common";

type CommonSchema = { [K in keyof typeof enCommon]: string };

export const common: CommonSchema = {
  appName: "نظام إدارة العيادات",
  language: "اللغة",
  switchLanguage: "تغيير اللغة",
  english: "English",
  arabic: "العربية",
  loading: "جارٍ التحميل...",
  save: "حفظ",
  cancel: "إلغاء",
  confirm: "تأكيد",
  back: "رجوع",
  close: "إغلاق",
  retry: "إعادة المحاولة",
  delete: "حذف",
  edit: "تعديل",
  search: "بحث",
  filter: "تصفية",
  status: "الحالة",
  actions: "الإجراءات",
  noData: "لا توجد بيانات متاحة",
  direction: "rtl",
  yes: "نعم",
  no: "لا",
  all: "الكل",
  viewAll: "عرض الكل",
  showingResults: "عرض {count} من النتائج",
  page: "صفحة",
  of: "من",
  previous: "السابق",
  next: "التالي",
};

