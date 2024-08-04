import {
    requestAuthRegister,
    requestClear,
    requestChannelsCreate,
    requestChannelJoin,
    requestMessageSend,
    requestMessagePin,
    requestMessageUnpin,
    requestDmCreate,
    requestMessageSenddm,
    requestChannelMessages,
    requestDmMessages,
  } from '../wrappers';
  
  import { session, channelsCreateSuccess, channelMessagesSuccess, dmCreateSuccess } from '../../types';
  
  let userOne: session;
  
  beforeEach(() => {
    requestClear();
    userOne = requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session;
  });
  
  describe('failure', () => {
    test('token is invalid', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      expect(requestMessageUnpin('Invalid', messageId)).toStrictEqual(403);
    });
    test('messageId does not refer to a valid message within a channel that the authorised user has joined', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      requestMessageSend(userOne.token, channelId, 'Turtle');
      expect(requestMessageUnpin(userOne.token, 12345)).toStrictEqual(400);
    });
    test('messageId does not refer to a valid message within a DM that the authorised user has joined', () => {
      const dmId = (requestDmCreate(userOne.token, []) as dmCreateSuccess).dmId;
      requestMessageSenddm(userOne.token, dmId, 'Cow');
      expect(requestMessageUnpin(userOne.token, 5959595)).toStrictEqual(400);
    });
    test('the message is not already pinned', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      expect(requestMessageUnpin(userOne.token, messageId)).toStrictEqual(400);
    });
    test('the message refers to valid message but was not sent by the authorised user making this request and the user does not have owner permissions in the channel', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      requestMessagePin(userOne.token, messageId);
      const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
      requestChannelJoin(userToken2, channelId);
      expect(requestMessageUnpin(userToken2, messageId)).toStrictEqual(403);
    });
    test('the message refers to valid message but was not sent by the authorised user making this request and the user does not have owner permissions in the DM', () => {
      const auth2: session = requestAuthRegister('fake@example.org', 'Dingus2', 'Ben', 'Donaldson') as session;
      const dmId = (requestDmCreate(userOne.token, [auth2.authUserId]) as dmCreateSuccess).dmId;
      const messageId = requestMessageSenddm(userOne.token, dmId, 'Cow').messageId;
      requestMessagePin(userOne.token, messageId);
      expect(requestMessageUnpin(auth2.token, messageId)).toStrictEqual(403);
    });
  });
  
  describe('sucess', () => {
    test('message is unpinned from channel correct return', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      requestMessagePin(userOne.token, messageId);
      expect(requestMessageUnpin(userOne.token, messageId)).toStrictEqual({});
    });
    test('message is unpinned from channel correct view', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      requestMessagePin(userOne.token, messageId);
      requestMessageUnpin(userOne.token, messageId);
      expect(requestChannelMessages(userOne.token, channelId, 0) as channelMessagesSuccess).toStrictEqual({
        messages: [{ messageId: messageId, uId: userOne.authUserId, message: 'Turtle', timeSent: expect.any(Number), reacts: [], isPinned: false }],
        start: expect.any(Number),
        end: expect.any(Number)
      });
    });
    test('two messages pinned but unpin first one', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      const messageId2 = requestMessageSend(userOne.token, channelId, 'Turtle2').messageId;
      requestMessagePin(userOne.token, messageId);
      requestMessagePin(userOne.token, messageId2);
      requestMessageUnpin(userOne.token, messageId);
      expect(requestChannelMessages(userOne.token, channelId, 0) as channelMessagesSuccess).toStrictEqual({
        messages: [{ messageId: messageId2, uId: userOne.authUserId, message: 'Turtle2', timeSent: expect.any(Number), reacts: [], isPinned: true },
          { messageId: messageId, uId: userOne.authUserId, message: 'Turtle', timeSent: expect.any(Number), reacts: [], isPinned: false }],
        start: expect.any(Number),
        end: expect.any(Number)
      });
    });
    test('two messages pinnedbut unpin second one', () => {
      const channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      const messageId2 = requestMessageSend(userOne.token, channelId, 'Turtle2').messageId;
      requestMessagePin(userOne.token, messageId);
      requestMessagePin(userOne.token, messageId2);
      requestMessageUnpin(userOne.token, messageId2);
      expect(requestChannelMessages(userOne.token, channelId, 0) as channelMessagesSuccess).toStrictEqual({
        messages: [{ messageId: messageId2, uId: userOne.authUserId, message: 'Turtle2', timeSent: expect.any(Number), reacts: [], isPinned: false },
          { messageId: messageId, uId: userOne.authUserId, message: 'Turtle', timeSent: expect.any(Number), reacts: [], isPinned: true }],
        start: expect.any(Number),
        end: expect.any(Number)
      });
    });
    test('message is unpinned from dm correct return', () => {
      const dmId = (requestDmCreate(userOne.token, []) as dmCreateSuccess).dmId;
      const messageId = requestMessageSenddm(userOne.token, dmId, 'Cow').messageId;
      requestMessagePin(userOne.token, messageId);
      expect(requestMessageUnpin(userOne.token, messageId)).toStrictEqual({});
    });
    test('message is unpinned from dm correct view', () => {
      const dmId = (requestDmCreate(userOne.token, []) as dmCreateSuccess).dmId;
      const messageId = requestMessageSenddm(userOne.token, dmId, 'Cow').messageId;
      requestMessagePin(userOne.token, messageId);
      requestMessageUnpin(userOne.token, messageId);
      expect(requestDmMessages(userOne.token, dmId, 0)).toStrictEqual({
        messages: [{
          message: 'Cow',
          messageId: messageId,
          timeSent: expect.any(Number),
          uId: 0,
          reacts: [],
          isPinned: false
        }],
        start: 0,
        end: -1,
      });
    });
  });
  
  