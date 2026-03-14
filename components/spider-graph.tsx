"use client";

import React, { useMemo, useState } from "react";
import { SpiderGraphConfig, Series } from "@/types/spider-graph";
import {
  getScalePolygons,
  getSeriesPoints,
  pointsToSvgString,
  getLabelPosition,
  getLabelAlignment,
  getScaleLabelValue,
  getAxisAngle,
} from "@/lib/spider-graph-geometry";

interface SpiderGraphProps {
  config: SpiderGraphConfig;
  series: Series[];
  width?: number;
  height?: number;
  className?: string;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: number;
  seriesLabel: string;
  color: string;
}

export default function SpiderGraph({
  config,
  series,
  width = 500,
  height = 500,
  className = "",
}: SpiderGraphProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: "",
    value: 0,
    seriesLabel: "",
    color: "",
  });

  const cx = width / 2;
  const cy = height / 2;
  // Leave room for labels on all sides
  const maxRadius = Math.min(width, height) / 2 - 60;

  const { dimensions, scale } = config;
  const numDimensions = dimensions.length;
  const totalSteps = Math.max(
    1,
    Math.round((scale.max - scale.min) / Math.max(scale.step, 0.001))
  );

  const scalePolygons = useMemo(
    () => getScalePolygons(dimensions, scale, maxRadius, cx, cy),
    [dimensions, scale, maxRadius, cx, cy]
  );

  const seriesData = useMemo(
    () =>
      series
        .filter((s) => s.show !== false)
        .map((s) => {
          // Ensure values array matches dimension count
          const values = dimensions.map((_, i) => s.values[i] ?? scale.min);
          const points = getSeriesPoints(values, scale, maxRadius, cx, cy);
          return { ...s, values, points };
        }),
    [series, dimensions, scale, maxRadius, cx, cy]
  );

  if (numDimensions < 3) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        At least 3 dimensions are required.
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-label="Spider Graph"
        role="img"
      >
        {/* Optional grid background */}
        {config.showGridBackground && (
          <rect x={0} y={0} width={width} height={height} fill="#f8fafc" rx={8} />
        )}

        {/* Concentric polygons (scale rings) */}
        {config.showGridPolygons &&
          scalePolygons.map((poly, levelIdx) => (
            <polygon
              key={`grid-${levelIdx}`}
              points={pointsToSvgString(poly)}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          ))}

        {/* Scale labels on first axis */}
        {config.showScaleLabels &&
          scalePolygons.map((poly, levelIdx) => {
            const firstPoint = poly[0];
            const value = getScaleLabelValue(levelIdx, totalSteps, scale);
            return (
              <text
                key={`scale-label-${levelIdx}`}
                x={firstPoint.x + 4}
                y={firstPoint.y}
                fontSize={10}
                fill="#94a3b8"
                dominantBaseline="middle"
                textAnchor="start"
              >
                {Number.isInteger(value) ? value : value.toFixed(1)}
              </text>
            );
          })}

        {/* Axis lines */}
        {config.showAxisLines &&
          dimensions.map((_, i) => {
            const angle = getAxisAngle(i, numDimensions);
            const endX = cx + maxRadius * Math.cos(angle);
            const endY = cy + maxRadius * Math.sin(angle);
            return (
              <line
                key={`axis-${i}`}
                x1={cx}
                y1={cy}
                x2={endX}
                y2={endY}
                stroke="#cbd5e1"
                strokeWidth={1}
              />
            );
          })}

        {/* Filled areas for each series (rendered before lines/points) */}
        {config.showFilledAreas &&
          seriesData.map((s) => (
            <polygon
              key={`fill-${s.id}`}
              points={pointsToSvgString(s.points)}
              fill={s.fillColor ?? s.color}
              fillOpacity={s.fillOpacity ?? 0.2}
              stroke="none"
            />
          ))}

        {/* Series polygons (outlines) */}
        {seriesData.map((s) => (
          <polygon
            key={`series-${s.id}`}
            points={pointsToSvgString(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth={s.lineWidth ?? 2}
            strokeLinejoin="round"
          />
        ))}

        {/* Points and value labels for each series */}
        {seriesData.map((s) =>
          s.points.map((pt, i) => (
            <g key={`point-${s.id}-${i}`}>
              {config.showPoints && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={5}
                  fill={s.color}
                  stroke="#fff"
                  strokeWidth={1.5}
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setTooltip({
                      visible: true,
                      x: pt.x,
                      y: pt.y,
                      label: dimensions[i]?.label ?? `Dim ${i + 1}`,
                      value: s.values[i],
                      seriesLabel: s.label,
                      color: s.color,
                    });
                  }}
                  onMouseLeave={() =>
                    setTooltip((prev) => ({ ...prev, visible: false }))
                  }
                />
              )}
              {s.showValues && (
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  fontSize={10}
                  fill={s.color}
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontWeight="600"
                >
                  {s.values[i]}
                </text>
              )}
            </g>
          ))
        )}

        {/* Dimension labels */}
        {config.showDimensionLabels &&
          dimensions.map((dim, i) => {
            const { x, y, angle } = getLabelPosition(
              i,
              numDimensions,
              maxRadius,
              cx,
              cy,
              24
            );
            const { textAnchor, dominantBaseline } = getLabelAlignment(angle);
            return (
              <text
                key={`dim-label-${dim.id}`}
                x={x}
                y={y}
                fontSize={13}
                fontWeight="600"
                fill="#1e293b"
                textAnchor={textAnchor as "middle" | "start" | "end"}
                dominantBaseline={dominantBaseline as "middle" | "auto" | "hanging"}
              >
                {dim.label}
              </text>
            );
          })}

        {/* SVG Tooltip */}
        {tooltip.visible && (
          <g>
            <rect
              x={tooltip.x + 10}
              y={tooltip.y - 36}
              width={130}
              height={40}
              rx={6}
              fill="white"
              stroke="#e2e8f0"
              strokeWidth={1}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
            />
            <text
              x={tooltip.x + 18}
              y={tooltip.y - 20}
              fontSize={11}
              fill="#64748b"
              dominantBaseline="middle"
            >
              {tooltip.seriesLabel}: {tooltip.label}
            </text>
            <text
              x={tooltip.x + 18}
              y={tooltip.y - 6}
              fontSize={12}
              fontWeight="700"
              fill={tooltip.color}
              dominantBaseline="middle"
            >
              {tooltip.value}
            </text>
          </g>
        )}
      </svg>

      {/* Legend */}
      {config.showLegend && (
        <div className="flex flex-wrap justify-center gap-4 mt-3">
          {series
            .filter((s) => s.show !== false)
            .map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <span
                  className="inline-block w-4 h-1 rounded"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-slate-700 font-medium">{s.label}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
