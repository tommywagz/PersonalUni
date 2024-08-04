import {
    requestAuthRegister,
    requestClear,
    requestChannelsCreate,
    requestChannelJoin,
    requestMessageSend,
    requestMessagePin,
    requestChannelMessages,
    requestDmCreate,
    requestMessageSenddm
  } from '../wrappers';
  
  import {
    session,
    channelsCreateSuccess,
    channelMessagesSuccess
  } from '../../types';
  
  let userOne: session, channelId: number;
  
  beforeEach(() => {
    requestClear();
    userOne = requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session;
    channelId = (requestChannelsCreate(userOne.token, 'channel1', true) as channelsCreateSuccess).channelId;
  });
  
  describe('failure', () => {
    test('token is invalid', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      expect(requestMessagePin(userOne.token + 1, messageId)).toStrictEqual(403);
    });
    test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
      requestMessageSend(userOne.token, channelId, 'Turtle');
      expect(requestMessagePin(userOne.token, 5959595)).toStrictEqual(400);
    });
    test('message is already pinned', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      requestMessagePin(userOne.token, messageId);
      expect(requestMessagePin(userOne.token, messageId)).toStrictEqual(400);
    });
    test('the message refers to valid message but was not sent by the authorised user making this request and the user does not have owner permissions in the channel', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
      requestChannelJoin(userToken2, channelId);
      expect(requestMessagePin(userToken2, messageId)).toStrictEqual(403);
    });
    test('the message refers to valid message but was not sent by the authorised user making this request and the user does not have owner permissions in the DM', () => {
      const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session);
      const dmId = requestDmCreate(userOne.token, [user2.authUserId]).dmId;
      const messageId = requestMessageSenddm(userOne.token, dmId, 'Turtle').messageId;
      expect(requestMessagePin(user2.token, messageId)).toStrictEqual(403);
    });
  });
  
  describe('success', () => {
    test('message pin correct return', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      expect(requestMessagePin(userOne.token, messageId)).toStrictEqual({});
    });
    test('message pin correct view', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      requestMessagePin(userOne.token, messageId);
      expect(requestChannelMessages(userOne.token, channelId, 0) as channelMessagesSuccess).toStrictEqual({
        messages: [{ messageId: messageId, uId: userOne.authUserId, message: 'Turtle', timeSent: expect.any(Number), reacts: [], isPinned: true }],
        start: expect.any(Number),
        end: expect.any(Number)
      });
    });
    test('two messages but pin first one', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      const messageId2 = requestMessageSend(userOne.token, channelId, 'Turtle2').messageId;
      requestMessagePin(userOne.token, messageId);
      expect(requestChannelMessages(userOne.token, channelId, 0) as channelMessagesSuccess).toStrictEqual({
        messages: [{ messageId: messageId2, uId: userOne.authUserId, message: 'Turtle2', timeSent: expect.any(Number), reacts: [], isPinned: false },
          { messageId: messageId, uId: userOne.authUserId, message: 'Turtle', timeSent: expect.any(Number), reacts: [], isPinned: true }],
        start: expect.any(Number),
        end: expect.any(Number)
      });
    });
    test('two messages but pin second one', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      const messageId2 = requestMessageSend(userOne.token, channelId, 'Turtle2').messageId;
      requestMessagePin(userOne.token, messageId2);
      expect(requestChannelMessages(userOne.token, channelId, 0) as channelMessagesSuccess).toStrictEqual({
        messages: [{ messageId: messageId2, uId: userOne.authUserId, message: 'Turtle2', timeSent: expect.any(Number), reacts: [], isPinned: true },
          { messageId: messageId, uId: userOne.authUserId, message: 'Turtle', timeSent: expect.any(Number), reacts: [], isPinned: false }],
        start: expect.any(Number),
        end: expect.any(Number)
      });
    });
    test('two messages and pin both', () => {
      const messageId = requestMessageSend(userOne.token, channelId, 'Turtle').messageId;
      const messageId2 = requestMessageSend(userOne.token, channelId, 'Turtle2').messageId;
      requestMessagePin(userOne.token, messageId);
      requestMessagePin(userOne.token, messageId2);
      expect(requestChannelMessages(userOne.token, channelId, 0) as channelMessagesSuccess).toStrictEqual({
        messages: [{ messageId: messageId2, uId: userOne.authUserId, message: 'Turtle2', timeSent: expect.any(Number), reacts: [], isPinned: true },
          { messageId: messageId, uId: userOne.authUserId, message: 'Turtle', timeSent: expect.any(Number), reacts: [], isPinned: true }],
        start: expect.any(Number),
        end: expect.any(Number)
      });
    });
  });
  
  