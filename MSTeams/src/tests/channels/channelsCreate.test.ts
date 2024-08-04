import {
    session,
    error,
    channelsCreateSuccess,
  } from '../../types';
  
  import {
    requestClear,
    requestAuthRegister,
    requestChannelsCreate,
    requestChannelsListAll,
  } from '../wrappers';
  
  // const ERROR = { error: expect.any(String) };
  
  let userToken: string;
  
  beforeEach(() => {
    requestClear();
    userToken = (
        requestAuthRegister(
          'emailone@gmail.com',
          'password',
          'tom',
          'abbott'
        ) as session
    ).token;
  });
  
  describe('error cases', () => {
    test('Test no name', () => {
      expect(requestChannelsCreate(userToken, '', true) as error).toStrictEqual(400);
    });
  
    test('Test name too long', () => {
      expect(requestChannelsCreate(userToken, 'dddddddddddddddddddddd', true) as error).toStrictEqual(400);
    });
  
    test('Test invalid token', () => {
      expect(requestChannelsCreate('invalid', 'golf', true) as error).toStrictEqual(403);
    });
  });
  
  describe('success', () => {
    test('return type', () => {
      expect(requestChannelsCreate(userToken, 'channel1', true)).toStrictEqual({ channelId: expect.any(Number) });
    });
  
    test('correct output for one channel', () => {
      const newId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
      expect(requestChannelsListAll(userToken)).toStrictEqual({ channels: [{ channelId: newId, name: 'channel1' }] });
    });
  
    test('correct output for two channels', () => {
      const newId1 = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
      const newId2 = (requestChannelsCreate(userToken, 'channel2', false) as channelsCreateSuccess).channelId;
      expect(requestChannelsListAll(userToken)).toStrictEqual({
        channels: [
          {
            channelId: newId1,
            name: 'channel1',
          },
          {
            channelId: newId2,
            name: 'channel2',
          },
        ],
      });
    });
  });
  
  