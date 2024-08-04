import { getData } from './dataStore';
import { usersAllSuccess, user, error } from './types';
import { isValidToken, userObject } from './helpers';

import HTTPError from 'http-errors';

/**
 * returns a list of all users
 *
 * @param { string } token  - string identifying the authorized users session
 *
 * @returns { users } returns an array of all users and their associated details
 */

export function usersAllV1(token: string): usersAllSuccess | error {
  const storedUsers = getData().users;

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }

  const allUserProfiles: user[] = [];
  for (const item of storedUsers) {
    if (item.deleted === false) {
      allUserProfiles.push(userObject(item.uId));
    }
  }

  allUserProfiles.sort((a: user, b: user) => b.uId - a.uId);

  return { users: allUserProfiles };
}
