import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AgentMpciStatCard from "./Components/AgentMpciStatCard";
import {
  AGENT_MPCI_STAT_DEFINITIONS,
  resolveAgentMpciStatItems,
} from "./constants/agentMpciDashboardStats";
import {
  changeAgentMpciDisplayHeaders,
  clearMPCIDetails,
  downloadAgentMPCIRowsRequest,
  fetchAgentMPCIRowsRequest,
} from "@/redux/actions/dubaiMpciAction";

const DURATION_OPTIONS = [
  { label: "Past 7 Days", value: 7 },
  { label: "Past 30 Days", value: 30 },
  { label: "Past 90 Days", value: 90 },
  { label: "All", value: "" },
];

const formatCell = (row, header) => {
  const value = row?.[header.key];
  if (value == null || value === "") return "-";
  if (header.date) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB");
    }
  }
  return String(value);
};

const AgentDubaiMPCI = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [filterDays, setFilterDays] = useState(30);
  const [activeStatId, setActiveStatId] = useState("total");
  const [activeBreakdownId, setActiveBreakdownId] = useState(null);

  const { AgentMPCIRows = {}, displayHeaders = [] } = useSelector(
    (state) => state.DubaiFormFiling || {},
  );
  const { loginUserData } = useSelector((state) => state.Login);
  const {
    agentRowListData = [],
    statusWiseCount = {},
    loading = false,
    exportLoading = false,
  } = AgentMPCIRows;

  const canCreateMpci = Boolean(loginUserData?.enableCreateMpci);
  const showActionColumn = loginUserData?.enableActionCTA === true;

  const getData = useCallback(
    (filter_days) => {
      dispatch(fetchAgentMPCIRowsRequest({ filterDays: filter_days ?? "" }));
    },
    [dispatch],
  );

  useEffect(() => {
    getData(filterDays);
  }, [getData, filterDays]);

  const handleMoreClick = useCallback(
    (rowData) => {
      if (rowData?.masterId == null) return;
      navigate(`/uae-mpci/filing/${rowData.masterId}`);
    },
    [navigate],
  );

  const handleCreateNew = useCallback(() => {
    dispatch(clearMPCIDetails());
    navigate("/uae-mpci/filing");
  }, [dispatch, navigate]);

  const handleExport = useCallback(() => {
    dispatch(downloadAgentMPCIRowsRequest({ filterDays }));
  }, [dispatch, filterDays]);

  const statItems = useMemo(
    () => resolveAgentMpciStatItems(statusWiseCount),
    [statusWiseCount],
  );

  const normalizeFilterValue = useCallback(
    (value) => String(value || "").trim().toUpperCase(),
    [],
  );

  const activeDefinition = useMemo(
    () =>
      AGENT_MPCI_STAT_DEFINITIONS.find((definition) => definition.id === activeStatId) ||
      AGENT_MPCI_STAT_DEFINITIONS[0],
    [activeStatId],
  );

  const activeBreakdown = useMemo(
    () => activeDefinition.breakdown?.find((item) => item.id === activeBreakdownId) || null,
    [activeBreakdownId, activeDefinition],
  );

  const filteredRows = useMemo(() => {
    const rows = Array.isArray(agentRowListData) ? agentRowListData : [];
    const activeFilter = activeBreakdown || activeDefinition;
    if (!activeFilter.filterField || !activeFilter.filterValues?.length) return rows;
    const allowedValues = new Set(activeFilter.filterValues.map((value) => normalizeFilterValue(value)));
    return rows.filter((shipment) =>
      allowedValues.has(normalizeFilterValue(shipment?.[activeFilter.filterField])),
    );
  }, [activeBreakdown, activeDefinition, agentRowListData, normalizeFilterValue]);

  const visibleHeaders = displayHeaders.filter(
    (header) => header.status && (header.key !== "action" || showActionColumn),
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">UAE MPCI Dashboard</h1>
        {canCreateMpci ? (
          <button
            type="button"
            onClick={handleCreateNew}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
          >
            + MPCI Filing
          </button>
        ) : null}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {statItems.map(({ id, breakdown, ...cardProps }) => (
          <AgentMpciStatCard
            key={id}
            {...cardProps}
            breakdown={breakdown}
            active={activeStatId === id}
            onClick={() => {
              setActiveStatId(id);
              setActiveBreakdownId(null);
            }}
            onBreakdownClick={(item) => {
              setActiveStatId(id);
              setActiveBreakdownId(item.id);
            }}
          />
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <p className="text-sm font-medium text-slate-600">
            {activeBreakdown?.title || activeDefinition.title}
          </p>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
              value={filterDays}
              onChange={(event) =>
                setFilterDays(event.target.value === "" ? "" : Number(event.target.value))
              }
            >
              {DURATION_OPTIONS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  changeAgentMpciDisplayHeaders(
                    displayHeaders.map((header) =>
                      header.key === "shipmentId" ? { ...header, status: !header.status } : header,
                    ),
                  ),
                )
              }
              className="rounded-md border border-slate-300 px-2 py-1.5 text-xs text-slate-600"
            >
              Columns
            </button>
            <button
              type="button"
              disabled={exportLoading}
              onClick={handleExport}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {exportLoading ? "Exporting..." : "Export"}
            </button>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {visibleHeaders.map((header) => (
                  <th key={header.key} className="px-4 py-3 font-medium">
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={visibleHeaders.length || 1}>
                    Loading shipments...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-slate-500" colSpan={visibleHeaders.length || 1}>
                    No shipments found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr key={row.masterId || row.hblNo || index} className="border-t border-slate-100">
                    {visibleHeaders.map((header) => (
                      <td key={header.key} className="px-4 py-3 text-slate-700">
                        {header.key === "action" ? (
                          <button
                            type="button"
                            disabled={row?.masterId == null}
                            onClick={() => handleMoreClick(row)}
                            className="rounded-md bg-sky-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            More
                          </button>
                        ) : (
                          formatCell(row, header)
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentDubaiMPCI;
