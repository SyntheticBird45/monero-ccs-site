import db from "@/db/index.ts";
import type { Database, ProposalTable } from "@/db/schema.ts";
import type { Selectable, SelectQueryBuilder } from "kysely";

export type Proposal = ReturnType<typeof toProposal>;

export interface ProposalQuery {
  status?: string;
  search?: string;
  sort?: string;
  notFullyFunded?: boolean;
  limit?: number;
  offset?: number;
}

const VALID_STATUSES = new Set([
  "funding-required",
  "work-in-progress",
  "completed",
]);

function withProposalFilters<O>(
  qb: SelectQueryBuilder<Database, "proposals", O>,
  query: ProposalQuery,
) {
  if (query.status && VALID_STATUSES.has(query.status)) {
    qb = qb.where("status", "=", query.status as ProposalTable["status"]);
  }

  if (query.search) {
    qb = qb.where("title", "like", `%${query.search}%`);
  }

  if (query.notFullyFunded) {
    qb = qb.whereRef("raised_amount", "<", "target_amount");
  }

  return qb;
}

export async function queryProposals(query: ProposalQuery = {}) {
  const [col, dir] = parseSortParams(query.sort || "newest");

  let qb = db.selectFrom("proposals").selectAll();

  qb = withProposalFilters(qb, query);

  const rows = await qb
    .orderBy(col, dir)
    .$if(!!query.limit, (q) => q.limit(query.limit!).offset(query.offset || 0))
    .execute();

  return rows.map(toProposal);
}

export async function countProposals(query: ProposalQuery = {}) {
  let qb = db.selectFrom("proposals")
    .select((eb) => eb.fn.countAll<number>().as("count"));

  qb = withProposalFilters(qb, query);

  const result = await qb.executeTakeFirstOrThrow();
  return result.count;
}

export async function getDepositCounts(
  proposalIds?: string[],
): Promise<Map<string, number>> {
  const rows = await db
    .selectFrom("deposits")
    .select(["proposal_id", (eb) => eb.fn.countAll<number>().as("count")])
    .$if(
      !!proposalIds?.length,
      (qb) => qb.where("proposal_id", "in", proposalIds!),
    )
    .groupBy("proposal_id")
    .execute();

  return new Map(rows.map((r) => [r.proposal_id, r.count]));
}

function parseSortParams(
  sort: string,
): ["date" | "raised_amount", "asc" | "desc"] {
  switch (sort) {
    case "oldest":
      return ["date", "asc"];
    case "most-funded":
      return ["raised_amount", "desc"];
    case "least-funded":
      return ["raised_amount", "asc"];
    default:
      return ["date", "desc"];
  }
}

function toProposal(row: Selectable<ProposalTable>) {
  return {
    id: row.id,
    data: {
      title: row.title,
      author: row.author,
      date: new Date(row.date),
      status: row.status,
      targetAmount: row.target_amount,
      raisedAmount: row.raised_amount,
      milestones: row.milestones,
      milestonesCompleted: row.milestones_completed,
      address: row.address,
      addressUri: row.address_uri,
      gitlabUrl: row.gitlab_url,
      bodyMarkdown: row.body_markdown,
    },
  };
}
