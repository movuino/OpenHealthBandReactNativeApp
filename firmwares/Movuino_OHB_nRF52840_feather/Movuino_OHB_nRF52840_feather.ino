// #define USE_PPG 1
#define USE_IMU 1

#include <bluefruit.h>
#include "definitions.h"

#ifdef USE_PPG
#include "ParticleSensor.h"
#endif

#ifdef USE_IMU
#include "IMU.h"
#endif

uint32_t startDate;
uint32_t timeStamp;

// DIS (Device Information Service) helper class instance
BLEDis bledis;

////////// PPG Service & characteristic

#ifdef USE_PPG
ParticleSensor ppg;
// BLEService ppgService = BLEService(0x1165);
// BLECharacteristic rawPpgCharacteristic = BLECharacteristic(0x1166);
BLEService ppgService = BLEService(makeUint8ArrayUuid("1000"));
BLECharacteristic rawPpgCharacteristic = BLECharacteristic(makeUint8ArrayUuid("1001"));
#endif

////////// IMU Service & characteristics

#ifdef USE_IMU
IMU imu;
// BLEService imuService = BLEService(0x1101);
// BLECharacteristic accCharacteristic = BLECharacteristic(0x1102);
// BLECharacteristic gyroCharacteristic = BLECharacteristic(0x1103);
// BLECharacteristic magCharacteristic = BLECharacteristic(0x1104);
BLEService imuService = BLEService(makeUint8ArrayUuid("2000"));
BLECharacteristic accelCharacteristic = BLECharacteristic(makeUint8ArrayUuid("2001"));
BLECharacteristic gyroCharacteristic = BLECharacteristic(makeUint8ArrayUuid("2002"));
BLECharacteristic magCharacteristic = BLECharacteristic(makeUint8ArrayUuid("2003"));
#endif

/* * * * * * * * * * * * * * * * CALLBACKS * * * * * * * * * * * * * * * * * */

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
    //*/
}

/* * * * * * * * * * * * * * * * * SETUP * * * * * * * * * * * * * * * * * * */

void setup() {
  ////////// setup BLE peripheral

  // Bluefruit.autoConnLed(true);
  Bluefruit.configPrphBandwidth(BANDWIDTH_MAX);  
  Bluefruit.setTxPower(13);  //13 max - 0 min
  Bluefruit.begin();
  Bluefruit.setName("Movuino OHB 89ZF1Z");

  Bluefruit.Periph.setConnectCallback(connect_callback);
  Bluefruit.Periph.setDisconnectCallback(disconnect_callback);
  Bluefruit.Periph.setConnInterval(6, 12); // 7.5 - 15 ms

  bledis.setManufacturer("CRI");
  bledis.setModel("OHB v0.1");
  bledis.setSerialNum("ZZHH");
  bledis.begin();

  ////////// setup sensors and related BLE services and characteristics

#ifdef USE_PPG
  ppg.init();

  ppgService.begin();

  rawPpgCharacteristic.setProperties(CHR_PROPS_NOTIFY);
  rawPpgCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  rawPpgCharacteristic.setFixedLen(16);
  rawPpgCharacteristic.setCccdWriteCallback(cccd_callback);
  rawPpgCharacteristic.begin();
#endif

#ifdef USE_IMU
  imu.init();

  imuService.begin();

  accelCharacteristic.setProperties(CHR_PROPS_NOTIFY);
  accelCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  accelCharacteristic.setFixedLen(10);
  accelCharacteristic.setCccdWriteCallback(cccd_callback);
  accelCharacteristic.begin();

  gyroCharacteristic.setProperties(CHR_PROPS_NOTIFY);
  gyroCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  gyroCharacteristic.setFixedLen(10);
  gyroCharacteristic.setCccdWriteCallback(cccd_callback);
  gyroCharacteristic.begin();

  magCharacteristic.setProperties(CHR_PROPS_NOTIFY);
  magCharacteristic.setPermission(SECMODE_OPEN, SECMODE_NO_ACCESS);
  magCharacteristic.setFixedLen(10);
  magCharacteristic.setCccdWriteCallback(cccd_callback);
  magCharacteristic.begin();
#endif

  ////////// setup advertising

  Bluefruit.Advertising.addFlags(BLE_GAP_ADV_FLAGS_LE_ONLY_GENERAL_DISC_MODE);
  Bluefruit.Advertising.addTxPower();

#ifdef USE_PPG
  Bluefruit.Advertising.addService(ppgService);
#endif

#ifdef USE_IMU
  Bluefruit.Advertising.addService(imuService);
#endif

  // Bluefruit.Advertising.addName();  
  Bluefruit.ScanResponse.addName();

  Bluefruit.Advertising.restartOnDisconnect(true);
  Bluefruit.Advertising.setInterval(32, 244); // in unit of 0.625 ms
  Bluefruit.Advertising.setFastTimeout(30); // number of seconds in fast mode

  ////////// start advertising

  Bluefruit.Advertising.start(0); // 0 = Don't stop advertising after n seconds

  startDate = millis();
}

/* * * * * * * * * * * * * * * * * LOOP * * * * * * * * * * * * * * * * * * * */

void loop() {
  // digitalToggle(LED_RED);
  if (Bluefruit.connected()) {
    timeStamp = millis() - startDate;

    ////////// PPG

#ifdef USE_PPG
    ppg.update(timeStamp);

    if (rawPpgCharacteristic.notify((void *) ppg.buffer, 16)) {
      // Serial.println("ppg notified");
    }
#endif

    ////////// IMU

#ifdef USE_IMU
    imu.update(timeStamp);

    if (accelCharacteristic.notify((void *) imu.accelBuffer, 10)) {
      // Serial.println("accel notified");
    }    

    if (gyroCharacteristic.notify((void *) imu.gyroBuffer, 10)) {
      // Serial.println("gyro notified");
    }    

    if (magCharacteristic.notify((void *) imu.magBuffer, 10)) {
      // Serial.println("mag notified");
    }
#endif
  }

  // TODO : add some Timer functionalities to sensor classes
  // to allow setting different sample rates for each service / characteristic
  // for now, this will do :
  delay(10);
}
