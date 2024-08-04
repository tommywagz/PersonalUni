import { session, dmCreateSuccess, dmDetailsSuccess } from '../../types';
import { requestDmCreate, requestAuthRegister, requestClear, requestDmDetails, requestDmLeave, requestUserProfile } from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('Succesful new dmDetailsSuccess tests post member leaving', () => {
  test('Test leaving full dm', () => {
    const user1: session = (requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session);
    const user2: session = (requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session);
    const user3: session = (requestAuthRegister(
      'what@how.net',
      'ToyzRmE12',
      'Lance',
      'Reddick'
    ) as session);

    const dm1: dmCreateSuccess = requestDmCreate(user3.token, [user1.authUserId, user2.authUserId]) as dmCreateSuccess;
    expect(requestDmLeave(user1.token, dm1.dmId)).toStrictEqual({});
    expect(requestDmDetails(user2.token, dm1.dmId) as dmDetailsSuccess).toStrictEqual(
      {
        name: 'bendonaldson, henryhutchison, lancereddick',
        members: [requestUserProfile(user3.token, user3.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user],
      }
    );
  });

  test('Test creator leaving full dm', () => {
    const user1: session = (requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session);
    const user2: session = (requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session);
    const user3: session = (requestAuthRegister(
      'what@how.net',
      'ToyzRmE12',
      'Lance',
      'Reddick'
    ) as session);

    const dm2: dmCreateSuccess = requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]) as dmCreateSuccess;

    expect(requestDmLeave(user1.token, dm2.dmId)).toStrictEqual({});

    expect(requestDmDetails(user2.token, dm2.dmId) as dmDetailsSuccess).toStrictEqual(
      {
        name: 'bendonaldson, henryhutchison, lancereddick',
        members: [requestUserProfile(user2.token, user2.authUserId).user, requestUserProfile(user3.token, user3.authUserId).user],
      }
    );
  });

  test('Test creator leaving empty dm', () => {
    const user1: session = (requestAuthRegister(
      'example@nothing.com',
      'blorgUs9',
      'henry',
      'hutchison'
    ) as session);

    const dm4: dmCreateSuccess = requestDmCreate(user1.token, []) as dmCreateSuccess;

    expect(requestDmLeave(user1.token, dm4.dmId)).toStrictEqual({});

    expect(requestDmDetails(user1.token, dm4.dmId) as dmDetailsSuccess).toStrictEqual(expect.any(Number));
  });

  test('Test creator leaving dm', () => {
    const user2: session = (requestAuthRegister(
      'fake@example.org',
      'Dingus2',
      'Ben',
      'Donaldson'
    ) as session);
    const user3: session = (requestAuthRegister(
      'what@how.net',
      'ToyzRmE12',
      'Lance',
      'Reddick'
    ) as session);

    const dm3: dmCreateSuccess = requestDmCreate(user2.token, [user3.authUserId]) as dmCreateSuccess;

    expect(requestDmLeave(user2.token, dm3.dmId)).toStrictEqual({});

    expect(requestDmDetails(user3.token, dm3.dmId)).toStrictEqual(
      {
        name: 'bendonaldson, lancereddick',
        members: [requestUserProfile(user3.token, user3.authUserId).user],
      }
    );
  });
});

describe('Unsuccessful dmDetailsSuccess Testing after leave', () => {
  const user1: session = (requestAuthRegister(
    'example@nothing.com',
    'blorgUs9',
    'henry',
    'hutchison'
  ) as session);
  const user2: session = (requestAuthRegister(
    'fake@example.org',
    'Dingus2',
    'Ben',
    'Donaldson'
  ) as session);
  const user3: session = (requestAuthRegister(
    'what@how.net',
    'ToyzRmE12',
    'Lance',
    'Reddick'
  ) as session);

  const dm1: dmCreateSuccess = requestDmCreate(user3.token, [user1.authUserId, user2.authUserId]);
  const dm3: dmCreateSuccess = requestDmCreate(user2.token, [user3.authUserId]);
  const dm5: dmCreateSuccess = {
    dmId: 96,
  };

  const badCases = [
    { a: ' ', b: dm1 },
    { a: user1.token, b: dm3 },
    { a: user1.token, b: dm5 },
    { a: 'blorgus', b: dm5 },
  ];

  test.each(badCases)('Testing broken tokens and dmIds', ({ a, b }) => {
    expect(requestDmLeave(a, b.dmId)).toStrictEqual(expect.any(Number));
    expect(requestDmDetails(a, b.dmId)).toStrictEqual(expect.any(Number));
  });
});

