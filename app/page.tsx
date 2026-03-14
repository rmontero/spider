"use client";

import React, { useState, useRef, useCallback } from "react";
import SpiderGraph from "@/components/spider-graph";
import SpiderGraphEditor from "@/components/spider-graph-editor";
import { SpiderGraphState } from "@/types/spider-graph";

const DEFAULT_STATE: SpiderGraphState = {
  config: {
    title: "Skill Assessment Chart",
    backgroundColor: "#f8fafc",
    dimensions: [
      { id: "dim-1", label: "Performance" },
      { id: "dim-2", label: "Potential" },
      { id: "dim-3", label: "Contribution" },
      { id: "dim-4", label: "Leadership" },
      { id: "dim-5", label: "Creativity" },
      { id: "dim-6", label: "Skill" },
    ],
    scale: { min: 0, max: 10, step: 2 },
    showDimensionLabels: true,
    showScaleLabels: true,
    showAxisLines: true,
    showGridPolygons: true,
    showPoints: true,
    showLegend: true,
    showFilledAreas: true,
    showGridBackground: true,
  },
  series: [
    {
      id: "series-1",
      label: "Alice",
      values: [8, 7, 9, 6, 8, 7],
      color: "#6366f1",
      fillOpacity: 0.2,
      lineWidth: 2,
      show: true,
      showValues: false,
    },
    {
      id: "series-2",
      label: "Bob",
      values: [6, 8, 7, 9, 5, 8],
      color: "#ec4899",
      fillOpacity: 0.2,
      lineWidth: 2,
      show: true,
      showValues: false,
    },
    {
      id: "series-3",
      label: "Carol",
      values: [7, 6, 8, 7, 9, 6],
      color: "#10b981",
      fillOpacity: 0.2,
      lineWidth: 2,
      show: true,
      showValues: false,
    },
  ],
};

export default function Home() {
  const [state, setState] = useState<SpiderGraphState>(DEFAULT_STATE);
  const svgRef = useRef<HTMLDivElement>(null);

  const handleExportJson = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spider-graph-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state]);

  const handleImportJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as SpiderGraphState;
      if (
        parsed.config &&
        Array.isArray(parsed.config.dimensions) &&
        parsed.config.dimensions.length >= 3 &&
        Array.isArray(parsed.series)
      ) {
        setState({
          ...parsed,
          config: {
            ...parsed.config,
            title: parsed.config.title || DEFAULT_STATE.config.title,
            backgroundColor:
              parsed.config.backgroundColor || DEFAULT_STATE.config.backgroundColor,
          },
        });
      } else {
        alert("Invalid config: must have at least 3 dimensions and a series array.");
      }
    } catch {
      alert("Failed to parse JSON. Please check the file format.");
    }
  }, []);

  const handleExportSvg = useCallback(() => {
    const svgEl = svgRef.current?.querySelector("svg");
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spider-graph.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportPng = useCallback(async () => {
    const svgEl = svgRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load SVG image."));
        img.src = svgUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = svgEl.viewBox.baseVal.width || svgEl.clientWidth || 500;
      canvas.height = svgEl.viewBox.baseVal.height || svgEl.clientHeight || 500;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "spider-graph.png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch {
      alert("Failed to export PNG.");
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <polygon
                  points="8,1 15,12.5 1,12.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <polygon
                  points="8,4 12.5,11 3.5,11"
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
              </svg>
            </div>
            <span className="text-base font-semibold text-slate-900">Spider Graph Generator</span>
          </div>
          <span className="hidden sm:block text-xs text-slate-400">
            Next.js · React · TypeScript · Tailwind CSS
          </span>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
        {/* Left panel: editor */}
        <aside className="w-full lg:w-80 lg:flex-shrink-0 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:pb-8 lg:pr-1">
          <SpiderGraphEditor
            state={state}
            onChange={setState}
            onExportJson={handleExportJson}
            onImportJson={handleImportJson}
            onExportSvg={handleExportSvg}
            onExportPng={handleExportPng}
          />
        </aside>

        {/* Right panel: chart */}
        <main className="w-full flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-8 flex flex-col items-center">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-1 text-center">
              {state.config.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-6 text-center">
              {state.config.dimensions.length} dimensions ·{" "}
              {state.series.filter((s) => s.show !== false).length} series
            </p>
            <div ref={svgRef} className="w-full flex justify-center overflow-x-auto">
              <SpiderGraph
                config={state.config}
                series={state.series}
                width={500}
                height={500}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
