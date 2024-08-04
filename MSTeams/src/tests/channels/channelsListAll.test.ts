import {
    session,
    channelsListSuccess,
    channelsCreateSuccess,
  } from '../../types';
  
  import {
    requestClear,
    requestAuthRegister,
    requestChannelsCreate,
    requestChannelsListAll,
  } from '../wrappers';
  
  // const ERROR: error = { error: expect.any(String) };
  
  let authToken: string;
  
  beforeEach(() => {
    requestClear();
    authToken = (
            requestAuthRegister(
              'aaron.apple@email.com',
              '123456',
              'Aaron',
              'Apple'
            ) as session
    ).token;
  });
  
  describe('error cases', () => {
    test('invalid authUserId', () => {
      expect(requestChannelsListAll(authToken + 1)).toStrictEqual(403);
    });
  
    test('no channels', () => {
      const result = requestChannelsListAll(authToken) as channelsListSuccess;
      expect(result).toStrictEqual({ channels: [] });
    });
  });
  
  describe('success', () => {
    test('create and view one public channel', () => {
      const channel1Id = (
                requestChannelsCreate(authToken, 'channel1', true) as channelsCreateSuccess
      ).channelId;
      const result = requestChannelsListAll(authToken) as channelsListSuccess;
      expect(result).toStrictEqual({
        channels: [
          {
            channelId: channel1Id,
            name: 'channel1',
          },
        ],
      });
    });
  
    test('create and view one private channel', () => {
      const channel1Id = (
                requestChannelsCreate(authToken, 'channel1', false) as channelsCreateSuccess
      ).channelId;
      const result = requestChannelsListAll(authToken) as channelsListSuccess;
      expect(result).toStrictEqual({
        channels: [
          {
            channelId: channel1Id,
            name: 'channel1',
          },
        ],
      });
    });
  
    test('create and view one public and one private channel', () => {
      const channelPublicId = (
                requestChannelsCreate(authToken, 'channelPublic', true) as channelsCreateSuccess
      ).channelId;
      const channelPrivateId = (
                requestChannelsCreate(authToken, 'channelPrivate', false) as channelsCreateSuccess
      ).channelId;
      const result = requestChannelsListAll(authToken) as channelsListSuccess;
      expect(result).toStrictEqual({
        channels: [
          {
            channelId: channelPublicId,
            name: 'channelPublic',
          },
          {
            channelId: channelPrivateId,
            name: 'channelPrivate',
          },
        ],
      });
    });
  
    test('create one public and one private channel, view from user not in either', () => {
      const channelPublicId = (
                requestChannelsCreate(authToken, 'channelPublic', true) as channelsCreateSuccess
      ).channelId;
      const channelPrivateId = (
                requestChannelsCreate(authToken, 'channelPrivate', false) as channelsCreateSuccess
      ).channelId;
      const authUserId2: string = (
                requestAuthRegister(
                  'bettie.banana@email.com',
                  '234567',
                  'Bettie',
                  'Banana'
                ) as session
      ).token;
      const result = requestChannelsListAll(authUserId2) as channelsListSuccess;
      expect(result).toStrictEqual({
        channels: [
          {
            channelId: channelPublicId,
            name: 'channelPublic',
          },
          {
            channelId: channelPrivateId,
            name: 'channelPrivate',
          },
        ],
      });
    });
  });
  
  