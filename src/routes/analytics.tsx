import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useMemo } from "react";
import { RequireAuth } from "../components/RequireAuth";
import { useHistory } from "../lib/history-store";
import {
  subjectAverages,
  totalQuestions,
  averageAccuracy,
} from "../lib/achievements";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — StudyWise" }] }),
  component: () => (
    <RequireAuth requireFull>
      <AnalyticsPage />
    </RequireAuth>
  ),
});

const COLORS = ["#2563EB", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"];

function AnalyticsPage() {
  const { list } = useHistory();

  const trend = useMemo(() => {
    return [...list]
      .reverse()
      .slice(-12)
      .map((h, i) => ({
        name: `#${i + 1}`,
        accuracy: h.accuracy,
        date: new Date(h.createdAt).toLocaleDateString(),
      }));
  }, [list]);

  const subjPerf = useMemo(() => subjectAverages(list), [list]);

  const diffPerf = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    list.forEach((h) => {
      const cur = map[h.difficulty] ?? { total: 0, count: 0 };
      cur.total += h.accuracy;
      cur.count += 1;
      map[h.difficulty] = cur;
    });
    return Object.entries(map).map(([difficulty, s]) => ({
      difficulty,
      avg: Math.round(s.total / s.count),
    }));
  }, [list]);

  const weekly = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets[d.toLocaleDateString(undefined, { weekday: "short" })] = 0;
    }
    list.forEach((h) => {
      const day = new Date(h.createdAt);
      const diff = Math.floor((Date.now() - day.getTime()) / (24 * 3600 * 1000));
      if (diff < 7) {
        const k = day.toLocaleDateString(undefined, { weekday: "short" });
        buckets[k] = (buckets[k] ?? 0) + h.questions.length;
      }
    });
    return Object.entries(buckets).map(([day, qs]) => ({ day, qs }));
  }, [list]);

  const monthly = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      buckets[d.toLocaleDateString(undefined, { month: "short" })] = 0;
    }
    list.forEach((h) => {
      const d = new Date(h.createdAt);
      const diffMonths =
        (new Date().getFullYear() - d.getFullYear()) * 12 +
        (new Date().getMonth() - d.getMonth());
      if (diffMonths < 6) {
        const k = d.toLocaleDateString(undefined, { month: "short" });
        buckets[k] = (buckets[k] ?? 0) + h.questions.length;
      }
    });
    return Object.entries(buckets).map(([month, qs]) => ({ month, qs }));
  }, [list]);

  const total = totalQuestions(list);
  const avg = averageAccuracy(list);

  return (
    <main className="bg-hero">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
          Your <span className="gradient-text">analytics</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Progress, patterns, and performance across your prep.</p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Kpi label="Total questions" value={String(total)} />
          <Kpi label="Average accuracy" value={`${avg}%`} />
          <Kpi label="Quizzes completed" value={String(list.length)} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Accuracy trend">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }} />
                <Line type="monotone" dataKey="accuracy" stroke="#2563EB" strokeWidth={3} dot={{ fill: "#8B5CF6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Subject performance">
            {subjPerf.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={subjPerf} dataKey="avg" nameKey="subject" outerRadius={95} label>
                    {subjPerf.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>

          <ChartCard title="Difficulty performance">
            {diffPerf.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={diffPerf}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                  <XAxis dataKey="difficulty" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                  <Bar dataKey="avg" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>

          <ChartCard title="Weekly practice">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="qs" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Monthly practice">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.06)" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line type="monotone" dataKey="qs" stroke="#10B981" strokeWidth={3} dot={{ fill: "#10B981", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>
      </div>
    </main>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-[22px] p-5">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-[22px] p-6">
      <p className="font-display text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-[260px] place-items-center text-sm text-muted-foreground">
      Take a quiz to see this chart.
    </div>
  );
}
