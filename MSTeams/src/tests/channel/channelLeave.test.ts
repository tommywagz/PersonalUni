import { session, channelsCreateSuccess } from '../../types';

import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestChannelDetails,
  requestChannelsListAll,
  requestChannelLeave,
  requestChannelAddOwner,
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
    expect(requestChannelLeave(user.token, 0)).toStrictEqual(400);
  });
  test('channelId valid, authorised user not a member of channel', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelLeave(user2.token, channelId)).toStrictEqual(403);
  });
  test('invalid token', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelLeave(user.token + 'error', channelId)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('return type is {}', () => {
    const user2 = createUser('two');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, user2.authUserId);
    expect(requestChannelLeave(user2.token, channelId)).toStrictEqual({});
  });
  test('channel owner leaves channel with channel owner and member left', () => {
    const channelOwner = createUser('owner');
    const member = createUser('member');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, channelOwner.authUserId);
    requestChannelAddOwner(user.token, channelId, channelOwner.authUserId);
    requestChannelInvite(user.token, channelId, member.authUserId);
    requestChannelLeave(user.token, channelId);
    expect(requestChannelDetails(channelOwner.token, channelId)).toStrictEqual({
      name: 'publicName',
      isPublic: true,
      ownerMembers: [requestUserProfile(channelOwner.token, channelOwner.authUserId).user],
      allMembers: [requestUserProfile(channelOwner.token, channelOwner.authUserId).user,
        requestUserProfile(member.token, member.authUserId).user]
    });
  });
  test('channel owner leaves channel with member left', () => {
    const member = createUser('member');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, member.authUserId);
    requestChannelLeave(user.token, channelId);
    expect(requestChannelDetails(member.token, channelId)).toStrictEqual({
      name: 'publicName',
      isPublic: true,
      ownerMembers: [],
      allMembers: [requestUserProfile(member.token, member.authUserId).user]
    });
  });
  test('channel owner leaves channel empty', () => {
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelLeave(user.token, channelId);
    expect(requestChannelsListAll(user.token)).toStrictEqual({
      channels: [{
        name: 'publicName',
        channelId: channelId
      }]
    });
  });
  test('member leaves channel with channel owner and other member left', () => {
    const member = createUser('member');
    const member2 = createUser('member2');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, member.authUserId);
    requestChannelInvite(user.token, channelId, member2.authUserId);
    requestChannelLeave(member.token, channelId);
    expect(requestChannelDetails(user.token, channelId)).toStrictEqual({
      name: 'publicName',
      isPublic: true,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user,
        requestUserProfile(member2.token, member2.authUserId).user]
    });
  });
  test('member leaves channel with member left', () => {
    const member = createUser('member');
    const member2 = createUser('member2');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, member.authUserId);
    requestChannelInvite(user.token, channelId, member2.authUserId);
    requestChannelLeave(user.token, channelId);
    requestChannelLeave(member.token, channelId);
    expect(requestChannelDetails(member2.token, channelId)).toStrictEqual({
      name: 'publicName',
      isPublic: true,
      ownerMembers: [],
      allMembers: [requestUserProfile(member2.token, member2.authUserId).user]
    });
  });
  test('member leaves channel empty', () => {
    const member = createUser('member');
    const channelId = (requestChannelsCreate(user.token, 'publicName', true) as channelsCreateSuccess).channelId;
    requestChannelInvite(user.token, channelId, member.authUserId);
    requestChannelLeave(user.token, channelId);
    requestChannelLeave(member.token, channelId);
    expect(requestChannelsListAll(user.token)).toStrictEqual({
      channels: [{
        name: 'publicName',
        channelId: channelId
      }]
    });
  });
});
