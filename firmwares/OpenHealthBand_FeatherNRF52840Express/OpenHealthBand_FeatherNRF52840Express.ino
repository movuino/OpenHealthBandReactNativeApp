/*
 * NB : this is a firmware for a prototype
 * consisting in a feather nRF52840 express
 * and an MPU9250 breakout from sparkfun
 * that acts as a BLE device sending sensor
 * values as notifications.
 */

#define DEVICE_NAME "OpenHealthBand"

#include <bluefruit.h>
#include <MPU9250_asukiaaa.h>
#include "definitions.h"

// BLEService timeStampService = BLEService(0x1165);
// BLECharacteristic timeStampCharacteristic = BLECharacteristic(0x1166);

BLEService batteryService = BLEService(UUID16_SVC_BATTERY); // BLEService(0x180F);
BLECharacteristic batteryCharacteristic = BLECharacteristic(UUID16_CHR_BATTERY_LEVEL); // BLECharacteristic(0x2A19);

BLEService sensorsService = BLEService(makeUint8ArrayUuid("1000"));
BLECharacteristic sensorsCharacteristic = BLECharacteristic(makeUint8ArrayUuid("2000"));

// DIS (Device Information Service) helper class instance
BLEDis bledis;

MPU9250_asukiaaa sensors;

uint32_t timeStampValue = 0;
uint16_t initialBatteryLevel = 1000;
uint16_t sensorValues[9] = { 0, 1, 2, 3, 4, 5, 6, 7, 8 };
long startTimer=0;
long startDate = 0;

/* * * * * * * * * * * * * callbacks * * * * * * * * * * * * * * */

void connect_callback(uint16_t conn_handle)
{
  // Get the reference to current connection
  BLEConnection* connection = Bluefruit.Connection(conn_handle);

  char central_name[32] = { 0 };
  connection->getPeerName(central_name, sizeof(central_name));

  Serial.print("Connected to ");
  Serial.println(central_name);
}

void disconnect_callback(uint16_t conn_handle, uint8_t reason)
{
  (void) conn_handle;
  (void) reason;

  Serial.print("Disconnected, reason = 0x"); Serial.println(reason, HEX);
  Serial.println("Advertising!");
}

void cccd_callback(uint16_t conn_hdl, BLECharacteristic* chr, uint16_t cccd_value)
{
    // Display the raw request packet
    Serial.print("CCCD Updated: ");
    //Serial.printBuffer(request->data, request->len);
    Serial.print(cccd_value);
    Serial.println("");

    // Check the characteristic this CCCD update is associated with in case
    // this handler is used for multiple CCCD records.
    /*
    if (chr->uuid == timeStampCharacteristic.uuid) {
        if (chr->notifyEnabled(conn_hdl)) {
            Serial.println("Service 'Notify' enabled");
            startTimer=millis();
        } else {
            Serial.println("Service 'Notify' disabled");
        }
    }
    */
}

/* * * * * * * * * * * * * setup/loop * * * * * * * * * * * * * */

void setup() {
  Serial.begin(115200);
  while (!Serial) delay(10);

  Wire.begin();
  sensors.setWire(&Wire);
  sensors.beginAccel();
  sensors.beginGyro();
  sensors.beginMag();
  
  // delay(2000);

  /* * * * * * * * * * * initialization : * * * * * * * * * * * */

  // Bluefruit.autoConnLed(false);
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX);  
  Bluefruit.setTxPower(8);
  Bluefruit.begin();
  Bluefruit.setName(DEVICE_NAME);

  uint16_t len = strlen(DEVICE_NAME);
  char name[len];
  Bluefruit.getName(name, len);
  Serial.println(name); // => prints the right name but advertise only 1 character
  Serial.println(len);

  // Set the connect/disconnect callback handlers
  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);
  Bluefruit.Periph.setConnInterval(6, 12); // 7.5 - 15 ms
  // Configure and Start the Device Information Service
  Serial.println("Configuring the Device Information Service");
  bledis.setManufacturer("CRI");
  bledis.setModel("OHB v0.1");
  bledis.begin();

  /* * * * * * * * * set up time stamp service : * * * * * * * * */

  /*
  timeStampService.begin();

  timeStampCharacteristic.setProperties(CHR_PROPS_NOTIFY);
  timeStampCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  timeStampCharacteristic.setFixedLen(4);
  timeStampCharacteristic.setCccdWriteCallback(cccd_callback);  // Optionally capture CCCD updates
  timeStampCharacteristic.begin();
  */

  batteryService.begin();
  batteryCharacteristic.setProperties(CHR_PROPS_READ);
  batteryCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  batteryCharacteristic.setFixedLen(sizeof(int16_t));
  batteryCharacteristic.begin();

  sensorsService.begin();
  
  sensorsCharacteristic.setProperties(CHR_PROPS_NOTIFY);
  sensorsCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  sensorsCharacteristic.setFixedLen(9 * sizeof(int16_t));
  // set cccd write callback ?
  sensorsCharacteristic.begin();

  /* * * * * * * * * * * start advertising * * * * * * * * * * * */

  // Advertising packet
  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

  // Include TimeStamp Service UUID
  // Bluefruit.Advertising.addService(timeStampService);
  Bluefruit.Advertising.addService(batteryService);
  Bluefruit.Advertising.addService(sensorsService);

  // Include Name
  // Bluefruit.Advertising.addName();
  Bluefruit.ScanResponse.addName();
  
  /* Start Advertising
   * - Enable auto advertising if disconnected
   * - Interval:  fast mode = 20 ms, slow mode = 152.5 ms
   * - Timeout for fast mode is 30 seconds
   * - Start(timeout) with timeout = 0 will advertise forever (until connected)
   */
  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244);    // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(30);      // number of seconds in fast mode
  Bluefruit.Advertising.start(0);                // 0 = Don't stop advertising after n seconds

  Serial.println("just started advertising");

  startDate = millis();
}

void loop() {
  timeStampValue = millis() - startTimer;
  startTimer = millis();
  digitalToggle(LED_RED);
  
  if (Bluefruit.connected()) {
    // Note: We use .notify instead of .write!
    // If it is connected but CCCD is not enabled
    // The characteristic's value is still updated although notification is not sent
    // if (timeStampCharacteristic.notify32(timeStampValue)) {
      // Serial.print("timeStampCharacteristic updated to: ");
      // Serial.println(timeStampValue); 
    // } else {
      // Serial.println("ERROR: Notify not set in the CCCD or not connected!");
    // }

    uint8_t *sensorBuffer;
    
    sensors.accelUpdate();
    sensorBuffer = sensors.accelBuff;
    sensorValues[0] = (float) *(sensorBuffer);
    sensorValues[1] = (float) *(sensorBuffer + 2);
    sensorValues[2] = (float) *(sensorBuffer + 4);

    sensors.gyroUpdate();
    sensorBuffer = sensors.gyroBuff;
    sensorValues[3] = (float) *(sensorBuffer);
    sensorValues[4] = (float) *(sensorBuffer + 2);
    sensorValues[5] = (float) *(sensorBuffer + 4);

    sensors.magUpdate();
    sensorBuffer = sensors.magBuff;
    sensorValues[6] = (float) *(sensorBuffer);
    sensorValues[7] = (float) *(sensorBuffer + 2);
    sensorValues[8] = (float) *(sensorBuffer + 4);

    // generate fake battery level according to time (not in the right units, should be in percent and starts around 230%)
    if (batteryCharacteristic.write16(initialBatteryLevel - (millis() - startDate) * 0.0001)) {
      // Serial.println("battery level updated");
    }

    if (sensorsCharacteristic.notify((void *) sensorValues, 9 * sizeof(int16_t))) {
      // Serial.println("sensors characteristic updated");
    }
  }
  
  delay(10);
}
