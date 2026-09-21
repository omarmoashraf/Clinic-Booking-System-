import type { auth as enAuth } from "../en/auth";

type AuthSchema = { [K in keyof typeof enAuth]: string };

export const auth: AuthSchema = {
  loginTitle: "تسجيل الدخول إلى حسابك",
  loginSubtitle: "أدخل بياناتك للوصول إلى بوابتك الطبية",
  registerTitle: "إنشاء حساب جديد",
  registerSubtitle: "انضم إلى منصتنا للرعاية الصحية اليوم",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  confirmPassword: "تأكيد كلمة المرور",
  fullName: "الاسم الكامل",
  phone: "رقم الهاتف",
  role: "نوع الحساب",
  selectRole: "اختر نوع الحساب",
  rolePatient: "مريض",
  roleDoctor: "طبيب",
  roleAdmin: "مدير النظام",
  forgotPassword: "هل نسيت كلمة المرور؟",
  alreadyHaveAccount: "هل لديك حساب بالفعل؟",
  dontHaveAccount: "ليس لديك حساب بعد؟",
  loginSuccess: "تم تسجيل الدخول بنجاح",
  registerSuccess: "تم إنشاء الحساب بنجاح",
  logoutSuccess: "تم تسجيل الخروج بنجاح",
};

