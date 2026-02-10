import { GITLAB_API_BASE } from "astro:env/server";

interface GitLabMr {
  iid: number;
  title: string;
  author: { username: string };
  created_at: string;
  web_url: string;
  upvotes: number;
  downvotes: number;
}

export interface IdeaProposal {
  id: string;
  data: {
    title: string;
    author: string;
    date: Date;
    status: "idea";
    targetAmount: null;
    raisedAmount: number;
    milestones: null;
    milestonesCompleted: number;
    address: null;
    addressUri: null;
    gitlabUrl: string;
    bodyMarkdown: null;
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
    if (!res.ok) break;
    const batch: GitLabMr[] = await res.json();
    if (batch.length === 0) break;
    mrs.push(...batch);
    page++;
  }

  let ideas = mrs
    .filter((mr) => (mr.upvotes - mr.downvotes) >= -3)
    .map((mr): IdeaProposal => ({
      id: `mr-${mr.iid}`,
      data: {
        title: mr.title,
        author: mr.author?.username || "unknown",
        date: new Date(mr.created_at),
        status: "idea" as const,
        targetAmount: null,
        raisedAmount: 0,
        milestones: null,
        milestonesCompleted: 0,
        address: null,
        addressUri: null,
        gitlabUrl: mr.web_url,
        bodyMarkdown: null,
        upvotes: mr.upvotes,
        downvotes: mr.downvotes,
      },
    }));

  if (opts.search) {
    const q = opts.search.toLowerCase();
    ideas = ideas.filter((p) => p.data.title.toLowerCase().includes(q));
  }

  const sorters: Record<string, (a: IdeaProposal, b: IdeaProposal) => number> =
    {
      newest: (a, b) => b.data.date.getTime() - a.data.date.getTime(),
      oldest: (a, b) => a.data.date.getTime() - b.data.date.getTime(),
    };
  ideas.sort(
    sorters[opts.sort ?? ""] ??
      ((a, b) => (b.data.upvotes ?? 0) - (a.data.upvotes ?? 0)),
  );

  return ideas;
}
