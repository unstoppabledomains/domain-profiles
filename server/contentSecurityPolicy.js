/* eslint-disable @typescript-eslint/no-var-requires */
const google = require('./csp/google.js');
const socialMedia = require('./csp/socialMedia.js');
const unstoppabledomains = require('./csp/unstoppable.js');
const opensea = require('./csp/opensea.js');
const push = require('./csp/push.js');
const xmtp = require('./csp/xmtp.js');

module.exports = {
  directives: {
    baseURI: ["'self'"],

    connectSrc: [
      "'self'",
      'data:',
      'blob:',
      'http://localhost:5003',
      'http://localhost:5004',
      ...google.connectSrc,
      ...unstoppabledomains.connectSrc,
      ...socialMedia.connectSrc,
      ...push.connectSrc,
      ...xmtp.connectSrc,
    ],

    defaultSrc: "'self'",

    fontSrc: ["'self'", ...unstoppabledomains.fontSrc, ...google.fontSrc],

    formAction: ["'self'"],

    frameAncestors: ["'none'"],

    frameSrc: [
      ...google.frameSrc,
      ...unstoppabledomains.frameSrc,
      ...socialMedia.frameSrc,
    ],

    imgSrc: [
      "'self'",
      'blob:',
      'data:',
      ...google.imgSrc,
      ...unstoppabledomains.imgSrc,
      ...socialMedia.imgSrc,
      ...push.imgSrc,
      ...xmtp.imgSrc,
      ...opensea.imgSrc,
    ],

    mediaSrc: [...google.mediaSrc, ...unstoppabledomains.mediaSrc],

    objectSrc: ['data:'],

    scriptSrc: [
      "'self'",
      "'unsafe-eval'",
      "'unsafe-inline'",
      ...google.scriptSrc,
      ...unstoppabledomains.scriptSrc,
      ...socialMedia.scriptSrc,
    ],

    styleSrc: ["'self'", "'unsafe-inline'", ...google.styleSrc],

    // blob: seems to be required to connect to MEW wallet and datadog session replays
    workerSrc: ['blob:'],
  },
};
/* eslint-enable @typescript-eslint/no-var-requires */
