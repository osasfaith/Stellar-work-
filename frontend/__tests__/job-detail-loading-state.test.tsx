import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import JobDetailPage from "@/app/job/[id]/page";
import { ToastProvider } from "@/components/ToastProvider";
import type { Job } from "@/lib/types";

const mockGetJob = vi.fn();
const mockUseWallet = vi.fn();

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "42" }),
}));

vi.mock("@/lib/contract", () => ({
  getJob: (...args: unknown[]) => mockGetJob(...args),
  acceptJob: vi.fn(),
  submitWork: vi.fn(),
  approveWork: vi.fn(),
  cancelJob: vi.fn(),
}));

vi.mock("@/lib/wallet-context", () => ({
  useWallet: () => mockUseWallet(),
}));

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    client: "GCLIENT",
    freelancer: null,
    amount: "10000000",
    description_hash: "abc",
    status: "Open",
    created_at: "1710000000",
    deadline: "0",
    token: "GTOKEN",
    revision_count: 0,
    ...overrides,
  };
}

function renderJobPage() {
  return render(
    <ToastProvider>
      <JobDetailPage />
    </ToastProvider>,
  );
}

describe("Job detail loading state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWallet.mockReturnValue({
      wallet: "GCLIENT",
      connectWallet: vi.fn(),
    });
  });

  // ── Loading indicator while fetch is pending ──────────────────────────────

  it("shows the loading indicator while getJob is pending", () => {
    // A promise that never resolves keeps the component in the fetching state
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockGetJob.mockReturnValue(new Promise(() => {}));
    renderJobPage();

    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent("Loading job details...");
  });

  it("does not render job content while fetch is still pending", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockGetJob.mockReturnValue(new Promise(() => {}));
    renderJobPage();

    expect(screen.queryByText("Job #42")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept Job" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel Job" })).not.toBeInTheDocument();
  });

  it("does not render the error state while fetch is still pending", () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    mockGetJob.mockReturnValue(new Promise(() => {}));
    renderJobPage();

    expect(screen.queryByText("Job not found.")).not.toBeInTheDocument();
    expect(screen.queryByText(/Failed to load/)).not.toBeInTheDocument();
  });

  // ── Transition to loaded content ──────────────────────────────────────────

  it("removes the loading indicator after getJob resolves", async () => {
    mockGetJob.mockResolvedValue(makeJob({ status: "Open", client: "GCLIENT" }));
    renderJobPage();

    await waitFor(() =>
      expect(screen.queryByText("Loading job details...")).not.toBeInTheDocument(),
    );
  });

  it("renders job heading after a successful fetch", async () => {
    mockGetJob.mockResolvedValue(makeJob({ status: "Open", client: "GCLIENT" }));
    renderJobPage();

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Job #42" })).toBeInTheDocument(),
    );
  });

  it("renders job status after a successful fetch", async () => {
    mockGetJob.mockResolvedValue(makeJob({ status: "Open", client: "GCLIENT" }));
    renderJobPage();

    await waitFor(() => expect(screen.getByText("Job #42")).toBeInTheDocument());
    // Status label is present in the article
    expect(screen.getByText("Status:")).toBeInTheDocument();
  });

  it("renders client address after a successful fetch", async () => {
    mockGetJob.mockResolvedValue(makeJob({ status: "Open", client: "GCLIENT" }));
    renderJobPage();

    await waitFor(() => expect(screen.getByText("GCLIENT")).toBeInTheDocument());
  });

  // ── Transition to error / not-found states ────────────────────────────────

  it("removes the loading indicator when getJob resolves to null", async () => {
    mockGetJob.mockResolvedValue(null);
    renderJobPage();

    await waitFor(() =>
      expect(screen.queryByText("Loading job details...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Job not found.")).toBeInTheDocument();
  });

  it("removes the loading indicator when getJob rejects", async () => {
    mockGetJob.mockRejectedValue(new Error("Network error"));
    renderJobPage();

    await waitFor(() =>
      expect(screen.queryByText("Loading job details...")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  // ── Slow-resolve: no flaky timer dependency ───────────────────────────────

  it("shows loading then content for a slow but eventually resolving fetch", async () => {
    // Resolve after a short artificial delay without using fake timers
    mockGetJob.mockImplementation(
      () =>
        new Promise<Job>((resolve) =>
          setTimeout(() => resolve(makeJob({ status: "Open", client: "GCLIENT" })), 50),
        ),
    );
    renderJobPage();

    // Loading indicator must be present immediately
    expect(screen.getByRole("status")).toHaveTextContent("Loading job details...");

    // After the promise settles, content must appear and loading must be gone
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Job #42" })).toBeInTheDocument(),
    );
    expect(screen.queryByText("Loading job details...")).not.toBeInTheDocument();
  });
});
