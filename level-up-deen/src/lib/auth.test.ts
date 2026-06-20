import { describe, it, expect } from "vitest";
import { normalizeRole, isAdminRole } from "./auth";

describe("auth utilities", () => {
  describe("normalizeRole", () => {
    it("should return admin_system if role is admin_system", () => {
      expect(normalizeRole("admin_system")).toBe("admin_system");
    });

    it("should return user if role is user", () => {
      expect(normalizeRole("user")).toBe("user");
    });

    it("should default to user if role is unknown", () => {
      expect(normalizeRole("unknown_role")).toBe("user");
      expect(normalizeRole(null)).toBe("user");
      expect(normalizeRole(undefined)).toBe("user");
      expect(normalizeRole(123)).toBe("user");
    });
  });

  describe("isAdminRole", () => {
    it("should return true for admin_system", () => {
      expect(isAdminRole("admin_system")).toBe(true);
    });

    it("should return false for user", () => {
      expect(isAdminRole("user")).toBe(false);
    });
  });
});
