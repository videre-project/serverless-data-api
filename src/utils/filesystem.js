import fs from 'fs-extra';


/**
 * Recursively crawls a directory, returning an array of file paths.
 */
export async function crawl(dir, filter, files=[]) {
  if (fs.lstatSync(dir).isDirectory()) {
    const filenames = fs.readdirSync(dir);
    await Promise.all(filenames.map(
      async (filename) => crawl(`${dir}/${filename}`, filter, files)
    ));
  } else if (!filter || filter.test(dir)) {
    files.push(dir);
  };

  return files;
};