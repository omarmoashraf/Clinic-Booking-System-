import type { specialties as enSpecialties } from "../en/specialties";

type SpecialtiesSchema = { [K in keyof typeof enSpecialties]: string };

export const specialties: SpecialtiesSchema = {
  title: "التخصصات",
  exploreSpecialties: "استكشف التخصصات الطبية",
  cardiology: "أمراض القلب والأوعية الدموية",
  cardiologyDesc: "صحة القلب والشرايين ورعاية الأوعية الدموية",
  dermatology: "الجلدية والتجميل",
  dermatologyDesc: "صحة الجلد، الشعر، الأظافر والأمراض الجلدية",
  neurology: "المخ والأعصاب",
  neurologyDesc: "تشخيص وعلاج أمراض الدماغ والعمود الفقري والجهاز العصبي",
  pediatrics: "طب الأطفال",
  pediatricsDesc: "رعاية طبية متكاملة لحديثي الولادة والأطفال واليافعين",
  orthopedics: "العظام والمفاصل",
  orthopedicsDesc: "صحة العظام، المفاصل، الأربطة والجهاز الحركي",
  generalPractice: "الطب العام",
  generalPracticeDesc: "الرعاية الصحية الأولية والطب الوقائي وطب الأسرة",
  viewDoctorsInSpecialty: "عرض الأطباء",
};

