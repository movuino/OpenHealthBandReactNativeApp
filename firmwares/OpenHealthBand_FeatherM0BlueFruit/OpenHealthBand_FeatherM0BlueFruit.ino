#include <Arduino.h>
#include <SPI.h>
#include "Adafruit_BLE.h"
#include "Adafruit_BluefruitLE_SPI.h"
#include "Adafruit_BluefruitLE_UART.h"
#include "Adafruit_BLEGatt.h"

#include "definitions.h"
#include "BluefruitConfig.h"

Adafruit_BluefruitLE_SPI ble(BLUEFRUIT_SPI_CS, BLUEFRUIT_SPI_IRQ, BLUEFRUIT_SPI_RST);
Adafruit_BLEGatt gatt(ble);

/* A small helper */
void error(const __FlashStringHelper*err) {
  Serial.println(err);
  while (1);
}

/* The service information */
int32_t htsServiceId;
int32_t htsMeasureCharId;

int16_t buffer[MTU];
int16_t bufferIndex = 0;
int16_t cnt = 0;

void setup() {
  pinMode(LEDPIN, OUTPUT);
  
  if ( !ble.begin(VERBOSE_MODE) ) {
    // error(F("Couldn't find Bluefruit, make sure it's in CoMmanD mode & check wiring?"));
  }
  // Serial.println( F("OK!") );

  /* Perform a factory reset to make sure everything is in a known state */
  // Serial.println(F("Performing a factory reset: "));
  if (! ble.factoryReset() ) {
       // error(F("Couldn't factory reset"));
  }

  /* Disable command echo from Bluefruit */
  ble.echo(false);

  // Serial.println("Requesting Bluefruit info:");
  /* Print Bluefruit information */
  ble.info();

  // this line is particularly required for Flora, but is a good idea
  // anyways for the super long lines ahead!
  // ble.setInterCharWriteDelay(5); // 5 ms

  /* Add the Heart Rate Service definition */
  /* Service ID should be 1 */
  // Serial.println(F("Adding the Health Thermometer Service definition (UUID = 0x1809): "));
  htsServiceId = gatt.addService(0x1809);
  if (htsServiceId == 0) {
    // error(F("Could not add Thermometer service"));
  }
  
  /* Add the Temperature Measurement characteristic which is composed of
   * 1 byte flags + 4 float */
  /* Chars ID for Measurement should be 1 */
  // Serial.println(F("Adding the Temperature Measurement characteristic (UUID = 0x2A1C): "));
  htsMeasureCharId = gatt.addCharacteristic(0x2A1C, GATT_CHARS_PROPERTIES_INDICATE, 5, 5, BLE_DATATYPE_BYTEARRAY);
  if (htsMeasureCharId == 0) {
    // error(F("Could not add Temperature characteristic"));
  }

  /* Add the Health Thermometer Service to the advertising data (needed for Nordic apps to detect the service) */
  // Serial.print(F("Adding Health Thermometer Service UUID to the advertising payload: "));
  uint8_t advdata[] { 0x02, 0x01, 0x06, 0x05, 0x02, 0x09, 0x18, 0x0a, 0x18 };
  ble.setAdvData( advdata, sizeof(advdata) );

  /* Reset the device for the new service setting changes to take effect */
  // Serial.print(F("Performing a SW reset (service changes require a reset): "));
  ble.reset(); 
}

void loop() {
  // put your main code here, to run repeatedly:
  int16_t x = cnt++;

  buffer[bufferIndex] = x;
  bufferIndex++;

  if (bufferIndex == MTU) {
    bufferIndex = 0;
    gatt.setChar(htsMeasureCharId, (uint8_t *)(&buffer[0]), MTU * 2);
  }

  delay(7.5);
}
