import type { status as enStatus } from "../en/status";

type StatusSchema = { [K in keyof typeof enStatus]: string };

export const status: StatusSchema = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  pendingDesc: "بانتظار تأكيد الطبيب أو إدارة العيادة",
  confirmedDesc: "تم تأكيد الموعد وجدولته بنجاح",
  completedDesc: "تمت الاستشارة الطبية بنجاح",
  cancelledDesc: "تم إلغاء الموعد",
};

