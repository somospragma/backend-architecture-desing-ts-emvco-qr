import { Mode, NUMERIC, ALPHANUMERIC, BYTE, KANJI, getCharCountIndicator, getBestModeForData, from as modeFrom, toString as modeToString } from "../value-objects/encoding-mode";
import { NumericData } from "../entities/data-segments/numeric-data";
import { AlphanumericData } from "../entities/data-segments/alphanumeric-data";
import { ByteData } from "../entities/data-segments/byte-data";
import { KanjiData } from "../entities/data-segments/kanji-data";
import * as Regex from "./regex";
import { isKanjiModeEnabled } from "./qr-utils";
import * as dijkstra from "./dijkstra";

interface SegmentData {
  data: string;
  mode: Mode;
  length: number;
}

interface SegmentWithIndex extends SegmentData {
  index: number;
}

function getStringByteLength(str: string): number {
  return unescape(encodeURIComponent(str)).length;
}

function getSegments(regex: RegExp, mode: Mode, str: string): SegmentWithIndex[] {
  const segments: SegmentWithIndex[] = [];
  let result: RegExpExecArray | null;

  while ((result = regex.exec(str)) !== null) {
    segments.push({
      data: result[0],
      index: result.index,
      mode: mode,
      length: result[0].length,
    });
  }

  return segments;
}

function getSegmentsFromString(dataStr: string): SegmentData[] {
  const numSegs = getSegments(Regex.NUMERIC, NUMERIC, dataStr);
  const alphaNumSegs = getSegments(Regex.ALPHANUMERIC, ALPHANUMERIC, dataStr);
  let byteSegs: SegmentWithIndex[];
  let kanjiSegs: SegmentWithIndex[];

  if (isKanjiModeEnabled()) {
    byteSegs = getSegments(Regex.BYTE, BYTE, dataStr);
    kanjiSegs = getSegments(Regex.KANJI, KANJI, dataStr);
  } else {
    byteSegs = getSegments(Regex.BYTE_KANJI, BYTE, dataStr);
    kanjiSegs = [];
  }

  const segs = numSegs.concat(alphaNumSegs, byteSegs, kanjiSegs);

  return segs
    .sort((s1, s2) => s1.index - s2.index)
    .map((obj) => ({
      data: obj.data,
      mode: obj.mode,
      length: obj.length,
    }));
}

function getSegmentBitsLength(length: number, mode: Mode): number {
  switch (mode) {
    case NUMERIC:
      return NumericData.getBitsLength(length);
    case ALPHANUMERIC:
      return AlphanumericData.getBitsLength(length);
    case KANJI:
      return KanjiData.getBitsLength(length);
    case BYTE:
      return ByteData.getBitsLength(length);
  }
  throw new Error("Encoding mode is not supported");
}

function mergeSegments(segs: SegmentData[]): SegmentData[] {
  return segs.reduce((acc: SegmentData[], curr) => {
    const prevSeg = acc.length - 1 >= 0 ? acc[acc.length - 1] : null;
    if (prevSeg && prevSeg.mode === curr.mode) {
      acc[acc.length - 1].data += curr.data;
      return acc;
    }

    acc.push(curr);
    return acc;
  }, []);
}

function buildNodes(segs: SegmentData[]): SegmentData[][] {
  const nodes: SegmentData[][] = [];
  for (let i = 0; i < segs.length; i++) {
    const seg = segs[i];

    switch (seg.mode) {
      case NUMERIC:
        nodes.push([
          seg,
          { data: seg.data, mode: ALPHANUMERIC, length: seg.length },
          { data: seg.data, mode: BYTE, length: seg.length },
        ]);
        break;
      case ALPHANUMERIC:
        nodes.push([
          seg,
          { data: seg.data, mode: BYTE, length: seg.length },
        ]);
        break;
      case KANJI:
        nodes.push([
          seg,
          {
            data: seg.data,
            mode: BYTE,
            length: getStringByteLength(seg.data),
          },
        ]);
        break;
      case BYTE:
        nodes.push([
          {
            data: seg.data,
            mode: BYTE,
            length: getStringByteLength(seg.data),
          },
        ]);
    }
  }

  return nodes;
}

function buildGraph(
  nodes: SegmentData[][],
  version: number
): { map: dijkstra.Graph; table: { [key: string]: { node: SegmentData; lastCount: number } } } {
  const table: { [key: string]: { node: SegmentData; lastCount: number } } = {};
  const graph: dijkstra.Graph = { start: {} };
  let prevNodeIds = ["start"];

  for (let i = 0; i < nodes.length; i++) {
    const nodeGroup = nodes[i];
    const currentNodeIds: string[] = [];

    for (let j = 0; j < nodeGroup.length; j++) {
      const node = nodeGroup[j];
      const key = `${i}${j}`;

      currentNodeIds.push(key);
      table[key] = { node: node, lastCount: 0 };
      graph[key] = {};

      for (let n = 0; n < prevNodeIds.length; n++) {
        const prevNodeId = prevNodeIds[n];

        if (table[prevNodeId] && table[prevNodeId].node.mode === node.mode) {
          graph[prevNodeId][key] =
            getSegmentBitsLength(
              table[prevNodeId].lastCount + node.length,
              node.mode
            ) - getSegmentBitsLength(table[prevNodeId].lastCount, node.mode);

          table[prevNodeId].lastCount += node.length;
        } else {
          if (table[prevNodeId]) table[prevNodeId].lastCount = node.length;

          graph[prevNodeId][key] =
            getSegmentBitsLength(node.length, node.mode) +
            4 +
            getCharCountIndicator(node.mode, version);
        }
      }
    }

    prevNodeIds = currentNodeIds;
  }

  for (let n = 0; n < prevNodeIds.length; n++) {
    graph[prevNodeIds[n]].end = 0;
  }

  return { map: graph, table: table };
}

function buildSingleSegment(data: string, modesHint: Mode | null): NumericData | AlphanumericData | ByteData | KanjiData {
  let mode: Mode;
  const bestMode = getBestModeForData(data);

  mode = modeFrom(modesHint, bestMode);

  if (mode !== BYTE && mode.bit < bestMode.bit) {
    throw new Error(
      `Data "${data}" cannot be encoded using ${modeToString(mode)} mode. Recommended mode: ${modeToString(bestMode)}`
    );
  }

  if (mode === KANJI && !isKanjiModeEnabled()) {
    mode = BYTE;
  }

  switch (mode) {
    case NUMERIC:
      return new NumericData(data);
    case ALPHANUMERIC:
      return new AlphanumericData(data);
    case KANJI:
      return new KanjiData(data);
    case BYTE:
      return new ByteData(data);
  }
  throw new Error("Unsupported encoding mode");
}

export function fromArray(array: (string | { data: string; mode?: Mode })[]): (NumericData | AlphanumericData | ByteData | KanjiData)[] {
  return array.reduce((acc: (NumericData | AlphanumericData | ByteData | KanjiData)[], seg) => {
    if (typeof seg === "string") {
      acc.push(buildSingleSegment(seg, null));
    } else if (seg.data) {
      acc.push(buildSingleSegment(seg.data, seg.mode || null));
    }

    return acc;
  }, []);
}

export function fromString(data: string, version: number): (NumericData | AlphanumericData | ByteData | KanjiData)[] {
  const segs = getSegmentsFromString(data);

  const nodes = buildNodes(segs);
  const graph = buildGraph(nodes, version);
  const path = dijkstra.find_path(graph.map, "start", "end");

  const optimizedSegs: SegmentData[] = [];
  for (let i = 1; i < path.length - 1; i++) {
    optimizedSegs.push(graph.table[path[i]].node);
  }

  return fromArray(mergeSegments(optimizedSegs));
}

export function rawSplit(data: string): (NumericData | AlphanumericData | ByteData | KanjiData)[] {
  return fromArray(getSegmentsFromString(data));
}
