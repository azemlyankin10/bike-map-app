interface RouteStep {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: [number, number];
}

interface RouteSegment {
  distance: number;
  duration: number;
  steps: RouteStep[];
}

interface RouteSummary {
  distance: number;
  duration: number;
}

interface Route {
  summary: RouteSummary;
  segments: RouteSegment[];
  geometry: string;
  bbox: number[];
  way_points: number[][];
}

interface Engine {
  version: string;
  build_date: string;
  graph_date: string;
}

interface QueryOptions {
  round_trip: {
      length: number;
      points: number;
      seed: number;
  };
}

export interface IRouteQueryResponse {
  coordinates: [number, number][];
  profile: string;
  format: string;
  options: QueryOptions;
}

interface Metadata {
  attribution: string;
  service: string;
  timestamp: number;
  query: IRouteQueryResponse;
  engine: Engine;
}

export interface IRouteResponse {
  metadata: Metadata;
  bbox: number[];
  routes: Route[];
}
