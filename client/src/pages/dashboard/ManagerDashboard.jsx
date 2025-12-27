import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
    Wrench,
    AlertTriangle,
    Users,
    Filter,
    RefreshCw,
    RotateCcw,
    Search,
    Calendar,
    UserPlus,
    ArrowRightLeft,
    Trash2,
} from "lucide-react";

const API = "http://localhost:5000/api";

/** Stage colors (headers for In Progress + Scrapped included) */
const statusMeta = {
    New: {
        dot: "bg-blue-500",
        pill: "border-blue-200 bg-blue-50 text-blue-700",
        header: "border-blue-200 bg-blue-50/90 text-blue-900",
        ring: "hover:ring-blue-200",
    },
    "In Progress": {
        dot: "bg-yellow-500",
        pill: "border-yellow-200 bg-yellow-50 text-yellow-800",
        header: "border-yellow-200 bg-yellow-50/90 text-yellow-900",
        ring: "hover:ring-yellow-200",
    },
    Repaired: {
        dot: "bg-green-500",
        pill: "border-green-200 bg-green-50 text-green-800",
        header: "border-green-200 bg-green-50/90 text-green-900",
        ring: "hover:ring-green-200",
    },
    Scrapped: {
        dot: "bg-red-500",
        pill: "border-red-200 bg-red-50 text-red-800",
        header: "border-red-200 bg-red-50/90 text-red-900",
        ring: "hover:ring-red-200",
    },
};

function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
}

function isOverdue(item) {
    if (!item?.scheduledDate) return false;
    if (item.status === "Repaired" || item.status === "Scrapped") return false;
    return new Date(item.scheduledDate) < new Date();
}

function Chip({ label, onClear }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
            <span className="max-w-[220px] truncate">{label}</span>
            <button
                type="button"
                onClick={onClear}
                className="grid h-5 w-5 place-items-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
                aria-label={`Clear ${label}`}
            >
                ×
            </button>
        </span>
    );
}

function KpiCard({ title, value, Icon, iconColor, barColor, loading }) {
    return (
        <Card className="overflow-hidden border bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
            <div className={`h-1 w-full ${barColor}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                <div className="rounded-md border bg-white p-2 shadow-sm">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight tabular-nums">
                    {loading ? "…" : value}
                </div>
            </CardContent>
        </Card>
    );
}

/** ---------- Inline Kanban (one file) ---------- */

function RequestCard({
    item,
    columns,
    technicians,
    onMove,
    onAssignTechnician,
    onScrap,
    meta,
}) {
    const overdue = isOverdue(item);

    return (
        <div
            className={`group rounded-xl border bg-white p-3 shadow-sm transition-all duration-200
                  hover:-translate-y-0.5 hover:shadow-md hover:ring-2 ${meta?.ring || "hover:ring-slate-200"}`}
        >
            {/* ... Top and Info sections ... */}
            {/* Simplified for brevity in replace helper, keeping surrounding code intact by using context matching if possible, but here we replace the component start to insert useMemo */}

            {/* Top */}
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${meta?.dot || "bg-slate-400"}`} />
                        <div className="truncate font-semibold text-slate-900">
                            {item?.title || item?.equipment?.name || "Request"}
                        </div>
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                        {item?.equipment?.name ? (
                            <span className="truncate">Equipment: {item.equipment.name}</span>
                        ) : (
                            <span className="truncate">Equipment: —</span>
                        )}
                    </div>
                </div>

                <span
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${meta?.pill || "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                >
                    {item?.status || "—"}
                </span>
            </div>

            {/* Info */}
            <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                            Due:{" "}
                            <span className="font-medium text-slate-800">
                                {formatDate(item?.scheduledDate) || "—"}
                            </span>
                        </span>
                    </div>

                    {overdue ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Overdue
                        </span>
                    ) : null}
                </div>

                <div className="flex items-center justify-between gap-2">
                    <span className="truncate">
                        Team:{" "}
                        <span className="font-medium text-slate-800">
                            {item?.assignedTeam?.name || "—"}
                        </span>
                    </span>
                    <span className="truncate">
                        Tech:{" "}
                        <span className="font-medium text-slate-800">
                            {item?.assignedTechnician?.name || "—"}
                        </span>
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-3 space-y-2">
                {/* Move */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="inline-flex items-center gap-2 text-xs text-slate-500 shrink-0">
                        <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                        <span className="hidden sm:inline">Move</span>
                    </div>
                    <select
                        className="flex-1 rounded-md border bg-white px-2 py-1.5 text-xs outline-none transition
                       focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
                        value={item?.status || ""}
                        onChange={(e) => onMove(item._id, e.target.value)}
                    >
                        {columns.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assign */}
                {Array.isArray(technicians) && technicians.length > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <div className="inline-flex items-center gap-2 text-xs text-slate-500 shrink-0">
                            <UserPlus className="h-4 w-4 text-slate-400" />
                            <span className="hidden sm:inline">Assign</span>
                        </div>
                        <select
                            className="flex-1 rounded-md border bg-white px-2 py-1.5 text-xs outline-none transition
                         focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
                            value={item?.assignedTechnician?._id || ""}
                            onChange={(e) => {
                                const techId = e.target.value;
                                if (!techId) return;
                                onAssignTechnician(item, techId);
                            }}
                        >
                            <option value="">Select tech…</option>
                            {technicians.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}

                {/* Scrap */}
                {item?.status !== "Scrapped" ? (
                    <button
                        type="button"
                        onClick={() => {
                            const ok = window.confirm("Scrap this request?");
                            if (ok) onScrap(item);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700
                       hover:bg-red-100 active:scale-[0.99] transition"
                    >
                        <Trash2 className="h-4 w-4" />
                        Scrap
                    </button>
                ) : null}
            </div>
        </div>
    );
}

function KanbanBoard({
    items,
    columns,
    technicians,
    onMove,
    onAssignTechnician,
    onScrap,
    columnMeta,
}) {
    const grouped = useMemo(() => {
        const map = {};
        (columns || []).forEach((c) => (map[c] = []));
        (items || []).forEach((it) => {
            const key = map[it?.status] ? it.status : columns?.[0];
            if (!map[key]) map[key] = [];
            map[key].push(it);
        });
        return map;
    }, [items, columns]);

    return (
        <div className="grid gap-4 lg:grid-cols-4">
            {(columns || []).map((col) => {
                const meta = columnMeta?.[col] || null;
                const list = grouped[col] || [];

                return (
                    <div key={col} className="flex min-h-[220px] flex-col rounded-xl border bg-slate-50/40">
                        {/* Colored header (In Progress + Scrapped will match) */}
                        <div className={`rounded-t-xl border-b px-3 py-2 ${meta?.header || "border-slate-200 bg-white"}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold">
                                    <span className={`h-2 w-2 rounded-full ${meta?.dot || "bg-slate-400"}`} />
                                    <span className="text-sm">{col}</span>
                                </div>
                                <span className="rounded-full border bg-white/70 px-2 py-0.5 text-xs text-slate-600">
                                    {list.length}
                                </span>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 space-y-3 p-3 overflow-y-auto max-h-[70vh]">
                            {list.length === 0 ? (
                                <div className="rounded-lg border border-dashed bg-white/50 p-4 text-center text-xs text-slate-500">
                                    No requests here
                                </div>
                            ) : (
                                list.map((item) => (
                                    <RequestCard
                                        key={item._id}
                                        item={item}
                                        columns={columns}
                                        technicians={technicians}
                                        onMove={onMove}
                                        onAssignTechnician={onAssignTechnician}
                                        onScrap={onScrap}
                                        meta={meta}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/** ---------- Equipment Matrix View ---------- */
function EquipmentMatrix({ equipment, requests, statusMeta }) {
    // Group requests by Equipment ID
    const requestsByEq = useMemo(() => {
        const map = {};
        requests.forEach(r => {
            const eqId = r.equipment?._id || 'unassigned';
            if (!map[eqId]) map[eqId] = [];
            map[eqId].push(r);
        });
        return map;
    }, [requests]);

    const columns = ["New", "In Progress", "Repaired", "Scrapped"];

    return (
        <div className="overflow-x-auto rounded-md border bg-white">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-4 py-3 font-medium border-b w-1/4">Equipment</th>
                        {columns.map(col => (
                            <th key={col} className={`px-4 py-3 font-medium border-b border-l ${statusMeta[col]?.header?.replace('bg-', 'bg-opacity-20 ') || ''}`}>
                                <div className="flex items-center gap-2">
                                    <span className={`h-2 w-2 rounded-full ${statusMeta[col]?.dot}`} />
                                    {col}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {equipment.length === 0 ? (
                        <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No equipment found.</td></tr>
                    ) : (
                        equipment.map(eq => {
                            const eqRequests = requestsByEq[eq._id] || [];
                            return (
                                <tr key={eq._id} className="hover:bg-slate-50/50">
                                    <td className="px-4 py-3 font-medium border-r bg-slate-50/30">
                                        <div className="font-semibold text-slate-800">{eq.name}</div>
                                        <div className="text-xs text-slate-500">{eq.serialNumber}</div>
                                        <div className="text-xs text-slate-400 mt-1">{eq.maintenanceTeam?.name || 'No Team'}</div>
                                    </td>
                                    {columns.map(col => {
                                        const inCol = eqRequests.filter(r => r.status === col);
                                        return (
                                            <td key={col} className="px-2 py-2 border-l align-top">
                                                <div className="flex flex-col gap-2">
                                                    {inCol.map(r => (
                                                        <div key={r._id} className="p-2 rounded bg-white border shadow-sm text-xs hover:ring-1 ring-primary/50 transition cursor-default">
                                                            <div className="font-medium truncate" title={r.description}>{r.description || 'Maintenance Request'}</div>
                                                            <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                                                                <span>{r.assignedTechnician?.name || 'Unassigned'}</span>
                                                                {r.scheduledDate && (
                                                                    <span className={isOverdue(r) ? "text-red-500 font-bold" : ""}>
                                                                        {new Date(r.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

/** ---------- Dashboard ---------- */

const ManagerDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [teams, setTeams] = useState([]);
    const [equipment, setEquipment] = useState([]);
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'matrix'

    const [filters, setFilters] = useState({
        q: "",
        technician: "",
        team: "",
        equipment: "",
        status: "",
    });

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchAll = async () => {
        setErrorMsg("");
        setLoading(true);
        try {
            const [eqRes, reqRes, teamRes] = await Promise.all([
                axios.get(`${API}/equipment`),
                axios.get(`${API}/requests`),
                axios.get(`${API}/teams`),
            ]);

            setEquipment(eqRes.data || []);
            setRequests(reqRes.data || []);
            setTeams(teamRes.data || []);
        } catch (e) {
            setErrorMsg("Failed to fetch dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const technicians = useMemo(() => {
        const all = teams.flatMap((t) => t.members || []);
        const map = new Map();
        all.forEach((u) => {
            if (u && u._id && !map.has(u._id)) map.set(u._id, u);
        });
        return Array.from(map.values());
    }, [teams]);

    // Derived KPIs (stay correct after moves/assigns)
    const stats = useMemo(() => {
        const now = new Date();

        const overdue = (requests || []).filter((r) => {
            if (!r) return false;
            if (r.status === "Repaired" || r.status === "Scrapped") return false;
            if (!r.scheduledDate) return false;
            return new Date(r.scheduledDate) < now;
        }).length;

        const open = (requests || []).filter((r) => r && ["New", "In Progress"].includes(r.status)).length;

        return {
            totalEquipment: equipment.length,
            openRequests: open,
            overdueRequests: overdue,
            activeTeams: teams.length,
        };
    }, [requests, equipment.length, teams.length]);

    const filteredRequests = useMemo(() => {
        const q = filters.q.trim().toLowerCase();

        return (requests || []).filter((r) => {
            if (!r) return false;

            if (filters.status && r.status !== filters.status) return false;
            if (filters.equipment && r.equipment?._id !== filters.equipment) return false;
            if (filters.team && r.assignedTeam?._id !== filters.team) return false;
            if (filters.technician && r.assignedTechnician?._id !== filters.technician) return false;

            if (q) {
                const haystack = [
                    r.title,
                    r.description,
                    r.equipment?.name,
                    r.assignedTeam?.name,
                    r.assignedTechnician?.name,
                    r.status,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                if (!haystack.includes(q)) return false;
            }

            return true;
        });
    }, [requests, filters]);

    // Filter equipment for Matrix view based on filtered requests + plain filters if needed
    // If we filter requests, we should probably still show ALL equipment or only equipment with requests?
    // Let's show filtered equipment if equipment filter is set, otherwise all.
    const filteredEquipment = useMemo(() => {
        if (filters.equipment) return equipment.filter(e => e._id === filters.equipment);
        if (filters.team) return equipment.filter(e => e.maintenanceTeam?._id === filters.team); // Assuming equipment stores maintenanceTeam populated or ID?
        // Check equipment model: maintenanceTeam is ID ref.
        // The equipment state populated maintenanceTeam? Yes in controller.
        // So e.maintenanceTeam._id or e.maintenanceTeam if populated.
        // Let's safe check.
        if (filters.team) {
            return equipment.filter(e => {
                const tId = e.maintenanceTeam?._id || e.maintenanceTeam;
                return String(tId) === String(filters.team);
            });
        }
        return equipment;
    }, [equipment, filters.equipment, filters.team]);


    const refreshRequests = async () => {
        const { data } = await axios.get(`${API}/requests`);
        setRequests(data || []);
    };

    const handleMove = async (id, toStatus) => {
        setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status: toStatus } : r)));
        try {
            await axios.put(`${API}/requests/${id}`, { status: toStatus });
        } catch (e) {
            await refreshRequests();
        }
    };

    const handleAssign = async (req, technicianId) => {
        try {
            await axios.put(`${API}/requests/${req._id}`, { assignedTechnician: technicianId });
            await refreshRequests();
        } catch (e) {
            console.error("Failed to assign technician");
        }
    };

    const handleScrap = async (req) => {
        setRequests((prev) => prev.map((r) => (r._id === req._id ? { ...r, status: "Scrapped" } : r)));
        try {
            await axios.put(`${API}/requests/${req._id}`, { status: "Scrapped" });
        } catch (e) {
            console.error("Failed to scrap");
            await refreshRequests();
        }
    };

    const clearFilters = () =>
        setFilters({ q: "", technician: "", team: "", equipment: "", status: "" });

    const activeChips = useMemo(() => {
        const chips = [];

        if (filters.status) {
            chips.push({
                key: "status",
                label: `Status: ${filters.status}`,
                clear: () => setFilters((f) => ({ ...f, status: "" })),
            });
        }

        if (filters.technician) {
            const t = technicians.find((x) => x._id === filters.technician);
            chips.push({
                key: "technician",
                label: `Tech: ${t?.name || "Unknown"}`,
                clear: () => setFilters((f) => ({ ...f, technician: "" })),
            });
        }

        if (filters.team) {
            const t = teams.find((x) => x._id === filters.team);
            chips.push({
                key: "team",
                label: `Team: ${t?.name || "Unknown"}`,
                clear: () => setFilters((f) => ({ ...f, team: "" })),
            });
        }

        if (filters.equipment) {
            const eq = equipment.find((x) => x._id === filters.equipment);
            chips.push({
                key: "equipment",
                label: `Equipment: ${eq?.name || "Unknown"}`,
                clear: () => setFilters((f) => ({ ...f, equipment: "" })),
            });
        }

        if (filters.q.trim()) {
            chips.push({
                key: "q",
                label: `Search: ${filters.q.trim()}`,
                clear: () => setFilters((f) => ({ ...f, q: "" })),
            });
        }

        return chips;
    }, [filters, technicians, teams, equipment]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
                    <p className="text-sm text-slate-600">
                        Smooth workflow: filter, assign technicians, and move work through stages.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={fetchAll}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm
                       hover:bg-slate-50 active:scale-[0.99] transition disabled:opacity-60"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={clearFilters}
                        disabled={activeChips.length === 0}
                        className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-2 text-sm text-slate-700 shadow-sm
                       hover:bg-slate-50 active:scale-[0.99] transition disabled:opacity-60"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset filters
                    </button>
                </div>
            </div>

            {/* Error */}
            {errorMsg ? (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="py-3 text-sm text-red-800">{errorMsg}</CardContent>
                </Card>
            ) : null}

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Equipment"
                    value={stats.totalEquipment}
                    Icon={Wrench}
                    iconColor="text-blue-600"
                    barColor="bg-blue-500/70"
                    loading={loading}
                />
                <KpiCard
                    title="Open Requests"
                    value={stats.openRequests}
                    Icon={AlertTriangle}
                    iconColor="text-yellow-600"
                    barColor="bg-yellow-500/70"
                    loading={loading}
                />
                <KpiCard
                    title="Overdue Tasks"
                    value={stats.overdueRequests}
                    Icon={AlertTriangle}
                    iconColor="text-red-600"
                    barColor="bg-red-500/70"
                    loading={loading}
                />
                <KpiCard
                    title="Active Teams"
                    value={stats.activeTeams}
                    Icon={Users}
                    iconColor="text-green-600"
                    barColor="bg-green-500/70"
                    loading={loading}
                />
            </div>

            {/* Visual Controls */}
            <div className="flex items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${viewMode === 'kanban' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Kanban Board
                    </button>
                    <button
                        onClick={() => setViewMode('matrix')}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${viewMode === 'matrix' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Equipment Matrix
                    </button>
                </div>
            </div>

            {/* Filters (Reusable) */}
            <Card className="border bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </CardTitle>

                    <div className="text-xs text-slate-500">
                        Showing <span className="font-semibold text-slate-800">{filteredRequests.length}</span>{" "}
                        / <span className="font-semibold text-slate-800">{requests.length}</span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Search + legend */}
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                className="w-full rounded-md border bg-white px-9 py-2 text-sm outline-none transition
                           focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                value={filters.q}
                                onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
                                placeholder="Search requests, equipment, teams, technicians…"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {["New", "In Progress", "Repaired", "Scrapped"].map((s) => (
                                <span
                                    key={s}
                                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs shadow-sm ${statusMeta[s]?.pill || "border-slate-200 bg-slate-50 text-slate-700"
                                        }`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${statusMeta[s]?.dot || "bg-slate-400"}`} />
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Select grid */}
                    <div className="grid md:grid-cols-4 gap-3">
                        {/* Same filters as before */}
                        <select
                            className="rounded-md border bg-white px-3 py-2 text-sm outline-none transition
                         focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
                            value={filters.status}
                            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                        >
                            <option value="">Status: All</option>
                            {["New", "In Progress", "Repaired", "Scrapped"].map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>

                        <select
                            className="rounded-md border bg-white px-3 py-2 text-sm outline-none transition
                         focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
                            value={filters.technician}
                            onChange={(e) => setFilters((f) => ({ ...f, technician: e.target.value }))}
                        >
                            <option value="">Technician: All</option>
                            {technicians.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="rounded-md border bg-white px-3 py-2 text-sm outline-none transition
                         focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
                            value={filters.team}
                            onChange={(e) => setFilters((f) => ({ ...f, team: e.target.value }))}
                        >
                            <option value="">Team: All</option>
                            {teams.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="rounded-md border bg-white px-3 py-2 text-sm outline-none transition
                         focus:ring-2 focus:ring-slate-200 focus:border-slate-300"
                            value={filters.equipment}
                            onChange={(e) => setFilters((f) => ({ ...f, equipment: e.target.value }))}
                        >
                            <option value="">Equipment: All</option>
                            {equipment.map((eq) => (
                                <option key={eq._id} value={eq._id}>
                                    {eq.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active chips */}
                    {activeChips.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-2">
                            {activeChips.map((c) => (
                                <Chip key={c.key} label={c.label} onClear={c.clear} />
                            ))}
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="rounded-md border bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm hover:bg-slate-50 transition"
                            >
                                Clear all
                            </button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            {/* Main View Area */}
            <Card className="border bg-white min-h-[500px]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                        {viewMode === 'kanban' ? 'Workflow Board' : 'Equipment Status Matrix'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                    {viewMode === 'kanban' ? (
                        <KanbanBoard
                            items={filteredRequests}
                            columns={["New", "In Progress", "Repaired", "Scrapped"]}
                            technicians={technicians} // Pass all technicians
                            onMove={handleMove}
                            onAssignTechnician={handleAssign}
                            onScrap={handleScrap}
                            columnMeta={statusMeta}
                        />
                    ) : (
                        <EquipmentMatrix
                            equipment={filteredEquipment}
                            requests={filteredRequests}
                            statusMeta={statusMeta}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ManagerDashboard;