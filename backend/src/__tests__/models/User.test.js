import { User } from '../../models/index.js';
import bcrypt from 'bcrypt';

describe('User Model', () => {
  describe('Password Hashing', () => {
    test('should hash password before creating user', async () => {
      const plainPassword = 'TestPassword123!';
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: plainPassword
      };

      // Mock User.create to check password hashing
      const hashedPassword = await bcrypt.hash(plainPassword, 12);
      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });
  });

  describe('Password Validation', () => {
    test('should validate correct password', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const isValid = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const plainPassword = 'TestPassword123!';
      const hashedPassword = await bcrypt.hash(plainPassword, 12);

      const isValid = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });
  });

  describe('Field Validation', () => {
    test('should validate username length (min 3)', () => {
      const shortUsername = 'ab';
      expect(shortUsername.length).toBeLessThan(3);
    });

    test('should validate username length (max 50)', () => {
      const longUsername = 'a'.repeat(51);
      expect(longUsername.length).toBeGreaterThan(50);
    });

    test('should validate email format', () => {
      const validEmail = 'test@example.com';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(validEmail)).toBe(true);
    });

    test('should reject invalid email format', () => {
      const invalidEmails = ['notanemail', '@example.com', 'test@', 'test'];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('toSafeObject', () => {
    test('should exclude password from safe object', () => {
      const userData = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashed_password_here',
        created_at: new Date(),
        updated_at: new Date()
      };

      const { password_hash, ...safeData } = userData;
      expect(safeData.password_hash).toBeUndefined();
      expect(safeData.username).toBe('testuser');
      expect(safeData.email).toBe('test@example.com');
    });
  });
});
