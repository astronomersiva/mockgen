#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const args = require('args');
const puppeteer = require('puppeteer');
const mergeImages = require('merge-images');
const Canvas = require('canvas');
const ora = require('ora');
const chalk = require('chalk');
const tmp = require('tmp');
const filenamify = require('filenamify');
const filenamifyUrl = require('filenamify-url');
const List = require('prompt-list');
const devices = require('./devices.js');

tmp.setGracefulCleanup();

const {log} = console;
const {
  cyan: info,
  red: error,
  yellow: tip
} = chalk;

(async () => {
  args
    .option('url', 'The URL of the website that you wish to mockup')
    .option(
      'assets',
      'Path to folder that contains Facebook Devices',
      process.cwd()
    )
    .option('device', 'The device for which you want a mockup')
    .option('shadows', 'Should the mockup have shadows?', true);
  // .option('landscape', 'Landscape mode', false); image rotation needed in merge-images

  const flags = args.parse(process.argv, {
    mri: {
      boolean: ['s']
    }
  });
  const {url, assets, shadows} = flags;
  let deviceToMock = flags.device;

  if (!url || url.length === 0) {
    log(error('\nPlease enter a URL.\n'));
    log(`\nRun ${tip('mockgen help')} to know more.\n`);

    process.exit(1);
  }

  let device = devices[deviceToMock];
  if (!device) {
    if (deviceToMock) {
      log(error('\nInvalid device name passed.\n'));
    }

    const devicePrompt = new List({
      name: 'deviceToMock',
      message: 'Please select a device.',
      choices: Object.keys(devices)
    });
    deviceToMock = await devicePrompt.run();
    device = devices[deviceToMock];
  }

  if (!fs.existsSync(path.join(assets, 'Facebook Devices'))) {
    log(error('\nPlease enter a valid assets path.\n'));

    process.exit(1);
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const puppeteerSpinner = ora(`Visiting ${url}`).start();
    const screenshot = tmp.fileSync({postfix: '.png'});
    await page.goto(url);

    const {deviceObject, viewport} = device;
    if (deviceObject) {
      await page.emulate(deviceObject);
    }
    if (viewport) {
      await page.setViewport(viewport);
    }

    await page.screenshot({path: screenshot.name});
    puppeteerSpinner.stop();

    let deviceBasePath = path.join(assets, device.mockup);
    deviceBasePath = shadows ? deviceBasePath : deviceBasePath.replace(/Device With Shadow/ig, 'Device');

    const baseImageVariants = fs.readdirSync(deviceBasePath);
    let variant;
    if (baseImageVariants.length > 1) {
      const variantPrompt = new List({
        name: 'variant',
        message: 'Which base image would you like to use?',
        choices: baseImageVariants
      });
      variant = await variantPrompt.run();
    } else {
      [variant] = baseImageVariants;
    }

    const imageSpinner = ora('Generating mockup').start();
    const b64 = await mergeImages(
      [
        {src: screenshot.name, x: device.offsetX || 0, y: device.offsetY || 0},
        path.join(deviceBasePath, variant)
      ],
      {Canvas}
    );
    const data = b64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const deviceNameFormatted = filenamify(deviceToMock).split(' ').join('-').toLowerCase();
    const mockup = `${filenamifyUrl(url)}-${deviceNameFormatted}.png`;
    fs.writeFileSync(mockup, buffer);
    imageSpinner.stop();

    log(`\n✨   Mockup saved to ${info(mockup)}\n`);

    await browser.close();
  } catch (err) {
    log(error(`\n${err}`));
    process.exit(1);
  }
})();
