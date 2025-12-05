# Relatório do Projeto: Sistema de Monitoramento de Consumo de Água Residencial

## 1. Introdução

Este projeto implementa um sistema completo de monitoramento de consumo de água residencial em tempo real, utilizando tecnologias modernas de hardware e software. O sistema permite que usuários monitorem o consumo de água através de uma interface web intuitiva, com visualizações gráficas e relatórios detalhados.

### 1.1 Objetivos

- Monitorar o consumo de água em tempo real
- Fornecer dados históricos por diferentes períodos (dia, semana, mês, ano)
- Criar uma interface web responsiva e intuitiva
- Gerar relatórios em PDF
- Implementar modo escuro (dark mode) para melhor experiência do usuário

## 2. Arquitetura do Sistema

### 2.1 Visão Geral

O sistema é composto por três componentes principais:

```
┌─────────────┐     Wi-Fi      ┌──────────────┐     HTTP/REST    ┌──────────────┐
│             │  ────────────> │              │  ──────────────> │              │
│   ESP32 +   │                │   Backend    │                  │   Frontend   │
│   Sensor    │  <──────────── │   Node.js +  │  <────────────── │   React +    │
│  YF-S201    │                │   MongoDB    │                  │   Chart.js   │
└─────────────┘                └──────────────┘                  └──────────────┘
```

### 2.2 Componentes

#### 2.2.1 Hardware
- **ESP32**: Microcontrolador com Wi-Fi integrado
- **Sensor YF-S201**: Sensor de vazão de água com saída de pulsos
- **LED indicador**: Para feedback visual

#### 2.2.2 Backend
- **Node.js + Express**: Servidor web RESTful
- **MongoDB**: Banco de dados NoSQL para armazenamento de dados
- **JWT**: Autenticação segura
- **bcryptjs**: Hash de senhas

#### 2.2.3 Frontend
- **React 19**: Framework JavaScript para interfaces
- **Vite**: Build tool moderno
- **Chart.js**: Biblioteca para gráficos
- **jsPDF**: Geração de relatórios PDF

## 3. Funcionalidades Implementadas

### 3.1 Coleta de Dados

O ESP32 lê pulsos do sensor YF-S201 e calcula o volume de água:

- **Calibração**: 450 pulsos ≈ 1 litro (configurável)
- **Frequência de envio**: A cada 5 segundos
- **Acumulação**: Mantém total acumulado desde o início
- **Timestamp**: Sincronização via NTP para precisão

### 3.2 Processamento no Backend

#### 3.2.1 Endpoints da API

1. **POST /login**: Autenticação de usuário
   - Valida credenciais
   - Retorna token JWT válido por 2 horas

2. **POST /api/enviar**: Recebe dados do ESP32
   - Valida timestamp
   - Armazena no MongoDB
   - Não requer autenticação (público para ESP32)

3. **GET /api/consumo/:deviceId**: Calcula consumo por período
   - Requer autenticação
   - Retorna: consumo diário, semanal, mensal, anual e total

4. **GET /api/historico/:deviceId**: Histórico de dados
   - Requer autenticação
   - Suporta filtro por período (dia, semana, mês, ano, tudo)

#### 3.2.2 Cálculo de Consumo

O sistema calcula o consumo de cada período da seguinte forma:

```
Consumo = Total Atual - Total no Início do Período
```

- **Diário**: Últimas 24 horas (não desde 00:00)
- **Semanal**: Últimos 7 dias
- **Mensal**: Desde o dia 1 do mês atual
- **Anual**: Desde 1º de janeiro do ano atual
- **Total**: Valor acumulado desde o início

### 3.3 Interface Web

#### 3.3.1 Tela de Login

- Autenticação segura
- Validação de credenciais
- Armazenamento de token no localStorage

**Credenciais padrão:**
- Usuário: Ducher Andre
- Senha: 12345

#### 3.3.2 Dashboard Principal

**Cards de Consumo:**
- Exibição visual dos valores por período
- Formatação com 2 casas decimais
- Design responsivo

**Gráfico de Histórico:**
- Visualização em linha temporal
- Formatação inteligente de datas conforme período
- Filtros por período (dia, semana, mês, ano, tudo)
- Cores adaptáveis ao tema (claro/escuro)

**Funcionalidades:**
- Dark Mode: Alternância entre tema claro e escuro
- Exportar PDF: Geração de relatórios
- Atualização automática: Refresh a cada 30 segundos

## 4. Especificações Técnicas

### 4.1 Hardware

#### ESP32
- **Microcontrolador**: ESP32-WROOM-DA
- **Wi-Fi**: 802.11 b/g/n
- **Pin do sensor**: GPIO 14
- **Pin do LED**: GPIO 2

#### Sensor YF-S201
- **Tipo**: Sensor de vazão magnético
- **Saída**: Pulsos elétricos
- **Calibração**: ~450 pulsos/litro
- **Conexão**: Em série no encanamento

### 4.2 Software

#### Backend
```json
{
  "node": ">=14.0.0",
  "express": "^4.18.2",
  "mongoose": "^7.2.2",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3"
}
```

#### Frontend
```json
{
  "react": "^19.2.0",
  "chart.js": "^4.5.1",
  "react-chartjs-2": "^5.3.1",
  "jspdf": "^2.5.1"
}
```

### 4.3 Banco de Dados

**Modelo de Dados:**
```javascript
{
  deviceId: String,      // ID do dispositivo (ex: "ESP32_001")
  totalLitros: Number,   // Total acumulado em litros
  timestamp: Number      // Timestamp Unix em milissegundos
}
```

## 5. Fluxo de Dados

### 5.1 Coleta
1. Sensor detecta fluxo de água → gera pulsos
2. ESP32 conta pulsos via interrupção
3. A cada 5 segundos, calcula litros acumulados
4. Envia dados via HTTP POST para backend

### 5.2 Armazenamento
1. Backend valida timestamp
2. Verifica se está dentro de limites válidos
3. Armazena no MongoDB

### 5.3 Visualização
1. Frontend solicita dados ao backend (autenticado)
2. Backend calcula consumo por período
3. Frontend renderiza gráficos e cards
4. Usuário interage com filtros e exporta PDF

## 6. Segurança

### 6.1 Autenticação
- Tokens JWT com expiração de 2 horas
- Senhas hasheadas com bcrypt
- Rotas protegidas por middleware de autenticação

### 6.2 Validação de Dados
- Validação de timestamps (não muito antigos/futuros)
- Sanitização de inputs
- Filtros de dados inválidos

## 7. Tratamento de Erros

### 7.1 Backend
- Try-catch em todas as operações assíncronas
- Logs de erro detalhados
- Respostas de erro padronizadas

### 7.2 ESP32
- Reconexão automática Wi-Fi
- Fallback de timestamp quando NTP falha
- Logs via Serial Monitor

### 7.3 Frontend
- Tratamento de erros de rede
- Mensagens amigáveis ao usuário
- Redirecionamento automático se não autenticado

## 8. Melhorias e Otimizações Implementadas

### 8.1 Validação de Timestamps
- Filtro automático de timestamps inválidos (< 2020)
- Validação de timestamps futuros
- Correção automática de timestamps incorretos

### 8.2 Cálculo de Consumo
- Lógica corrigida para calcular diferença corretamente
- Suporte a dados que iniciam dentro do período
- Formatação precisa com 2 casas decimais

### 8.3 Interface
- Formatação inteligente de datas no gráfico
- Atualização automática de dados
- Melhor tratamento de estados vazios

## 9. Instalação e Configuração

### 9.1 Pré-requisitos
- Node.js >= 14.0.0
- MongoDB instalado e rodando
- Arduino IDE com bibliotecas ESP32
- Conexão Wi-Fi

### 9.2 Backend
```bash
cd backend
npm install
npm start
```

### 9.3 Frontend
```bash
cd frontend
npm install
npm run dev
```

### 9.4 ESP32
1. Instalar bibliotecas necessárias no Arduino IDE
2. Configurar SSID e senha Wi-Fi
3. Configurar IP do servidor
4. Fazer upload do código

## 10. Resultados e Conclusão

### 10.1 Funcionalidades Entregues
✅ Monitoramento em tempo real
✅ Histórico por múltiplos períodos
✅ Interface web responsiva
✅ Gráficos interativos
✅ Dark mode
✅ Exportação de PDF
✅ Autenticação segura
✅ Validação de dados

### 10.2 Desafios Enfrentados
- Sincronização de timestamps via NTP
- Cálculo correto de períodos quando dados iniciam dentro do período
- Filtragem de timestamps inválidos de dados antigos
- Formatação inteligente de datas no gráfico

### 10.3 Possíveis Melhorias Futuras
- Múltiplos sensores/dispositivos
- Alertas de consumo excessivo
- Notificações por email/SMS
- Aplicativo mobile
- Integração com IoT cloud platforms
- Machine Learning para previsão de consumo

## 11. Referências Técnicas

### Bibliotecas Utilizadas
- Express.js: Framework web para Node.js
- Mongoose: ODM para MongoDB
- React: Biblioteca JavaScript para interfaces
- Chart.js: Biblioteca de gráficos
- jsPDF: Geração de PDFs no cliente

### Documentação
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)

---

**Autor**: Ducher Andre  
**Data**: Dezembro 2024  
**Versão**: 1.0

