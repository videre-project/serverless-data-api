import {
  VERCEL_API_URL,
  DATA_DIR,
  VERCEL_DOMAIN_REDIRECT
} from '../../scripts/vercel/constants.js';


export function formatURI(name) {
  return VERCEL_DOMAIN_REDIRECT(`https://${[
    VERCEL_API_URL,
    DATA_DIR,
    name,
  ].join('/')}`);
};

export function formatTime(ms) {
  let totalSeconds = ms/1000;

  let days = Math.floor(totalSeconds / 86400).toFixed(0);
  let hours = Math.floor((totalSeconds % 84600) / 3600).toFixed(0);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60).toFixed(0);
  let seconds = (totalSeconds % 60).toFixed(minutes > 0 ? 0 : 3);
  // Create array of these values to later filter out null values
  let formattedArray = ms < 1000 && totalSeconds.toFixed(0) == 0
      ? [`${ (ms/1000).toFixed(3) } ${ (ms/1000 == 1 ? 'second' : 'seconds') }`]
      : [
        days > 0 ? `${ days } ${ (days == 1 ? 'day' : 'days') }` : ``,
        hours > 0 ? `${ hours } ${ (hours == 1 ? 'hour' : 'hours') }` : ``,
        minutes > 0 ? `${ minutes } ${ (minutes == 1 ? 'minute' : 'minutes') }` : ``,
        seconds > 0 ? `${ seconds } ${ (seconds == 1 ? 'second' : 'seconds') }` : ``,
      ];

  return formattedArray
    .filter(Boolean)
    .join(', ')
    // Replace last comma with ' and' for fluency
    .replace(/, ([^,]*)$/, ' and $1');
};