"use client";

import {
  PROVIDER_DOMAIN_ORDER,
  PROVIDER_DOMAINS,
  OWNER_SIDE_LABELS,
  PRIORITY_LABELS,
  type ProviderDomain,
  type OwnerSide,
  type Priority,
} from "@/lib/constants";

export const selectClass =
  "flex h-9 w-full rounded-lg border bg-background px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DomainSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: ProviderDomain | "";
  onChange: (v: ProviderDomain | "") => void;
}) {
  return (
    <select
      id={id}
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value as ProviderDomain | "")}
    >
      <option value="">Transverse</option>
      {PROVIDER_DOMAIN_ORDER.map((d) => (
        <option key={d} value={d}>
          {PROVIDER_DOMAINS[d].short}
        </option>
      ))}
    </select>
  );
}

export function OwnerSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: OwnerSide;
  onChange: (v: OwnerSide) => void;
}) {
  return (
    <select
      id={id}
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value as OwnerSide)}
    >
      {(["provider", "client", "skalesy"] as OwnerSide[]).map((o) => (
        <option key={o} value={o}>
          {OWNER_SIDE_LABELS[o]}
        </option>
      ))}
    </select>
  );
}

export function PrioritySelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: Priority;
  onChange: (v: Priority) => void;
}) {
  return (
    <select
      id={id}
      className={selectClass}
      value={value}
      onChange={(e) => onChange(e.target.value as Priority)}
    >
      {(["low", "medium", "high", "urgent"] as Priority[]).map((p) => (
        <option key={p} value={p}>
          {PRIORITY_LABELS[p]}
        </option>
      ))}
    </select>
  );
}
