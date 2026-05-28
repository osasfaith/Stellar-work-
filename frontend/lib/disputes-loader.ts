export type DisputeStatus =
  | "Active"
  | "Resolved"
  | "PendingEvidence"
  | "UnderReview"
  | "Closed";

export interface Dispute {
  id: string;
  jobId: string;
  jobTitle: string;
  client: string;
  freelancer: string;
  amount: number;
  raisedBy: "client" | "freelancer";
  raisedAt: string;
  status: DisputeStatus;
  reason: string;
  evidence?: string;
  resolution?: {
    resolvedAt: string;
    clientShare: number;
    freelancerShare: number;
    note: string;
  };
}

export interface EligibleJob {
  id: string;
  title: string;
  counterparty: string;
  amount: number;
}

export type DisputesPageData = {
  disputes: Dispute[];
  eligibleJobs: EligibleJob[];
};

const MOCK_DISPUTES: Dispute[] = [
  {
    id: "D-001",
    jobId: "J-104",
    jobTitle: "Smart Contract Audit — DeFi Protocol",
    client: "BlockVentures LLC",
    freelancer: "0xDev.eth",
    amount: 4200,
    raisedBy: "client",
    raisedAt: "2025-04-18T09:22:00Z",
    status: "UnderReview",
    reason: "Delivered audit missed three critical vulnerabilities found by a third party.",
    evidence: "Audit report diff, third-party findings attached.",
  },
  {
    id: "D-002",
    jobId: "J-098",
    jobTitle: "NFT Marketplace Frontend",
    client: "ArtChain Studio",
    freelancer: "pixel.labs",
    amount: 2800,
    raisedBy: "freelancer",
    raisedAt: "2025-04-12T14:05:00Z",
    status: "Active",
    reason: "Client has not approved final deliverable despite meeting all specs.",
    evidence: "Spec doc signed off, delivery screenshots included.",
  },
  {
    id: "D-003",
    jobId: "J-091",
    jobTitle: "Tokenomics Whitepaper",
    client: "NovaCoin Foundation",
    freelancer: "dr.tokenomics",
    amount: 1500,
    raisedBy: "client",
    raisedAt: "2025-03-30T11:40:00Z",
    status: "Resolved",
    reason: "Whitepaper contained significant factual errors requiring full revision.",
    resolution: {
      resolvedAt: "2025-04-08T16:20:00Z",
      clientShare: 40,
      freelancerShare: 60,
      note: "Partial refund agreed — work was largely complete but needed corrections.",
    },
  },
  {
    id: "D-004",
    jobId: "J-087",
    jobTitle: "DAO Governance Module",
    client: "Collective3",
    freelancer: "rustchain.dev",
    amount: 7500,
    raisedBy: "freelancer",
    raisedAt: "2025-03-22T08:15:00Z",
    status: "Closed",
    reason: "Payment withheld after scope expansion was verbally agreed.",
    resolution: {
      resolvedAt: "2025-04-01T10:00:00Z",
      clientShare: 10,
      freelancerShare: 90,
      note: "Evidence of scope expansion accepted. Freelancer awarded full revised amount.",
    },
  },
];

const MOCK_ELIGIBLE_JOBS: EligibleJob[] = [
  { id: "J-112", title: "Solidity Gas Optimisation", counterparty: "GasHawks Inc.", amount: 960 },
  { id: "J-108", title: "Web3 Dashboard Redesign", counterparty: "UX3 Studio", amount: 1800 },
];

export async function loadDisputesPageData(): Promise<DisputesPageData> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    disputes: MOCK_DISPUTES,
    eligibleJobs: MOCK_ELIGIBLE_JOBS,
  };
}
