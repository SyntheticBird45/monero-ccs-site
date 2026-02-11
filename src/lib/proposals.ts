import db from "@/db/index.ts";
import {
  deposits,
  type Proposal as ProposalRow,
  proposals,
} from "@/db/schema.ts";
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  like,
  lt,
  type SQL,
} from "drizzle-orm";

export type ProposalView = ReturnType<typeof toProposalView>;

export interface ProposalQuery {
  status?: string;
  search?: string;
  sort?: string;
  notFullyFunded?: boolean;
  limit?: number;
  offset?: number;
}

function collectFilters(query: ProposalQuery): SQL[] {
  const conditions: SQL[] = [];

  if (
    query.status &&
    (proposals.status.enumValues as string[]).includes(query.status)
  ) {
    conditions.push(
      eq(proposals.status, query.status as ProposalRow["status"]),
    );
  }

  if (query.search) {
    conditions.push(like(proposals.title, `%${query.search}%`));
  }

  if (query.notFullyFunded) {
    conditions.push(lt(proposals.raised_amount, proposals.target_amount));
  }

  return conditions;
}

export function queryProposals(query: ProposalQuery = {}) {
  const [col, dir] = parseSortParams(query.sort || "newest");
  const orderFn = dir === "asc" ? asc : desc;
  const conditions = collectFilters(query);

  let qb = db
    .select()
    .from(proposals)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderFn(proposals[col]))
    .$dynamic();

  if (query.limit) {
    qb = qb.limit(query.limit).offset(query.offset || 0);
  }

  return qb.all().map(toProposalView);
}

export function countProposals(query: ProposalQuery = {}) {
  const conditions = collectFilters(query);

  const result = db
    .select({ count: count() })
    .from(proposals)
    .where(conditions.length ? and(...conditions) : undefined)
    .get();

  return result?.count ?? 0;
}

export function getDepositCounts(
  proposalIds?: string[],
): Map<string, number> {
  let qb = db
    .select({
      proposal_id: deposits.proposal_id,
      count: count(),
    })
    .from(deposits)
    .$dynamic();

  if (proposalIds?.length) {
    qb = qb.where(inArray(deposits.proposal_id, proposalIds));
  }

  const rows = qb.groupBy(deposits.proposal_id).all();
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

function toProposalView(row: ProposalRow) {
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
