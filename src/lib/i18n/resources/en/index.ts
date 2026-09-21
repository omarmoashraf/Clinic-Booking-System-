import { common } from "./common";
import { nav } from "./nav";
import { auth } from "./auth";
import { status } from "./status";
import { home } from "./home";
import { errors } from "./errors";
import { appointments } from "./appointments";
import { doctors } from "./doctors";
import { patients } from "./patients";
import { specialties } from "./specialties";
import { admin } from "./admin";
import { verification } from "./verification";

export const en = {
  common,
  nav,
  auth,
  status,
  home,
  errors,
  appointments,
  doctors,
  patients,
  specialties,
  admin,
  verification,
} as const;

type DeepString<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object
    ? DeepString<T[K]>
    : string;
};

export type TranslationSchema = DeepString<typeof en>;

