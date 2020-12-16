const uint8_t FIRMWARE_VERSION[] = { 1, 0, 0 };

// GUID generated on https://www.guidgenerator.com/online-guid-generator.aspx :
// 28b967f0-5e8e-4309-b2de-3d4e0e9f2542
#define OPENHEALTHBAND_NANO33BLE_UUID(val) ("28b967f0-" val "-4309-b2de-3d4e0e9f2542")

// ArduinoBLE limits the MTU to 23 bytes
// A 3 bytes long header is included in the MTU, so the data can only take up to 20 bytes
// It looks like 23 is the default MTU size for a ble connection
// 
// TODO :
// - fork the ArduinoBLE lib to enable bigger MTUs (see src/utility.ATT.cpp)
// - figure out how to handle negociation (from periph or central ? => seems negociation is initiated by central ...)
// ==> Done (ATT_MTU has to be negociated, and only react-native-ble-plx allows to do this in a cross-platform way)
// - or : fragment data in 20 byte packets
// ==> This is what we'll be doing for now until we test the MTU negociation on android and ios

#define MAX_BLE_PACKET_SIZE 20

#define STREAM_VECTOR_LENGTH 4 // ACCX, ACCY, ACCZ, PPG/ECG
#define STREAM_VECTOR_SIZE 8 //STREAM_VECTOR_LENGTH * sizeof(int16_t)
#define STREAM_PACKET_SIZE 16 // STREAM_VECTOR_SIZE * (MAX_BLE_PACKET_SIZE / STREAM_VECTOR_SIZE) // actually 16 bytes (8 * (20 / 8))
#define STREAM_PACKET_LENGTH 2 // STREAM_PACKET_SIZE / (STREAM_VECTOR_LENGTH * sizeof(int16_t))

#define HR_PACKET_SIZE sizeof(uint8_t) // 1 byte is sufficient for a real heartrate

// #define MAX_BLE_PACKET_SIZE 512 // <=> 256 * sizeof(int16_t) // seems to work
// #define MAX_BLE_PACKET_SIZE 1024 // <=> 512 * sizeof(int16_t) // seems too high
// #define MAX_BLE_PACKET_SIZE 185 // limit on iOS, android is higher, should be negociated
#define MAX_INT16_BUFFER_SIZE (MAX_BLE_PACKET_SIZE / sizeof(int16_t))
#define MAX_FLOAT_BUFFER_SIZE (MAX_BLE_PACKET_SIZE / sizeof(float))

// #define SAMPLERATE 200
// #define INTERVAL (1000 / SAMPLERATE)

// #define CONNECTION_INTERVAL 30
#define INTERVAL 7.5f
#define SAMPLERATE (1000 / INTERVAL)
