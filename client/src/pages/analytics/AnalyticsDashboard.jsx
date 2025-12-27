import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

const palette = (i) => `hsl(${(i * 53) % 360}deg 70% 55%)`;

const BarChart = ({ data }) => {
  if (!data?.length) return <p className="text-sm text-muted-foreground">No data</p>;
  const max = Math.max(...data.map(d => d.hours));
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.technicianId}>
          <div className="flex justify-between text-sm">
            <span>{d.name}</span>
            <span className="text-muted-foreground">{d.hours}h</span>
          </div>
          <div className="h-2 bg-muted rounded">
            <div
              className="h-2 rounded"
              style={{ width: `${Math.max(5, (d.hours / max) * 100)}%`, backgroundColor: palette(i) }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const PieChart = ({ data }) => {
  if (!data?.length) return <p className="text-sm text-muted-foreground">No data</p>;
  const total = data.reduce((s, d) => s + (d.hours || 0), 0);
  let offset = 0;
  return (
    <svg viewBox="0 0 42 42" className="w-40 h-40">
      <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="hsl(var(--muted))" strokeWidth="6" />
      {data.map((d, i) => {
        const pct = total ? (d.hours / total) * 100 : 0;
        const dash = `${pct} ${100 - pct}`;
        const rotate = (offset / 100) * 360;
        offset += pct;
        return (
          <circle
            key={d.technicianId}
            cx="21" cy="21" r="15.915" fill="transparent"
            stroke={palette(i)} strokeWidth="6"
            strokeDasharray={dash}
            transform={`rotate(${rotate} 21 21)`}
          />
        );
      })}
    </svg>
  );
};

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [hoursData, setHoursData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({ team: '', technician: '', start: '', end: '' });
  const isManager = user?.role === 'Manager';

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (isManager && filters.team) params.set('team', filters.team);
    if (isManager && filters.technician) params.set('technician', filters.technician);
    if (filters.start) params.set('start', filters.start);
    if (filters.end) params.set('end', filters.end);
    return params.toString();
  }, [filters, isManager]);

  const fetchHours = async () => {
    const url = query ? `http://localhost:5000/api/requests/analytics/hours?${query}` : 'http://localhost:5000/api/requests/analytics/hours';
    const { data } = await axios.get(url);
    setHoursData(data);
  };

  const [summary, setSummary] = useState({ totalRequests: 0, totalHours: 0, avgHours: 0 });
  const fetchSummary = async () => {
    const url = query ? `http://localhost:5000/api/requests/analytics/summary?${query}` : 'http://localhost:5000/api/requests/analytics/summary';
    try {
      const { data } = await axios.get(url);
      setSummary(data);
    } catch {
      // Fallback: compute locally from hoursData
      const totalHours = hoursData.reduce((s, d) => s + (d.hours || 0), 0);
      setSummary({ totalRequests: 0, totalHours, avgHours: 0 });
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      if (isManager) {
        try {
          const { data } = await axios.get('http://localhost:5000/api/teams');
          setTeams(data);
        } catch {
          setTeams([]);
        }
      }
      await fetchHours();
      await fetchSummary();
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const techniciansForTeam = useMemo(() => {
    if (!isManager) return [];
    const team = teams.find(t => t._id === filters.team);
    return team?.members || [];
  }, [teams, filters.team, isManager]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {isManager && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Team</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.team}
                  onChange={(e) => setFilters(f => ({ ...f, team: e.target.value, technician: '' }))}
                >
                  <option value="">All Teams</option>
                  {teams.map(t => (<option key={t._id} value={t._id}>{t.name}</option>))}
                </select>
              </div>
            )}
            {isManager && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Technician</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={filters.technician}
                  onChange={(e) => setFilters(f => ({ ...f, technician: e.target.value }))}
                >
                  <option value="">All Technicians</option>
                  {techniciansForTeam.map(m => (<option key={m._id} value={m._id}>{m.name}</option>))}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={filters.start} onChange={(e) => setFilters(f => ({ ...f, start: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={filters.end} onChange={(e) => setFilters(f => ({ ...f, end: e.target.value }))} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Requests Completed</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Hours Logged</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.totalHours}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Average Hours per Request</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{summary.avgHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Hours Worked per Technician</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={hoursData} />
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Work Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <PieChart data={hoursData} />
            <div className="space-y-2">
              {hoursData.map((d, i) => (
                <div key={d.technicianId} className="flex items-center gap-2 text-sm">
                  <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: palette(i) }} />
                  <span className="truncate max-w-[200px]">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
