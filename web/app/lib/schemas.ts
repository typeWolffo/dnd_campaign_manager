export type CreateRoomFormData = {
  name: string;
  description?: string;
};

export type UpdateRoomFormData = {
  name?: string;
  description?: string;
};

export type AddMemberFormData = {
  email: string;
  role?: "player" | "gm";
};

export type SignInFormData = {
  email: string;
  password: string;
};

export type SignUpFormData = {
  name: string;
  email: string;
  password: string;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};

export const validateRequired = (value: string) => {
  return value.trim().length > 0;
};
