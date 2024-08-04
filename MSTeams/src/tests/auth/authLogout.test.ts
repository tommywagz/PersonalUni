import { session } from '../../types';
import {
  requestClear,
  requestAuthRegister,
  requestAuthLogin,
  requestAuthLogout,
  requestChannelsList,
} from '../wrappers';

// const ERROR: error = { error: expect.any(String) };

let userToken: string;

beforeEach(() => {
  requestClear();
  userToken = (
      requestAuthRegister(
        'emailone@gmail.com',
        'password',
        'tom',
        'abbott'
      ) as session
  ).token;
});

describe('error cases', () => {
  test('token is the invalid string', () => {
    expect(requestAuthLogout('invalid')).toStrictEqual(403);
  });

  test('token not in dataStore', () => {
    expect(requestAuthLogout('-1')).toStrictEqual(403);
  });
});

describe('success', () => {
  test('valid token correct return', () => {
    expect(requestAuthLogout(userToken)).toStrictEqual({});
  });

  test('valid token and view', () => {
    expect(requestAuthLogout(userToken)).toStrictEqual({});
    expect(requestChannelsList(userToken)).toStrictEqual(403);
  });

  test('valid token and view using authLogin', () => {
    requestAuthLogout(userToken);
    const loginToken: string = requestAuthLogin('emailone@gmail.com', 'password').token;
    requestAuthLogout(loginToken);
    expect(requestChannelsList(loginToken)).toStrictEqual(403);
  });
});

