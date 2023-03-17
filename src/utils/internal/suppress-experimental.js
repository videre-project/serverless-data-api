import log from './log.js';

const SUPPRESS_WARNINGS_ENABLE = process.argv.includes('--suppress-experimental')

// TODO: add args for adding custom listener.
export function suppressWarnings() {
  const originalEmit = process.emit;

  process.emit = function (name, data, ...args) {
    if (name === 'warning') return false;
    // if (
    //   name === 'warning' &&
    //   typeof data === 'object' &&
    //   data.name === 'ExperimentalWarning' &&
    //   ( // Vercel/Next-specific warnings
    //     data.message.includes('--experimental-loader') ||
    //     data.message.includes('Custom ESM Loaders is an experimental feature') ||
    //     data.message.includes('The Node.js specifier resolution flag is experimental') ||
    //     data.message.includes('Importing JSON modules is an experimental feature') ||
    //     data.message.includes('Use `node --trace-warnings ...`') ||
    //     // Project-specific warnings
    //     data.message.includes('stream/web is an experimental feature.') ||
    //     data.message.includes('buffer.Blob is an experimental feature.'))
    // ) return false;

    return originalEmit.apply(process, arguments);
  };
};

export default () => {
  // Hide experimental warnings in production.
  if (SUPPRESS_WARNINGS_ENABLE || process.env['suppress-warn'] !== 'false') {
    log({ label: 'Logs' }, 'Suppressing experimental flags...');
    suppressWarnings(); 
    log({ label:'Logs', indent:0 }, 'Use --suppress-experimental to configure.');
  };
}