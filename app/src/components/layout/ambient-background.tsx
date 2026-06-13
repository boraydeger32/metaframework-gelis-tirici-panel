"use client";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Base */}
      <div className="absolute inset-0 bg-[#050510]" />

      {/* Floating orbs */}
      <div
        className="ambient-orb"
        style={{
          width: "600px",
          height: "600px",
          top: "-10%",
          left: "20%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
          animationDelay: "0s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: "500px",
          height: "500px",
          bottom: "10%",
          right: "10%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
          animationDelay: "-7s",
        }}
      />
      <div
        className="ambient-orb"
        style={{
          width: "400px",
          height: "400px",
          top: "40%",
          left: "-5%",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)",
          animationDelay: "-14s",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />
    </div>
  );
}
