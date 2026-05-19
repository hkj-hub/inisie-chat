import { describe, it, expect } from "vitest";
import { chatEntrySchema, postChatBodySchema } from "./chatSchema.js";

describe("chatEntrySchema", () => {
  it("有効な ChatEntry が parse できること", () => {
    const input = {
      timestamp: "2026-05-19T12:34:56.000Z",
      name: "Alice",
      color: "blue",
      message: "こんにちは！",
    };
    const result = chatEntrySchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("name が空のとき失敗すること", () => {
    const input = {
      timestamp: "2026-05-19T12:34:56.000Z",
      name: "",
      color: "blue",
      message: "こんにちは！",
    };
    const result = chatEntrySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("color が定義外のとき失敗すること", () => {
    const input = {
      timestamp: "2026-05-19T12:34:56.000Z",
      name: "Alice",
      color: "rainbow",
      message: "こんにちは！",
    };
    const result = chatEntrySchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("message が空のとき失敗すること", () => {
    const input = {
      timestamp: "2026-05-19T12:34:56.000Z",
      name: "Alice",
      color: "blue",
      message: "",
    };
    const result = chatEntrySchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("postChatBodySchema", () => {
  it("timestamp なしで parse できること", () => {
    const input = {
      name: "Alice",
      color: "red",
      message: "やあ！",
    };
    const result = postChatBodySchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});
