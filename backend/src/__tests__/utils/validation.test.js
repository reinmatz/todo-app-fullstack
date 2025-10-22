describe('Input Validation Tests', () => {
  describe('Password Validation', () => {
    const validatePassword = (password) => {
      if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters' };
      if (!/[A-Z]/.test(password)) return { valid: false, error: 'Password must contain uppercase letter' };
      if (!/[a-z]/.test(password)) return { valid: false, error: 'Password must contain lowercase letter' };
      if (!/[0-9]/.test(password)) return { valid: false, error: 'Password must contain number' };
      if (!/[!@#$%^&*]/.test(password)) return { valid: false, error: 'Password must contain special character' };
      return { valid: true };
    };

    test('should accept valid password', () => {
      const result = validatePassword('Test123!');
      expect(result.valid).toBe(true);
    });

    test('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Test12!');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('8 characters');
    });

    test('should reject password without uppercase', () => {
      const result = validatePassword('test123!');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('uppercase');
    });

    test('should reject password without lowercase', () => {
      const result = validatePassword('TEST123!');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('lowercase');
    });

    test('should reject password without number', () => {
      const result = validatePassword('TestTest!');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('number');
    });

    test('should reject password without special character', () => {
      const result = validatePassword('Test1234');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('special character');
    });
  });

  describe('Email Validation', () => {
    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    test('should accept valid email', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.user+tag@example.co.uk')).toBe(true);
    });

    test('should reject invalid email', () => {
      expect(validateEmail('notanemail')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@.com')).toBe(false);
    });
  });

  describe('Todo Title Validation', () => {
    const validateTitle = (title) => {
      if (!title || title.trim().length === 0) {
        return { valid: false, error: 'Title is required' };
      }
      if (title.length > 200) {
        return { valid: false, error: 'Title must not exceed 200 characters' };
      }
      return { valid: true };
    };

    test('should accept valid title', () => {
      const result = validateTitle('Buy groceries');
      expect(result.valid).toBe(true);
    });

    test('should reject empty title', () => {
      const result = validateTitle('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should reject title with only whitespace', () => {
      const result = validateTitle('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('should reject title longer than 200 characters', () => {
      const longTitle = 'a'.repeat(201);
      const result = validateTitle(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('200 characters');
    });
  });

  describe('Priority Validation', () => {
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    const validatePriority = (priority) => {
      return validPriorities.includes(priority);
    };

    test('should accept valid priorities', () => {
      expect(validatePriority('low')).toBe(true);
      expect(validatePriority('medium')).toBe(true);
      expect(validatePriority('high')).toBe(true);
      expect(validatePriority('critical')).toBe(true);
    });

    test('should reject invalid priority', () => {
      expect(validatePriority('urgent')).toBe(false);
      expect(validatePriority('normal')).toBe(false);
      expect(validatePriority('LOW')).toBe(false);
    });
  });

  describe('Date Validation', () => {
    const validateDate = (dateString) => {
      const date = new Date(dateString);
      return !isNaN(date.getTime());
    };

    test('should accept valid date', () => {
      expect(validateDate('2025-12-31')).toBe(true);
      expect(validateDate('2025-01-01')).toBe(true);
    });

    test('should reject invalid date', () => {
      expect(validateDate('invalid-date')).toBe(false);
      expect(validateDate('2025-13-01')).toBe(false);
      expect(validateDate('2025-02-30')).toBe(false);
    });
  });

  describe('Pagination Validation', () => {
    const validatePagination = (page, limit) => {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      return {
        page: Math.max(1, pageNum),
        limit: Math.min(100, Math.max(1, limitNum))
      };
    };

    test('should use defaults for invalid values', () => {
      const result = validatePagination(undefined, undefined);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    test('should enforce minimum page of 1', () => {
      const result = validatePagination(0, 20);
      expect(result.page).toBe(1);
    });

    test('should enforce maximum limit of 100', () => {
      const result = validatePagination(1, 500);
      expect(result.limit).toBe(100);
    });

    test('should enforce minimum limit of 1', () => {
      const result = validatePagination(1, 0);
      expect(result.limit).toBe(1);
    });
  });
});
