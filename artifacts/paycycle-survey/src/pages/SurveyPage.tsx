import { useState } from "react";
import { supabase, type SurveyInsert } from "@/lib/supabase";
import Footer from "@/components/Footer";

const PAY_FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Irregular"];
const CHECK_FREQUENCIES = ["Always", "Frequently", "Sometimes", "Rarely", "Never"];
const PRIORITIES = ["Essential Spending", "Savings", "Long-term Investing", "Fun/Discretionary"];

type FormData = {
  major: string;
  pay_frequency: string;
  balance_check_frequency: string;
  priorities: string[];
  end_cycle_anxiety: number | null;
  financial_challenge: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  major: "",
  pay_frequency: "",
  balance_check_frequency: "",
  priorities: [],
  end_cycle_anxiety: null,
  financial_challenge: "",
};

export default function SurveyPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.major.trim()) newErrors.major = "Please enter your major.";
    if (!form.pay_frequency) newErrors.pay_frequency = "Please select your pay frequency.";
    if (!form.balance_check_frequency) newErrors.balance_check_frequency = "Please select how often you check your balance.";
    if (form.priorities.length === 0) newErrors.priorities = "Please select at least one priority.";
    if (form.end_cycle_anxiety === null) newErrors.end_cycle_anxiety = "Please rate your anxiety level.";
    if (!form.financial_challenge.trim()) newErrors.financial_challenge = "Please describe your biggest financial challenge.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function togglePriority(item: string) {
    setForm((prev) => ({
      ...prev,
      priorities: prev.priorities.includes(item)
        ? prev.priorities.filter((p) => p !== item)
        : [...prev.priorities, item],
    }));
    setErrors((prev) => ({ ...prev, priorities: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const payload: SurveyInsert = {
      major: form.major.trim(),
      pay_frequency: form.pay_frequency,
      balance_check_frequency: form.balance_check_frequency,
      priorities: form.priorities,
      end_cycle_anxiety: form.end_cycle_anxiety!,
      financial_challenge: form.financial_challenge.trim(),
    };

    const { error } = await supabase.from("survey_results").insert(payload);
    setSubmitting(false);

    if (error) {
      setSubmitError("Something went wrong saving your response. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-white rounded-2xl shadow-md p-10 max-w-lg w-full text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you!</h2>
            <p className="text-gray-600 mb-6">Your response has been recorded. Your insights help us build better tools for students managing their finances.</p>
            <a
              href="/results"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              View Results
            </a>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">PayCycle</h1>
            <p className="text-xs text-gray-500 mt-0.5">Student Financial Habits Survey</p>
          </div>
          <a href="/results" className="ml-auto text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">
            View Results →
          </a>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Tell us about your financial habits</h2>
          <p className="mt-1.5 text-gray-500 text-sm">This anonymous survey takes about 2 minutes. Your responses help us understand how students like you manage income between paychecks.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">

          {/* Q1: Major */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Q1. What is your primary major? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Enter your current declared major or field of study.</p>
            <input
              type="text"
              value={form.major}
              onChange={(e) => {
                setForm((p) => ({ ...p, major: e.target.value }));
                setErrors((p) => ({ ...p, major: undefined }));
              }}
              placeholder="e.g., Business Analytics, Computer Science"
              className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${errors.major ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {errors.major && <p className="mt-1.5 text-xs text-red-500">{errors.major}</p>}
          </div>

          {/* Q2: Pay Frequency */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Q2. How often do you receive a paycheck? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Select the option that best matches your current income schedule.</p>
            <select
              value={form.pay_frequency}
              onChange={(e) => {
                setForm((p) => ({ ...p, pay_frequency: e.target.value }));
                setErrors((p) => ({ ...p, pay_frequency: undefined }));
              }}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition ${errors.pay_frequency ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            >
              <option value="">Select pay frequency...</option>
              {PAY_FREQUENCIES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
            {errors.pay_frequency && <p className="mt-1.5 text-xs text-red-500">{errors.pay_frequency}</p>}
          </div>

          {/* Q3: Balance Check Frequency */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Q3. How often do you check your balance before a purchase? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Think about your typical purchasing behavior at point of sale.</p>
            <div className="mt-3 space-y-2.5">
              {CHECK_FREQUENCIES.map((freq) => (
                <label key={freq} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="balance_check_frequency"
                    value={freq}
                    checked={form.balance_check_frequency === freq}
                    onChange={() => {
                      setForm((p) => ({ ...p, balance_check_frequency: freq }));
                      setErrors((p) => ({ ...p, balance_check_frequency: undefined }));
                    }}
                    className="w-4 h-4 text-emerald-500 border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{freq}</span>
                </label>
              ))}
            </div>
            {errors.balance_check_frequency && <p className="mt-2 text-xs text-red-500">{errors.balance_check_frequency}</p>}
          </div>

          {/* Q4: Financial Priorities */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Q4. Which financial categories do you prioritize? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Select all that apply. These map to the four-level income allocation system.</p>
            <div className="mt-3 space-y-2.5">
              {PRIORITIES.map((item) => (
                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.priorities.includes(item)}
                    onChange={() => togglePriority(item)}
                    className="w-4 h-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                </label>
              ))}
            </div>
            {errors.priorities && <p className="mt-2 text-xs text-red-500">{errors.priorities}</p>}
          </div>

          {/* Q5: End-of-Cycle Anxiety */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Q5. How anxious do you feel about your balance in the last 3 days of your pay cycle? <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-4">Rate from 1 (no anxiety) to 5 (high anxiety).</p>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="flex flex-col items-center gap-1.5 cursor-pointer flex-1">
                  <input
                    type="radio"
                    name="end_cycle_anxiety"
                    value={n}
                    checked={form.end_cycle_anxiety === n}
                    onChange={() => {
                      setForm((p) => ({ ...p, end_cycle_anxiety: n }));
                      setErrors((p) => ({ ...p, end_cycle_anxiety: undefined }));
                    }}
                    className="sr-only"
                  />
                  <span
                    className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all ${
                      form.end_cycle_anxiety === n
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                        : "border-gray-200 text-gray-500 hover:border-emerald-300 hover:text-emerald-600"
                    }`}
                  >
                    {n}
                  </span>
                  <span className="text-[10px] text-gray-400 text-center leading-tight">
                    {n === 1 ? "No Anxiety" : n === 5 ? "High Anxiety" : ""}
                  </span>
                </label>
              ))}
            </div>
            {errors.end_cycle_anxiety && <p className="mt-2 text-xs text-red-500">{errors.end_cycle_anxiety}</p>}
          </div>

          {/* Q6: Financial Challenge */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-800 mb-1">
              Q6. Describe your biggest challenge when deciding how much to save vs. spend. <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">Share in your own words — the more specific, the more helpful.</p>
            <textarea
              value={form.financial_challenge}
              onChange={(e) => {
                setForm((p) => ({ ...p, financial_challenge: e.target.value }));
                setErrors((p) => ({ ...p, financial_challenge: undefined }));
              }}
              placeholder="e.g., I always underestimate how much I spend on food, so I have nothing left to save..."
              rows={4}
              className={`w-full border rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none ${errors.financial_challenge ? "border-red-400 bg-red-50" : "border-gray-300"}`}
            />
            {errors.financial_challenge && <p className="mt-1.5 text-xs text-red-500">{errors.financial_challenge}</p>}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm shadow-sm"
          >
            {submitting ? "Submitting..." : "Submit Survey"}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}
