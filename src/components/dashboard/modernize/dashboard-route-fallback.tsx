export function DashboardRouteFallback() {
  return (
    <div
      className="dashboard-root"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        background: "#F6F9FC",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 28,
            height: 28,
            border: "3px solid #ECF2FF",
            borderTopColor: "#5D87FF",
            borderRadius: "50%",
            margin: "0 auto 12px",
            animation: "dash-spin 0.8s linear infinite",
          }}
        />
        <p style={{ margin: 0, fontSize: 14, color: "#5A6A85" }}>
          Loading dashboard…
        </p>
      </div>
      <style>{`@keyframes dash-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
