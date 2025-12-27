import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

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
    <div className="space-y-6 pb-10">
      <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {isManager && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Team</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Requests Completed</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Hours Logged</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg Hours / Request</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.avgHours.toFixed(1)}h</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Hours Worked per Technician</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {hoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} style={{ fontSize: '12px' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Legend />
                  <Bar dataKey="hours" fill="#8884d8" name="Hours Worked" radius={[0, 4, 4, 0]}>
                    {hoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Work Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {hoursData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={hoursData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="hours"
                    nameKey="name"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {hoursData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
