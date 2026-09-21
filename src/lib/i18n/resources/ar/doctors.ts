import type { doctors as enDoctors } from "../en/doctors";

type DoctorsSchema = { [K in keyof typeof enDoctors]: string };

export const doctors: DoctorsSchema = {
  title: "الأطباء",
  findDoctor: "ابحث عن طبيب",
  searchPlaceholder: "البحث باسم الطبيب أو التخصص...",
  allSpecialties: "جميع التخصصات",
  filterSpecialty: "تصفية حسب التخصص",
  viewProfile: "عرض الملف الشخصي",
  bookConsultation: "حجز استشارة",
  experienceYears: "خبرة {years} سنوات",
  availableToday: "متاح اليوم",
  consultationFee: "رسوم الكشف",
  aboutDoctor: "نبذة عن الطبيب",
  workingHours: "ساعات العمل",
  noDoctorsFound: "لم يتم العثور على أطباء يطابقون معايير البحث",
};

