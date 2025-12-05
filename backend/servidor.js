const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");
const Consumo = require("./models/consumo");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const SECRET = "segredo-super-seguro";

// ----------------------------------------------
// LOGIN (usuário alterado para Ducher Andre)
// ----------------------------------------------
const usuario = {
  nome: "Ducher Andre",
  senha: bcrypt.hashSync("12345", 10)
};

app.post("/login", (req, res) => {
  const { nome, senha } = req.body;

  if (nome !== usuario.nome) return res.status(400).send("Usuário incorreto");
  if (!bcrypt.compareSync(senha, usuario.senha)) return res.status(400).send("Senha incorreta");

  const token = jwt.sign({ nome }, SECRET, { expiresIn: "2h" });
  res.json({ token });
});

// Middleware de autenticação
function autenticar(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send("Token ausente");

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).send("Token inválido");
  }
}

// ----------------------------------------------
// Receber dados do ESP32
// ----------------------------------------------
app.post("/api/enviar", async (req, res) => {
  try {
    const { deviceId, totalLitros, timestamp } = req.body;

    // Converter timestamp para número se necessário
    let ts;
    if (timestamp) {
      if (typeof timestamp === 'number') {
        ts = timestamp;
      } else {
        ts = new Date(timestamp).getTime();
      }
      
      // Validar se o timestamp é razoável (não muito antigo - antes de 2020)
      // Se o timestamp for menor que 1577836800000 (2020-01-01), está incorreto
      const timestampMinimo = 1577836800000; // 2020-01-01 00:00:00 UTC em milissegundos
      if (ts < timestampMinimo || isNaN(ts)) {
        console.warn(`Timestamp inválido recebido: ${timestamp}, usando timestamp atual`);
        ts = Date.now();
      }
      
      // Também verificar se não está muito no futuro (mais de 1 hora)
      const agora = Date.now();
      if (ts > agora + 3600000) { // 1 hora no futuro
        console.warn(`Timestamp muito no futuro: ${timestamp}, usando timestamp atual`);
        ts = agora;
      }
    } else {
      ts = Date.now();
    }

    await Consumo.create({ deviceId, totalLitros, timestamp: ts });
    res.send("OK");
  } catch (error) {
    console.error("Erro ao salvar consumo:", error);
    res.status(500).send("Erro ao salvar dados");
  }
});

// ----------------------------------------------
// Fornecer histórico ao dashboard
// ----------------------------------------------
app.get("/api/historico/:deviceId", autenticar, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { periodo } = req.query; // 'dia', 'semana', 'mes', 'ano', 'tudo'

    let filtro = { deviceId };
    const agora = new Date();

    if (periodo === 'dia') {
      // Últimas 24 horas (não desde o início do dia)
      const inicio24h = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
      filtro.timestamp = { $gte: inicio24h.getTime() };
    } else if (periodo === 'semana') {
      const inicioSemana = new Date(agora);
      inicioSemana.setDate(agora.getDate() - 7);
      filtro.timestamp = { $gte: inicioSemana.getTime() };
    } else if (periodo === 'mes') {
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      filtro.timestamp = { $gte: inicioMes.getTime() };
    } else if (periodo === 'ano') {
      const inicioAno = new Date(agora.getFullYear(), 0, 1);
      filtro.timestamp = { $gte: inicioAno.getTime() };
    }
    // Se periodo === 'tudo' ou não especificado, retorna todos

    const dados = await Consumo.find(filtro).sort({ timestamp: 1 });

    // Filtrar dados com timestamps inválidos (muito antigos)
    const timestampMinimo = 1577836800000; // 2020-01-01
    const dadosFiltrados = dados.filter(d => {
      const ts = d.timestamp;
      return ts && ts >= timestampMinimo && ts <= Date.now() + 3600000; // Máximo 1h no futuro
    });

    res.json(dadosFiltrados);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

// ----------------------------------------------
// Cálculo diário/semanal/mensal/anual
// ----------------------------------------------
app.get("/api/consumo/:deviceId", autenticar, async (req, res) => {
  try {
    const deviceId = req.params.deviceId;

    // Filtrar dados inválidos desde o início
    const timestampMinimo = 1577836800000; // 2020-01-01
    const todosDados = await Consumo.find({ deviceId }).sort({ timestamp: 1 });
    const dados = todosDados.filter(d => {
      const ts = d.timestamp;
      return ts && ts >= timestampMinimo && ts <= Date.now() + 3600000;
    });

    if (dados.length === 0) {
      return res.json({
        dia: 0,
        semana: 0,
        mes: 0,
        ano: 0,
        total: 0
      });
    }

    const agora = new Date();
    // Últimas 24 horas (não desde o início do dia)
    const inicioDia = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
    const inicioSemana = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1, 0, 0, 0, 0);
    const inicioAno = new Date(agora.getFullYear(), 0, 1, 0, 0, 0, 0);

    // Converter timestamps para Date objects e ordenar
    const dadosComData = dados.map(d => ({
      totalLitros: parseFloat(d.totalLitros) || 0,
      timestamp: d.timestamp,
      data: new Date(d.timestamp)
    })).sort((a, b) => a.timestamp - b.timestamp);

    const totalFinal = dadosComData[dadosComData.length - 1].totalLitros;

    // Função para encontrar o último valor ANTES do início do período
    // Se não houver valor antes, retorna 0 (todo consumo aconteceu no período)
    function encontrarValorInicial(inicio) {
      // Procurar o último valor antes do início do período
      for (let i = dadosComData.length - 1; i >= 0; i--) {
        if (dadosComData[i].data < inicio) {
          return dadosComData[i].totalLitros;
        }
      }
      
      // Se não encontrou nenhum valor antes do período, significa que
      // todo o consumo aconteceu dentro do período, então retorna 0
      return 0;
    }

    // Calcular consumo de cada período
    const valorInicialDia = encontrarValorInicial(inicioDia);
    const valorInicialSemana = encontrarValorInicial(inicioSemana);
    const valorInicialMes = encontrarValorInicial(inicioMes);
    const valorInicialAno = encontrarValorInicial(inicioAno);

    const consumoDia = Math.max(0, totalFinal - valorInicialDia);
    const consumoSemana = Math.max(0, totalFinal - valorInicialSemana);
    const consumoMes = Math.max(0, totalFinal - valorInicialMes);
    const consumoAno = Math.max(0, totalFinal - valorInicialAno);

    // Log para debug (pode ser removido em produção)
    console.log(`Consumo calculado para ${deviceId}:`, {
      totalFinal,
      valorInicialDia,
      valorInicialSemana,
      valorInicialMes,
      valorInicialAno,
      consumoDia,
      consumoSemana,
      consumoMes,
      consumoAno
    });

    res.json({
      dia: parseFloat(consumoDia.toFixed(2)),
      semana: parseFloat(consumoSemana.toFixed(2)),
      mes: parseFloat(consumoMes.toFixed(2)),
      ano: parseFloat(consumoAno.toFixed(2)),
      total: parseFloat(totalFinal.toFixed(2))
    });
  } catch (error) {
    console.error("Erro ao calcular consumo:", error);
    res.status(500).json({ error: "Erro ao calcular consumo" });
  }
});

mongoose.connect("mongodb://127.0.0.1:27017/monitoramento")
  .then(() => {
    console.log("MongoDB conectado!");
    
    // Limpar dados com timestamps inválidos (opcional - descomente se quiser limpar automaticamente)
    // LimparDadosInvalidos();
  });

// Função para limpar dados com timestamps inválidos (manualmente ou ao iniciar)
async function LimparDadosInvalidos() {
  try {
    const timestampMinimo = 1577836800000; // 2020-01-01
    const resultado = await Consumo.deleteMany({
      $or: [
        { timestamp: { $lt: timestampMinimo } },
        { timestamp: { $gt: Date.now() + 3600000 } }, // Mais de 1h no futuro
        { timestamp: { $exists: false } }
      ]
    });
    if (resultado.deletedCount > 0) {
      console.log(`Limpeza: ${resultado.deletedCount} registros inválidos removidos`);
    }
  } catch (error) {
    console.error("Erro ao limpar dados inválidos:", error);
  }
}

// Endpoint para limpar dados inválidos manualmente (requer autenticação)
app.post("/api/limpar-dados-invalidos", autenticar, async (req, res) => {
  try {
    await LimparDadosInvalidos();
    res.json({ message: "Limpeza concluída" });
  } catch (error) {
    console.error("Erro ao limpar dados:", error);
    res.status(500).json({ error: "Erro ao limpar dados" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
