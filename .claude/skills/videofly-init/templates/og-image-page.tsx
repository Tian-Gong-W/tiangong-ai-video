export const dynamic = "force-static";

export default function OGImagePage() {
  return (
    <div
      style={{
        width: 1200,
        height: 630,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(ellipse 80% 60% at 50% 40%, {{PRIMARY_COLOR}}33 0%, transparent 70%),
          radial-gradient(ellipse 40% 50% at 80% 20%, {{PRIMARY_COLOR}}22 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 20% 80%, {{PRIMARY_COLOR}}18 0%, transparent 50%),
          linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)
        `,
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        color: "#ffffff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient({{PRIMARY_COLOR}}08 1px, transparent 1px),
            linear-gradient(90deg, {{PRIMARY_COLOR}}08 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {/* Logo emoji */}
        <div style={{ fontSize: 72, lineHeight: 1 }}>{{LOGO_EMOJI}}</div>

        {/* Project name */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            margin: 0,
            background: `linear-gradient(135deg, #ffffff 0%, {{PRIMARY_COLOR}} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.02em",
          }}
        >
          {{PROJECT_NAME}}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: 28,
            fontWeight: 400,
            margin: 0,
            color: "rgba(255, 255, 255, 0.7)",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          {{DESCRIPTION}}
        </p>

        {/* Domain */}
        <p
          style={{
            fontSize: 20,
            fontWeight: 500,
            margin: 0,
            color: "{{PRIMARY_COLOR}}",
            letterSpacing: "0.05em",
          }}
        >
          {{DOMAIN}}
        </p>
      </div>
    </div>
  );
}
