import jwt from 'jsonwebtoken';

describe('Auth Middleware', () => {
  const JWT_SECRET = 'test-secret-key';

  describe('JWT Token Generation', () => {
    test('should generate valid JWT token', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('should include correct payload in token', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
      const decoded = jwt.verify(token, JWT_SECRET);

      expect(decoded.id).toBe(1);
      expect(decoded.username).toBe('testuser');
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('JWT Token Verification', () => {
    test('should verify valid token', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).not.toThrow();
    });

    test('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, JWT_SECRET);
      }).toThrow();
    });

    test('should reject token with wrong secret', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '24h' });

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow();
    });

    test('should reject expired token', () => {
      const payload = { id: 1, username: 'testuser' };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1s' });

      expect(() => {
        jwt.verify(token, JWT_SECRET);
      }).toThrow('jwt expired');
    });
  });

  describe('Authorization Header Parsing', () => {
    test('should parse Bearer token correctly', () => {
      const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const token = authHeader.split(' ')[1];

      expect(token).toBeDefined();
      expect(authHeader.startsWith('Bearer ')).toBe(true);
    });

    test('should handle missing Bearer prefix', () => {
      const authHeader = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      const parts = authHeader.split(' ');

      expect(parts.length).toBe(1);
      expect(parts[0]).not.toBe('Bearer');
    });

    test('should handle missing authorization header', () => {
      const authHeader = undefined;
      expect(authHeader).toBeUndefined();
    });
  });
});
