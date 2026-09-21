import type { errors as enErrors } from "../en/errors";

type ErrorsSchema = { [K in keyof typeof enErrors]: string };

export const errors: ErrorsSchema = {
  generic: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
  network: "خطأ في الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت.",
  notFound: "المورد المطلوب غير موجود.",
  unauthorized: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
  forbidden: "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
  rateLimit: "طلبات كثيرة جداً. يرجى المحاولة لاحقاً.",
  validationFailed: "يرجى تصحيح الأخطاء المحددة في النموذج.",
  conflict: "هذا السجل أو الموعد موجود بالفعل.",
  serverError: "حدث خطأ داخلي في الخادم. تم إخطار فريق الدعم الفني.",
};

