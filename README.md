# Sistema de Monitoramento de Consumo de Água Residencial

Sistema completo para monitoramento de consumo de água usando ESP32, sensor de vazão YF-S201, backend Node.js e frontend React.

## 📋 Características

- ✅ Monitoramento em tempo real do consumo de água
- ✅ Visualização por períodos: Dia, Semana, Mês, Ano
- ✅ Gráficos interativos com Chart.js
- ✅ Dark Mode
- ✅ Relatórios em PDF
- ✅ Autenticação com JWT
- ✅ Interface responsiva

## 🛠️ Tecnologias

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT para autenticação
- bcryptjs para hash de senhas

### Frontend
- React 19
- Vite
- Chart.js / react-chartjs-2
- jsPDF para relatórios
- React Router

### Hardware
- ESP32
- Sensor de vazão YF-S201
- WiFi

## 📦 Instalação

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

### 3. MongoDB

Certifique-se de que o MongoDB está instalado e rodando na porta padrão (27017).

## 🚀 Como Executar

### 1. Iniciar o Backend

```bash
cd backend
npm start
```

O servidor estará disponível em `http://localhost:3001`

### 2. Iniciar o Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em `http://localhost:5173` (ou outra porta disponível)

### 3. Configurar o ESP32

1. Abra o arquivo `esp/esp_yf.ino` no Arduino IDE
2. Instale as bibliotecas necessárias:
   - WiFi (já incluída no ESP32)
   - HTTPClient (já incluída no ESP32)
   - time.h (já incluída)

3. Configure as variáveis:
   - `ssid`: Nome da sua rede WiFi
   - `password`: Senha do WiFi
   - `serverUrl`: IP do computador onde o backend está rodando + porta 3001
     - Exemplo: `http://192.168.0.4:3001/api/enviar`
   - `Pulses_Per_Liter`: Calibração do sensor (padrão: 450)

4. Faça upload para o ESP32

## 🔧 Configuração do Hardware

### Sensor YF-S201

- **Fio Amarelo**: Conecte ao pino 14 do ESP32 (digital)
- **Fio Vermelho**: VCC (5V)
- **Fio Preto**: GND

**Nota**: O sensor é conectado em série no encanamento. O fluxo de água faz girar uma turbina que gera pulsos elétricos.

## 👤 Credenciais de Login

- **Usuário**: `Ducher Andre`
- **Senha**: `12345`

## 📊 Funcionalidades

### Dashboard

- **Cards de Consumo**: Mostra consumo diário, semanal, mensal, anual e total
- **Gráfico**: Visualização do histórico de consumo
- **Filtros de Período**: Filtrar por dia, semana, mês, ano ou todo o período
- **Dark Mode**: Alternar entre tema claro e escuro
- **Exportar PDF**: Gerar relatório em PDF

### API Endpoints

- `POST /login` - Autenticação
- `POST /api/enviar` - Receber dados do ESP32 (sem autenticação)
- `GET /api/consumo/:deviceId` - Obter consumo por período (requer autenticação)
- `GET /api/historico/:deviceId?periodo=dia|semana|mes|ano|tudo` - Histórico (requer autenticação)

## 🔍 Calibração do Sensor

O sensor YF-S201 geralmente precisa de calibração. O valor padrão é 450 pulsos por litro, mas pode variar.

Para calibrar:
1. Colete uma quantidade conhecida de água (ex: 1 litro)
2. Observe quantos pulsos foram contados
3. Ajuste a constante `Pulses_Per_Liter` no código do ESP32

## ⚠️ Solução de Problemas

### Backend não conecta ao MongoDB
- Verifique se o MongoDB está rodando: `mongod`
- Verifique a string de conexão em `servidor.js`

### ESP32 não envia dados
- Verifique se o WiFi está conectado
- Verifique o IP do servidor no código do ESP32
- Verifique se o backend está rodando na porta 3001
- Abra o Serial Monitor para ver mensagens de debug

### Frontend não carrega dados
- Verifique se o backend está rodando
- Verifique o console do navegador para erros
- Verifique se o token está sendo salvo no localStorage

### Timestamp incorreto
- O ESP32 usa NTP para sincronizar o tempo
- Se não conseguir sincronizar, ajuste o fuso horário em `gmtOffset_sec`
- Verifique se há conexão com a internet para NTP

## 📝 Notas Importantes

1. O ESP32 acumula o total de litros desde o início da execução. Se reiniciar o ESP32, o total acumulado será zerado.
2. O timestamp é sincronizado via NTP. Se não houver internet, será usado um timestamp aproximado.
3. A porta padrão do backend é 3001, não 3000.

## 📄 Licença

Este projeto é para fins educacionais.


