import { session } from '../../types';

import {
  requestClear, requestAuthRegister, requestAdminUserpermissionChange
} from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('error', () => {
  test('uId invalid', () => {
    const token = (requestAuthRegister('email@gmail.com', 'password', 'tom', 'abbott') as session).token;
    expect(requestAdminUserpermissionChange(token, 3, 1)).toStrictEqual(400);
  });
  test('uId is the only global user', () => {
    const token = (requestAuthRegister('email@gmail.com', 'password', 'tom', 'abbott') as session).token;
    expect(requestAdminUserpermissionChange(token, 0, 1)).toStrictEqual(400);
  });
  test('permId is already that value', () => {
    const token1 = (requestAuthRegister('email@gmail.com', 'password', 'tom', 'abbott') as session).token;
    requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'abbott');
    expect(requestAdminUserpermissionChange(token1, 1, 2)).toStrictEqual(400);
  });
  test('permId invalid', () => {
    const token1 = (requestAuthRegister('email@gmail.com', 'password', 'tom', 'abbott') as session).token;
    requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'abbott');
    expect(requestAdminUserpermissionChange(token1, 1, 10)).toStrictEqual(400);
  });
  test('authUser is not a global owner', () => {
    requestAuthRegister('email@gmail.com', 'password', 'tom', 'abbott');
    const token2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'abbott') as session).token;
    expect(requestAdminUserpermissionChange(token2, 1, 1)).toStrictEqual(403);
  });
});

describe('succes', () => {
  test('authUser is not a global owner', () => {
    const token1 = (requestAuthRegister('email@gmail.com', 'password', 'tom', 'abbott') as session).token;
    requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'abbott');
    expect(requestAdminUserpermissionChange(token1, 1, 1)).toStrictEqual({});
  });
});

