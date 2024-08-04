import {
    session,
    channelsCreateSuccess,
    channelsListSuccess,
  } from '../../types';
  
  import {
    requestClear,
    requestAuthRegister,
    requestChannelsCreate,
    requestChannelsList,
  } from '../wrappers';
  
  let authToken: string;
  let channelId: number;
  
  beforeEach(() => {
    requestClear();
    authToken = (
        requestAuthRegister(
          'aaron.apple@gmail.com',
          '123456',
          'Aaron',
          'Apple'
        ) as session
    ).token;
  
    channelId = (
        requestChannelsCreate(
          authToken,
          'golf',
          true
        ) as channelsCreateSuccess
    ).channelId;
  });
  
  describe('error cases', () => {
    test('Test invalid authUserId channels list', () => {
      expect(requestChannelsList('-1')).toStrictEqual(403);
    });
  });
  
  describe('success', () => {
    test('Test successful channels list', () => {
      expect(requestChannelsList(authToken) as channelsListSuccess).toStrictEqual({
        channels: [{ channelId: channelId, name: 'golf' }],
      });
    });
  
    test('Test multiple channels', () => {
      const channelId1: number = (
                requestChannelsCreate(
                  authToken,
                  'cricket',
                  true
                ) as channelsCreateSuccess
      ).channelId;
  
      expect(requestChannelsList(authToken) as channelsListSuccess).toStrictEqual({
        channels: [{ channelId: channelId, name: 'golf' },
          { channelId: channelId1, name: 'cricket' }],
      });
    });
  });
  
  