import crypto from "crypto";

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex"));
    });
  });
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function comparePasswords({
  hashedPassword,
  password,
  salt,
}: {
  hashedPassword: string;
  password: string;
  salt: string;
}): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey.toString("hex") === hashedPassword);
    });
  });
}
