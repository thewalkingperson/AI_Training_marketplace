import { tokenLabel } from "@/lib/tokens";

export const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);

export const formatPercent = (value: number) =>
  `${Math.round(value * 100)}%`;

export const formatTokens = (value: number) =>
  `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value)} ${tokenLabel}`;

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const humanizeToken = (value: string) =>
  value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
