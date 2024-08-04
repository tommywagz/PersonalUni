import { user, session, dmCreateSuccess } from '../../types';
import { requestDmCreate, requestAuthRegister, requestClear, requestUserProfile } from '../wrappers';

import config from '../../config.json';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'localhost';

const SUCCESS: dmCreateSuccess = { dmId: expect.any(Number) };

beforeEach(() => {
  requestClear();
});

test('Test no uIds', () => {
  const auth1: session = (requestAuthRegister(
    'example@nothing.com',
    'blorgUs9',
    'henry',
    'hutchison'
  ) as session);
  const users: number[] = [];
  expect(requestDmCreate(auth1.token, users)).toStrictEqual(SUCCESS);
});

describe('Successful dm creations', () => {
  test('Normal dm createion test to others', () => {
    const auth1: session = requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session;

    const auth2: session = requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session;

    const auth3: session = requestAuthRegister(
      'imaginaryAcc@something.aol',
      '1PWplease',
      'Angus',
      'Bell'
    ) as session;

    const Users1: number[] = [auth2.authUserId, auth3.authUserId];
    expect(requestDmCreate(auth1.token, Users1)).toStrictEqual(SUCCESS);
  });

  test('Normal dm creation test to one other person', () => {
    const auth1: session = requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session;
    const user1: user = requestUserProfile(auth1.token, auth1.authUserId).user;

    const auth2: session = requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session;

    const Users2: number[] = [user1.uId];
    expect(requestDmCreate(auth2.token, Users2)).toStrictEqual(SUCCESS);
  });

  test('Normal dm createion test to self', () => {
    const auth3: session = requestAuthRegister(
      'imaginaryAcc@something.aol',
      '1PWplease',
      'Angus',
      'Bell'
    ) as session;
    const user3: user = requestUserProfile(auth3.token, auth3.authUserId).user;

    const Users3: number[] = [user3.uId];
    expect(requestDmCreate(auth3.token, Users3)).toStrictEqual(SUCCESS);
  });
});

let testNo = 1;
describe('Unsuccessful dm creations', () => {
  const auth1: session = requestAuthRegister(
    'example@nothing.com',
    'blorgUs9',
    'henry',
    'hutchison'
  ) as session;

  const auth2: session = requestAuthRegister(
    'fake@example.org',
    'Dingus2',
    'Ben',
    'Donaldson'
  ) as session;

  const auth3: session = requestAuthRegister(
    'imaginaryAcc@something.aol',
    '1PWplease',
    'Angus',
    'Bell'
  ) as session;
  const user3: user = requestUserProfile(auth3.token, auth3.authUserId);

  const user4: user = {
    uId: user3.uId + 7,
    email: user3.email,
    nameFirst: user3.nameFirst,
    nameLast: user3.nameLast,
    handleStr: user3.handleStr + '  l',
    profileImgUrl: `http://${HOST}:${PORT}/imgs/banana.jpg`,
  };

  const Users4: number[] = [auth1.authUserId, auth2.authUserId, auth3.authUserId];
  const Users5: number[] = [auth2.authUserId, user4.uId];
  const Users6: number[] = [auth3.authUserId, auth2.authUserId, auth3.authUserId];
  const Users7: number[] = [user4.uId];
  const badCases = [
    { a: auth1.token + ' ', b: Users4 },
    { a: auth2.token + ' ', b: Users5 },
    { a: auth3.token, b: Users6 },
    { a: auth2.token, b: Users7 },
  ];

  test.each(badCases)(`testing errors #${testNo}`, ({ a, b }) => {
    testNo++;
    const result = requestDmCreate(a, b);
    expect(result).toStrictEqual(expect.any(Number));
  });
});
