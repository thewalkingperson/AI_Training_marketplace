import { Badge } from "@/components/badge";
import type { AgentLeaderboardEntry, ResolverLeaderboardEntry } from "@/lib/types";
import { humanizeToken } from "@/lib/utils";

const buildTickValues = (maxValue: number) => {
  const rawValues = [maxValue, Math.ceil(maxValue * 0.75), Math.ceil(maxValue * 0.5), Math.ceil(maxValue * 0.25), 0];
  return Array.from(new Set(rawValues)).sort((left, right) => right - left);
};

interface LeaderboardBarChartProps {
  entries: Array<ResolverLeaderboardEntry | AgentLeaderboardEntry>;
  maxEntries?: number;
  heightClassName?: string;
  minWidthClassName?: string;
  showAxisLabels?: boolean;
  showRankBadges?: boolean;
  xAxisLabel?: string;
  getLabel?: (entry: ResolverLeaderboardEntry | AgentLeaderboardEntry) => string;
  getSubtitle?: (entry: ResolverLeaderboardEntry | AgentLeaderboardEntry) => string;
  emptyState?: string;
}

export const LeaderboardBarChart = ({
  entries,
  maxEntries,
  heightClassName = "h-[23rem]",
  minWidthClassName = "min-w-[44rem]",
  showAxisLabels = true,
  showRankBadges = true,
  xAxisLabel = "models",
  getLabel,
  getSubtitle,
  emptyState = "No accepted fixes yet. The first credited model will appear here once a repair attempt is approved."
}: LeaderboardBarChartProps) => {
  const chartEntries = entries.slice(0, maxEntries ?? entries.length);
  const maxResolved = Math.max(...chartEntries.map((entry) => entry.casesResolved), 1);
  const tickValues = buildTickValues(maxResolved);

  if (chartEntries.length === 0) {
    return (
      <div className="rounded-[1.6rem] bg-surface-container-low px-5 py-6 text-sm leading-7 text-on-surface-variant">
        {emptyState}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className={minWidthClassName}>
        <div className="grid gap-4 sm:grid-cols-[3.5rem_1fr]">
          <div className={["hidden flex-col justify-between pt-4 sm:flex", heightClassName].join(" ")}>
            {tickValues.map((tick) => (
              <p key={tick} className="mono-kicker text-right">
                {tick}
              </p>
            ))}
          </div>

          <div className="relative">
            <div className={["pointer-events-none absolute inset-0 flex flex-col justify-between pt-4", heightClassName].join(" ")}>
              {tickValues.map((tick, index) => (
                <div
                  key={tick}
                  className={[
                    "border-outline-variant/15",
                    index === tickValues.length - 1 ? "border-t-2" : "border-t"
                  ].join(" ")}
                />
              ))}
            </div>

            <div className={["relative z-10 grid grid-flow-col auto-cols-fr items-end gap-4 pt-4", heightClassName].join(" ")}>
              {chartEntries.map((entry, index) => {
                const heightPercent = Math.max((entry.casesResolved / maxResolved) * 100, 12);
                const label = getLabel?.(entry) ?? ("modelName" in entry ? entry.modelName : entry.agentName);
                const subtitle =
                  getSubtitle?.(entry) ??
                  ("primaryVendor" in entry
                    ? humanizeToken(entry.primaryVendor)
                    : [entry.agentFramework, entry.operatorName].filter(Boolean).join(" · "));

                return (
                  <div key={label} className="flex h-full flex-col items-center justify-end gap-3">
                    <p className="font-headline text-2xl italic text-on-surface">{entry.casesResolved}</p>
                    <div
                      className="w-full max-w-[5.75rem] rounded-t-[1.5rem] bg-gradient-to-t from-primary via-primary to-secondary shadow-[0_18px_34px_rgba(175,77,31,0.18)]"
                      style={{ height: `${heightPercent}%` }}
                    />
                    {showRankBadges ? <Badge tone={index === 0 ? "accent" : "default"}>#{index + 1}</Badge> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-flow-col auto-cols-fr gap-4 sm:pl-[4.5rem]">
          {chartEntries.map((entry) => (
            <div key={getLabel?.(entry) ?? ("modelName" in entry ? entry.modelName : entry.agentName)} className="text-center">
              <p className="font-headline text-[1.35rem] italic text-on-surface">
                {getLabel?.(entry) ?? ("modelName" in entry ? entry.modelName : entry.agentName)}
              </p>
              <p className="mt-2 text-xs leading-6 text-on-surface-variant">
                {getSubtitle?.(entry) ??
                  ("primaryVendor" in entry
                    ? humanizeToken(entry.primaryVendor)
                    : [entry.agentFramework, entry.operatorName].filter(Boolean).join(" · "))}
              </p>
            </div>
          ))}
        </div>

        {showAxisLabels ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="mono-kicker">Y-axis · accepted issue count</p>
            <p className="mono-kicker">X-axis · {xAxisLabel}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
