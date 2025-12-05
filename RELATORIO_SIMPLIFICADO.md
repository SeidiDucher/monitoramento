# Relatório Simplificado: Monitoramento de Consumo de Água

## Resumo Executivo

Sistema desenvolvido para monitorar consumo de água residencial usando ESP32, sensor de vazão YF-S201, backend Node.js e frontend React.

## Componentes

### Hardware
- **ESP32**: Envia dados via Wi-Fi
- **Sensor YF-S201**: Mede vazão de água (450 pulsos/litro)
- **LED**: Indicador visual

### Software
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Chart.js
- **Autenticação**: JWT

## Funcionalidades

✅ Monitoramento em tempo real  
✅ Consumo por: Dia, Semana, Mês, Ano  
✅ Gráficos interativos  
✅ Dark Mode  
✅ Exportar PDF  
✅ Filtros de período  

## Como Funciona

1. Sensor detecta água → ESP32 conta pulsos
2. ESP32 envia dados via Wi-Fi a cada 5 segundos
3. Backend armazena no MongoDB
4. Frontend exibe gráficos e estatísticas

## Estrutura de Pastas

```
monitoramento/
├── backend/          # Servidor Node.js
│   ├── models/       # Modelos MongoDB
│   └── servidor.js   # API REST
├── frontend/         # Aplicação React
│   └── src/
│       ├── pages/    # Páginas (login, dashboard)
│       └── components/ # Componentes reutilizáveis
└── esp/             # Código Arduino
    └── esp_yf.ino   # Firmware ESP32
```

## Tecnologias

| Componente | Tecnologia |
|------------|-----------|
| Backend | Node.js, Express, MongoDB |
| Frontend | React, Chart.js, Vite |
| Hardware | ESP32, Sensor YF-S201 |
| Autenticação | JWT, bcrypt |

## Principais Correções Realizadas

1. ✅ Validação de timestamps (eliminou datas de 1969)
2. ✅ Cálculo correto de períodos (diário, semanal, etc.)
3. ✅ Filtro de últimas 24 horas funcionando
4. ✅ Formatação inteligente de datas no gráfico
5. ✅ Correção de warnings de compilação ESP32

## Instalação Rápida

**Backend:**
```bash
cd backend && npm install && npm start
```

**Frontend:**
```bash
cd frontend && npm install && npm run dev
```

**ESP32:**
- Configurar Wi-Fi no código
- Configurar IP do servidor
- Fazer upload via Arduino IDE

## Credenciais

- **Usuário**: Ducher Andre
- **Senha**: 12345

---

*Projeto desenvolvido para monitoramento residencial de consumo de água*

