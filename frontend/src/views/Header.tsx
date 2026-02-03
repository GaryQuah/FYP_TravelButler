import { useUser } from "../models/UserContext";

export function Header() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        background: "#fff",
        padding: "10px",
        borderBottom: "1px solid #ccc",
        zIndex: 1000,
      }}
    >
      <div>Welcome, {user.name}!</div>
    </header>
  );
}
