import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeRole, isAdminRole, isAuthFailure } from '../auth';

// Mock env and supabase calls to test auth logic in isolation
vi.mock('@/lib/env', () => ({
  isAuthBypassEnabled: vi.fn(() => false),
  getAuthBypassUserId: vi.fn(() => 'bypass-123'),
  serverEnv: { AUTH_BYPASS_ROLE: 'admin_system' },
}));

describe('Auth Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('normalizeRole', () => {
    it('should return the role if it is valid', () => {
      expect(normalizeRole('admin_system')).toBe('admin_system');
      expect(normalizeRole('guild_leader')).toBe('guild_leader');
    });

    it('should fallback to "user" for unknown strings', () => {
      expect(normalizeRole('hacker')).toBe('user');
      expect(normalizeRole('super_admin')).toBe('user');
    });

    it('should fallback to "user" for non-string types', () => {
      expect(normalizeRole(null)).toBe('user');
      expect(normalizeRole(undefined)).toBe('user');
      expect(normalizeRole(123)).toBe('user');
      expect(normalizeRole({})).toBe('user');
    });
  });

  describe('isAdminRole', () => {
    it('should return true only for admin_system', () => {
      expect(isAdminRole('admin_system')).toBe(true);
      expect(isAdminRole('user')).toBe(false);
      expect(isAdminRole('guild_leader')).toBe(false);
    });
  });

  describe('isAuthFailure', () => {
    it('should correctly identify AuthFailure object', () => {
      expect(isAuthFailure({ error: 'Unauthorized', status: 401 })).toBe(true);
      expect(isAuthFailure({ error: 'Forbidden', status: 403 })).toBe(true);
    });

    it('should return false for valid AuthContext', () => {
      expect(isAuthFailure({ userId: '123', email: 'test@test.com', role: 'user' })).toBe(false);
    });
  });
});
