import { session, channelsCreateSuccess } from '../../types';

import {
  requestClear,
  requestAuthRegister,
  requestChannelsCreate,
  requestChannelDetails,
  requestChannelInvite,
  requestChannelAddOwner,
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
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    expect(requestChannelAddOwner(user.token, channelId + 1, user2.authUserId)).toStrictEqual(400);
  });

  test('uId does not refer to a valid user', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    expect(requestChannelAddOwner(user.token, channelId, user2.authUserId + 1)).toStrictEqual(400);
  });
  test('uId refers to a user who is not a member of the channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    expect(requestChannelAddOwner(user.token, channelId, user2.authUserId)).toStrictEqual(400);
  });
  test('uId refers to a user who is already an owner of the channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    expect(requestChannelAddOwner(user.token, channelId, user.authUserId)).toStrictEqual(400);
  });
  test('channelId is valid, authorised user has no owner permissions in channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    const user3 = createUser('three');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    requestChannelInvite(user.token, channelId, user3.authUserId);
    expect(requestChannelAddOwner(user2.token, channelId, user3.authUserId)).toStrictEqual(403);
  });
  test('invalid token', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    expect(requestChannelAddOwner(user.token + 'error', channelId, user2.authUserId)).toStrictEqual(403);
  });
});

describe('success', () => {
  test('return type', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    expect(requestChannelAddOwner(user.token, channelId, user2.authUserId)).toStrictEqual({});
  });
  test('add one owner to public channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    requestChannelAddOwner(user.token, channelId, user2.authUserId);
    expect(requestChannelDetails(user.token, channelId)).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
  test('add one owner to private channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', false) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    requestChannelAddOwner(user.token, channelId, user2.authUserId);
    expect(requestChannelDetails(user.token, channelId)).toStrictEqual({
      name: 'name',
      isPublic: false,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user, requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
  test('add two owners to public channel', () => {
    const channelId = (requestChannelsCreate(user.token, 'name', true) as channelsCreateSuccess).channelId;
    const user2 = createUser('two');
    const user3 = createUser('three');
    requestChannelInvite(user.token, channelId, user2.authUserId);
    requestChannelInvite(user.token, channelId, user3.authUserId);
    requestChannelAddOwner(user.token, channelId, user2.authUserId);
    requestChannelAddOwner(user.token, channelId, user3.authUserId);
    expect(requestChannelDetails(user.token, channelId)).toStrictEqual({
      name: 'name',
      isPublic: true,
      ownerMembers: [requestUserProfile(user.token, user.authUserId).user,
        requestUserProfile(user2.token, user2.authUserId).user,
        requestUserProfile(user3.token, user3.authUserId).user],
      allMembers: [requestUserProfile(user.token, user.authUserId).user,
        requestUserProfile(user2.token, user2.authUserId).user,
        requestUserProfile(user3.token, user3.authUserId).user]
    });
  });
});
