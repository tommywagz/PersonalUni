import { session } from '../../types';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserProfileSethandle } from '../wrappers';

beforeEach(() => {
  requestClear();
});

const INVALID_HANDLES = [['?=123abc'], ['12 34'], ['alphanumeric?nahhhh%'], ['( does this work?'], ['ab'], ['thisstringiswaytoolongwoweee']];
const VALID_HANDLE = 'thisisvalid';

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
        `example${emailSuffix}@gmail.com`,
        'password',
        'namefirst',
        'namelast'
  ) as session;
}

describe('error cases', () => {
  test.each(INVALID_HANDLES)('Invalid handle: $newhandle', (newhandle) => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSethandle(userToken, newhandle)).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSethandle(userToken + '1', VALID_HANDLE)).toStrictEqual(403);
  });
  test('handle is already taken', () => {
    const userOne = createUser('one');
    const userTwo = createUser('two');
    expect(requestUserProfileSethandle(userOne.token, requestUserProfile(userTwo.token, userTwo.authUserId).user.handleStr)).toStrictEqual(400);
  });
});

describe('success', () => {
  test('return type', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSethandle(userToken, VALID_HANDLE)).toStrictEqual({});
  });
  test('changes handle', () => {
    const userOne = createUser('one');
    requestUserProfileSethandle(userOne.token, VALID_HANDLE);
    expect(requestUserProfile(userOne.token, userOne.authUserId).user.handleStr).toStrictEqual(VALID_HANDLE);
  });
});
