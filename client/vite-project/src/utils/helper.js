export const validateEmail = (email) => {
  if (!email.trim()) return "Email is Required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please eneter a valid email address";
  return "";
};
