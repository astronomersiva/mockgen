const devices = require('puppeteer/DeviceDescriptors');

module.exports = {
  'Apple iPhone X': {
    deviceObject: devices['iPhone X'],
    mockup: 'Facebook Devices/Phones/Apple iPhone X/Device With Shadow',
    offsetX: 140,
    offsetY: 180
  },
  'Apple iMac Retina': {
    viewport: {width: 2560, height: 1440, deviceScaleFactor: 2},
    mockup: 'Facebook Devices/Computers/Apple iMac Retina/Device With shadow',
    offsetX: 225,
    offsetY: 290
  },
  'Apple iPad Pro': {
    deviceObject: devices['iPad Pro'],
    mockup: 'Facebook Devices/Tablets/Apple iPad Pro/Device With Shadow',
    offsetX: 200,
    offsetY: 350
  },
  'Samsung Galaxy S8': {
    viewport:{width: 360, height: 740, deviceScaleFactor: 4},
    mockup: 'Facebook Devices/Phones/Samsung Galaxy S8/Device With Shadow',
    offsetX: 100,
    offsetY: 320
  },
  'Google Pixel 2': {
    viewport:{width: 411, height: 731, deviceScaleFactor: 2.6},
    mockup: 'Facebook Devices/Phones/Google Pixel 2/Device With Shadow',
    offsetX: 125,
    offsetY: 370
  },
};
