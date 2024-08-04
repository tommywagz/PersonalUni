import { session, channelsCreateSuccess, dmCreateSuccess } from '../../types';

import {
  requestClear, requestAuthRegister, requestChannelsCreate, requestChannelMessages,
  requestChannelInvite, requestMessageSend, requestMessageSenddm, requestDmMessages, requestDmCreate,
  requestUserProfile, requestUsersAll, requestAdminUserRemove
} from '../wrappers';

let user: session;

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
    `example${emailSuffix}@gmail.com`,
    'password',
    'namefirst',
    'namelast'
  ) as session;
}

beforeEach(() => {
  requestClear();
  user = createUser('one');
});

describe('error cases', () => {
  test('invalid uId', () => {
    const user2 = createUser('two');
    expect(requestAdminUserRemove(user.token, user2.authUserId + 1)).toStrictEqual(400);
  });
  test('uId is only global owner', () => {
    expect(requestAdminUserRemove(user.token, user.authUserId)).toStrictEqual(400);
  });
  test('auth user is not a global owner', () => {
    const user2 = createUser('two');
    const user3 = createUser('three');
    expect(requestAdminUserRemove(user2.token, user3.authUserId)).toStrictEqual(403);
  });
  test('invalid token', () => {
    const user2 = createUser('two');
    expect(requestAdminUserRemove(user.token + 1, user2.authUserId)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('return type', () => {
    const user2 = createUser('two');
    expect(requestAdminUserRemove(user.token, user2.authUserId)).toStrictEqual({});
  });
  test('remove one user and view all users', () => {
    const user2 = createUser('two');
    requestAdminUserRemove(user.token, user2.authUserId);
    expect(requestUsersAll(user.token)).toStrictEqual({
      users: [{
        uId: user.authUserId,
        email: 'exampleone@gmail.com',
        nameFirst: 'namefirst',
        nameLast: 'namelast',
        handleStr: 'namefirstnamelast',
        profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
      }]
    });
  });
  test('remove one user and view that user', () => {
    const user2 = createUser('two');
    requestAdminUserRemove(user.token, user2.authUserId);
    expect(requestUserProfile(user.token, user2.authUserId)).toStrictEqual({
      user: {
        uId: user2.authUserId,
        email: '[]',
        nameFirst: 'Removed',
        nameLast: 'user',
        handleStr: '[]',
        profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
      }
    });
  });
  test('remove one user and view users sent messages in channel', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, user2.authUserId);
    const messageIdCh: number = requestMessageSend(user2.token, channelId, 'hello channel').messageId;
    requestAdminUserRemove(user.token, user2.authUserId);
    expect(requestChannelMessages(user.token, channelId, 0)).toStrictEqual({
      messages: [
        {
          uId: user2.authUserId,
          messageId: messageIdCh,
          message: 'Removed user',
          timeSent: expect.any(Number),
          reacts: [],
          isPinned: false,
        }
      ],
      start: 0,
      end: -1,
    });
  });
  test('remove one user and view users sent messages in dm', () => {
    const user2 = createUser('two');
    const dmId = (requestDmCreate(user.token, [user2.authUserId]) as dmCreateSuccess).dmId;
    const messageIdDm: number = requestMessageSenddm(user2.token, dmId, 'hello dm').messageId;
    requestAdminUserRemove(user.token, user2.authUserId);
    expect(requestDmMessages(user.token, dmId, 0)).toStrictEqual({
      messages: [{
        uId: user2.authUserId,
        messageId: messageIdDm,
        message: 'Removed user',
        timeSent: expect.any(Number),
        reacts: [],
        isPinned: false,
      }],
      start: 0,
      end: -1,
    });
  });
});
