import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminPage from "@/app/admin/page";

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUseWallet = vi.fn();

vi.mock("@/lib/wallet-context", () => ({
  useWallet: () => mockUseWallet(),
}));

const mockGetNativeToken = vi.fn();
const mockGetFees = vi.fn();
const mockGetJobCount = vi.fn();
const mockGetJob = vi.fn();
const mockWithdrawFees = vi.fn();
const mockGetProposalsCount = vi.fn();
const mockGetTimelockDelay = vi.fn();
const mockGetOperation = vi.fn();
const mockProposeOperation = vi.fn();
const mockExecuteOperation = vi.fn();
const mockCancelOperation = vi.fn();

vi.mock("@/lib/contract", () => ({
  getNativeToken: (...args: unknown[]) => mockGetNativeToken(...args),
  getFees: (...args: unknown[]) => mockGetFees(...args),
  getJobCount: (...args: unknown[]) => mockGetJobCount(...args),
  getJob: (...args: unknown[]) => mockGetJob(...args),
  withdrawFees: (...args: unknown[]) => mockWithdrawFees(...args),
  getProposalsCount: (...args: unknown[]) => mockGetProposalsCount(...args),
  getTimelockDelay: (...args: unknown[]) => mockGetTimelockDelay(...args),
  getOperation: (...args: unknown[]) => mockGetOperation(...args),
  proposeOperation: (...args: unknown[]) => mockProposeOperation(...args),
  executeOperation: (...args: unknown[]) => mockExecuteOperation(...args),
  cancelOperation: (...args: unknown[]) => mockCancelOperation(...args),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const WALLET = "GADMIN123456789012345678901234567890123456789012345678";

function setupConnectedAdmin() {
  mockUseWallet.mockReturnValue({ wallet: WALLET, connectWallet: vi.fn() });
  mockGetNativeToken.mockResolvedValue("CNATIVE");
  mockGetFees.mockResolvedValue(0);
  mockGetJobCount.mockResolvedValue(0);
  mockGetProposalsCount.mockResolvedValue(0);
  mockGetTimelockDelay.mockResolvedValue(3600);
}

function makePendingOp(id: number, tag = "UpdateFeeBps", earliestOffset = 3600) {
  const now = Math.floor(Date.now() / 1000);
  return {
    proposer: WALLET,
    operation: { tag, value: "500" },
    proposed_at: String(now),
    earliest_execution: String(now + earliestOffset),
    executed: false,
    cancelled: false,
  };
}

function makeReadyOp(id: number, tag = "UpdateFeeBps") {
  const now = Math.floor(Date.now() / 1000);
  return {
    proposer: WALLET,
    operation: { tag, value: "500" },
    proposed_at: String(now - 7200),
    earliest_execution: String(now - 1),
    executed: false,
    cancelled: false,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Admin page — Governance tab", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Governance tab button when admin is connected", async () => {
    setupConnectedAdmin();
    render(<AdminPage />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /governance/i })).toBeInTheDocument(),
    );
  });

  it("shows pending badge count on governance tab when proposals exist", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(1);
    mockGetTimelockDelay.mockResolvedValue(3600);
    mockGetOperation.mockResolvedValue(makePendingOp(1));

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    await waitFor(() => {
      const badges = screen.getAllByText("1");
      const badge = badges.find(
        (el) => el.className.includes("rounded-full") && el.className.includes("bg-yellow"),
      );
      expect(badge).toBeInTheDocument();
    });
  });

  it("shows timelock delay after switching to governance tab", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(0);
    mockGetTimelockDelay.mockResolvedValue(7200);

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    await waitFor(() =>
      expect(screen.getByLabelText("Current timelock delay")).toBeInTheDocument(),
    );
    expect(screen.getByLabelText("Current timelock delay").textContent).toContain("2h");
  });

  it("renders the New Proposal form with operation type selector", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(0);
    mockGetTimelockDelay.mockResolvedValue(3600);

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    await waitFor(() =>
      expect(screen.getByLabelText("Operation type")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /submit proposal/i })).toBeInTheDocument();
  });

  it("submit proposal button is disabled when value is empty", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(0);
    mockGetTimelockDelay.mockResolvedValue(3600);

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    const submitBtn = await screen.findByRole("button", { name: /submit proposal/i });
    expect(submitBtn).toBeDisabled();
  });

  it("submit proposal button is enabled when value is filled", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(0);
    mockGetTimelockDelay.mockResolvedValue(3600);

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "500" } });

    expect(screen.getByRole("button", { name: /submit proposal/i })).not.toBeDisabled();
  });

  it("calls proposeOperation with correct args on form submit", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(0);
    mockGetTimelockDelay.mockResolvedValue(3600);
    mockProposeOperation.mockResolvedValue(1);

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: /submit proposal/i }));

    await waitFor(() =>
      expect(mockProposeOperation).toHaveBeenCalledWith(WALLET, "UpdateFeeBps", "500"),
    );
  });

  it("shows success message after successful proposal submission", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(0);
    mockGetTimelockDelay.mockResolvedValue(3600);
    mockProposeOperation.mockResolvedValue(1);

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    const input = await screen.findByRole("textbox");
    fireEvent.change(input, { target: { value: "500" } });
    fireEvent.click(screen.getByRole("button", { name: /submit proposal/i }));

    await waitFor(() =>
      expect(screen.getByText(/proposal #1 submitted/i)).toBeInTheDocument(),
    );
  });

  it("renders pending proposal with Cancel button", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(1);
    mockGetTimelockDelay.mockResolvedValue(3600);
    mockGetOperation.mockResolvedValue(makePendingOp(1));

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument(),
    );
    expect(screen.queryByRole("button", { name: /execute/i })).not.toBeInTheDocument();
  });

  it("renders ready proposal with both Execute and Cancel buttons", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(1);
    mockGetTimelockDelay.mockResolvedValue(3600);
    mockGetOperation.mockResolvedValue(makeReadyOp(1));

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /execute/i })).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("calls executeOperation when Execute button is clicked", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(1);
    mockGetTimelockDelay.mockResolvedValue(3600);
    mockGetOperation.mockResolvedValue(makeReadyOp(1));
    mockExecuteOperation.mockResolvedValue({ status: "SUCCESS" });

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    const execBtn = await screen.findByRole("button", { name: /execute/i });
    fireEvent.click(execBtn);

    await waitFor(() =>
      expect(mockExecuteOperation).toHaveBeenCalledWith("1"),
    );
  });

  it("calls cancelOperation with admin address when Cancel is clicked", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(1);
    mockGetTimelockDelay.mockResolvedValue(3600);
    mockGetOperation.mockResolvedValue(makePendingOp(1));
    mockCancelOperation.mockResolvedValue({ status: "SUCCESS" });

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    const cancelBtn = await screen.findByRole("button", { name: /cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() =>
      expect(mockCancelOperation).toHaveBeenCalledWith(WALLET, "1"),
    );
  });

  it("shows empty state when there are no proposals", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockResolvedValue(0);
    mockGetTimelockDelay.mockResolvedValue(3600);

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    await waitFor(() =>
      expect(
        screen.getByText("No proposals yet"),
      ).toBeInTheDocument(),
    );
  });

  it("shows error banner when proposal loading fails", async () => {
    setupConnectedAdmin();
    mockGetProposalsCount.mockRejectedValue(new Error("RPC timeout"));
    mockGetTimelockDelay.mockRejectedValue(new Error("RPC timeout"));

    render(<AdminPage />);
    const govTab = await screen.findByRole("button", { name: /governance/i });
    fireEvent.click(govTab);

    await waitFor(() =>
      expect(screen.getByText(/rpc timeout/i)).toBeInTheDocument(),
    );
  });
});
