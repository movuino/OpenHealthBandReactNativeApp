// GUID generated on https://www.guidgenerator.com/online-guid-generator.aspx :
// a1f04dcbbfbd470fa4f8bd251953cd79

#define CUSTOM_UUID_PREFIX "a1f04dcb"
#define CUSTOM_UUID_SUFFIX "470fa4f8bd251953cd79"

uint8_t* makeUint8ArrayUuid(String val) {
  uint8_t* res = new uint8_t[16];
  
  String fullUuid(CUSTOM_UUID_PREFIX);
  fullUuid += val;
  fullUuid += CUSTOM_UUID_SUFFIX;

  // transform hex string into uint8_t array :
  
  for (int i = 0; i < 16; i++) {
    res[15 - i] = strtoul(fullUuid.substring(i*2, (i+1)*2).c_str(), NULL, 16);
  }
  
  return res;
}
