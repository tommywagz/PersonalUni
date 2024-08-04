import { session } from '../../types';
import { requestClear, requestAuthRegister, requestUserProfile, requestUserProfileSetemail } from '../wrappers';

beforeEach(() => {
  requestClear();
});

const INVALID_EMAIL = 'isthisvalid?';
const NEW_VALID_EMAIL = 'exampletwo@gmail.com';

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
        `example${emailSuffix}@gmail.com`,
        'password',
        'namefirst',
        'namelast'
  ) as session;
}

describe('error cases', () => {
  test('token is invalid', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetemail(userToken + '1', NEW_VALID_EMAIL)).toStrictEqual(403);
  });
  test('email is not a valid email', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetemail(userToken, INVALID_EMAIL)).toStrictEqual(400);
  });
  test('email is already taken', () => {
    const userToken = createUser('one').token;
    createUser('two');
    expect(requestUserProfileSetemail(userToken, NEW_VALID_EMAIL)).toStrictEqual(400);
  });
});

describe('success', () => {
  test('return type', () => {
    const userToken = createUser('one').token;
    expect(requestUserProfileSetemail(userToken, NEW_VALID_EMAIL)).toStrictEqual({});
  });
  test('changes email', () => {
    const userOne = createUser('one');
    requestUserProfileSetemail(userOne.token, NEW_VALID_EMAIL);

    expect(requestUserProfile(userOne.token, userOne.authUserId).user.email).toStrictEqual(NEW_VALID_EMAIL);
  });
});

