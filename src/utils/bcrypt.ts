import bcrypt from "bcryptjs";

export function saltAndHashPassword(password: string): string {
  const saltRounds = 12;
  return bcrypt.hashSync(password, saltRounds);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}
