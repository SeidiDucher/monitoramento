import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function GraficoConsumo({ dados, periodo }) {
  const canvas = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Destruir chart anterior se existir
    if (chartRef.current) {
      try { 
        chartRef.current.destroy(); 
      } catch (e) {
        console.error("Erro ao destruir chart:", e);
      }
      chartRef.current = null;
    }

    if (!dados || !dados.length || !canvas.current) {
      return;
    }

    // Filtrar apenas dados válidos para o gráfico
    // Validar que o timestamp é razoável (não muito antigo ou muito no futuro)
    const timestampMinimo = 1577836800000; // 2020-01-01 00:00:00 UTC
    const agora = Date.now();
    const timestampMaximo = agora + 3600000; // Máximo 1 hora no futuro
    
    const dadosValidos = dados.filter(d => {
      if (!d.timestamp) return false;
      
      const date = new Date(d.timestamp);
      if (isNaN(date.getTime())) return false;
      
      const ts = date.getTime();
      // Rejeitar timestamps muito antigos (antes de 2020) ou muito no futuro
      if (ts < timestampMinimo || ts > timestampMaximo) {
        return false;
      }
      
      return true;
    });
    
    if (dadosValidos.length === 0) {
      return;
    }
    
    // Formatar labels baseado no período selecionado
    const labels = dadosValidos.map(d => {
      const date = new Date(d.timestamp);
      
      // Para últimas 24 horas, mostrar hora:minuto
      if (periodo === 'dia') {
        return date.toLocaleString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit"
        });
      }
      
      // Para semana, mostrar dia/mês e hora
      if (periodo === 'semana') {
        return date.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
      }
      
      // Para mês, mostrar dia/mês e hora (compacto)
      if (periodo === 'mes') {
        return date.toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit"
        });
      }
      
      // Para ano, mostrar apenas dia/mês
      if (periodo === 'ano') {
        return date.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit"
        });
      }
      
      // Para "tudo", verificar o intervalo dos dados para decidir o formato
      if (periodo === 'tudo' && dadosValidos.length > 0) {
        const primeiraData = new Date(dadosValidos[0].timestamp);
        const ultimaData = new Date(dadosValidos[dadosValidos.length - 1].timestamp);
        const diffDias = (ultimaData - primeiraData) / (1000 * 60 * 60 * 24);
        
        if (diffDias <= 7) {
          // Se o período total é curto, mostrar hora
          return date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          });
        } else {
          // Período longo, mostrar apenas data
          return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: dadosValidos.length > 365 ? "2-digit" : undefined
          });
        }
      }
      
      // Padrão: data compacta
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit"
      });
    });

    // Mapear valores (já filtramos dados inválidos acima)
    const valores = dadosValidos.map(d => parseFloat(d.totalLitros) || 0);

    // Criar novo chart
    const ctx = canvas.current.getContext("2d");
    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Consumo Total (L)",
          data: valores,
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            labels: {
              color: "var(--text)"
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: "var(--text)",
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            }
          },
          y: {
            ticks: {
              color: "var(--text)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            beginAtZero: true
          }
        }
      }
    });

    // Cleanup
    return () => {
      if (chartRef.current) {
        try { 
          chartRef.current.destroy(); 
        } catch (e) {
          console.error("Erro ao destruir chart no cleanup:", e);
        }
        chartRef.current = null;
      }
    };
  }, [dados, periodo]);

  if (!dados || !dados.length) {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center", 
        background: "var(--card-bg)",
        borderRadius: 12,
        color: "var(--text)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <p style={{ fontSize: "16px", marginBottom: "10px" }}>
          Nenhum dado disponível para o período selecionado.
        </p>
        <p style={{ fontSize: "12px", opacity: 0.7 }}>
          Aguarde o ESP32 enviar dados ou verifique a conexão.
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: "var(--card-bg)",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
    }}>
      <canvas ref={canvas} style={{ maxHeight: "400px" }}></canvas>
    </div>
  );
}
