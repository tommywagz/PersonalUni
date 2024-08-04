import { store } from './types';
import { saveData } from './server';

// The initial data-store
let data: store = {
  users: [],
  channels: [],
  dms: [],
  messages: [],
  sessions: [],
  standups: [],
  reacts: [],
  notifications: [],
};

/**
 * Function to retrieve the datastore
 *
 * @returns {object}  -    returns the current datastore
 */
export function getData(): store {
  return data;
}

/**
 * Function to update the datastore
 *
 * @param {object} newData   -   updated data
 */
export function setData(newData: store) {
  data = newData;
  saveData();
}
