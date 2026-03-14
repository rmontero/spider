export type Dimension = {
  id: string;
  label: string;
};

export type ScaleConfig = {
  min: number;
  max: number;
  step: number;
};

export type Series = {
  id: string;
  label: string;
  values: number[];
  color: string;
  fillColor?: string;
  fillOpacity?: number;
  lineWidth?: number;
  show?: boolean;
  showValues?: boolean;
};

export type SpiderGraphConfig = {
  title: string;
  dimensions: Dimension[];
  scale: ScaleConfig;
  showDimensionLabels: boolean;
  showScaleLabels: boolean;
  showAxisLines: boolean;
  showGridPolygons: boolean;
  showPoints: boolean;
  showLegend: boolean;
  showFilledAreas: boolean;
  showGridBackground: boolean;
};

export type SpiderGraphState = {
  config: SpiderGraphConfig;
  series: Series[];
};
