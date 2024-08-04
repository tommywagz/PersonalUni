import { requestClear, requestAuthPasswordresetRequest, requestAuthPasswordresetReset } from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('passwordRequest', () => {
  test('invalid email', () => {
    expect(requestAuthPasswordresetRequest('tow7304@gmail.com')).toStrictEqual({});
  });
//   test('valid email', () => {
//     requestAuthRegister('tow7304@gmail.com', 'password', 'name1', 'name2');
//     expect(requestAuthPasswordresetRequest('tow7304@gmail.com')).toStrictEqual({});
//   });
});

describe('passwordReset', () => {
  test('password invalid', () => {
    expect(requestAuthPasswordresetReset('code', '123')).toStrictEqual(400);
  });
});
