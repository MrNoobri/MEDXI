import React, { useMemo } from "react";
import { MeshGradient } from "@paper-design/shaders-react";

/**
 * Animated shader mesh-gradient background that adapts to the current theme.
 * Uses CSS variable values resolved at render time.
 *
 * Usage:
 *   <ShaderBackground className="absolute inset-0" />
 */
export default function ShaderBackground({
  className = "",
  style = {},
  speed = 0.12,
}) {
  // Read current theme CSS variables and resolve to actual colors
  const colors = useMemo(() => {
    const root = document.documentElement;
    const get = (v, fallback) =>
      getComputedStyle(root).getPropertyValue(v).trim() || fallback;

    // Resolve HSL custom-property channels to usable hsl() strings
    const hsl = (channels) => `hsl(${channels})`;

    const bg = hsl(get("--background", "220 20% 10%"));
    const primary = hsl(get("--primary", "220 80% 50%"));
    const secondary = hsl(get("--secondary", "200 70% 55%"));
    const accent = hsl(get("--accent", "140 60% 50%"));

    return [bg, primary, secondary, accent];
  }, []);

  return (
    <div className={className} style={{ overflow: "hidden", ...style }}>
      <MeshGradient
        color1={colors[0]}
        color2={colors[1]}
        color3={colors[2]}
        color4={colors[3]}
        speed={speed}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
        }}
      />
    </div>
  );
}
