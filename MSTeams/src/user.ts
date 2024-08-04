import { getData, setData } from './dataStore';
import { user, store, userInfo, userProfileSuccess } from './types';
import { isValidToken, userObject, getUId } from './helpers';
import { v4 as uuidv4 } from 'uuid';

import request from 'sync-request';
import validator from 'validator';
import HTTPError from 'http-errors';
import sharp from 'sharp';
import fs from 'fs';
import config from './config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

/**
 * provides information that describes the user with the uId parameter
 * that the function identifies given the authId and uId
 *
 * @param { integer } uId  - number identifying the authorized user ID
 * @param { integer } uId - number identifying the regular user id
 *
 * @returns { user } returns an object containing the user profile
 */

export function userProfileV3(token: string, uId: number): userProfileSuccess {
  const ds: store = getData();

  const user: userInfo = ds.users.find((x) => x.uId === uId);

  // #region Errors
  if (user === undefined) {
    throw HTTPError(400, 'user is not defined');
  }

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }
  // #endregion

  const profile: user = userObject(uId);

  return { user: profile };
}

export function userProfileSetnameV2(token: string, nameFirst: string, nameLast: string) : object {
  // #region errors
  if (nameFirst.length > 50 || nameFirst.length < 1) {
    throw HTTPError(400, 'invalid nameFirst');
  }

  if (nameLast.length > 50 || nameLast.length < 1) {
    throw HTTPError(400, 'invalid nameLast');
  }

  if (!isValidToken(token)) {
    throw HTTPError(403, 'token is invalid');
  }
  // #endregion errors

  // get the uId correlating with the session
  const ds: store = getData();
  const uId: number = ds.sessions.find(x => x.token === token).authUserId;

  // get the user object and update its nameFirst and nameLast
  ds.users.find(x => x.uId === uId).nameFirst = nameFirst;
  ds.users.find(x => x.uId === uId).nameLast = nameLast;

  setData(ds);

  return {};
}

export function userProfileSetemailV2(token: string, email: string): object {
  const ds: store = getData();

  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'invalid email');
  }

  if (!isValidToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  for (const user of ds.users) {
    if (user.email === email) {
      throw HTTPError(400, 'email already in use');
    }
  }

  // get the uId correlating with the session
  const uId: number = ds.sessions.find(x => x.token === token).authUserId;

  // get the user object and update its email
  ds.users.find(x => x.uId === uId).email = email;

  setData(ds);

  return {};
}

export function userProfileSethandleV2(token: string, handleStr: string): object {
  const ds: store = getData();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  if (handleStr.length > 20 || handleStr.length < 3) {
    throw HTTPError(400, 'invalid handleStr');
  }

  if (!(/^[a-zA-Z0-9]+$/.test(handleStr))) {
    throw HTTPError(400, 'invalid handleStr (not alphanumeric)');
  }

  for (const user of ds.users) {
    if (user.handleStr === handleStr) {
      throw HTTPError(400, 'invalid handleStr (already in use)');
    }
  }

  // get the uId correlating with the session
  const uId: number = ds.sessions.find(x => x.token === token).authUserId;

  // get the user object and update its handleStr
  ds.users.find(x => x.uId === uId).handleStr = handleStr;

  setData(ds);

  return {};
}

export function userProfileUploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number): object {
  const ds: store = getData();

  const tag = uuidv4();

  if (!isValidToken(token)) {
    throw HTTPError(403, 'invalid token');
  }

  try {
    const res = request('GET', imgUrl);

    const body = res.getBody();
    const path = `src/imgs/raw${tag}.jpg`;
    fs.writeFileSync(path, body, { flag: 'w' });
  } catch (error) {
    throw HTTPError(400, 'unable to get image');
  }

  async function checkMetaData() {
    try {
      const mdata = await sharp(`src/imgs/raw${tag}.jpg`).metadata();

      if ((mdata.format !== 'jpeg') && (mdata.format !== 'jpg')) {
        throw new Error('wrong img format');
      }

      if ((xStart < 0 || xStart > mdata.width) || (xEnd > mdata.width) || (yStart < 0 || yStart > mdata.height) || (yEnd > mdata.height)) {
        throw new Error('invalid dimensions for crop');
      }
    } catch (error) {
      throw HTTPError(400, error);
    }
  }

  try { checkMetaData(); } catch (error) {
    throw HTTPError(400, error.message);
  }

  checkMetaData();

  function cropImage() {
    try {
      sharp(`src/imgs/raw${tag}.jpg`)
        .extract({ width: xEnd - xStart, height: yEnd - yStart, left: xStart, top: yStart })
        .toFile(`src/imgs/cropped${tag}.jpg`);
    } catch (error) {
      throw HTTPError(400, 'issue cropping image');
    }
  }

  cropImage();

  ds.users.find(x => x.uId === getUId(token)).profileImgUrl = `http://${HOST}:${PORT}/imgs/cropped${tag}.jpg`;

  setData(ds);

  return {};
}
