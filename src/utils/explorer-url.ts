import type { ProposalStatus } from "../data/proposals.ts";

export interface SortOption {
  value: string;
  label: string;
  statuses?: ProposalStatus[];
}

export interface CheckboxFilter {
  name: string;
  label: string;
  statuses?: ProposalStatus[];
}

export const sortOptions: SortOption[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  {
    value: "most-funded",
    label: "Most funded",
    statuses: ["funding-required"],
  },
  {
    value: "least-funded",
    label: "Least funded",
    statuses: ["funding-required"],
  },
];

export const checkboxFilters: CheckboxFilter[] = [
  {
    name: "notFullyFunded",
    label: "Not fully funded only",
    statuses: ["funding-required"],
  },
];

export const DEFAULT_SORT = "newest";

export function sortsForStatus(status: string): SortOption[] {
  if (!status) return sortOptions;
  return sortOptions.filter((s) =>
    !s.statuses || s.statuses.includes(status as ProposalStatus)
  );
}

export function checkboxesForStatus(status: string): CheckboxFilter[] {
  if (!status) return checkboxFilters;
  return checkboxFilters.filter((c) =>
    !c.statuses || c.statuses.includes(status as ProposalStatus)
  );
}

export function inferStatus(
  rawSort: string,
  rawCheckboxValues: Record<string, boolean>,
): string {
  const activeSort = sortOptions.find((s) => s.value === rawSort && s.statuses);
  if (activeSort) return activeSort.statuses![0];

  const activeCb = checkboxFilters.find((cb) =>
    rawCheckboxValues[cb.name] && cb.statuses
  );
  if (activeCb) return activeCb.statuses![0];

  return "";
}

export function normalizeSort(sort: string, status: string): string {
  const valid = sortsForStatus(status);
  return valid.some((s) => s.value === sort) ? sort : DEFAULT_SORT;
}

export function normalizeCheckboxes(
  values: Record<string, boolean>,
  status: string,
): Record<string, boolean> {
  const valid = checkboxesForStatus(status);
  const validNames = new Set(valid.map((c) => c.name));
  const result: Record<string, boolean> = {};
  for (const [key, val] of Object.entries(values)) {
    result[key] = validNames.has(key) ? val : false;
  }
  return result;
}

export interface ExplorerParams {
  status?: string;
  search?: string;
  sort?: string;
  [key: string]: string | boolean | undefined;
}

export function explorerUrl(params: ExplorerParams = {}): string {
  const p = new URLSearchParams();
  if (params.status) p.set("status", params.status);
  if (params.search) p.set("search", params.search);
  if (params.sort && params.sort !== DEFAULT_SORT) p.set("sort", params.sort);

  for (const cb of checkboxFilters) {
    if (params[cb.name] === true) p.set(cb.name, "1");
  }

  const qs = p.toString();
  return `/explorer${qs ? `?${qs}` : ""}`;
}
