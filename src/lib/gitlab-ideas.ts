import { GITLAB_API_BASE } from "astro:env/server";
import type { ProposalView } from "@/lib/proposals.ts";

interface GitLabMr {
  iid: number;
  title: string;
  author: { username: string };
  created_at: string;
  web_url: string;
  upvotes: number;
  downvotes: number;
}

export interface IdeaProposal extends Omit<ProposalView, "data"> {
  data: Omit<ProposalView["data"], "status"> & {
    status: "idea";
    upvotes: number;
    downvotes: number;
  };
}

export async function fetchIdeas(
  opts: { search?: string; sort?: string } = {},
): Promise<IdeaProposal[]> {
  const mrs: GitLabMr[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
      `${GITLAB_API_BASE}/merge_requests?state=opened&per_page=50&page=${page}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    const batch: GitLabMr[] = res.ok ? await res.json() : [];
    if (batch.length === 0) break;
    mrs.push(...batch);
    page++;
  }

  const searchLower = opts.search?.toLowerCase();

  const ideas = mrs
    .filter((mr) => {
      const passesScore = (mr.upvotes - mr.downvotes) >= -3;
      const passesSearch = !searchLower ||
        mr.title.toLowerCase().includes(searchLower);
      return passesScore && passesSearch;
    })
    .map((mr): IdeaProposal => ({
      id: `mr-${mr.iid}`,
      data: {
        title: mr.title,
        author: mr.author?.username ?? "unknown",
        date: new Date(mr.created_at),
        status: "idea",
        upvotes: mr.upvotes,
        downvotes: mr.downvotes,
        targetAmount: null,
        raisedAmount: 0,
        milestones: null,
        milestonesCompleted: 0,
        address: null,
        addressUri: null,
        gitlabUrl: mr.web_url,
        bodyMarkdown: null,
      },
    }));

  return ideas.sort((a, b) => {
    switch (opts.sort) {
      case "oldest":
        return a.data.date.getTime() - b.data.date.getTime();
      default:
        return b.data.date.getTime() - a.data.date.getTime();
    }
  });
}
