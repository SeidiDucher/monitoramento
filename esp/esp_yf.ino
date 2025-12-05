/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <time.h>

// Configuração NTP para obter timestamp real
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = -3 * 3600; // GMT-3 (ajuste conforme seu fuso: -3 = Brasil)
const int daylightOffset_sec = 0;

// CONFIGURAÇÕES DO WI-FI
const char* ssid = "Deus_e_Fiel";
const char* password = "T601963#";

// ENDPOINT DO BACKEND
String serverUrl = "http://192.168.0.4:3001/api/enviar";  
// IMPORTANTE: Altere para o IP do seu computador e porta 3001

// CONFIGURAÇÕES DO SENSOR
#define SENSOR_PIN 14       // Fio amarelo do YF-S201
#define LED_PIN 2           // LED indicador
volatile long pulsos = 0;

// CALIBRAÇÃO DO SENSOR YF-S201
// Média real: ~450 pulsos ≈ 1 litro
const float Pulses_Per_Liter = 450.0;

unsigned long ultimoEnvio = 0;
unsigned long intervaloEnvio = 5000; // Enviar a cada 5 segundos

// Variável para acumular total de litros desde o início
float totalLitrosAcumulado = 0.0;

// INTERRUPÇÃO: CONTAGEM DE PULSOS
// IRAM_ATTR garante que a função fique na RAM interna para acesso rápido
void IRAM_ATTR contarPulso() {
  // Incremento usando atribuição em vez de ++ para evitar warning com volatile
  pulsos = pulsos + 1;
}

// Função para obter timestamp Unix (em segundos)
unsigned long getUnixTime() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return 0;
  }
  time_t now;
  time(&now);
  return (unsigned long)now;
}

void setup() {
  Serial.begin(115200);

  // LED
  pinMode(LED_PIN, OUTPUT);

  // Sensor
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(SENSOR_PIN), contarPulso, RISING);

  // Conectando ao Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("\nConectando ao WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado!");
  Serial.print("IP do ESP32: ");
  Serial.println(WiFi.localIP());

  // Configurar NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  
  // Aguardar sincronização do tempo (máximo 10 segundos)
  Serial.println("Sincronizando tempo NTP...");
  int tentativas = 0;
  unsigned long epochTime = 0;
  while (epochTime == 0 && tentativas < 20) {
    delay(500);
    epochTime = getUnixTime();
    tentativas++;
    if (tentativas % 4 == 0) {
      Serial.print(".");
    }
  }
  Serial.println();
  
  if (epochTime > 0) {
    Serial.print("Tempo sincronizado! Unix timestamp: ");
    Serial.println(epochTime);
  } else {
    Serial.println("AVISO: Não foi possível sincronizar o tempo NTP. O timestamp pode estar incorreto.");
  }
}

void loop() {
  unsigned long agora = millis();

  if (agora - ultimoEnvio >= intervaloEnvio) {
    ultimoEnvio = agora;

    // Ler e zerar pulsos de forma segura
    // No ESP32, a leitura de uma variável long (32 bits) é geralmente atômica
    long pulsosLidos = pulsos;
    pulsos = 0;  // Zerar após ler

    // Cálculo de litros a partir dos pulsos desde último envio
    float litrosIncremento = pulsosLidos / Pulses_Per_Liter;
    
    // Acumular total de litros
    totalLitrosAcumulado += litrosIncremento;
    
    // Mostrar no serial
    Serial.print("Pulsos: ");
    Serial.print(pulsosLidos);
    Serial.print("  | Litros no período: ");
    Serial.print(litrosIncremento, 4);
    Serial.print("  | Total acumulado: ");
    Serial.println(totalLitrosAcumulado, 4);

    // Piscar LED ao enviar
    digitalWrite(LED_PIN, HIGH);
    delay(100);
    digitalWrite(LED_PIN, LOW);

    // Enviar dados ao servidor (total acumulado)
    enviarDados(totalLitrosAcumulado);
  }
}

void enviarDados(float totalLitros) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Obter timestamp Unix (em segundos)
    unsigned long timestampUnix = getUnixTime();
    
    // Validar se o timestamp é razoável (não zero e não muito antigo)
    // Unix timestamp de 2020-01-01 é aproximadamente 1577836800
    unsigned long timestampMinimo = 1577836800; // 2020-01-01 00:00:00 UTC
    
    if (timestampUnix == 0 || timestampUnix < timestampMinimo) {
      // Se não conseguir sincronizar ou timestamp inválido, usar timestamp atual aproximado
      // Usar uma data base recente + tempo decorrido desde o boot
      // Data base: 2024-01-01 00:00:00 UTC = 1704067200 segundos
      unsigned long dataBase = 1704067200; // 2024-01-01
      timestampUnix = dataBase + (millis() / 1000);
      
      Serial.print("AVISO: Usando timestamp aproximado baseado em millis: ");
      Serial.println(timestampUnix);
    }
    
    // Converter para milissegundos para manter compatibilidade com backend
    unsigned long timestamp = timestampUnix * 1000;
    
    Serial.print("Timestamp final (ms): ");
    Serial.println(timestamp);

    // JSON enviado ao backend
    String json = "{";
    json += "\"deviceId\":\"ESP32_001\",";
    json += "\"totalLitros\":" + String(totalLitros, 4) + ",";
    json += "\"timestamp\":" + String(timestamp);
    json += "}";

    Serial.println("JSON enviado:");
    Serial.println(json);

    int httpResponseCode = http.POST(json);

    Serial.print("Resposta do servidor: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {
      String resposta = http.getString();
      Serial.println("Resposta: " + resposta);
    } else {
      Serial.println("Erro na requisição");
    }

    http.end();
  } 
  else {
    Serial.println("WiFi desconectado. Tentando reconectar...");
    WiFi.reconnect();
  }
}
*/
