/**
 * Screen Visual Diff Service (Fase 04: Motor de Comparación y Diff Visual de Pantallas Crawler)
 * Compara capturas de pantalla y jerarquías XML de UIAutomator entre versiones del crawler
 * para detectar regresiones visuales, shifts de layout y cambios estructurales.
 */

import { VisualScreenDiffReport, MobileCapturedScreen } from '../types';

export class ScreenVisualDiffService {
  private static instance: ScreenVisualDiffService;
  private reportsCache: Map<string, VisualScreenDiffReport> = new Map();

  private constructor() {}

  public static getInstance(): ScreenVisualDiffService {
    if (!ScreenVisualDiffService.instance) {
      ScreenVisualDiffService.instance = new ScreenVisualDiffService();
    }
    return ScreenVisualDiffService.instance;
  }

  /**
   * Ejecuta una comparación heurística y estructural entre dos pantallas capturadas.
   */
  public computeDiff(
    screenA: MobileCapturedScreen,
    screenB: MobileCapturedScreen,
    screenNameA = 'Versión Previa',
    screenNameB = 'Versión Actual'
  ): VisualScreenDiffReport {
    const reportId = `diff-${screenA.id}-vs-${screenB.id}`;
    if (this.reportsCache.has(reportId)) {
      return this.reportsCache.get(reportId)!;
    }

    const nodesA = screenA.boundingBoxes || [];
    const nodesB = screenB.boundingBoxes || [];

    // 1. Identificar nodos añadidos, eliminados y modificados
    const mapA = new Map(nodesA.map(n => [n.id, n]));
    const mapB = new Map(nodesB.map(n => [n.id, n]));

    let addedNodesCount = 0;
    let removedNodesCount = 0;
    let modifiedNodesCount = 0;
    let layoutShiftTotal = 0;
    const divergenceDetails: string[] = [];

    // Buscar eliminados o modificados
    for (const [id, nodeA] of mapA.entries()) {
      if (!mapB.has(id)) {
        removedNodesCount++;
        divergenceDetails.push(`[-] Elemento eliminado: <${nodeA.className}> id="${nodeA.id}" text="${nodeA.text || ''}"`);
      } else {
        const nodeB = mapB.get(id)!;
        const [x1A, y1A, x2A, y2A] = nodeA.bounds;
        const [x1B, y1B, x2B, y2B] = nodeB.bounds;

        const shiftX = Math.abs(x1A - x1B);
        const shiftY = Math.abs(y1A - y1B);
        const shift = Math.sqrt(shiftX * shiftX + shiftY * shiftY);

        if (shift > 4 || nodeA.text !== nodeB.text) {
          modifiedNodesCount++;
          layoutShiftTotal += shift;
          if (shift > 8) {
            divergenceDetails.push(`[~] Desplazamiento UI (${Math.round(shift)}px): "${nodeA.text || nodeA.id}" de [${x1A},${y1A}] a [${x1B},${y1B}]`);
          }
          if (nodeA.text !== nodeB.text) {
            divergenceDetails.push(`[T] Cambio de texto: "${nodeA.text}" ➔ "${nodeB.text}"`);
          }
        }
      }
    }

    // Buscar añadidos
    for (const [id, nodeB] of mapB.entries()) {
      if (!mapA.has(id)) {
        addedNodesCount++;
        divergenceDetails.push(`[+] Nuevo elemento detectado: <${nodeB.className}> text="${nodeB.text || ''}"`);
      }
    }

    // 2. Cálculo del porcentaje de delta visual heurístico
    const totalElements = Math.max(1, nodesA.length + nodesB.length);
    const elementDivergence = ((addedNodesCount + removedNodesCount + modifiedNodesCount) / totalElements) * 100;
    const resolutionDelta = (screenA.width !== screenB.width || screenA.height !== screenB.height) ? 15 : 0;
    const deltaPercentage = Math.min(100, Math.round((elementDivergence * 0.8 + resolutionDelta + (layoutShiftTotal > 50 ? 8 : 0)) * 10) / 10);

    const changedPixelsEstimated = Math.round((deltaPercentage / 100) * (screenA.width * screenA.height * 0.35));

    const report: VisualScreenDiffReport = {
      id: reportId,
      screenIdA: screenA.id,
      screenIdB: screenB.id,
      screenNameA,
      screenNameB,
      deltaPercentage,
      changedPixelsCount: changedPixelsEstimated,
      addedNodesCount,
      removedNodesCount,
      modifiedNodesCount,
      layoutShiftScore: Math.min(100, Math.round(layoutShiftTotal / 10)),
      divergenceDetails: divergenceDetails.length > 0 ? divergenceDetails : ['Sin discrepancias visuales significativas detectadas.'],
      auditTimestamp: new Date().toISOString()
    };

    this.reportsCache.set(reportId, report);
    return report;
  }

  /**
   * Obtiene un reporte previamente generado por su identificador.
   */
  public getReport(reportId: string): VisualScreenDiffReport | undefined {
    return this.reportsCache.get(reportId);
  }
}

export const screenVisualDiffService = ScreenVisualDiffService.getInstance();
