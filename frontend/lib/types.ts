export type JobStatus =
  | "Open"
  | "InProgress"
  | "SubmittedForReview"
  | "Completed"
  | "Cancelled"
  | "Disputed";

export interface Job {
  client: string;
  freelancer: string | null;
  amount: string;
  description_hash: string;
  status: JobStatus;
  created_at: string;
  deadline: string;
  token: string;
  revision_count: number;
}

export type AdminOperationTag =
  | "UpdateFeeBps"
  | "TransferAdmin"
  | "SetDescPayloadMax"
  | "SetMaxActiveJobsPerClient"
  | "AddAllowedToken"
  | "RemoveAllowedToken"
  | "WithdrawFees"
  | "UpdateTimelockDelay";

export interface TimelockedOperation {
  proposer: string;
  operation: { tag: AdminOperationTag; value: unknown };
  proposed_at: string;
  earliest_execution: string;
  executed: boolean;
  cancelled: boolean;
}

export interface ProposalEntry {
  id: number;
  op: TimelockedOperation;
}
