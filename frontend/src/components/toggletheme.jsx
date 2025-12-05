import { useEffect, useState } from "react";

export default function ToggleTheme() {
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)} style={{
      background: "var(--card-bg)",
      padding: 10,
      borderRadius: 10,
      color: "var(--text)"
    }}>
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
