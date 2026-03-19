import type { ValidatedCase } from "@/lib/types";

export interface DomainDefinition {
  id: ValidatedCase["domain"];
  label: string;
  description: string;
  defaultSignals: string[];
}

export const DOMAIN_TAXONOMY: DomainDefinition[] = [
  {
    id: "devops",
    label: "DevOps",
    description: "CI/CD, infrastructure automation, incident response, and deployment drift.",
    defaultSignals: ["ci_failure", "infra_drift", "broken_release", "misconfigured_build"]
  },
  {
    id: "financial_modeling_code",
    label: "Financial Modeling Code",
    description: "Quant logic, pricing engines, scenario analysis, and reporting transformations.",
    defaultSignals: ["pricing_bug", "scenario_mismatch", "numerical_error", "bad_assumption"]
  },
  {
    id: "backend_debugging",
    label: "Backend Debugging",
    description: "APIs, data access, authorization, and service orchestration failures.",
    defaultSignals: ["api_regression", "auth_bug", "query_error", "state_bug"]
  },
  {
    id: "frontend_debugging",
    label: "Frontend Debugging",
    description: "Broken component behavior, state wiring, and rendering regressions.",
    defaultSignals: ["state_desync", "hydration_bug", "form_bug", "accessibility_regression"]
  },
  {
    id: "data_pipeline",
    label: "Data Pipeline",
    description: "ETL jobs, schedulers, transformations, and schema drift handling.",
    defaultSignals: ["etl_failure", "schema_drift", "job_timeout", "bad_transform"]
  },
  {
    id: "test_repair",
    label: "Test Repair",
    description: "Fixing brittle tests, mocks, fixtures, and regression coverage.",
    defaultSignals: ["fixture_drift", "snapshot_failure", "mock_mismatch", "missing_assertion"]
  },
  {
    id: "refactor_navigation",
    label: "Refactor and Navigation",
    description: "Large-context navigation, safe edits, and architecture-aware refactors.",
    defaultSignals: ["unsafe_refactor", "missed_dependency", "context_drop", "broken_contract"]
  }
];

export const getDomainDefinition = (id: ValidatedCase["domain"]) =>
  DOMAIN_TAXONOMY.find((domain) => domain.id === id);
