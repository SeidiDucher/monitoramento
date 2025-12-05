import jsPDF from "jspdf";

export default function BotaoPDF({ consumo }) {

  function gerar() {
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text("Relatório de Consumo de Água", 20, 20);

    // Data do relatório
    const agora = new Date();
    doc.setFontSize(10);
    doc.text(`Data: ${agora.toLocaleDateString("pt-BR")}`, 20, 30);

    // Dados
    doc.setFontSize(14);
    let y = 50;
    doc.text(`Consumo diário: ${(consumo?.dia || 0).toFixed(2)} L`, 20, y);
    y += 10;
    doc.text(`Consumo semanal: ${(consumo?.semana || 0).toFixed(2)} L`, 20, y);
    y += 10;
    doc.text(`Consumo mensal: ${(consumo?.mes || 0).toFixed(2)} L`, 20, y);
    y += 10;
    doc.text(`Consumo anual: ${(consumo?.ano || 0).toFixed(2)} L`, 20, y);
    y += 10;
    doc.text(`Total acumulado: ${(consumo?.total || 0).toFixed(2)} L`, 20, y);

    doc.save(`relatorio_agua_${agora.toISOString().split('T')[0]}.pdf`);
  }

  return (
    <button onClick={gerar} style={{
      marginTop: 20,
      background: "var(--card-bg)",
      padding: "12px 24px",
      borderRadius: 8,
      border: "none",
      color: "var(--text)",
      cursor: "pointer",
      fontSize: "16px",
      fontWeight: "500",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
    }}>
      📄 Baixar Relatório PDF
    </button>
  );
}
