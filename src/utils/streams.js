// see ranges and units in polar sdk's README :
// https://github.com/polarofficial/polar-ble-sdk

const polarHr = {
  label: 'HR',
  sample: {
    hr: {
      type: 'integer',
      unit: 'Hz',
      min: 0,
      max: 220,
    },
    contact: { type: 'boolean' },
    contactSupported: { type: 'boolean' },
    rrAvailable: { type: 'boolean' },
    rrs: {
      type: 'integer',
      unit: 'raw',
      min: 0,
      max: 1024,
    },
    rrsMs: {
      type: 'integer',
      unit: 'ms',
      min: 0,
      max: 1000,
    },
  },
};

const polarAcc = {
  label: 'ACC',
  sample: {
    x: {
      type: 'integer',
      unit: 'mG',
      min: -4000,
      max: 4000,
    },
    y: {
      type: 'integer',
      unit: 'mG',
      min: -4000,
      max: 4000,
    },
    z: {
      type: 'integer',
      unit: 'mG',
      min: -4000,
      max: 4000,
    },
  },  
};

const descriptions = {

  //////////////////// POLAR

  polar: {

  ////////// H10

    H10: {
      streams: {
        hr: polarHr,
        acc: polarAcc,
        ecg: {
          label: 'ECG',
          sample: {
            value: {
              type: 'integer',
              unit: 'microvolt',
              min: -1000,
              max: 1000,
            },
          },
        },
      },
    },

  ////////// 0H1

    OH1: {
      streams: {
        hr: polarHr,
        acc: polarAcc,
        ppg: {
          label: 'PPG',
          sample: {
            ppg0: {
              type: 'integer',
              unit: 'unknown',
              min: 0,
              max: 1000,
            },
            ppg1: {
              type: 'integer',
              unit: 'unknown',
              min: 0,
              max: 1000,
            },
            ppg2: {
              type: 'integer',
              unit: 'unknown',
              min: 0,
              max: 1000,
            },
            ambient: {
              type: 'integer',
              unit: 'unknown',
              min: 0,
              max: 1000,
            },
          },
        },
        ppi: {
          label: "PPI",
          sample: {
            hr: {
              type: 'integer',
              unit: 'Hz',
              min: 0,
              max: 220,
            },
            ppInMs: {
              type: 'integer',
              unit: 'ms',
              min: 0,
              max: 1000,
            },
            ppErrorEstimate: {
              type: 'integer',
              unit: 'Hz',
              min: 0,
              max: 1000,
            },
            blockerBit: { type: 'boolean' },
            skinContactStatus: { type: 'boolean' },
            skinContactSupported: { type: 'boolean' },
          },
        },
      }, // streams
    }, // oh1
  }, // polar

  //////////////////// MOVUINO

  movuino: {

  ////////// OHB

    OHB: {
      streams: {
        acc: {
          label: 'ACC',
          sample: {
            x: {
              type: 'integer',
              unit: 'mG',
              min: -4000,
              max: 4000
            },
            y: {
              type: 'integer',
              unit: 'mG',
              min: -4000,
              max: 4000
            },
            z: {
              type: 'integer',
              unit: 'mG',
              min: -4000,
              max: 4000
            },
          }
        },
        gyr: {
          label: 'GYR',
          sample: {
            x: {
              type: 'integer',
              unit: 'DPS',
              min: -2000,
              max: 2000
            },
            y: {
              type: 'integer',
              unit: 'DPS',
              min: -2000,
              max: 2000
            },
            z: {
              type: 'integer',
              unit: 'DPS',
              min: -2000,
              max: 2000
            },
          }
        },
        mag: {
          label: 'MAG',
          sample: {
            x: {
              type: 'integer',
              unit: 'unknown',
              min: -2000,
              max: 2000
            },
            y: {
              type: 'integer',
              unit: 'unknown',
              min: -2000,
              max: 2000
            },
            z: {
              type: 'integer',
              unit: 'unknown',
              min: -2000,
              max: 2000
            },
          }
        },
        /*
        ppg: {
          label: 'PPG',
          sample: {
            red: {
              type: 'integer',
              unit: 'unknown',
              min: 0,
              max: 4096,
            },
            ir: {
              type: 'integer',
              unit: 'unknown',
              min: 0,
              max: 4096,
            },
            green: {
              type: 'integer',
              unit: 'unknown',
              min: 0,
              max: 4096,
            },
          }
        },
        //*/
      }, // streams
    }, // OHB
  }, // movuino
};

export {
  descriptions,
};