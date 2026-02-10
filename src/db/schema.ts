import type { ColumnType, Generated } from "kysely";

export interface Database {
  proposals: ProposalTable;
  deposits: DepositTable;
}

export interface ProposalTable {
  id: string;
  title: string;
  author: string;
  date: string;
  status: "funding-required" | "work-in-progress" | "completed";
  target_amount: number | null;
  raised_amount: Generated<number>;
  milestones: number | null;
  milestones_completed: Generated<number>;
  address: string | null;
  address_uri: string | null;
  gitlab_url: string | null;
  body_markdown: string | null;
  created_at: ColumnType<string, string | undefined, never>;
}

export interface DepositTable {
  id: Generated<number>;
  proposal_id: string;
  tx_id: string;
  amount: number;
  block_height: number | null;
  confirmations: Generated<number>;
  detected_at: ColumnType<string, string | undefined, never>;
}
