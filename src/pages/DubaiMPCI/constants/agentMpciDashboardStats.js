const EXCEPTION_BREAKDOWN = [
  {
    id: "psf",
    title: "Pending Sub-Filing",
    apiKey: "PSF",
    filterField: "status",
    filterValues: ["Pending Sub-FIling"],
    color: "#EF4444",
  },
  {
    id: "rfi",
    title: "Request For Information",
    apiKey: "RFI",
    filterField: "status",
    filterValues: ["REQUEST FOR INFORMATION"],
    color: "#F59E0B",
  },
  {
    id: "dnl",
    title: "Do Not Load",
    apiKey: "DNL",
    filterField: "status",
    filterValues: ["DO NOT LOAD"],
    color: "#EF4444",
  },
  {
    id: "fe",
    title: "Filing Expired",
    apiKey: "FE",
    filterField: "status",
    filterValues: ["Filing Expired"],
    color: "#EF4444",
  },
];

const FILING_RISK_BREAKDOWN = [
  { id: "overdue", title: "Overdue", edtTitle: "ETD Passed", apiKey: "Overdue", color: "#B71C1C" },
  { id: "urgent", title: "Urgent", edtTitle: "ETD within 4 days", apiKey: "Urgent", color: "#E53935" },
  { id: "dueSoon", title: "Due soon", edtTitle: "ETD in 5-7 days", apiKey: "Due soon", color: "#F59E0B" },
  // { id: "breached", title: "Breached", edtTitle: "2 Days Left", apiKey: "Breached", color: "#9333EA" },
  { id: "onTrack", title: "On Track", edtTitle: "ETD in 8+ days", apiKey: "On track", color: "#43A047" },
  
].map((item) => ({
  ...item,
  filterField: "filingRisk",
  filterValues: [item.apiKey],
}));

export const AGENT_MPCI_STAT_DEFINITIONS = [
  // filterField/filterValues always map directly to a field in API shipment data.
  // breakdown entries use the same shape, so cards and breakdown rows share one filter flow.
  {
    id: "filingPending",
    title: "ACTION REQUIRED",
    subtitle: "Pending Filing",
    subpara: "HBL filing yet to be submitted or rejected",
    apiKey: "Filing Pending",
    apiKeys: ["Filing Pending", "REJECTED"],
    filterField: "status",
    filterValues: ["Filing Pending", "REJECTED"],
    breakdown: FILING_RISK_BREAKDOWN,
    iconName: "pending",
    iconBgColor: "rgba(245, 124, 0, 0.12)",
    iconColor: "#E65100",
    accentColor: "#F57C00",
  },
  {
    id: "exceptions",
    title: "EXCEPTIONS",
    subtitle: "Attention Required",
    subpara: "Operational exceptions requiring action",
    apiKeys: EXCEPTION_BREAKDOWN.map((item) => item.apiKey),
    filterField: "status",
    filterValues: EXCEPTION_BREAKDOWN.flatMap((item) => item.filterValues),
    breakdown: EXCEPTION_BREAKDOWN,
    iconName: "warning",
    iconBgColor: "rgba(220, 38, 38, 0.12)",
    iconColor: "#B91C1C",
    accentColor: "#EF4444",
  },
  {
    id: "success",
    title: "CLEARED",
    subtitle: "Approved for Loading",
    subpara: "NAIC assessment completed",
    apiKey: "SUCCESS",
    filterField: "status",
    filterValues: ["ACCEPTED"],
    iconName: "truck",
    iconBgColor: "rgba(46, 125, 50, 0.12)",
    iconColor: "#2E7D32",
    accentColor: "#43A047",
  },
  {
    id: "submitted",
    title: "IN PROGRESS",
    subtitle: "Awaiting NAIC Response",
    subpara: "Filing submitted successfully",
    apiKey: "SUBMITTED",
    filterField: "status",
    filterValues: ["SUBMITTED"],
    iconName: "check",
    iconBgColor: "rgba(123, 31, 162, 0.1)",
    iconColor: "#7B1FA2",
    accentColor: "#8E24AA",
  },
  {
    id: "total",
    title: "ALL SHIPMENTS",
    subtitle: "Total Shipments",
    subpara: "Eligible for MPCI filing",
    apiKey: "TOTAL",
    filterField: null,
    filterValues: null,
    iconName: "list",
    iconBgColor: "rgba(25, 118, 210, 0.12)",
    iconColor: "#1565C0",
    accentColor: "#1976D2",
  },
];

const toSafeCount = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const getDefinitionCount = (definition, statusWiseCount) => {
  if (Array.isArray(definition.apiKeys)) {
    return definition.apiKeys.reduce(
      (total, apiKey) => total + toSafeCount(statusWiseCount?.[apiKey]),
      0,
    );
  }

  return toSafeCount(statusWiseCount?.[definition.apiKey]);
};

export function resolveAgentMpciStatItems(statusWiseCount = {}) {
  return AGENT_MPCI_STAT_DEFINITIONS.map((definition) => ({
    ...definition,
    value: getDefinitionCount(definition, statusWiseCount),
    iconName: definition.iconName,
    breakdown: definition.breakdown?.map((item) => ({
      ...item,
      value: toSafeCount(statusWiseCount?.[item.apiKey]),
    })),
    testId: `agent-mpci-stat-${definition.id}`,
  }));
}
