import Link from "next/link";

export default function RootNotFound() {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>404</h1>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>Page not found</p>
        <Link
          href="/en"
          style={{
            marginTop: "1rem",
            display: "inline-block",
            color: "#d97706",
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
