import bcrypt from "bcryptjs";

export class PasswordService {
  /**
   * Hash a plain text password
   * @param password - The plain text password to hash
   * @returns The hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - The plain text password
   * @param hashedPassword - The hashed password to compare against
   * @returns True if passwords match, false otherwise
   */
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Validate password strength
   * @param password - The password to validate
   * @returns Object with validation result and message
   */
  static validatePassword(password: string): {
    isValid: boolean;
    message?: string;
  } {
    if (password.length < 6) {
      return {
        isValid: false,
        message: "Password must be at least 6 characters long",
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        message: "Password must be less than 128 characters",
      };
    }

    // Optional: Add more validation rules
    // const hasUpperCase = /[A-Z]/.test(password);
    // const hasLowerCase = /[a-z]/.test(password);
    // const hasNumber = /[0-9]/.test(password);
    // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return { isValid: true };
  }
}
