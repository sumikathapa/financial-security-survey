import { useEffect, useState } from "react";
import { supabase, type SurveyResult } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import Footer from "@/components/Footer";

const EMERALD = "#10b981";
const EMERALD_LIGHT = "#6ee7b7";
const GRAY_200 = "#e5e7eb";

const PRIORITY_COLORS: Record<string, string> = {
  "Essential Spending": "#10b981",
  "Savings": "#3b82f6",
  "Long-term Investing": "#8b5cf6",
  "Fun/Discretionary": "#f59e0b",
};

const PIE_COLORS: Record<string, string> = {
  Always: "#10b981",
  Frequently: "#6ee7b7",
  Sometimes: "#fbbf24",
  Rarely: "#f87171",
  Never: "#94a3b8",
};

export default function ResultsPage() {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      const { data, error } = await supabase
        .from("survey_results")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Failed to load results. Please try again.");
      } else {
        setResults(data ?? []);
      }
      setLoading(false);
    }
    fetchResults();
  }, []);

  const total = results.length;

  const avgAnxiety =
    total > 0
      ? (results.reduce((sum, r) => sum + r.end_cycle_anxiety, 0) / total).toFixed(2)
      : "N/A";

  const anxietyChartData = [
    { label: "Average Anxiety Score", value: total > 0 ? parseFloat(avgAnxiety as string) : 0, max: 5 },
  ];

  const priorityCounts: Record<string, number> = {
    "Essential Spending": 0,
    "Savings": 0,
    "Long-term Investing": 0,
    "Fun/Discretionary": 0,
  };
  results.forEach((r) => {
    (r.priorities ?? []).forEach((p) => {
      if (p in priorityCounts) priorityCounts[p]++;
    });
  });
  const priorityData = Object.entries(priorityCounts).map(([name, count]) => ({ name, count }));

  const checkCounts: Record<string, number> = {
    Always: 0,
    Frequently: 0,
    Sometimes: 0,
    Rarely: 0,
    Never: 0,
  };
  results.forEach((r) => {
    if (r.balance_check_frequency && r.balance_check_frequency in checkCounts) {
      checkCounts[r.balance_check_frequency]++;
    }
  });
  const checkData = Object.entries(checkCounts)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">PayCycle</h1>
            <p className="text-xs text-gray-500 mt-0.5">Survey Results Dashboard</p>
          </div>
          <a href="/" className="ml-auto text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            ← Take the Survey
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Aggregated Responses</h2>
          <p className="mt-1.5 text-gray-500 text-sm">All responses are anonymized. Data helps validate PayCycle's core metric: intentional financial decision-making.</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Total Respondents */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5 col-span-2 sm:col-span-1 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold text-emerald-500">{total}</span>
                <span className="mt-1 text-sm font-medium text-gray-600">Total Respondents</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold text-gray-900">{avgAnxiety}</span>
                <span className="mt-1 text-sm font-medium text-gray-600">Avg. Anxiety Score</span>
                <span className="text-[10px] text-gray-400 mt-0.5">out of 5</span>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-extrabold text-gray-900">
                  {total > 0 ? `${Math.round((checkCounts["Always"] + checkCounts["Frequently"]) / total * 100)}%` : "N/A"}
                </span>
                <span className="mt-1 text-sm font-medium text-gray-600">Check Before Purchase</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Always or Frequently</span>
              </div>
            </div>

            {total === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 font-medium">No responses yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to take the survey!</p>
                <a href="/" className="inline-block mt-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
                  Take the Survey
                </a>
              </div>
            ) : (
              <div className="space-y-6">

                {/* Chart 1: End-of-Cycle Anxiety Average */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">End-of-Cycle Anxiety</h3>
                  <p className="text-xs text-gray-400 mb-5">Mean score of Q5 (validates the need for "Unshakable Certainty")</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={anxietyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={GRAY_200} vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value: number) => [`${value} / 5`, "Avg. Anxiety"]}
                        contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "12px" }}
                      />
                      <Bar dataKey="value" fill={EMERALD} radius={[6, 6, 0, 0]} maxBarSize={80} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex justify-center">
                    <div className="bg-emerald-50 rounded-lg px-4 py-2 text-center">
                      <span className="text-2xl font-bold text-emerald-600">{avgAnxiety}</span>
                      <span className="text-sm text-gray-500 ml-1">/ 5</span>
                      <p className="text-xs text-gray-400 mt-0.5">average end-of-cycle anxiety</p>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Priority Popularity */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">Financial Priority Popularity</h3>
                  <p className="text-xs text-gray-400 mb-5">Which of the four income allocation categories are most selected (Q4)</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={priorityData}
                      layout="vertical"
                      margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={GRAY_200} horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={140}
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => [value, "Respondents"]}
                        contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "12px" }}
                      />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={30}>
                        {priorityData.map((entry) => (
                          <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] ?? EMERALD} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Chart 3: Pre-Purchase Check Rates */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-800 mb-1">Pre-Purchase Balance Check Rates</h3>
                  <p className="text-xs text-gray-400 mb-5">How often students perform a "Go/No-Go" check before spending (Q3)</p>
                  {checkData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={checkData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={true}
                        >
                          {checkData.map((entry) => (
                            <Cell key={entry.name} fill={PIE_COLORS[entry.name] ?? EMERALD_LIGHT} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [value, "Respondents"]}
                          contentStyle={{ borderRadius: "0.75rem", border: "1px solid #e5e7eb", fontSize: "12px" }}
                        />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No data available yet.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
