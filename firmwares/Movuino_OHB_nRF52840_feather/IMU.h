#include <MPU9250_asukiaaa.h>

// MPU9250_asukiaaa mpu(0x69);
MPU9250_asukiaaa mpu;

class IMU {
private:
  // config parameters
  uint8_t accScale = ACC_FULL_SCALE_16_G;
  uint8_t gyroScale = GYRO_FULL_SCALE_2000_DPS;

  // MPU9250_asukiaaa mpu(0x69);

  int16_t accelValues[3];
  int16_t gyroValues[3];
  int16_t magValues[3];

public:
  // public buffers to be sent via characteristic notifications
  // 3 * int16 values + 1 int32 time stamp = 10 bytes
  uint8_t accelBuffer[10];
  uint8_t gyroBuffer[10];
  uint8_t magBuffer[10];

  IMU() {}  
  ~IMU() {}

  void init() {
    mpu.beginAccel();
    mpu.beginGyro();
    mpu.beginMag();
  }

  void update(uint32_t timeStamp) {
    ////////// ACCELEROMETER

    mpu.accelUpdate();
    // return integer mG values
    accelValues[0] = (int16_t) (mpu.accelX() * 1000);
    accelValues[1] = (int16_t) (mpu.accelY() * 1000);
    accelValues[2] = (int16_t) (mpu.accelZ() * 1000);
    writeValuesIntoBuffer(timeStamp, accelValues, accelBuffer);

    ////////// GYROSCOPE

    mpu.gyroUpdate();
    // 0 to 2000 DPS seems a good enough scale (with 1 DPS precision)
    gyroValues[0] = (int16_t) mpu.gyroX();
    gyroValues[1] = (int16_t) mpu.gyroY();
    gyroValues[2] = (int16_t) mpu.gyroZ();
    writeValuesIntoBuffer(timeStamp, gyroValues, gyroBuffer);

    ////////// MAGNETOMETER

    mpu.magUpdate();
    // just forward values whatever scale they use
    magValues[0] = (int16_t) mpu.magX();
    magValues[1] = (int16_t) mpu.magY();
    magValues[2] = (int16_t) mpu.magZ();
    writeValuesIntoBuffer(timeStamp, magValues, magBuffer);
  }

  void writeValuesIntoBuffer(uint32_t timeStamp,
                             int16_t *values,
                             uint8_t *buffer) {
    // write time stamp :
    buffer[0] = (uint8_t) (timeStamp >> 24);
    buffer[1] = (uint8_t) (timeStamp >> 16);
    buffer[2] = (uint8_t) (timeStamp >> 8);
    buffer[3] = (uint8_t) (timeStamp >> 0);

    // write values :
    for (int i = 0; i < 3; i++) {
      buffer[2 * i + 4] = (uint8_t) (values[i] >> 8);
      buffer[2 * i + 5] = (uint8_t) (values[i] >> 0);
    }
  }
};
