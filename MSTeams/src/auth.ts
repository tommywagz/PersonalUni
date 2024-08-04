import { getData, setData } from './dataStore';
import validator from 'validator';
import { store, error, userInfo, session } from './types';
import { v4 as uuidv4 } from 'uuid';
import { isValidToken, hashString, hashVerify, sendEmail } from './helpers';
import HTTPError from 'http-errors';

import config from './config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

/**
 * Given a user's first and last name, email address, and password,
 * creates a new account for them and returns a new authUserId.
 *
 * @param {string} email - email of the user making the function call
 * @param {integer} password - password of the user's account
 * @param {string} nameFirst - the first name of the user
 * @param {string} nameLast - the last name of the user
 *l
 * @returns {token: string} token of the user making the function call
 * @returns {error: string} - returns error when invalid
 */
export function authRegisterV3(
  email: string,
  password: string,
  nameFirst: string,
  nameLast: string
): session | error {
  const ds: store = getData();

  // #region Errors
  for (const user of ds.users) {
    if (user.email === email) {
      throw HTTPError(400, 'email already used');
    }
  }

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'email invalid');
  }

  if (password.length < 6) {
    throw HTTPError(400, 'password too short');
  }

  if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'firstname length not valid');
  }

  if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'lastname length not valid');
  }
  // #endregion

  // Create a lowercase alphanumeric handle from first and last name
  let handle: string = (nameFirst + nameLast).toLowerCase().replace(/\W/g, '');

  // Cut the handle to be of length 20
  handle = handle.substring(0, 20);

  const handleLength: number = handle.length;

  // Generate a positive integer suffix to ensure handle is unique
  let suffix = -1;
  for (const item of ds.users) {
    if (item.handleStr.substring(0, handleLength) === handle) {
      suffix++;
    }
  }

  if (suffix !== -1) {
    handle = handle + suffix;
  }

  // Generate a unique uId
  const id: number = ds.users.length;
  let permissionId: number;

  if (id === 0) {
    permissionId = 1;
  } else {
    permissionId = 2;
  }

  const hashedPassword: string = hashString(password);

  if (hashVerify(password, hashedPassword) === false) {
    throw HTTPError(400, 'password hashing failed');
  }

  const user: userInfo = {
    uId: id,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    handleStr: handle,
    password: hashedPassword,
    permissionId: permissionId,
    resetCode: undefined,
    deleted: false,
    profileImgUrl: `http://${HOST}:${PORT}/imgs/banana.jpg`,
  };

  ds.users.push(user);

  const token: string = uuidv4();

  const session: session = {
    token: token,
    authUserId: id,
  };

  ds.sessions.push(session);

  setData(ds);

  return { token: token, authUserId: id };
}

/**
 * Returns authUserId if email and password are valid and match.
 *
 * @param {email: string} - takes in the user's email
 * @param {password: string} - takes in the user's password
 *
 * @returns {token: string} token of the user making the function call
 * @returns {authUserId: number} - returns authUserId of user
 * @returns {error: string} - returns error when invalid
 */
export function authLoginV3(
  email: string,
  password: string
): session | error {
  const ds: store = getData();

  const user: userInfo = ds.users.find(x => x.email === email);

  // #region Errors
  if (user === undefined) {
    throw HTTPError(400, 'invalid email');
  }

  if (!hashVerify(password, user.password)) {
    throw HTTPError(400, 'invalid password');
  }
  // endregion

  const token: string = uuidv4();

  ds.sessions.push({ token: token, authUserId: user.uId });

  setData(ds);

  return { token: token, authUserId: user.uId };
}

/**
   * Given an active token, invalidates the token to log the user out.
   *
   * @param {token: string} - takes in the user's email
   *
   * @returns {error: string} - returns error when invalid token
   */
export function authLogoutV2(
  token: string
) {
  const ds: store = getData();

  // #region Errors
  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }
  // endregion

  for (const item of ds.sessions) {
    if (item.token === token) {
      item.token = 'invalid';
    }
  }

  setData(ds);

  return {};
}

export function authPasswordResetRequest(email: string): object {
  const ds = getData();

  const user: userInfo = ds.users.find(x => x.email === email);

  // If the email doesn't refer to a vaid user, return.
  if (user === undefined) {
    return {};
  }

  // Clear sessions
  ds.sessions = ds.sessions.filter(x => x.authUserId !== user.uId);

  // Create code and send email with code
  const code: string = uuidv4();
  sendEmail(email, code);

  // Set code in datastore for paswordReset
  (ds.users.find(x => x.email === email) as userInfo).resetCode = code;

  setData(ds);

  return {};
}

export function authPasswordResetReset(resetCode: string, newPassword: string): object {
  const ds = getData();

  if (newPassword.length < 6) {
    throw HTTPError(400, 'invalid password');
  }

  // Find the user based on the reset code
  const user: userInfo = ds.users.find(x => x.resetCode === resetCode);

  // If the code doesn't exist, throw an error
  if (user === undefined) {
    throw HTTPError(400, 'resetCode is not a valid resetCode');
  }

  // Else, set the new password.
  ds.users.find(x => x.resetCode === resetCode).password = hashString(newPassword);

  // Invalidate the resetcode
  ds.users.find(x => x.resetCode === resetCode).resetCode = undefined;

  setData(ds);

  return {};
}

