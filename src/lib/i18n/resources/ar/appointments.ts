import type { appointments as enAppointments } from "../en/appointments";

type AppointmentsSchema = { [K in keyof typeof enAppointments]: string };

export const appointments: AppointmentsSchema = {
  title: "المواعيد",
  myAppointments: "مواعيدي",
  upcomingAppointments: "المواعيد القادمة",
  pastAppointments: "المواعيد السابقة",
  bookNew: "حجز موعد جديد",
  selectDate: "اختر التاريخ",
  selectTime: "اختر الوقت",
  availableSlots: "المواعيد المتاحة",
  noSlots: "لا توجد مواعيد متاحة في هذا اليوم",
  appointmentDetails: "تفاصيل الموعد",
  doctor: "الطبيب",
  specialty: "التخصص",
  dateTime: "التاريخ والوقت",
  status: "الحالة",
  notes: "ملاحظات",
  cancelAppointment: "إلغاء الموعد",
  confirmCancelTitle: "هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟",
  confirmCancelDesc: "لا يمكن التراجع عن هذا الإجراء، وسيتم إتاحة الموعد لمرضى آخرين.",
  keepAppointment: "الاحتفاظ بالموعد",
  cancelSuccess: "تم إلغاء الموعد بنجاح",
  bookSuccess: "تم حجز الموعد بنجاح",
};

