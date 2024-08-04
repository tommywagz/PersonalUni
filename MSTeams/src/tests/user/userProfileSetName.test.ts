import { session } from '../../types';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserProfileSetname } from '../wrappers';

beforeEach(() => {
  requestClear();
});

const LONG_STRING = '01234567890123456789012345678901234567890123456789012345678910';
const SHORT_STRING = '';

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
        `example${emailSuffix}@gmail.com`,
        'password',
        'namefirst',
        'namelast'
  ) as session;
}

describe('error cases', () => {
  test('nameFirst too short', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, SHORT_STRING, 'lastname')).toStrictEqual(400);
  });
  test('nameFirst too long', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, LONG_STRING, 'lastname')).toStrictEqual(400);
  });
  test('nameLast too short', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, 'firstname', SHORT_STRING)).toStrictEqual(400);
  });
  test('nameLast too long', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, 'firstname', LONG_STRING)).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken + '1', 'firstname', 'lastname')).toStrictEqual(403);
  });
});

describe('sucess', () => {
  test('returns empty object', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, 'firstname', 'lastname')).toStrictEqual({});
  });
  test('changes firstname and lastname', () => {
    const userOne = createUser('one');
    requestUserProfileSetname(userOne.token, 'newfirstname', 'newlastname');
    expect(requestUserProfile(userOne.token, userOne.authUserId).user.nameFirst).toStrictEqual('newfirstname');
    expect(requestUserProfile(userOne.token, userOne.authUserId).user.nameLast).toStrictEqual('newlastname');
  });
});

import { session } from '../../types';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserProfileSetname } from '../wrappers';

beforeEach(() => {
  requestClear();
});

const LONG_STRING = '01234567890123456789012345678901234567890123456789012345678910';
const SHORT_STRING = '';

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
        `example${emailSuffix}@gmail.com`,
        'password',
        'namefirst',
        'namelast'
  ) as session;
}

describe('error cases', () => {
  test('nameFirst too short', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, SHORT_STRING, 'lastname')).toStrictEqual(400);
  });
  test('nameFirst too long', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, LONG_STRING, 'lastname')).toStrictEqual(400);
  });
  test('nameLast too short', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, 'firstname', SHORT_STRING)).toStrictEqual(400);
  });
  test('nameLast too long', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, 'firstname', LONG_STRING)).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken + '1', 'firstname', 'lastname')).toStrictEqual(403);
  });
});

describe('sucess', () => {
  test('returns empty object', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetname(userToken, 'firstname', 'lastname')).toStrictEqual({});
  });
  test('changes firstname and lastname', () => {
    const userOne = createUser('one');
    requestUserProfileSetname(userOne.token, 'newfirstname', 'newlastname');
    expect(requestUserProfile(userOne.token, userOne.authUserId).user.nameFirst).toStrictEqual('newfirstname');
    expect(requestUserProfile(userOne.token, userOne.authUserId).user.nameLast).toStrictEqual('newlastname');
  });
});

