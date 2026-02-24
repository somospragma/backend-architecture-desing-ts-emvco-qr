declare module "dijkstrajs" {
  export function find_path(
    graph: { [key: string]: { [key: string]: number } },
    start: string,
    end: string
  ): string[];

  export function single_source_shortest_paths(
    graph: { [key: string]: { [key: string]: number } },
    start: string,
    end?: string
  ): { [key: string]: number };
}
