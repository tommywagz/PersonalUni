import { getData, setData } from './dataStore';
import { store } from './types';
import fs from 'fs';
import path from 'path';

/**
 * Resets the internal data of the application to its initial state.
 *
 * @returns { }
 */
export function clearV1() {
  const ds: store = getData();

  // Sets every key-value to an empty array.
  const keys: string[] = Object.keys(ds);
  keys.forEach((key) => (ds[key] = []));

  // Reset the dataStore to be empty.
  setData(ds);

  fs.readdir('src/imgs', (err, files) => {
    if (err) {
      console.log(err);
    }

    files.forEach(file => {
      const fileDir = path.join('src/imgs', file);

      if (file !== 'banana.jpg') {
        fs.unlinkSync(fileDir);
      }
    });
  });

  return {};
}
