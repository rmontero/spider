"use client";

import React, { useId } from "react";
import { SpiderGraphConfig, SpiderGraphState, Series, Dimension } from "@/types/spider-graph";
import { nanoid } from "nanoid";

interface SpiderGraphEditorProps {
  state: SpiderGraphState;
  onChange: (state: SpiderGraphState) => void;
  onExportJson?: () => void;
  onImportJson?: (json: string) => void;
  onExportSvg?: () => void;
}

// Reusable toggle switch component
function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-10 h-5 rounded-full transition-colors ${
            checked ? "bg-indigo-500" : "bg-slate-300"
          }`}
        />
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

// Reusable section card
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

const SERIES_COLORS = [
  "#6366f1",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
];

export default function SpiderGraphEditor({
  state,
  onChange,
  onExportJson,
  onImportJson,
  onExportSvg,
}: SpiderGraphEditorProps) {
  const uid = useId();
  const { config, series } = state;

  function updateConfig(updates: Partial<SpiderGraphConfig>) {
    onChange({ ...state, config: { ...config, ...updates } });
  }

  function updateSeries(updatedSeries: Series[]) {
    onChange({ ...state, series: updatedSeries });
  }

  // ——— Dimensions ———

  function addDimension() {
    const newDim: Dimension = { id: nanoid(), label: `Dimension ${config.dimensions.length + 1}` };
    const updatedDims = [...config.dimensions, newDim];
    const updatedSeries = series.map((s) => ({
      ...s,
      values: [...s.values, config.scale.min],
    }));
    onChange({
      ...state,
      config: { ...config, dimensions: updatedDims },
      series: updatedSeries,
    });
  }

  function removeDimension(id: string) {
    if (config.dimensions.length <= 3) return;
    const idx = config.dimensions.findIndex((d) => d.id === id);
    const updatedDims = config.dimensions.filter((d) => d.id !== id);
    const updatedSeries = series.map((s) => ({
      ...s,
      values: s.values.filter((_, i) => i !== idx),
    }));
    onChange({
      ...state,
      config: { ...config, dimensions: updatedDims },
      series: updatedSeries,
    });
  }

  function updateDimensionLabel(id: string, label: string) {
    updateConfig({
      dimensions: config.dimensions.map((d) => (d.id === id ? { ...d, label } : d)),
    });
  }

  // ——— Series ———

  function addSeries() {
    const colorIdx = series.length % SERIES_COLORS.length;
    const newSeries: Series = {
      id: nanoid(),
      label: `Series ${series.length + 1}`,
      values: config.dimensions.map(() => config.scale.min),
      color: SERIES_COLORS[colorIdx],
      fillOpacity: 0.2,
      lineWidth: 2,
      show: true,
      showValues: false,
    };
    updateSeries([...series, newSeries]);
  }

  function removeSeries(id: string) {
    if (series.length <= 1) return;
    updateSeries(series.filter((s) => s.id !== id));
  }

  function updateSeriesField<K extends keyof Series>(id: string, field: K, value: Series[K]) {
    updateSeries(series.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }

  function updateSeriesValue(seriesId: string, dimIndex: number, value: number) {
    updateSeries(
      series.map((s) => {
        if (s.id !== seriesId) return s;
        const newValues = [...s.values];
        newValues[dimIndex] = value;
        return { ...s, values: newValues };
      })
    );
  }

  // ——— Import ———
  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      onImportJson?.(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const scaleSteps = Math.max(
    1,
    Math.round((config.scale.max - config.scale.min) / Math.max(config.scale.step, 0.001))
  );

  return (
    <div className="space-y-4 text-slate-800">
      {/* Export / Import buttons */}
      <div className="flex flex-wrap gap-2">
        {onExportSvg && (
          <button
            onClick={onExportSvg}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            ↓ SVG
          </button>
        )}
        {onExportJson && (
          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
          >
            ↓ JSON
          </button>
        )}
        {onImportJson && (
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer">
            ↑ Import JSON
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
        )}
      </div>

      {/* Dimensions */}
      <Section title="Dimensions">
        <div className="space-y-2">
          {config.dimensions.map((dim, idx) => (
            <div key={dim.id} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-5 text-right">{idx + 1}</span>
              <input
                type="text"
                value={dim.label}
                onChange={(e) => updateDimensionLabel(dim.id, e.target.value)}
                className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                placeholder="Dimension label"
              />
              <button
                onClick={() => removeDimension(dim.id)}
                disabled={config.dimensions.length <= 3}
                className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
                title="Remove dimension"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addDimension}
          className="w-full py-1.5 text-sm font-medium rounded-lg border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          + Add Dimension
        </button>
      </Section>

      {/* Scale */}
      <Section title="Scale">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Min</label>
            <input
              type="number"
              value={config.scale.min}
              onChange={(e) =>
                updateConfig({ scale: { ...config.scale, min: parseFloat(e.target.value) || 0 } })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Max</label>
            <input
              type="number"
              value={config.scale.max}
              onChange={(e) =>
                updateConfig({ scale: { ...config.scale, max: parseFloat(e.target.value) || 10 } })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Step</label>
            <input
              type="number"
              value={config.scale.step}
              min={0.1}
              onChange={(e) =>
                updateConfig({
                  scale: { ...config.scale, step: parseFloat(e.target.value) || 1 },
                })
              }
              className="w-full px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
            />
          </div>
        </div>
        <p className="text-xs text-slate-400">
          {scaleSteps} ring{scaleSteps !== 1 ? "s" : ""} (
          {config.scale.min} – {config.scale.max}, step {config.scale.step})
        </p>
      </Section>

      {/* Series */}
      <Section title="Series">
        <div className="space-y-4">
          {series.map((s) => (
            <div
              key={s.id}
              className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50"
            >
              {/* Series header */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={s.color}
                  onChange={(e) => updateSeriesField(s.id, "color", e.target.value)}
                  className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5 bg-white"
                  title="Series color"
                />
                <input
                  type="text"
                  value={s.label}
                  onChange={(e) => updateSeriesField(s.id, "label", e.target.value)}
                  className="flex-1 px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                />
                <button
                  onClick={() => removeSeries(s.id)}
                  disabled={series.length <= 1}
                  className="p-1 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded"
                  title="Remove series"
                >
                  ✕
                </button>
              </div>

              {/* Series toggles */}
              <div className="flex flex-wrap gap-3">
                <Toggle
                  id={`${uid}-show-${s.id}`}
                  checked={s.show !== false}
                  onChange={(v) => updateSeriesField(s.id, "show", v)}
                  label="Visible"
                />
                <Toggle
                  id={`${uid}-vals-${s.id}`}
                  checked={s.showValues === true}
                  onChange={(v) => updateSeriesField(s.id, "showValues", v)}
                  label="Values"
                />
              </div>

              {/* Per-dimension values */}
              <div className="space-y-1.5">
                {config.dimensions.map((dim, i) => (
                  <div key={dim.id} className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-24 truncate" title={dim.label}>
                      {dim.label}
                    </span>
                    <input
                      type="range"
                      min={config.scale.min}
                      max={config.scale.max}
                      step={config.scale.step}
                      value={s.values[i] ?? config.scale.min}
                      onChange={(e) => updateSeriesValue(s.id, i, parseFloat(e.target.value))}
                      className="flex-1 accent-indigo-500"
                    />
                    <span className="text-xs font-mono text-slate-600 w-8 text-right">
                      {s.values[i] ?? config.scale.min}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addSeries}
          className="w-full py-1.5 text-sm font-medium rounded-lg border border-dashed border-indigo-300 text-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          + Add Series
        </button>
      </Section>

      {/* Display toggles */}
      <Section title="Display Options">
        <div className="grid grid-cols-1 gap-2.5">
          <Toggle
            id={`${uid}-dim-labels`}
            checked={config.showDimensionLabels}
            onChange={(v) => updateConfig({ showDimensionLabels: v })}
            label="Dimension labels"
          />
          <Toggle
            id={`${uid}-scale-labels`}
            checked={config.showScaleLabels}
            onChange={(v) => updateConfig({ showScaleLabels: v })}
            label="Scale labels"
          />
          <Toggle
            id={`${uid}-axis-lines`}
            checked={config.showAxisLines}
            onChange={(v) => updateConfig({ showAxisLines: v })}
            label="Axis lines"
          />
          <Toggle
            id={`${uid}-grid-polygons`}
            checked={config.showGridPolygons}
            onChange={(v) => updateConfig({ showGridPolygons: v })}
            label="Concentric polygons"
          />
          <Toggle
            id={`${uid}-filled-areas`}
            checked={config.showFilledAreas}
            onChange={(v) => updateConfig({ showFilledAreas: v })}
            label="Filled areas"
          />
          <Toggle
            id={`${uid}-points`}
            checked={config.showPoints}
            onChange={(v) => updateConfig({ showPoints: v })}
            label="Point markers"
          />
          <Toggle
            id={`${uid}-legend`}
            checked={config.showLegend}
            onChange={(v) => updateConfig({ showLegend: v })}
            label="Legend"
          />
          <Toggle
            id={`${uid}-grid-bg`}
            checked={config.showGridBackground}
            onChange={(v) => updateConfig({ showGridBackground: v })}
            label="Grid background"
          />
        </div>
      </Section>
    </div>
  );
}
