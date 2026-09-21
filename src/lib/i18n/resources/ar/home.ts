import type { home as enHome } from "../en/home";

type HomeSchema = { [K in keyof typeof enHome]: string };

export const home: HomeSchema = {
  title: "نظام إدارة العيادات",
  subtitle: "الأساس البرمجي لمنصة الرعاية الصحية الرقمية الحديثة.",
  primaryAction: "الإجراء الأساسي",
  secondaryAction: "الإجراء الثانوي",
  outlineAction: "مخطط تفصيلي",
  badgeMilestone: "المرحلة 02",
  alertTitle: "البنية التحتية لتدويل النظام جاهزة",
  alertDescription: "تم التحقق من تبديل اللغتين العربية والإنجليزية مع دعم اتجاهات RTL/LTR ورموز التصميم.",
  heroTitle: "عمليات رعاية صحية استثنائية",
  heroDescription: "تنظيم مواعيد الحجز، إدارة الأطباء، ومتابعة رعاية المرضى بسلاسة تامة.",
  bookAppointment: "حجز موعد",
  findDoctors: "البحث عن الأطباء",
};

