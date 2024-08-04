import { session, channelsCreateSuccess } from '../../types';

import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestChannelDetails,
  requestChannelJoin,
  requestChannelInvite,
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
  test('channelId does not refer to valid channel', () => {
    expect(requestChannelInvite(user.token, 0, user.authUserId)).toStrictEqual(400);
  });
  test('uId does not refer to valid user', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelInvite(user.token, channelId, user.authUserId + 1)).toStrictEqual(400);
  });
  test('uId refers to a user who is already a member of the channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelInvite(user.token, channelId, user.authUserId)).toStrictEqual(400);
  });
  test('channelId valid, authorised user not a member of channel', () => {
    const user2 = createUser('two');
    const user3 = createUser('three');
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelInvite(user2.token, channelId, user3.authUserId)).toStrictEqual(403);
  });
  test('invalid token', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelInvite(user.token + 'error', channelId, user.authUserId)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('return type is {}', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    expect(requestChannelInvite(user.token, channelId, user2.authUserId)).toStrictEqual({});
  });
  test('channel owner invites member to public channel', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelJoin(user2.token, channelId);
    expect(requestChannelDetails(user2.token, channelId)).toStrictEqual({
      name: 'publicName',
      isPublic: true,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
  test('member invites member to public channel', () => {
    const user2 = createUser('two');
    const user3 = createUser('three');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelJoin(user2.token, channelId);
    requestChannelInvite(user2.token, channelId, user3.authUserId);
    expect(requestChannelDetails(user2.token, channelId)).toStrictEqual({
      name: 'publicName',
      isPublic: true,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user, requestUserProfile(user3.token, user3.authUserId).user]
    });
  });
  test('channel owner invites member to private channel', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user.token, 'privateName', false) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, user2.authUserId);
    expect(requestChannelDetails(user2.token, channelId)).toStrictEqual({
      name: 'privateName',
      isPublic: false,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
  test('member invites member to private channel', () => {
    const user2 = createUser('two');
    const user3 = createUser('three');
    const channelId = (requestChannelsCreate(user.token, 'privateName', false) as channelsCreateSuccess).channelId;
    requestChannelInvite(user2.token, channelId, user3.authUserId);
    expect(requestChannelDetails(user2.token, channelId)).toStrictEqual(403);
  });

  test('global owner invited as member, not an owner', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user2.token, 'privateName', false) as channelsCreateSuccess).channelId;
    requestChannelInvite(user2.token, channelId, user.authUserId);
    expect(requestChannelDetails(user2.token, channelId)).toStrictEqual({
      name: 'privateName',
      isPublic: false,
      ownerMembers: [requestUserProfile(user2.token, user2.authUserId).user],
      allMembers: [requestUserProfile(user2.token, user2.authUserId).user, requestUserProfile(user.token, user.authUserId).user]
    });
  });
});

