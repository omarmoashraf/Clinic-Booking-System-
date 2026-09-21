export const errors = {
  generic: "Something went wrong. Please try again.",
  network: "Network connection error. Please check your internet.",
  notFound: "Requested resource was not found.",
  unauthorized: "Your session has expired. Please log in again.",
  forbidden: "You do not have permission to perform this action.",
  rateLimit: "Too many requests. Please try again later.",
  validationFailed: "Please correct the highlighted errors.",
  conflict: "This time slot or record already exists.",
  serverError: "Internal server error. Our team has been notified.",
} as const;

