import { user, session, dmCreateSuccess, dmDetailsSuccess } from '../../types';
import { requestDmCreate, requestAuthRegister, requestClear, requestDmRemove, requestUserProfile, requestDmDetails } from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('Successful removal tests', () => {
  test('Testing removal with multiple people', () => {
    const auth1: session = (requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session);
    const auth2: session = (requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session);
    const auth3: session = (requestAuthRegister(
      'what@how.net',
      'ToyzRmE12',
      'Lance',
      'Reddick'
    ) as session);

    const dmId1 = requestDmCreate(auth1.token, [auth2.authUserId, auth3.authUserId]) as dmCreateSuccess;

    expect(requestDmRemove(auth1.token, dmId1.dmId)).toStrictEqual({});
    const newDm: dmDetailsSuccess = requestDmDetails(auth1.token, dmId1.dmId);
    expect(newDm.members).toStrictEqual(undefined);
  });

  test('Testing removal with one other person', () => {
    const auth1: session = (requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session);
    const auth2: session = (requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session);

    const dmId1 = requestDmCreate(auth1.token, [auth2.authUserId]) as dmCreateSuccess;

    expect(requestDmRemove(auth1.token, dmId1.dmId)).toStrictEqual({});
    const newDm: dmDetailsSuccess = requestDmDetails(auth1.token, dmId1.dmId);
    expect(newDm.members).toStrictEqual(undefined);
  });

  test('Testing removal with single user', () => {
    const auth1: session = (requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session);
    const dmId1 = requestDmCreate(auth1.token, []) as dmCreateSuccess;

    expect(requestDmRemove(auth1.token, dmId1.dmId)).toStrictEqual({});
    const newDm: dmDetailsSuccess = requestDmDetails(auth1.token, dmId1.dmId);
    expect(newDm.members).toStrictEqual(undefined);
  });
});

describe('Unsuccessful removal tests', () => {
  const auth1: session = (requestAuthRegister(
    'example@nothing.com',
    'blorgUs9',
    'henry',
    'hutchison'
  ) as session);
  const auth2: session = (requestAuthRegister(
    'fake@example.org',
    'Dingus2',
    'Ben',
    'Donaldson'
  ) as session);
  const auth3: session = (requestAuthRegister(
    'what@how.net',
    'ToyzRmE12',
    'Lance',
    'Reddick'
  ) as session);

  const user2: user = requestUserProfile(auth2.token, auth2.authUserId);
  const user3: user = requestUserProfile(auth3.token, auth3.authUserId);

  const dmId1: dmCreateSuccess = requestDmCreate(auth1.token, [user2.uId, user3.uId]);
  const dmId2: dmCreateSuccess = requestDmCreate(auth2.token, []);
  const fake: dmCreateSuccess = { dmId: 963 };

  const badCases = [
    { a: auth1.token, b: dmId2 }, // token is valid, but not the creator of the dm
    { a: auth2.token + ' ', b: dmId1 }, // token is invalid
    { a: auth3.token, b: fake },

  ];

  test.each(badCases)('Test removal of faulty tokens and dmIds', ({ a, b }) => {
    expect(requestDmRemove(a, b.dmId)).toStrictEqual(expect.any(Number));
  });
});

