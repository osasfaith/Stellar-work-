import { beforeEach, describe, expect, it, vi } from "vitest";

const mockIsAllowed = vi.fn();
const mockGetAddress = vi.fn();

vi.mock("@stellar/freighter-api", () => ({
  isAllowed: (...args: unknown[]) => mockIsAllowed(...args),
  getAddress: (...args: unknown[]) => mockGetAddress(...args),
  requestAccess: vi.fn(),
  signTransaction: vi.fn(),
}));

import { getPublicKey } from "../lib/stellar";

describe("getPublicKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when Freighter access is not allowed", async () => {
    mockIsAllowed.mockResolvedValue({ isAllowed: false });

    await expect(getPublicKey()).resolves.toBeNull();
    expect(mockGetAddress).not.toHaveBeenCalled();
  });

  it("returns the wallet address when Freighter access is allowed", async () => {
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetAddress.mockResolvedValue({ address: "GALLOWEDWALLET" });

    await expect(getPublicKey()).resolves.toBe("GALLOWEDWALLET");
  });

  it("returns null when Freighter getAddress reports an error", async () => {
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetAddress.mockResolvedValue({ error: "User rejected request" });

    await expect(getPublicKey()).resolves.toBeNull();
  });
});
