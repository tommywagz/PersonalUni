import {
    session,
  } from '../../types';
  
  import {
    requestClear,
    requestAuthRegister,
    requestAuthLogin,
  } from '../wrappers';
  
  let authUser: session;
  
  beforeEach(() => {
    requestClear();
    authUser = (
            requestAuthRegister(
              'aaron.apple@email.com',
              '123456',
              'Aaron',
              'Apple'
            ) as session
    );
  });
  
  describe('error cases', () => {
    test('invalid email and valid password', () => {
      const resultLogin = requestAuthLogin('aaron.banana@email.com', '123456') as number;
      expect(resultLogin).toEqual(400);
    });
  
    test('invalid email and invalid password', () => {
      const resultLogin = requestAuthLogin('aaron.banana@email.com', '123457') as number;
      expect(resultLogin).toEqual(400);
    });
  
    test('valid email and invalid password', () => {
      const resultLogin = requestAuthLogin('aaron.apple@email.com', '123457') as number;
      expect(resultLogin).toEqual(400);
    });
  
    test('empty email and empty password', () => {
      const resultLogin = requestAuthLogin('', '') as number;
      expect(resultLogin).toEqual(400);
    });
  });
  
  describe('success', () => {
    test('valid email and valid password', () => {
      const resultLogin = requestAuthLogin(
        'aaron.apple@email.com',
        '123456'
      ) as session;
      expect(resultLogin).toEqual({ token: resultLogin.token, authUserId: authUser.authUserId });
    });
  });
  
  