#include "MAX30105.h"

class ParticleSensor {
private:
  // config parameters
  byte ledBrightness = 0x3F; // Options: 0=Off to 255=50mA
  byte sampleAverage = 1; //Options: 1, 2, 4, 8, 16, 32
  byte ledMode = 3; // Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
  int sampleRate = 200; // Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
  int pulseWidth = 411; // Options: 69, 118, 215, 411
  int adcRange = 4096; // Options: 2048, 4096, 8192, 16384

  MAX30105 particleSensor;

  uint32_t redPPG;
  uint32_t irPPG;
  uint32_t greenPPG;

public:
  // buffer to be sent via characterisitc notification :
  uint8_t buffer[16];

  ParticleSensor() : redPPG(0), irPPG(0), greenPPG(0) {}
  ~ParticleSensor() {}

  void init() {
    return;

    // is this first call really needed ??????
    // particleSensor.setup(); // Configure sensor. Use 6.4mA for LED drive

    // buflen = 4 + 4 * ledMode;
    particleSensor.setup(
      ledBrightness,
      sampleAverage,
      ledMode,
      sampleRate,
      pulseWidth,
      adcRange
    );
  }

  void update(uint32_t timeStamp) {
    return;

    particleSensor.check(); // Check the sensor, read up to 3 samples

    while (particleSensor.available()) {
      redPPG = particleSensor.getFIFORed();
      irPPG = particleSensor.getFIFOIR();
      greenPPG = particleSensor.getFIFOGreen();

      writeValueIntoBuffer(timeStamp, 0);
      writeValueIntoBuffer(redPPG, 4);
      writeValueIntoBuffer(irPPG, 8);
      writeValueIntoBuffer(greenPPG, 12);

      particleSensor.nextSample(); // We're finished with this sample so move to next sample
    }
  }

  void writeValueIntoBuffer(uint32_t value, size_t offset) {
    buffer[0 + offset] = (uint8_t) (value >> 24);
    buffer[1 + offset] = (uint8_t) (value >> 16);
    buffer[2 + offset] = (uint8_t) (value >> 8);
    buffer[3 + offset] = (uint8_t) (value >> 0);
  }
};
