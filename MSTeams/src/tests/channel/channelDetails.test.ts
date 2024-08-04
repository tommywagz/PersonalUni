import { session, channelsCreateSuccess } from '../../types';

import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestChannelDetails,
  requestChannelJoin,
  requestUserProfile
} from '../wrappers';

// const ERROR: error = { error: expect.any(String) };

let user1: session;

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
  user1 = createUser('one');
});

describe('error cases', () => {
  test('channelId does not refer to valid channel', () => {
    expect(requestChannelDetails(user1.token, 0)).toStrictEqual(400);
  });
  test('valid channelId, auth not member', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelDetails(user2.token, channelId)).toStrictEqual(403);
  });
  test('invalid token', () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelDetails(user1.token + 'error', channelId)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('valid user1, valid public channelId', () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelDetails(user1.token, channelId)).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: [requestUserProfile(user1.token, user1.authUserId).user],
      allMembers: [requestUserProfile(user1.token, user1.authUserId).user]
    });
  });

  test('valid user1, valid private channelId', () => {
    const channelId = (requestChannelsCreate(user1.token, 'name', false) as channelsCreateSuccess).channelId;
    expect(requestChannelDetails(user1.token, channelId)).toStrictEqual({
      name: 'name',
      isPublic: false,
      ownerMembers: [requestUserProfile(user1.token, user1.authUserId).user],
      allMembers: [requestUserProfile(user1.token, user1.authUserId).user]
    });
  });
  test('add user1 to valid public channel, view from user1', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    requestChannelJoin(user2.token, channelId);
    expect(requestChannelDetails(user1.token, channelId)).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: [requestUserProfile(user1.token, user1.authUserId).user],
      allMembers: [requestUserProfile(user1.token, user1.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
  test('add user1 to valid public channel, view from user2', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user1.token, 'name', true) as channelsCreateSuccess).channelId;
    requestChannelJoin(user2.token, channelId);
    expect(requestChannelDetails(user2.token, channelId)).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: [requestUserProfile(user1.token, user1.authUserId).user],
      allMembers: [requestUserProfile(user1.token, user1.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
});

