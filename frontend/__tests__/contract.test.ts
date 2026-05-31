import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";

const mockCallContract = vi.fn();

vi.mock("../lib/stellar", () => ({
  callContract: (...args: unknown[]) => mockCallContract(...args),
  nativeToScVal: vi.fn((value: unknown) => value),
}));

import {
  getJob,
  hexToBytes,
  postJob,
  requireContractId,
} from "../lib/contract";

const CONTRACT_ID_ERROR = "NEXT_PUBLIC_CONTRACT_ID is not configured.";

describe("hexToBytes", () => {
  it("parses valid hex strings to bytes", () => {
    expect(Array.from(hexToBytes("0a10ff"))).toEqual([10, 16, 255]);
    expect(Array.from(hexToBytes("0A10FF"))).toEqual([10, 16, 255]);
  });

  it("strips a 0x prefix before parsing", () => {
    expect(Array.from(hexToBytes("0x0a10ff"))).toEqual([10, 16, 255]);
    expect(Array.from(hexToBytes("0x0A10FF"))).toEqual([10, 16, 255]);
  });

  it("throws for odd-length hex strings", () => {
    expect(() => hexToBytes("abc")).toThrow("Invalid hex input.");
    expect(() => hexToBytes("0xabc")).toThrow("Invalid hex input.");
  });

  it("throws for non-hex characters", () => {
    expect(() => hexToBytes("zz")).toThrow("Invalid hex input.");
    expect(() => hexToBytes("0x12gh")).toThrow("Invalid hex input.");
  });
});

describe("requireContractId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the configured contract id", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTRACT_ID", "CA12345");
    expect(requireContractId()).toBe("CA12345");
  });

  it("throws when the contract id env var is empty", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTRACT_ID", "");
    expect(() => requireContractId()).toThrow(CONTRACT_ID_ERROR);
  });

  it("throws when the contract id env var is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_CONTRACT_ID", undefined);
    expect(() => requireContractId()).toThrow(CONTRACT_ID_ERROR);
  });
});

describe("contract calls without NEXT_PUBLIC_CONTRACT_ID", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_CONTRACT_ID", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("postJob fails fast before calling the contract", async () => {
    await expect(
      postJob("GCLIENT", "100", "0x0a", 4, "0", "GTOKEN"),
    ).rejects.toThrow(CONTRACT_ID_ERROR);
    expect(mockCallContract).not.toHaveBeenCalled();
  });

  it("getJob fails fast before calling the contract", async () => {
    await expect(getJob("1")).rejects.toThrow(CONTRACT_ID_ERROR);
    expect(mockCallContract).not.toHaveBeenCalled();
  });
});
