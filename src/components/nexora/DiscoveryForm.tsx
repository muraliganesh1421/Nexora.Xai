'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  MapPin,
  Globe,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Database,
  Building2,
  RefreshCw,
  Info,
} from 'lucide-react';
import { DiscoveryRequest, DiscoveryResponse } from '@/types/nexora';
import { discoverLeads } from '@/lib/nexora/api';

const QUICK_PRESETS = [
  { label: 'Restaurants in Rajahmundry', category: 'Restaurant', city: 'Rajahmundry', country: 'India' },
  { label: 'Bakeries in Rajahmundry', category: 'Bakery', city: 'Rajahmundry', country: 'India' },
  { label: 'Gyms in Kakinada', category: 'Gym', city: 'Kakinada', country: 'India' },
  { label: 'Clinics in Visakhapatnam', category: 'Clinic', city: 'Visakhapatnam', country: 'India' },
  { label: 'Real Estate in Hyderabad', category: 'Real Estate', city: 'Hyderabad', country: 'India' },
];

interface DiscoveryFormProps {
  onSuccess?: (response: DiscoveryResponse) => void;
}

export default function DiscoveryForm({ onSuccess }: DiscoveryFormProps) {
  // Form State
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('Rajahmundry');
  const [country, setCountry] = useState('India');
  const [maxResults, setMaxResults] = useState(5);
  const [minScore, setMinScore] = useState(55);

  // Interaction State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Loading stages simulation for visual UX
  const loadingStages = [
    'Searching businesses via OSM nodes...',
    'Removing duplicates against Google Sheets CRM...',
    'Running AI qualification & scoring...',
    'Appending qualified records to CRM...',
  ];

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!category.trim()) {
      errs.category = 'Business category or industry is required.';
    }
    if (!city.trim()) {
      errs.city = 'City is required.';
    }
    if (!country.trim()) {
      errs.country = 'Country is required.';
    }
    if (isNaN(maxResults) || maxResults < 1 || maxResults > 20) {
      errs.maxResults = 'Must be between 1 and 20.';
    }
    if (isNaN(minScore) || minScore < 0 || minScore > 100) {
      errs.minScore = 'Must be between 0 and 100.';
    }
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate submissions

    if (!validate()) return;

    setError(null);
    setResult(null);
    setIsLoading(true);
    setLoadingStep(0);

    // Visual step progression interval
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 2800);

    try {
      const payload: DiscoveryRequest = {
        category: category.trim(),
        city: city.trim(),
        country: country.trim(),
        maxResults,
        minScore,
      };

      const res = await discoverLeads(payload);
      clearInterval(stepInterval);
      setResult(res);
      if (onSuccess) onSuccess(res);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setError(
        err instanceof Error
          ? err.message
          : 'Discovery couldn’t be completed. Please try again or check connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setLoadingStep(0);
  };

  const applyPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setCategory(preset.category);
    setCity(preset.city);
    setCountry(preset.country);
    setValidationErrors({});
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07070b] p-6 sm:p-8">
      {/* Background Cosmic Atmosphere */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-500/[0.05] blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/[0.06] text-zinc-300 border border-white/10">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            Automated Prospect Discovery
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Find Businesses
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Discover businesses and let AI qualify the highest potential opportunities.
        </p>

        {/* 1-Click Fast Presets */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
            1-Click Search Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((p) => (
              <button
                type="button"
                key={p.label}
                disabled={isLoading}
                onClick={() => applyPreset(p)}
                className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                  category.toLowerCase() === p.category.toLowerCase() && city.toLowerCase() === p.city.toLowerCase()
                    ? 'border-white/30 bg-white/10 text-white'
                    : 'border-white/[0.08] bg-[#0c0c12] text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUCCESS STATE */}
      {result && (
        <div className="relative z-10 rounded-xl border border-white/[0.08] bg-[#0b0b12] p-6 text-center">
          {result.processed > 0 ? (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Discovery Complete
              </h3>
              <p className="mt-1 text-sm font-medium text-emerald-400">
                {result.processed} {result.processed === 1 ? 'lead' : 'leads'} processed & qualified
              </p>
              <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Qualified businesses have been added to your Google Sheets CRM and are ready for founder review.
              </p>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Discovery completed
              </h3>
              <p className="mt-1 text-sm font-medium text-zinc-300">
                No new leads were added.
              </p>
              <p className="mt-2 text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                Some businesses may already exist in your CRM or may not have met the score threshold.
              </p>
            </>
          )}

          {result.isDemo && (
            <div className="mt-3 inline-block rounded border border-amber-500/30 bg-amber-950/20 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
              DEMO MODE EXECUTION
            </div>
          )}

          {/* Action CTAs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/leads"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
            >
              <span>View Leads in CRM</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#12121c] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.08]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Run Another Search</span>
            </button>
          </div>

          <div className="mt-4 text-[11px] text-zinc-500 font-mono">
            Records are appended to your connected Google Sheets CRM table.
          </div>
        </div>
      )}

      {/* ERROR STATE */}
      {error && !result && (
        <div className="relative z-10 mb-6 rounded-xl border border-rose-500/30 bg-rose-950/20 p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-rose-200">
                Discovery couldn’t be completed.
              </h3>
              <p className="mt-1 text-xs text-rose-300/80 leading-relaxed">
                {error}
              </p>
              <div className="mt-4">
                <button
                  onClick={handleSubmit}
                  className="rounded-lg bg-rose-600/30 border border-rose-500/40 px-3.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-600/50 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM INPUTS */}
      {!result && (
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Category Field */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Business Category / Industry <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={category}
                  disabled={isLoading}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    if (validationErrors.category) {
                      setValidationErrors((prev) => ({ ...prev, category: '' }));
                    }
                  }}
                  placeholder="Restaurant, Bakery, Gym, Clinic, Furniture Store"
                  className={`w-full rounded-xl border bg-[#0c0c12] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none transition ${
                    validationErrors.category
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-white/[0.08] focus:border-white/30'
                  }`}
                />
              </div>
              {validationErrors.category && (
                <p className="mt-1 text-[11px] text-rose-400">
                  {validationErrors.category}
                </p>
              )}
            </div>

            {/* City Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                City <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={city}
                  disabled={isLoading}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (validationErrors.city) {
                      setValidationErrors((prev) => ({ ...prev, city: '' }));
                    }
                  }}
                  placeholder="e.g. Rajahmundry"
                  className={`w-full rounded-xl border bg-[#0c0c12] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none transition ${
                    validationErrors.city
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-white/[0.08] focus:border-white/30'
                  }`}
                />
              </div>
              {validationErrors.city && (
                <p className="mt-1 text-[11px] text-rose-400">
                  {validationErrors.city}
                </p>
              )}
            </div>

            {/* Country Field */}
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Country <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                  <Globe className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={country}
                  disabled={isLoading}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    if (validationErrors.country) {
                      setValidationErrors((prev) => ({ ...prev, country: '' }));
                    }
                  }}
                  placeholder="e.g. India"
                  className={`w-full rounded-xl border bg-[#0c0c12] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none transition ${
                    validationErrors.country
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-white/[0.08] focus:border-white/30'
                  }`}
                />
              </div>
              {validationErrors.country && (
                <p className="mt-1 text-[11px] text-rose-400">
                  {validationErrors.country}
                </p>
              )}
            </div>

            {/* Number of Leads (1–20) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Number of Leads (1–20)
                </label>
                <span className="font-mono text-xs font-semibold text-zinc-200">
                  {maxResults}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="1"
                value={maxResults}
                disabled={isLoading}
                onChange={(e) => setMaxResults(parseInt(e.target.value, 10))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>1</span>
                <span>Default: 5</span>
                <span>20</span>
              </div>
            </div>

            {/* Minimum AI Score (0–100) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Minimum AI Score (0–100)
                </label>
                <span className="font-mono text-xs font-semibold text-zinc-200">
                  {minScore}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                disabled={isLoading}
                onChange={(e) => setMinScore(parseInt(e.target.value, 10))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1 font-mono">
                <span>0</span>
                <span>Default: 55</span>
                <span>100</span>
              </div>
            </div>
          </div>

          {/* VISUAL LOADING PROGRESS REPRESENTATION */}
          {isLoading && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0c12] p-5">
              <div className="flex items-center gap-3 mb-3">
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span className="text-xs font-semibold text-white">
                  Executing Nexora Workflow 01
                </span>
              </div>

              {/* Progress Steps */}
              <div className="space-y-2">
                {loadingStages.map((stage, idx) => {
                  const isDone = idx < loadingStep;
                  const isCurrent = idx === loadingStep;
                  return (
                    <div
                      key={stage}
                      className={`flex items-center gap-2.5 text-xs transition-opacity ${
                        isDone
                          ? 'text-emerald-400 font-medium'
                          : isCurrent
                          ? 'text-white font-semibold'
                          : 'text-zinc-600'
                      }`}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${
                          isDone
                            ? 'bg-emerald-400'
                            : isCurrent
                            ? 'bg-white animate-ping'
                            : 'bg-zinc-800'
                        }`}
                      />
                      <span>{stage}</span>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 text-[10px] text-zinc-500 border-t border-white/[0.06] pt-2 font-mono">
                Visual progress indicator while n8n queries OSM, deduplicates, AI-qualifies, and writes to CRM.
              </p>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-zinc-500 font-mono hidden sm:block">
              POST /api/nexora/discover → n8n Lead Intelligence
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-black" />
                  <span>Discovering Leads...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 text-black" />
                  <span>Find Leads</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
