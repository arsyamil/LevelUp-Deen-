import { describe, it, expect } from 'vitest';
import { roleLabel, accessLevelLabel } from '../rbac';

// Assuming normalizeRole is imported from auth, but let's just test rbac pure functions here
// We'll test auth in auth.test.ts

describe('RBAC Utilities', () => {
  describe('roleLabel', () => {
    it('should return correct display name for known roles', () => {
      expect(roleLabel('user')).toBe('User');
      expect(roleLabel('admin_system')).toBe('Admin System');
      expect(roleLabel('community_member')).toBe('Community Member');
      expect(roleLabel('guild_leader')).toBe('Guild Leader');
      expect(roleLabel('mentor')).toBe('Mentor');
    });

    it('should return the key itself if role is unknown', () => {
      // @ts-expect-error Testing invalid input
      expect(roleLabel('unknown_role')).toBe('unknown_role');
    });
  });

  describe('accessLevelLabel', () => {
    it('should format access levels correctly', () => {
      expect(accessLevelLabel('none')).toBe('No Access');
      expect(accessLevelLabel('read')).toBe('Read');
      expect(accessLevelLabel('write')).toBe('Write');
      expect(accessLevelLabel('manage')).toBe('Manage');
    });

    it('should return the raw string if level is unknown', () => {
      // @ts-expect-error Testing invalid input
      expect(accessLevelLabel('super')).toBe('super');
    });
  });
});
