/**
 * Layout Optimizer
 *
 * Intelligent layout algorithm for dashboard widgets.
 * Finds optimal positions for new widgets by:
 * - Filling gaps in existing layout
 * - Prioritizing top-left positions
 * - Aligning with existing widgets
 * - Avoiding creation of unusable small gaps
 */

import type { WidgetConfig, WidgetDefinition } from '../widgets/types';

interface PlacementCandidate {
    x: number;
    y: number;
    score: number;
}

class LayoutOptimizer {
    private gridCols = 12;

    /**
     * Build a 2D occupancy map from existing widgets
     */
    private buildOccupancyMap(widgets: WidgetConfig[]): boolean[][] {
        // Find the maximum Y coordinate to determine map height
        const maxY = widgets
            .filter((w) => w.position)
            .reduce((max, w) => Math.max(max, w.position.y + w.position.h), 0);

        // Create map with extra rows for new widgets
        const mapHeight = maxY + 10;
        const map: boolean[][] = Array(mapHeight)
            .fill(null)
            .map(() => Array(this.gridCols).fill(false));

        // Mark occupied cells
        widgets.forEach((widget) => {
            if (!widget.position) return;
            const { x, y, w, h } = widget.position;
            for (let row = y; row < y + h && row < mapHeight; row++) {
                for (let col = x; col < x + w && col < this.gridCols; col++) {
                    map[row][col] = true;
                }
            }
        });

        return map;
    }

    /**
     * Check if a widget can be placed at the given position
     */
    private canPlaceAt(
        map: boolean[][],
        x: number,
        y: number,
        w: number,
        h: number
    ): boolean {
        // Check bounds
        if (x < 0 || x + w > this.gridCols || y < 0 || y + h > map.length) {
            return false;
        }

        // Check if all cells are free
        for (let row = y; row < y + h; row++) {
            for (let col = x; col < x + w; col++) {
                if (map[row][col]) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Check if placing a widget at this position fills a gap
     */
    private isFillingGap(
        x: number,
        y: number,
        w: number,
        h: number,
        map: boolean[][]
    ): boolean {
        // Check if there are occupied cells above or to the left
        let hasOccupiedAbove = false;
        let hasOccupiedLeft = false;

        // Check above
        if (y > 0) {
            for (let col = x; col < x + w && col < this.gridCols; col++) {
                if (map[y - 1][col]) {
                    hasOccupiedAbove = true;
                    break;
                }
            }
        }

        // Check left
        if (x > 0) {
            for (let row = y; row < y + h && row < map.length; row++) {
                if (map[row][x - 1]) {
                    hasOccupiedLeft = true;
                    break;
                }
            }
        }

        return hasOccupiedAbove || hasOccupiedLeft;
    }

    /**
     * Calculate alignment bonus for position
     */
    private calculateAlignmentBonus(
        x: number,
        y: number,
        w: number,
        map: boolean[][]
    ): number {
        let bonus = 0;

        // Check left edge alignment
        if (x === 0) {
            bonus += 50; // Strong preference for left edge
        } else if (x > 0) {
            // Check if left edge aligns with any occupied cell above
            for (let row = 0; row < y && row < map.length; row++) {
                if (map[row][x] && (x === 0 || !map[row][x - 1])) {
                    bonus += 30;
                    break;
                }
            }
        }

        // Check right edge alignment
        const rightEdge = x + w;
        if (rightEdge === this.gridCols) {
            bonus += 40; // Preference for right edge
        } else if (rightEdge < this.gridCols) {
            // Check if right edge aligns with any occupied cell above
            for (let row = 0; row < y && row < map.length; row++) {
                if (map[row][rightEdge] && (rightEdge === 0 || !map[row][rightEdge - 1])) {
                    bonus += 30;
                    break;
                }
            }
        }

        return bonus;
    }

    /**
     * Calculate penalty for creating small unusable gaps
     */
    private calculateGapPenalty(
        x: number,
        y: number,
        w: number,
        h: number,
        map: boolean[][]
    ): number {
        let penalty = 0;

        // Check gap to the right
        const rightEdge = x + w;
        if (rightEdge < this.gridCols) {
            const gapWidth = this.gridCols - rightEdge;

            // Check if there's an occupied cell to the right
            let hasOccupiedRight = false;
            for (let row = y; row < y + h && row < map.length; row++) {
                for (let col = rightEdge; col < this.gridCols; col++) {
                    if (map[row][col]) {
                        hasOccupiedRight = true;
                        break;
                    }
                }
                if (hasOccupiedRight) break;
            }

            // Penalize small gaps (1 column is unusable)
            if (hasOccupiedRight && gapWidth === 1) {
                penalty += 200;
            } else if (hasOccupiedRight && gapWidth === 2) {
                penalty += 100; // 2 columns is barely usable
            }
        }

        return penalty;
    }

    /**
     * Score a potential position
     * Higher score = better position
     */
    private scorePosition(
        x: number,
        y: number,
        w: number,
        h: number,
        map: boolean[][]
    ): number {
        let score = 10000; // Base score

        // Vertical position penalty (prefer top)
        score -= y * 100;

        // Horizontal position penalty (prefer left)
        score -= x * 10;

        // Bonus for filling gaps
        if (this.isFillingGap(x, y, w, h, map)) {
            score += 500;
        }

        // Alignment bonus
        score += this.calculateAlignmentBonus(x, y, w, map);

        // Gap penalty
        score -= this.calculateGapPenalty(x, y, w, h, map);

        return score;
    }

    /**
     * Find all available positions for a widget
     */
    private findAvailablePositions(
        map: boolean[][],
        width: number,
        height: number
    ): PlacementCandidate[] {
        const candidates: PlacementCandidate[] = [];

        // Scan the grid for available positions
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x <= this.gridCols - width; x++) {
                if (this.canPlaceAt(map, x, y, width, height)) {
                    const score = this.scorePosition(x, y, width, height, map);
                    candidates.push({ x, y, score });
                }
            }
        }

        return candidates;
    }

    /**
     * Find the best position for a new widget
     * Returns the optimal position and alternative candidates
     */
    findBestPosition(
        widgets: WidgetConfig[],
        widgetDef: WidgetDefinition
    ): {
        x: number;
        y: number;
        alternatives: PlacementCandidate[];
    } {
        const { w, h } = widgetDef.defaultSize;

        // Build occupancy map
        const map = this.buildOccupancyMap(widgets);

        // Find all available positions
        const candidates = this.findAvailablePositions(map, w, h);

        if (candidates.length === 0) {
            // No space found - this shouldn't happen with our map expansion
            // Fall back to bottom of layout
            const maxY = widgets
                .filter((widget) => widget.position)
                .reduce((max, widget) => Math.max(max, widget.position.y + widget.position.h), 0);

            return {
                x: 0,
                y: maxY,
                alternatives: [],
            };
        }

        // Sort by score (descending)
        candidates.sort((a, b) => b.score - a.score);

        // Return best position and alternatives
        const best = candidates[0];
        return {
            x: best.x,
            y: best.y,
            alternatives: candidates.slice(1, 5), // Top 5 alternatives
        };
    }
}

// Export singleton instance
export const layoutOptimizer = new LayoutOptimizer();
