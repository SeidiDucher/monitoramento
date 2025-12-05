import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ToggleTheme from "../components/toggletheme";
import CardsConsumo from "../components/cardsconsumo";
import GraficoConsumo from "../components/graficoconsumo";
import BotaoPDF from "../components/botaopdf";

export default function Dashboard() {

  const deviceId = "ESP32_001";
  const [dados, setDados] = useState([]);
  const [periodo, setPeriodo] = useState("tudo");
  const [consumo, setConsumo] = useState({ dia: 0, semana: 0, mes: 0, ano: 0, total: 0 });
  const navigate = useNavigate();

  // Verificar autenticação
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  async function carregarHistorico() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const url = periodo === "tudo" 
        ? `http://localhost:3001/api/historico/${deviceId}`
        : `http://localhost:3001/api/historico/${deviceId}?periodo=${periodo}`;

      const r = await fetch(url, {
        headers: { "Authorization": token }
      });

      if (r.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const dadosRecebidos = await r.json();
      console.log(`Dados recebidos para período '${periodo}':`, dadosRecebidos.length, "registros");
      setDados(Array.isArray(dadosRecebidos) ? dadosRecebidos : []);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      setDados([]);
    }
  }

  async function carregarConsumo() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const r = await fetch(`http://localhost:3001/api/consumo/${deviceId}`, {
        headers: { "Authorization": token }
      });

      if (r.status === 401) {
        localStorage.removeItem("token");
        navigate("/");
        return;
      }

      const dadosConsumo = await r.json();
      setConsumo(dadosConsumo);
    } catch (error) {
      console.error("Erro ao carregar consumo:", error);
    }
  }

  useEffect(() => {
    carregarHistorico();
    carregarConsumo();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(() => {
      carregarHistorico();
      carregarConsumo();
    }, 30000);

    return () => clearInterval(interval);
  }, [periodo]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <div style={{ padding: 20, minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2>Painel de Consumo de Água</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ToggleTheme />
          <button onClick={handleLogout} style={{
            background: "var(--card-bg)",
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            color: "var(--text)",
            cursor: "pointer"
          }}>
            Sair
          </button>
        </div>
      </div>

      <CardsConsumo consumo={consumo} />

      <div style={{ marginTop: 30 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3>Histórico</h3>
          <select 
            value={periodo} 
            onChange={(e) => setPeriodo(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "var(--card-bg)",
              color: "var(--text)",
              border: "1px solid var(--text)",
              cursor: "pointer"
            }}
          >
            <option value="tudo">Todo o período</option>
            <option value="dia">Últimas 24 horas</option>
            <option value="semana">Últimos 7 dias</option>
            <option value="mes">Este mês</option>
            <option value="ano">Este ano</option>
          </select>
        </div>
        <GraficoConsumo dados={dados} periodo={periodo} />
      </div>

      <BotaoPDF consumo={consumo} />
    </div>
  );
}
