// these are modified versions of the original libraries :
#include <Arduino_LSM9DS1.h>
#include <ArduinoBLE.h>

#include "definitions.h"
// #include "SignalGenerator.h"

size_t streamBufferIndex = 0;
size_t streamBufferSize = MAX_INT16_BUFFER_SIZE;
int16_t streamBuffer[MAX_INT16_BUFFER_SIZE];

int16_t cnt = 0;

String name;

BLEService service(OPENHEALTHBAND_NANO33BLE_UUID("0000"));
BLECharacteristic versionCharacteristic(OPENHEALTHBAND_NANO33BLE_UUID("1001"), BLERead, 3 * sizeof(uint8_t));
BLECharacteristic streamCharacteristic(OPENHEALTHBAND_NANO33BLE_UUID("1002"), BLENotify, STREAM_PACKET_SIZE);
BLECharacteristic hrCharacteristic(OPENHEALTHBAND_NANO33BLE_UUID("1003"), BLENotify, HR_PACKET_SIZE);

// BLECharacteristic ecgCharacteristic(OPENHEALTHBAND_NANO33BLE_UUID("1002"), BLENotify, MAX_BLE_PACKET_SIZE * sizeof(byte));
// BLECharacteristic accCharacteristic(OPENHEALTHBAND_NANO33BLE_UUID("1003"), BLENotify, MAX_BLE_PACKET_SIZE * sizeof(byte));
// BLECharacteristic hrCharacteristic(OPENHEALTHBAND_NANO33BLE_UUID("1004"), BLENotify, MAX_BLE_PACKET_SIZE * sizeof(byte));

void setup() {
  if (!IMU.begin()) {
    // Failed to initialized IMU !
    while(true) delay(10);
  }

  if (!BLE.begin()) {
    // Failed to initialized BLE !
    while(true) delay(10);
  }

  String address = BLE.address();
  address.toUpperCase();

  name = "OpenHealthBand";
  name += "-";
  name += address[address.length() - 5];
  name += address[address.length() - 4];
  name += address[address.length() - 2];
  name += address[address.length() - 1];

  BLE.setLocalName(name.c_str());
  BLE.setDeviceName(name.c_str());
  BLE.setAdvertisedService(service);

  service.addCharacteristic(versionCharacteristic);
  versionCharacteristic.writeValue(FIRMWARE_VERSION, sizeof(FIRMWARE_VERSION));
  
  service.addCharacteristic(streamCharacteristic);
  service.addCharacteristic(hrCharacteristic);

  BLE.addService(service);
  BLE.advertise();
}

void loop() {
  while (BLE.connected()) {
    if (streamCharacteristic.subscribed() && IMU.accelerationAvailable()) {
      int16_t x, y, z;
      IMU.readRawAcceleration(x, y, z);

      size_t i = streamBufferIndex * STREAM_VECTOR_LENGTH;
      
      streamBuffer[i] = x;
      streamBuffer[i + 1] = y;
      streamBuffer[i + 2] = z;
      streamBuffer[i + 3] = cnt++;

      streamBufferIndex++;
      
      if (streamBufferIndex == STREAM_PACKET_LENGTH) {
        streamBufferIndex = 0;
        if (streamCharacteristic.subscribed()) {
          streamCharacteristic.writeValue(streamBuffer, sizeof(streamBuffer));
        }
      }

      delay(INTERVAL);
    }
  }
}
