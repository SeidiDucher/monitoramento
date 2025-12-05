export default function CardsConsumo({ consumo }) {
  const card = {
    background: "var(--card-bg)",
    color: "var(--text)",
    padding: 20,
    flex: 1,
    minWidth: 150,
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s"
  };

  const cardTitle = {
    margin: "0 0 10px 0",
    fontSize: "14px",
    fontWeight: "500",
    opacity: 0.8
  };

  const cardValue = {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold"
  };

  return (
    <div style={{ 
      display: "flex", 
      gap: 20, 
      marginTop: 20,
      flexWrap: "wrap"
    }}>
      <div style={card}>
        <h3 style={cardTitle}>Diário</h3>
        <p style={cardValue}>{consumo?.dia?.toFixed(2) || "0.00"} L</p>
      </div>
      <div style={card}>
        <h3 style={cardTitle}>Semanal</h3>
        <p style={cardValue}>{consumo?.semana?.toFixed(2) || "0.00"} L</p>
      </div>
      <div style={card}>
        <h3 style={cardTitle}>Mensal</h3>
        <p style={cardValue}>{consumo?.mes?.toFixed(2) || "0.00"} L</p>
      </div>
      <div style={card}>
        <h3 style={cardTitle}>Anual</h3>
        <p style={cardValue}>{consumo?.ano?.toFixed(2) || "0.00"} L</p>
      </div>
      <div style={card}>
        <h3 style={cardTitle}>Total</h3>
        <p style={cardValue}>{consumo?.total?.toFixed(2) || "0.00"} L</p>
      </div>
    </div>
  );
}
