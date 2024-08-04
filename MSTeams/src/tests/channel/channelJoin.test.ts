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
  test('channelsCreateSuccess does not refer to valid channel', () => {
    expect(requestChannelJoin(user.token, 0)).toStrictEqual(400);
  });
  test('invalid token', () => {
    const channelsCreateSuccess = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelJoin(user.token + 'error', channelsCreateSuccess)).toStrictEqual(403);
  });
  test('member already in channel', () => {
    const channelsCreateSuccess = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelJoin(user.token, channelsCreateSuccess)).toStrictEqual(400);
  });
  test('member not in channel, not global owner, private channel', () => {
    // user is the global owner
    const user2 = createUser('two');
    const channelsCreateSuccess = (requestChannelsCreate(user.token, 'name', false) as channelsCreateSuccess).channelId;
    expect(requestChannelJoin(user2.token, channelsCreateSuccess)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('global member joins public channel', () => {
    const user2 = createUser('two');
    const channelsCreateSuccess = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    requestChannelJoin(user2.token, channelsCreateSuccess);
    expect(requestChannelDetails(user.token, channelsCreateSuccess)).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
  test('global owner joins public channel', () => {
    const user2 = createUser('two');
    const channelsCreateSuccess = (requestChannelsCreate(user2.token, 'name', true) as channelsCreateSuccess).channelId;
    requestChannelJoin(user.token, channelsCreateSuccess);
    expect(requestChannelDetails(user.token, channelsCreateSuccess)).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: [requestUserProfile(user2.token, user2.authUserId).user],
      allMembers: [requestUserProfile(user2.token, user2.authUserId).user, requestUserProfile(user.token, user.authUserId).user]
    });
  });
  test('global owner joins private channel', () => {
    const user2 = createUser('two');
    const channelsCreateSuccess = (requestChannelsCreate(user2.token, 'name', false) as channelsCreateSuccess).channelId;
    requestChannelJoin(user.token, channelsCreateSuccess);
    expect(requestChannelDetails(user.token, channelsCreateSuccess)).toStrictEqual({
      name: 'name',
      isPublic: false,
      ownerMembers: [requestUserProfile(user2.token, user2.authUserId).user],
      allMembers: [requestUserProfile(user2.token, user2.authUserId).user, requestUserProfile(user.token, user.authUserId).user]
    });
  });
});
