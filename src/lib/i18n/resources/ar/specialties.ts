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
  pageTitle: "التخصصات الطبية",
  pageSubtitle: "تصفح مجموعتنا الكاملة من التخصصات الطبية واعثر على أفضل الأطباء المعتمدين.",
  searchPlaceholder: "ابحث عن التخصصات بالاسم...",
  clearSearch: "مسح البحث",
  specialtiesCount: "عرض {count} من التخصصات",
  totalSpecialties: "{total} تخصص متاح",
  noSpecialtiesFound: "لم يتم العثور على تخصصات",
  noSpecialtiesMatch: "لم نتمكن من العثور على أي تخصص يطابق \"{query}\". تحقق من صحة الكلمات أو امسح البحث.",
  emptyCatalog: "لا توجد تخصصات متاحة حالياً في دليل العيادة.",
  loadError: "تعذر تحميل قائمة التخصصات. يرجى المحاولة مرة أخرى.",
};

