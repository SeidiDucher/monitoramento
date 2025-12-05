import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {

  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();

    try {
      const r = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, senha })
      });

      if (!r.ok) {
        const error = await r.text();
        alert(`Erro no login: ${error}`);
        return;
      }

      const data = await r.json();
      localStorage.setItem("token", data.token);

      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Erro ao conectar com o servidor. Verifique se o backend está rodando.");
    }
  }

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center",
      minHeight: "100vh",
      padding: 20
    }}>
      <form onSubmit={login} style={{ 
        padding: 40, 
        background: "var(--card-bg)", 
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        minWidth: "300px",
        maxWidth: "400px",
        width: "100%"
      }}>
        <h2 style={{ marginBottom: 30, textAlign: "center" }}>Monitoramento de Água</h2>
        <input 
          placeholder="Usuário" 
          value={nome} 
          onChange={e => setNome(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={senha} 
          onChange={e => setSenha(e.target.value)}
          required
        />
        <button type="submit" style={{ width: "100%", marginTop: 10 }}>
          Entrar
        </button>
        <p style={{ 
          marginTop: 20, 
          fontSize: "12px", 
          textAlign: "center",
          opacity: 0.7
        }}>
          Usuário: Ducher Andre<br />
          Senha: 12345
        </p>
      </form>
    </div>
  );
}
