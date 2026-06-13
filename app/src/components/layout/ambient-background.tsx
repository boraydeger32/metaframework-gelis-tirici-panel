"use client";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#050510]" />

      {/* Larger, more vivid orbs — Apple uses bold color bleed */}
      <div
        className="ambient-orb"
        style={{
          width: "800px",
          height: "800px",
          top: "-15%",
          left: "15%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(99, 102, 241, 0.02) 50%, transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: "700px",
          height: "700px",
          bottom: "5%",
          right: "5%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.10) 0%, rgba(139, 92, 246, 0.02) 50%, transparent 70%)",
          animationDelay: "-8s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: "500px",
          height: "500px",
          top: "35%",
          left: "-8%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%)",
          animationDelay: "-16s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: "400px",
          height: "400px",
          top: "60%",
          right: "30%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, transparent 60%)",
          animationDelay: "-12s",
          animationDuration: "30s",
        }}
      />

      {/* Noise texture — gives glass that frosted texture */}
      <div className="noise-overlay" />
    </div>
  );
}
