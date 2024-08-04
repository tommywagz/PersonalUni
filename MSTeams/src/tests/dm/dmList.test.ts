import { session, dmCreateSuccess } from '../../types';
import { requestDmCreate, requestAuthRegister, requestClear, requestDmList } from '../wrappers';

beforeEach(() => {
  requestClear();
});

test('Not a member of any dms', () => {
  const auth1: session = (requestAuthRegister(
    'example@nothing.com',
    'blorgUs9',
    'henry',
    'hutchison'
  ) as session);
  expect(requestDmList(auth1.token)).toStrictEqual({ dms: [] });
});

describe('Successfull list tests', () => {
  test('Successful case - token 1', () => {
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
    const dmId1: number = (requestDmCreate(auth1.token, [auth2.authUserId, auth3.authUserId]) as dmCreateSuccess).dmId;
    const dmId2: number = (requestDmCreate(auth1.token, []) as dmCreateSuccess).dmId;
    const dmId4: number = (requestDmCreate(auth3.token, [auth2.authUserId, auth1.authUserId]) as dmCreateSuccess).dmId;

    expect(requestDmList(auth1.token)).toStrictEqual({
      dms: [
        {
          dmId: dmId1,
          name: 'bendonaldson, henryhutchison, lancereddick',
        },
        {
          dmId: dmId2,
          name: 'henryhutchison',
        },
        {
          dmId: dmId4,
          name: 'bendonaldson, henryhutchison, lancereddick',
        },
      ]
    });
  });

  test('Successful case - token 2', () => {
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
    const auth4: session = (requestAuthRegister(
      'acct@email.au',
      'someth1ng',
      'Ben',
      'Dowling'
    ) as session);

    const dmId1: number = (requestDmCreate(auth1.token, [auth2.authUserId, auth3.authUserId]) as dmCreateSuccess).dmId;
    const dmId3: number = (requestDmCreate(auth2.token, [auth4.authUserId]) as dmCreateSuccess).dmId;
    const dmId4: number = (requestDmCreate(auth3.token, [auth2.authUserId, auth1.authUserId]) as dmCreateSuccess).dmId;
    expect(requestDmList(auth2.token)).toStrictEqual({
      dms: [
        {
          dmId: dmId1,
          name: 'bendonaldson, henryhutchison, lancereddick',
        },
        {
          dmId: dmId3,
          name: 'bendonaldson, bendowling',
        },
        {
          dmId: dmId4,
          name: 'bendonaldson, henryhutchison, lancereddick',
        },
      ]
    });
  });

  test('Successful case - token 3', () => {
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

    const dmId1: number = (requestDmCreate(auth1.token, [auth2.authUserId, auth3.authUserId]) as dmCreateSuccess).dmId;
    const dmId4: number = (requestDmCreate(auth3.token, [auth2.authUserId, auth1.authUserId]) as dmCreateSuccess).dmId;
    expect(requestDmList(auth3.token)).toStrictEqual({
      dms: [
        {
          dmId: dmId1,
          name: 'bendonaldson, henryhutchison, lancereddick',
        },
        {
          dmId: dmId4,
          name: 'bendonaldson, henryhutchison, lancereddick',
        },
      ]
    });
  });

  test('Successful case - token 4', () => {
    const auth2: session = (requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session);

    const auth4: session = (requestAuthRegister(
      'acct@email.au',
      'someth1ng',
      'Ben',
      'Dowling'
    ) as session);

    const dmId3: number = (requestDmCreate(auth2.token, [auth4.authUserId]) as dmCreateSuccess).dmId;
    expect(requestDmList(auth4.token)).toStrictEqual({
      dms: [
        {
          dmId: dmId3,
          name: 'bendonaldson, bendowling',
        },
      ]
    });
  });
});

describe('Unsuccessful list tests', () => {
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
  const badCases = [auth1.token + ' ', ' ', auth1.token + auth2.token, String(54)];
  test.each(badCases)('testing with the incorrect tokens', (a) => {
    expect(requestDmList(a)).toStrictEqual(403);
  });
});

