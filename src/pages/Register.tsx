#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Keypad.h>
#include <ArduinoJson.h>
#include <ESP32Servo.h>
#include <DFRobotDFPlayerMini.h>
#include <HardwareSerial.h>

// Include untuk brownout detector
#include "soc/rtc_cntl_reg.h"
#include "soc/soc.h"

// ==================== WiFi Configuration ====================
const char* WIFI_SSID = "FELIXTHE3RD";
const char* WIFI_PASS = "superadmin";

// ==================== MQTT Configuration ====================
const char* MQTT_SERVER = "broker.hivemq.com"; 
const int MQTT_PORT = 1883;
const char* MQTT_USER = "";
const char* MQTT_PASS = "";

// Sensor Topics (ESP32 → Backend)
const char* TOPIC_TEMPERATURE = "iotcihuy/home/temperature";
const char* TOPIC_HUMIDITY = "iotcihuy/home/humidity";
const char* TOPIC_GAS = "iotcihuy/home/gas";
const char* TOPIC_LIGHT = "iotcihuy/home/light";

// Control Topics (Backend → ESP32)
const char* TOPIC_LAMP_CONTROL = "iotcihuy/home/lamp/control";
const char* TOPIC_DOOR_CONTROL = "iotcihuy/home/door/control";
const char* TOPIC_CURTAIN_CONTROL = "iotcihuy/home/curtain/control";
const char* TOPIC_BUZZER_CONTROL = "iotcihuy/home/buzzer/control";

// Status Topics (ESP32 → Backend)
const char* TOPIC_LAMP_STATUS = "iotcihuy/home/lamp/status";
const char* TOPIC_DOOR_STATUS = "iotcihuy/home/door/status";
const char* TOPIC_CURTAIN_STATUS = "iotcihuy/home/curtain/status";

// PIN Verification Topics
const char* TOPIC_DOOR_VERIFY = "iotcihuy/home/door/verify";
const char* TOPIC_DOOR_VERIFY_RESPONSE = "iotcihuy/home/door/verify/response";

const char* TOPIC_DEBUG = "iotcihuy/home/debug";

// ==================== Pin Definitions ====================
#define DHT_PIN 13
#define DHT_TYPE DHT22 
#define LDR_PIN 32   
#define MQ2_PIN 35   
#define RELAY_LAMP_PIN 33  
#define RELAY_DOOR_PIN 26 
#define SERVO_GORDEN_PIN 25 
#define BUZZER_PIN 23
#define DFPLAYER_RX 16  
#define DFPLAYER_TX 17  
#define LCD_ADDR 0x27
#define LCD_COLS 16
#define LCD_ROWS 2

// Keypad Configuration
const byte ROWS = 4;
const byte COLS = 4;
char keys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte rowPins[ROWS] = {19, 5, 15, 12}; 
byte colPins[COLS] = {18, 4, 27, 14}; 

// ==================== Objects ====================
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);
DHT dht(DHT_PIN, DHT_TYPE);
LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);
Keypad keypad = Keypad(makeKeymap(keys), rowPins, colPins, ROWS, COLS);
HardwareSerial dfSerial(2); 
DFRobotDFPlayerMini dfPlayer;
Servo gordenServo;

// ==================== Sensor Variables ====================
float temperature = 0;
float humidity = 0;
int gasValue = 0;
int lightValue = 0;

// ==================== Device State Variables ====================
bool lampState = false;
String lampMode = "manual";
bool lampAutoMode = false;

bool doorLocked = true;

bool curtainOpen = false;
String curtainMode = "manual";
bool curtainAutoMode = false;

bool buzzerState = false;

// ==================== Thresholds ====================
const int LAMP_LUX_THRESHOLD = 300;    // Gelap jika < 300 lux → lamp ON
const int CURTAIN_LUX_THRESHOLD = 300; // Gelap jika < 300 lux → curtain OPEN
const int GORDEN_OPEN_ANGLE = 180; 
const int GORDEN_CLOSED_ANGLE = 0;  

// ==================== Timing Variables ====================
unsigned long lastSensorRead = 0;
unsigned long lastMQTTPublish = 0;
unsigned long lastAutoCheck = 0;
unsigned long lampChangeTime = 0;
unsigned long doorUnlockTimer = 0;
unsigned long lastBuzzerToggle = 0;
unsigned long lcdMessageTimer = 0;
unsigned long pinRequestTime = 0;

const unsigned long SENSOR_INTERVAL = 2000;
const unsigned long MQTT_INTERVAL = 5000;
const unsigned long AUTO_CHECK_INTERVAL = 3000;
const unsigned long GAS_SKIP_DURATION = 5000;
const unsigned long DOOR_UNLOCK_DURATION = 5000;
const unsigned long BUZZER_BEEP_INTERVAL = 500;
const unsigned long PIN_TIMEOUT = 5000;

// ==================== PIN & LCD Variables ====================
String enteredPin = "";
bool waitingForPinResponse = false;
bool showingMessage = false;
bool doorAutoLockPending = false;

// ==================== MQ-2 Calibration ====================
int mq2Baseline = 0;
bool mq2Calibrated = false;

// ==================== Smoothing Arrays ====================
const int NUM_READINGS = 10;
int mq2Readings[NUM_READINGS];
int ldrReadings[NUM_READINGS];
int mq2ReadIndex = 0;
int ldrReadIndex = 0;
long mq2Total = 0;
long ldrTotal = 0;

// ==================== Debug Counters ====================
int gasSkipCount = 0;
int gasReadCount = 0;
int lampToggleCount = 0;

// ==================== DFPlayer ====================
bool dfPlayerReady = false;

// Voice Tracks
#define VOICE_WELCOME 1 
#define VOICE_DOOR_UNLOCKED 2 
#define VOICE_DOOR_LOCKED 3     
#define VOICE_WRONG_PIN 4       
#define VOICE_CORRECT_PIN 5     
#define VOICE_GAS_ALERT 6       

// ==================== Function Prototypes ====================
void setupWiFi();
void setupMQTT();
void reconnectMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void readSensors();
void publishSensorData();
void publishDebugData();
void handleKeypad();
void updateLCD();
void controlLamp(bool state, String mode);
void controlDoor(bool lock, String method);
void controlCurtain(bool open, String mode);
void controlBuzzer(bool state);
void playVoice(int trackNumber);
void checkDoorAutoLock();
void checkAutoMode();

// ==================== Setup ====================
void setup() {
  Serial.begin(115200);
  
  // Disable brownout detector
  WRITE_PERI_REG(RTC_CNTL_BROWN_OUT_REG, 0);
  
  Serial.println("\n╔═════════════════════════════════════════╗");
  Serial.println("║  🏠 SMART HOME SYSTEM v3.1 (FIXED)     ║");
  Serial.println("║  🔧 Backend Integration: FULL          ║");
  Serial.println("║  🤖 Auto Mode: ENABLED                 ║");
  Serial.println("║  ✅ Mode Extraction: FIXED             ║");
  Serial.println("╚═════════════════════════════════════════╝\n");

  // Initialize pins
  pinMode(MQ2_PIN, INPUT);
  pinMode(LDR_PIN, INPUT);
  pinMode(RELAY_LAMP_PIN, OUTPUT);
  pinMode(RELAY_DOOR_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  // Initial relay state (OFF)
  digitalWrite(RELAY_LAMP_PIN, HIGH); 
  digitalWrite(RELAY_DOOR_PIN, HIGH); 
  digitalWrite(BUZZER_PIN, LOW);

  // Initialize smoothing arrays
  int initialMQ2 = analogRead(MQ2_PIN);
  int initialLDR = analogRead(LDR_PIN);
  
  for (int i = 0; i < NUM_READINGS; i++) {
    mq2Readings[i] = initialMQ2;
    ldrReadings[i] = initialLDR;
    mq2Total += initialMQ2;
    ldrTotal += initialLDR;
  }
  
  Serial.printf("[INIT] Smoothing buffer initialized:\n");
  Serial.printf("  MQ-2 Initial: %d (Total: %ld)\n", initialMQ2, mq2Total);
  Serial.printf("  LDR Initial:  %d (Total: %ld)\n", initialLDR, ldrTotal);

  // Servo setup
  ESP32PWM::allocateTimer(0);
  gordenServo.setPeriodHertz(50); 
  gordenServo.attach(SERVO_GORDEN_PIN, 500, 2400);
  gordenServo.write(GORDEN_CLOSED_ANGLE);

  // LCD setup
  Wire.begin(21, 22);
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.print("Smart Home v3.1");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");

  // DFPlayer setup
  Serial.println("[INIT] Initializing DFPlayer...");
  dfSerial.begin(9600, SERIAL_8N1, DFPLAYER_RX, DFPLAYER_TX);
  delay(1000);
  
  if (dfPlayer.begin(dfSerial)) {
    dfPlayerReady = true;
    dfPlayer.volume(25);
    Serial.println("✅ DFPlayer Ready!");
    playVoice(VOICE_WELCOME);
  } else {
    Serial.println("⚠  DFPlayer Not Found");
  }

  // DHT sensor setup
  Serial.println("[INIT] Initializing DHT Sensor...");
  dht.begin();

  // MQ-2 Calibration
  Serial.println("\n[INIT] Calibrating MQ-2 Gas Sensor...");
  Serial.println("⏳ Please wait 10 seconds for sensor warm-up...");
  lcd.setCursor(0, 1);
  lcd.print("MQ2 Warming Up ");
  
  // Warm-up phase (10 detik)
  for (int i = 10; i > 0; i--) {
    Serial.printf("  Warm-up: %d seconds remaining...\n", i);
    delay(1000);
  }
  
  // Calibration phase (20 samples)
  lcd.setCursor(0, 1);
  lcd.print("Calibrating MQ2");
  Serial.println("\n[CALIB] Taking 20 samples...");
  
  long sum = 0;
  int minVal = 4095;
  int maxVal = 0;
  
  for (int i = 0; i < 20; i++) {
    int reading = analogRead(MQ2_PIN);
    sum += reading;
    if (reading < minVal) minVal = reading;
    if (reading > maxVal) maxVal = reading;
    Serial.printf("  Sample %2d/20: ADC=%4d\n", i+1, reading);
    delay(100);
  }
  
  mq2Baseline = sum / 20;
  mq2Calibrated = true;
  
  Serial.println("\n╔═════════════════════════════════════════╗");
  Serial.printf("║  ✅ MQ-2 CALIBRATION COMPLETE           ║\n");
  Serial.printf("║     Baseline : %4d                      ║\n", mq2Baseline);
  Serial.printf("║     Min Value: %4d                      ║\n", minVal);
  Serial.printf("║     Max Value: %4d                      ║\n", maxVal);
  Serial.printf("║     Range    : %4d                      ║\n", maxVal - minVal);
  
  if ((maxVal - minVal) > 200) {
    Serial.println("║  ⚠  WARNING: Unstable readings!        ║");
    Serial.println("║     Sensor may need more warm-up time   ║");
  } else {
    Serial.println("║  ✅ Readings stable - sensor ready!     ║");
  }
  Serial.println("╚═════════════════════════════════════════╝\n");

  setupWiFi();
  setupMQTT();

  lcd.clear();
  updateLCD();
  
  Serial.println("\n╔═════════════════════════════════════════╗");
  Serial.println("║  ✅ SYSTEM READY                        ║");
  Serial.println("║  📊 Monitoring all sensors...           ║");
  Serial.println("╚═════════════════════════════════════════╝\n");
}

// ==================== Main Loop ====================
void loop() {
  // MQTT connection check
  if (WiFi.status() == WL_CONNECTED && !mqtt.connected()) {
    reconnectMQTT();
  }
  mqtt.loop();

  // Read sensors
  if (millis() - lastSensorRead >= SENSOR_INTERVAL) {
    readSensors();
    lastSensorRead = millis();
  }

  // Publish sensor data
  if (millis() - lastMQTTPublish >= MQTT_INTERVAL) {
    publishSensorData();
    publishDebugData();
    lastMQTTPublish = millis();
  }

  // Check auto mode (lamp & curtain)
  checkAutoMode();

  // Handle keypad input
  handleKeypad();
  
  // Check door auto-lock
  checkDoorAutoLock();
  
  // LCD message timeout
  if (showingMessage && (millis() - lcdMessageTimer >= 3000)) {
    showingMessage = false;
    updateLCD();
  }

  // Buzzer beep pattern
  if (buzzerState) {
    if (millis() - lastBuzzerToggle >= BUZZER_BEEP_INTERVAL) {
      digitalWrite(BUZZER_PIN, !digitalRead(BUZZER_PIN)); 
      lastBuzzerToggle = millis();
    }
  } else {
    digitalWrite(BUZZER_PIN, LOW);
  }
}

// ==================== Sensor Reading ====================
void readSensors() {
  Serial.println("\n╔═════════════════════════════════════════════════════╗");
  Serial.println("║         🔍 SENSOR READING - v3.1                    ║");
  Serial.println("╠═════════════════════════════════════════════════════╣");

  // DHT22
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  
  if (!isnan(t) && !isnan(h)) {
    temperature = t;
    humidity = h;
    Serial.printf("║ ✅ DHT22  | Temp: %6.2f°C | Humidity: %5.2f%%  ║\n", temperature, humidity);
  } else {
    Serial.println("║ ❌ DHT22  | SENSOR ERROR - Check wiring!          ║");
  }

  // MQ-2 GAS
  unsigned long timeSinceLampChange = millis() - lampChangeTime;
  bool skipGas = (timeSinceLampChange < GAS_SKIP_DURATION);
  
  int currentRaw = analogRead(MQ2_PIN);
  
  Serial.println("╠─────────────────────────────────────────────────────╣");
  Serial.printf("║ 🔬 MQ-2 DEBUG                                       ║\n");
  Serial.printf("║    Raw ADC (now)  : %4d / 4095                     ║\n", currentRaw);
  Serial.printf("║    Baseline       : %4d                            ║\n", mq2Baseline);
  
  if (skipGas) {
    gasSkipCount++;
    Serial.printf("║    Lamp State     : %-3s                            ║\n", lampState ? "ON" : "OFF");
    Serial.printf("║    Time Since Chg : %.1fs / %.1fs                 ║\n", 
                  timeSinceLampChange / 1000.0, 
                  GAS_SKIP_DURATION / 1000.0);
    Serial.printf("║ ⏭  STATUS: SKIPPED (Count: %d)                    ║\n", gasSkipCount);
    Serial.println("║    Reason: Lamp state recently changed             ║");
    
    // Tetap update smoothing buffer
    mq2Total = mq2Total - mq2Readings[mq2ReadIndex];
    mq2Readings[mq2ReadIndex] = currentRaw;
    mq2Total = mq2Total + mq2Readings[mq2ReadIndex];
    mq2ReadIndex = (mq2ReadIndex + 1) % NUM_READINGS;
    
  } else {
    gasReadCount++;
    
    // Update smoothing buffer
    mq2Total = mq2Total - mq2Readings[mq2ReadIndex];
    mq2Readings[mq2ReadIndex] = currentRaw;
    mq2Total = mq2Total + mq2Readings[mq2ReadIndex];
    mq2ReadIndex = (mq2ReadIndex + 1) % NUM_READINGS;
    
    int mq2Average = mq2Total / NUM_READINGS;
    
    Serial.printf("║    Smoothed Avg   : %4d                            ║\n", mq2Average);
    Serial.printf("║    Buffer Index   : %d / %d                        ║\n", mq2ReadIndex, NUM_READINGS);
    Serial.printf("║    Lamp State     : %-3s                            ║\n", lampState ? "ON" : "OFF");
    
    if (mq2Calibrated) {
      int difference = mq2Average - mq2Baseline;
      
      Serial.printf("║    Difference     : %4d (avg - baseline)          ║\n", difference);
      
      const int MQ2_THRESHOLD = 150;
      
      if (difference < MQ2_THRESHOLD) {
        gasValue = 0;
        Serial.printf("║ ✅ STATUS: SAFE (0 PPM) - diff=%d < %d          ║\n", difference, MQ2_THRESHOLD);
      } else {
        int positiveDiff = (difference > 0) ? difference : 0;
        gasValue = constrain(map(positiveDiff, MQ2_THRESHOLD, 1500, 0, 1000), 0, 1000);
        Serial.printf("║ ⚠  STATUS: GAS DETECTED - %d PPM                ║\n", gasValue);
      }
    }
    Serial.printf("║    Read Count     : %d                             ║\n", gasReadCount);
  }
  
  // LDR
  ldrTotal = ldrTotal - ldrReadings[ldrReadIndex];
  ldrReadings[ldrReadIndex] = analogRead(LDR_PIN);
  ldrTotal = ldrTotal + ldrReadings[ldrReadIndex];
  ldrReadIndex = (ldrReadIndex + 1) % NUM_READINGS;
  
  int ldrRaw = ldrTotal / NUM_READINGS;
  lightValue = 1000 - constrain(map(ldrRaw, 0, 4095, 0, 1000), 0, 1000);
  
  Serial.println("╠─────────────────────────────────────────────────────╣");
  Serial.printf("║ 💡 LDR    | Raw: %4d | Lux: %4d                 ║\n", ldrRaw, lightValue);
  
  Serial.println("╠═════════════════════════════════════════════════════╣");
  Serial.printf("║ 📊 SUMMARY                                          ║\n");
  Serial.printf("║    Temperature : %6.2f°C                           ║\n", temperature);
  Serial.printf("║    Humidity    : %6.2f%%                           ║\n", humidity);
  Serial.printf("║    Gas PPM     : %6d %-10s                ║\n", 
                skipGas ? -1 : gasValue, 
                skipGas ? "[SKIPPED]" : "[ACTIVE]");
  Serial.printf("║    Light Lux   : %6d                               ║\n", lightValue);
  Serial.printf("║    Lamp        : %-3s (Mode: %-6s)                ║\n", 
                lampState ? "ON" : "OFF", lampMode.c_str());
  Serial.printf("║    Door        : %-8s                             ║\n", 
                doorLocked ? "LOCKED" : "UNLOCKED");
  Serial.printf("║    Curtain     : %-6s (Mode: %-6s)               ║\n", 
                curtainOpen ? "OPEN" : "CLOSED", curtainMode.c_str());
  Serial.println("╚═════════════════════════════════════════════════════╝\n");
}

// ==================== Publish Sensor Data ====================
void publishSensorData() {
  if (!mqtt.connected()) {
    Serial.println("⚠  [MQTT] Disconnected!");
    return;
  }

  Serial.println("📤 [MQTT] Publishing sensor data...");

  // Temperature
  {
    StaticJsonDocument<128> doc;
    char buffer[128];
    doc["temperature"] = round(temperature * 10) / 10.0;
    doc["unit"] = "C";
    serializeJson(doc, buffer);
    mqtt.publish(TOPIC_TEMPERATURE, buffer);
    Serial.printf("  ✅ Temperature: %.1f°C\n", temperature);
  }

  // Humidity
  {
    StaticJsonDocument<128> doc;
    char buffer[128];
    doc["humidity"] = round(humidity * 10) / 10.0;
    doc["unit"] = "%";
    serializeJson(doc, buffer);
    mqtt.publish(TOPIC_HUMIDITY, buffer);
    Serial.printf("  ✅ Humidity: %.1f%%\n", humidity);
  }

  // Gas (skip if lamp recently changed)
  unsigned long timeSinceLampChange = millis() - lampChangeTime;
  if (timeSinceLampChange >= GAS_SKIP_DURATION) {
    StaticJsonDocument<128> doc;
    char buffer[128];
    doc["gas_ppm"] = gasValue;
    doc["unit"] = "PPM";
    serializeJson(doc, buffer);
    mqtt.publish(TOPIC_GAS, buffer);
    Serial.printf("  ✅ Gas: %d PPM\n", gasValue);
  } else {
    Serial.printf("  ⏭  Gas: SKIPPED (%.1fs remaining)\n", 
                  (GAS_SKIP_DURATION - timeSinceLampChange) / 1000.0);
  }

  // Light
  {
    StaticJsonDocument<128> doc;
    char buffer[128];
    doc["lux"] = lightValue;
    doc["unit"] = "Lux";
    serializeJson(doc, buffer);
    mqtt.publish(TOPIC_LIGHT, buffer);
    Serial.printf("  ✅ Light: %d Lux\n", lightValue);
  }

  Serial.println("✅ [MQTT] Publish complete!\n");
}

// ==================== Publish Debug Data ====================
void publishDebugData() {
  if (!mqtt.connected()) return;
  
  StaticJsonDocument<512> doc;
  char buffer[512];
  
  doc["lamp_state"] = lampState ? "on" : "off";
  doc["lamp_mode"] = lampMode;
  doc["lamp_auto_mode"] = lampAutoMode;
  doc["lamp_toggle_count"] = lampToggleCount;
  doc["lamp_change_time_ago_ms"] = millis() - lampChangeTime;
  doc["gas_skip_count"] = gasSkipCount;
  doc["gas_read_count"] = gasReadCount;
  doc["gas_current_ppm"] = gasValue;
  doc["mq2_raw_adc"] = analogRead(MQ2_PIN);
  doc["mq2_baseline"] = mq2Baseline;
  doc["curtain_open"] = curtainOpen;
  doc["curtain_mode"] = curtainMode;
  doc["curtain_auto_mode"] = curtainAutoMode;
  doc["door_locked"] = doorLocked;
  doc["free_heap"] = ESP.getFreeHeap();
  doc["uptime_sec"] = millis() / 1000;
  
  serializeJson(doc, buffer);
  mqtt.publish(TOPIC_DEBUG, buffer);
}

// ==================== MQTT Callback ====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) message += (char)payload[i];
  
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);
  if (error) {
    Serial.printf("❌ [ERROR] JSON Parse Failed: %s\n", error.c_str());
    return;
  }

  String topicStr = String(topic);
  Serial.printf("📥 [MQTT] Received: %s -> %s\n", topic, message.c_str());

  // ==================== LAMP CONTROL (FIXED) ====================
  if (topicStr == TOPIC_LAMP_CONTROL) {
    String action = doc["action"] | "";
    String mode = doc["mode"] | "manual";  // ✅ Extract mode dari payload
    
    static unsigned long lastLampToggle = 0;
    if (millis() - lastLampToggle < 2000) {
      Serial.println("⚠  [LAMP] Ignored (debounce 2s)");
      return;
    }
    lastLampToggle = millis();
    
    // ✅ Set auto mode flag berdasarkan mode dari payload
    lampAutoMode = (mode == "auto");
    Serial.printf("🔧 [LAMP] Mode set to: %s (Auto: %s)\n", 
                  mode.c_str(), lampAutoMode ? "YES" : "NO");
    
    if (action == "on") {
      controlLamp(true, mode);  // ✅ Pass mode dari payload
    } else if (action == "off") {
      controlLamp(false, mode);  // ✅ Pass mode dari payload
    }
  }
  
  // ==================== DOOR CONTROL ====================
  if (topicStr == TOPIC_DOOR_CONTROL) {
    String action = doc["action"] | "";
    String method = doc["method"] | "remote";
    
    if (action == "lock") {
      controlDoor(true, method);
    } else if (action == "unlock") {
      controlDoor(false, method);
    }
  }

  // ==================== PIN VERIFICATION RESPONSE ====================
  if (topicStr == TOPIC_DOOR_VERIFY_RESPONSE) {
    bool valid = doc["valid"] | false;
    String message = doc["message"] | "";
    
    waitingForPinResponse = false;
    
    if (valid) {
      Serial.println("✅ [PIN] Valid - Unlocking door");
      playVoice(VOICE_CORRECT_PIN);
      controlDoor(false, "pin");
      
      lcd.setCursor(0, 1);
      lcd.print("ACCESS GRANTED  ");
      showingMessage = true;
      lcdMessageTimer = millis();
    } else {
      Serial.println("❌ [PIN] Invalid");
      playVoice(VOICE_WRONG_PIN);
      
      lcd.setCursor(0, 1);
      lcd.print("INVALID PIN!    ");
      showingMessage = true;
      lcdMessageTimer = millis();
    }
    
    enteredPin = "";
  }

  // ==================== CURTAIN CONTROL ====================
  if (topicStr == TOPIC_CURTAIN_CONTROL) {
    String action = doc["action"] | "";
    String mode = doc["mode"] | "manual";
    
    if (mode == "manual") {
      curtainAutoMode = false;
      if (action == "open") {
        controlCurtain(true, "manual");
      } else if (action == "close") {
        controlCurtain(false, "manual");
      }
    } else if (mode == "auto") {
      curtainAutoMode = true;
      Serial.println("🤖 [CURTAIN] Switched to AUTO mode");
    }
  }

  // ==================== BUZZER CONTROL ====================
  if (topicStr == TOPIC_BUZZER_CONTROL) {
    String action = doc["action"] | "";
    controlBuzzer(action == "on");
  }
}

// ==================== Control Functions ====================
void controlLamp(bool state, String mode) {
  lampToggleCount++;
  lampState = state;
  lampMode = mode;  // ✅ Simpan mode yang diterima
  
  Serial.println("\n╔═════════════════════════════════════════╗");
  Serial.printf("║  💡 LAMP CONTROL - Toggle #%d          ║\n", lampToggleCount);
  Serial.println("╠═════════════════════════════════════════╣");
  Serial.printf("║  Target State : %-3s                    ║\n", state ? "ON" : "OFF");
  Serial.printf("║  Mode         : %-6s                  ║\n", mode.c_str());
  Serial.printf("║  Auto Flag    : %-3s                    ║\n", lampAutoMode ? "YES" : "NO");
  Serial.println("╠═════════════════════════════════════════╣");
  
  lampChangeTime = millis();
  gasSkipCount = 0;
  
  Serial.printf("║  ⏰ Gas reading disabled for %ds       ║\n", GAS_SKIP_DURATION / 1000);
  
  if (state) {
    Serial.println("║  ⏳ Pre-energizing (300ms)...           ║");
    delay(300);
  }
  
  digitalWrite(RELAY_LAMP_PIN, state ? LOW : HIGH);
  delay(100);
  
  Serial.println("║  ✅ Relay switched successfully!        ║");
  Serial.println("╚═════════════════════════════════════════╝\n");
  
  // ✅ Publish status dengan mode yang benar
  StaticJsonDocument<128> statusDoc;
  char statusBuffer[128];
  statusDoc["status"] = state ? "on" : "off";
  statusDoc["mode"] = mode;  // ✅ Gunakan parameter mode
  serializeJson(statusDoc, statusBuffer);
  mqtt.publish(TOPIC_LAMP_STATUS, statusBuffer);
  
  Serial.printf("📤 [MQTT] Lamp status published: %s\n", statusBuffer);
}

void controlDoor(bool lock, String method) {
  doorLocked = lock;
  digitalWrite(RELAY_DOOR_PIN, lock ? HIGH : LOW);

  Serial.printf("🚪 [DOOR] %s via %s\n", lock ? "LOCKED" : "UNLOCKED", method.c_str());

  if (lock) {
    playVoice(VOICE_DOOR_LOCKED);
    doorAutoLockPending = false;
  } else {
    playVoice(VOICE_DOOR_UNLOCKED);
    delay(1000);
    playVoice(VOICE_WELCOME);
    doorUnlockTimer = millis();
    doorAutoLockPending = true;
  }
  
  updateLCD();
  
  // Publish status to backend
  StaticJsonDocument<128> doc;
  char buffer[128];
  doc["status"] = lock ? "locked" : "unlocked";
  doc["method"] = method;
  serializeJson(doc, buffer);
  mqtt.publish(TOPIC_DOOR_STATUS, buffer);
  
  Serial.printf("📤 [MQTT] Door status published: %s\n", buffer);
}

void controlCurtain(bool open, String mode) {
  curtainOpen = open;
  curtainMode = mode;
  gordenServo.write(open ? GORDEN_OPEN_ANGLE : GORDEN_CLOSED_ANGLE);
  
  Serial.printf("🪟 [CURTAIN] %s (mode: %s)\n", open ? "OPEN" : "CLOSED", mode.c_str());
  
  // Publish status to backend
  if (mqtt.connected()) {
    StaticJsonDocument<128> doc;
    char buffer[128];
    doc["status"] = open ? "open" : "closed";
    doc["mode"] = mode;
    serializeJson(doc, buffer);
    mqtt.publish(TOPIC_CURTAIN_STATUS, buffer);
    
    Serial.printf("📤 [MQTT] Curtain status published: %s\n", buffer);
  }
}

void controlBuzzer(bool state) {
  buzzerState = state;
  if (!state) digitalWrite(BUZZER_PIN, LOW);
  Serial.printf("🔔 [BUZZER] %s\n", state ? "ON" : "OFF");
}

// ==================== Auto Mode Check ====================
void checkAutoMode() {
  if (millis() - lastAutoCheck < AUTO_CHECK_INTERVAL) return;
  lastAutoCheck = millis();
  
  // ==================== LAMP AUTO MODE ====================
  if (lampAutoMode) {
    bool shouldBeOn = (lightValue < LAMP_LUX_THRESHOLD);
    
    if (shouldBeOn != lampState) {
      Serial.printf("🤖 [LAMP AUTO] Lux=%d, Threshold=%d → Turn %s\n", 
                    lightValue, LAMP_LUX_THRESHOLD, shouldBeOn ? "ON" : "OFF");
      controlLamp(shouldBeOn, "auto");
    }
  }
  
  // ==================== CURTAIN AUTO MODE ====================
  if (curtainAutoMode) {
    bool shouldBeOpen = (lightValue < CURTAIN_LUX_THRESHOLD);
    
    if (shouldBeOpen != curtainOpen) {
      Serial.printf("🤖 [CURTAIN AUTO] Lux=%d, Threshold=%d → %s\n", 
                    lightValue, CURTAIN_LUX_THRESHOLD, shouldBeOpen ? "OPEN" : "CLOSE");
      controlCurtain(shouldBeOpen, "auto");
    }
  }
}

// ==================== Door Auto Lock ====================
void checkDoorAutoLock() {
  if (doorAutoLockPending && !doorLocked) {
    if (millis() - doorUnlockTimer >= DOOR_UNLOCK_DURATION) {
      Serial.println("⏰ [DOOR] Auto-lock timeout");
      controlDoor(true, "auto");
    }
  }
}

// ==================== Keypad Handler ====================
void handleKeypad() {
  char key = keypad.getKey();
  
  if (key) {
    if (key == '#') {
      // Send PIN to backend for verification via MQTT
      if (enteredPin.length() >= 4) {
        StaticJsonDocument<64> doc;
        char buffer[64];
        doc["pin"] = enteredPin;
        serializeJson(doc, buffer);
        
        mqtt.publish(TOPIC_DOOR_VERIFY, buffer);
        waitingForPinResponse = true;
        pinRequestTime = millis();
        
        Serial.printf("🔐 [PIN] Sent to backend for verification: %s\n", enteredPin.c_str());
        
        lcd.setCursor(0, 1);
        lcd.print("Verifying...    ");
      } else {
        lcd.setCursor(0, 1);
        lcd.print("PIN too short!  ");
        showingMessage = true;
        lcdMessageTimer = millis();
        enteredPin = "";
      }
    } 
    else if (key == '*') {
      enteredPin = "";
      updateLCD();
    } 
    else if (key >= '0' && key <= '9') {
      if (enteredPin.length() < 6) {
        enteredPin += key;
        lcd.setCursor(0, 1);
        lcd.print("PIN: ");
        for(int i = 0; i < enteredPin.length(); i++) lcd.print("*");
      }
    }
  }
  
  // Timeout untuk PIN verification
  if (waitingForPinResponse && (millis() - pinRequestTime > PIN_TIMEOUT)) {
    waitingForPinResponse = false;
    lcd.setCursor(0, 1);
    lcd.print("Request Timeout!");
    showingMessage = true;
    lcdMessageTimer = millis();
    enteredPin = "";
    Serial.println("⏱  [PIN] Verification timeout");
  }
}

// ==================== LCD Update ====================
void updateLCD() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Door:");
  lcd.print(doorLocked ? "LOCKED" : "OPEN");
  lcd.setCursor(0, 1);
  lcd.print("Enter PIN");
}

// ==================== Voice Playback ====================
void playVoice(int trackNumber) {
  if (dfPlayerReady) {
    dfPlayer.play(trackNumber);
    Serial.printf("🔊 [VOICE] Playing track #%d\n", trackNumber);
  }
}

// ==================== WiFi Setup ====================
void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  
  Serial.print("[WiFi] Connecting");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ [WiFi] Connected!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ [WiFi] Connection Failed!");
  }
}

// ==================== MQTT Setup ====================
void setupMQTT() {
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(1024);
}

void reconnectMQTT() {
  while (!mqtt.connected()) {
    Serial.print("[MQTT] Connecting...");
    String clientId = "ESP32-SmartHome-" + String(random(0xffff), HEX);
    
    if (mqtt.connect(clientId.c_str(), MQTT_USER, MQTT_PASS)) {
      Serial.println(" Connected!");
      
      // Subscribe to control topics
      mqtt.subscribe(TOPIC_LAMP_CONTROL);
      mqtt.subscribe(TOPIC_DOOR_CONTROL);
      mqtt.subscribe(TOPIC_CURTAIN_CONTROL);
      mqtt.subscribe(TOPIC_BUZZER_CONTROL);
      mqtt.subscribe(TOPIC_DOOR_VERIFY_RESPONSE);
      
      Serial.println("✅ [MQTT] Subscribed to all topics!");
    } else {
      Serial.print(" Failed! rc=");
      Serial.println(mqtt.state());
      delay(5000);
    }
  }
}