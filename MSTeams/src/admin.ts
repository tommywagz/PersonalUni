import { getData, setData } from './dataStore';
import { userInfo, store } from './types';
import { isValidToken, getUId, isGlobalOwner } from './helpers';
import HttpError from 'http-errors';

/**
 * Given a user by their uId, removes them from Memes
 *
 * @param {string} token - authentication of the user making the function call
 * @param {integer} uId - unique identifier for a user
 *
 * @returns { } - returns null if no error
 */
export function adminUserRemoveV1(
  token: string,
  uId: number
): object {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HttpError(403, 'Token is invalid');
  }

  // find auth user in the datastore from token parameter
  const userId: number = getUId(token);

  // #region Errors
  const user: userInfo = ds.users.find(x => x.uId === uId);

  if (user === undefined) {
    throw HttpError(400, 'Invalid user');
  }

  if (isGlobalOwner(uId) === true) {
    throw HttpError(400, 'user is only global owner');
  }

  if (isGlobalOwner(userId) === false) {
    throw HttpError(403, 'auth user is does not have right permissions');
  }
  // #endregion

  // change user info
  user.nameFirst = 'Removed';
  user.nameLast = 'user';
  user.email = '[]';
  user.handleStr = '[]';
  user.deleted = true;

  // change user's messages
  for (const messageItem of ds.messages) {
    if (messageItem.uId === uId) {
      messageItem.message = 'Removed user';
    }
  }

  // // remove user from ds
  // const index: number = ds.users.indexOf(user);
  // ds.users.splice(index, 1);

  setData(ds);

  return {};
}

export function adminUserpermissionChange(token: string, uId: number, permissionId: number): object {
  const ds = getData();

  if (!isValidToken(token)) {
    throw HttpError(403, 'invalid token');
  }

  const authUser: userInfo = ds.users.find(x => x.uId === getUId(token));
  const user: userInfo = ds.users.find(x => x.uId === uId);

  if (user === undefined) {
    throw HttpError(400, 'user does not exist');
  }

  if (user.permissionId === permissionId) {
    throw HttpError(400, 'permissionId is already set to specified value');
  }

  if (authUser.permissionId !== 1) {
    throw HttpError(403, 'authuser is not global owner');
  }

  if (permissionId !== 1 && permissionId !== 2) {
    throw HttpError(400, 'permissionId is invalid');
  }

  let numGlobalOwners = 0;
  for (const user of ds.users) {
    if (user.permissionId === 1) {
      numGlobalOwners++;
    }
  }

  if (numGlobalOwners === 1 && permissionId !== 1) {
    throw HttpError(400, 'can not remove last global owner');
  }

  ds.users.find(x => x.uId === uId).permissionId = permissionId;

  setData(ds);

  return {};
}
