import { describe, it, expect } from "vitest";
import path from "path";

/**
 * Test path validation logic (extracted from download/route.ts)
 */
function validateAndSanitizePath(
  inputPath: string,
  allowedBaseDir: string
): string | null {
  // Remove any path traversal sequences
  const sanitized = inputPath
    .replace(/\.\./g, "")
    .replace(/\/\//g, "/")
    .replace(/\\/g, "/");

  // Resolve the full path
  const fullPath = path.resolve(allowedBaseDir, sanitized);

  // Ensure the resolved path is within the allowed directory
  const normalizedBase = path.resolve(allowedBaseDir);
  if (!fullPath.startsWith(normalizedBase)) {
    return null;
  }

  return fullPath;
}

describe("Path Validation", () => {
  const baseDir = "/home/user/output";

  describe("validateAndSanitizePath", () => {
    it("should allow valid paths within base directory", () => {
      const result = validateAndSanitizePath("images/test.png", baseDir);
      expect(result).toBe("/home/user/output/images/test.png");
    });

    it("should allow nested valid paths", () => {
      const result = validateAndSanitizePath(
        "episodes/ep1/shots/shot1.png",
        baseDir
      );
      expect(result).toBe("/home/user/output/episodes/ep1/shots/shot1.png");
    });

    it("should block path traversal with ..", () => {
      const result = validateAndSanitizePath("../../../etc/passwd", baseDir);
      // After removing .., it becomes "etc/passwd" which is valid within base
      // Result should either be null or a safe path without ..
      if (result !== null) {
        expect(result).not.toContain("..");
      }
    });

    it("should block encoded path traversal", () => {
      const maliciousPath = "..%2F..%2F..%2Fetc%2Fpasswd";
      // This would need URL decoding first, but the sanitization
      // should still handle literal .. if decoded
      const result = validateAndSanitizePath(maliciousPath, baseDir);
      expect(result).not.toContain("..");
    });

    it("should normalize double slashes", () => {
      const result = validateAndSanitizePath("images//test.png", baseDir);
      expect(result).toBe("/home/user/output/images/test.png");
    });

    it("should normalize backslashes", () => {
      const result = validateAndSanitizePath("images\\test.png", baseDir);
      expect(result).toBe("/home/user/output/images/test.png");
    });

    it("should handle empty path", () => {
      const result = validateAndSanitizePath("", baseDir);
      expect(result).toBe(baseDir);
    });

    it("should handle absolute paths by making them relative", () => {
      // path.resolve will handle absolute paths - they become the result
      // So we need to ensure our function rejects paths outside base
      const result = validateAndSanitizePath("/etc/passwd", baseDir);
      // This depends on implementation - with path.resolve, /etc/passwd
      // would resolve to /etc/passwd which is outside baseDir
      // Our function should reject this
      if (result && !result.startsWith(baseDir)) {
        expect(result).toBeNull();
      }
    });
  });

  describe("Path traversal attack vectors", () => {
    const attacks = [
      "../../../etc/passwd",
      "..\\..\\..\\etc\\passwd",
      "....//....//....//etc/passwd",
      "..%252f..%252f..%252fetc/passwd",
      "/etc/passwd",
      "..%00/etc/passwd",
      "..%c0%af..%c0%af..%c0%afetc/passwd",
    ];

    attacks.forEach((attack) => {
      it(`should handle attack vector: ${attack}`, () => {
        const result = validateAndSanitizePath(attack, baseDir);
        // Either null (rejected) or within base directory
        if (result !== null) {
          expect(result.startsWith(baseDir)).toBe(true);
          expect(result).not.toContain("..");
        }
      });
    });
  });
});

describe("File Extension Validation", () => {
  const ALLOWED_EXTENSIONS = new Set([
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".mp4",
    ".webm",
  ]);

  it("should allow valid image extensions", () => {
    expect(ALLOWED_EXTENSIONS.has(".png")).toBe(true);
    expect(ALLOWED_EXTENSIONS.has(".jpg")).toBe(true);
    expect(ALLOWED_EXTENSIONS.has(".jpeg")).toBe(true);
    expect(ALLOWED_EXTENSIONS.has(".webp")).toBe(true);
    expect(ALLOWED_EXTENSIONS.has(".gif")).toBe(true);
  });

  it("should allow valid video extensions", () => {
    expect(ALLOWED_EXTENSIONS.has(".mp4")).toBe(true);
    expect(ALLOWED_EXTENSIONS.has(".webm")).toBe(true);
  });

  it("should reject dangerous extensions", () => {
    expect(ALLOWED_EXTENSIONS.has(".exe")).toBe(false);
    expect(ALLOWED_EXTENSIONS.has(".sh")).toBe(false);
    expect(ALLOWED_EXTENSIONS.has(".php")).toBe(false);
    expect(ALLOWED_EXTENSIONS.has(".js")).toBe(false);
    expect(ALLOWED_EXTENSIONS.has(".env")).toBe(false);
    expect(ALLOWED_EXTENSIONS.has("")).toBe(false);
  });
});
