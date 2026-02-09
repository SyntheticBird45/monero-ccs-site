export type ProposalStatus =
  | "idea"
  | "funding-required"
  | "work-in-progress"
  | "completed";

export interface Proposal {
  id: string;
  title: string;
  author: string;
  date: string;
  status: ProposalStatus;
  url: string;
  amount?: number;
  contributions?: number;
  amountFunded?: number;
  milestones?: number;
  milestonesCompleted?: number;
}

export const sampleProposals: Proposal[] = [
  {
    id: "1",
    title: "39C3 Support",
    author: "rehrar",
    date: "2025-11-05",
    status: "idea",
    url: "/proposals/1",
  },
  {
    id: "2",
    title: "acx part-time work on Monfluo 2026Q1",
    author: "acx",
    date: "2025-12-25",
    status: "funding-required",
    url: "/proposals/2",
    amount: 75,
    contributions: 25,
    amountFunded: 60,
  },
  {
    id: "3",
    title: "acx part-time work on Monfluo 2026Q",
    author: "acx",
    date: "2025-12-14",
    status: "work-in-progress",
    url: "/proposals/3",
    amount: 200,
    contributions: 15,
    milestones: 5,
    milestonesCompleted: 3,
  },
  {
    id: "4",
    title: "BasicSwapDEX Mobile App",
    author: "ofrnxmr",
    date: "2026-01-19",
    status: "completed",
    url: "/proposals/4",
    amount: 200,
    contributions: 50,
  },
];
