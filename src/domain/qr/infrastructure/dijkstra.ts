import * as dijkstrajs from "dijkstrajs";

export interface Graph {
  [key: string]: { [key: string]: number };
}

export function find_path(graph: Graph, start: string, end: string): string[] {
  return dijkstrajs.find_path(graph, start, end);
}
