import React, { useState, useCallback } from "react";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

/**
 * Persistent key for saving layouts to localStorage.
 */
const STORAGE_KEY = "medxi_metrics_layout";

/**
 * Wrapper that makes child widgets draggable and resizable.
 *
 * Each child MUST have a unique `key` prop and optionally
 * a `data-grid` prop with { x, y, w, h, minW, minH }.
 */
export default function DraggableGrid({
  children,
  cols = { lg: 4, md: 3, sm: 2, xs: 1 },
  rowHeight = 220,
  className = "",
  compactType = "vertical",
  isResizable = true,
  isDraggable = true,
  persistLayout = true,
  onDragStart,
  onDragStop,
  onLayoutChange: onLayoutChangeProp,
}) {
  // useContainerWidth returns { width, mounted, containerRef, measureWidth }
  const { width, mounted, containerRef } = useContainerWidth({
    initialWidth: 1280,
  });

  // Try to load saved layout from localStorage (only when persistence is enabled)
  const [savedLayouts, setSavedLayouts] = useState(() => {
    if (!persistLayout) return {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleLayoutChange = useCallback(
    (layout, allLayouts) => {
      // Notify parent with the single-breakpoint layout
      if (onLayoutChangeProp) onLayoutChangeProp(layout);

      if (!persistLayout) return;
      setSavedLayouts(allLayouts);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allLayouts));
      } catch {
        /* storage full — ignore */
      }
    },
    [persistLayout, onLayoutChangeProp],
  );

  return (
    <div ref={containerRef} className={`dashboard-grid ${className}`}>
      {mounted && width > 0 && (
        <ResponsiveGridLayout
          width={width}
          layouts={
            persistLayout && Object.keys(savedLayouts).length > 0
              ? savedLayouts
              : undefined
          }
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
          cols={cols}
          rowHeight={rowHeight}
          compactType={compactType}
          isResizable={isResizable}
          isDraggable={isDraggable}
          onLayoutChange={handleLayoutChange}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          margin={[16, 16]}
          containerPadding={[0, 0]}
        >
          {children}
        </ResponsiveGridLayout>
      )}
    </div>
  );
}
