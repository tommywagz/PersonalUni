import {
    session,
    userProfileSuccess,
    messageSendSuccess,
    dmCreateSuccess,
    channelDetailsSuccess,
  } from '../../types';
  
  import {
    requestClear,
    requestAuthRegister,
    requestNotificationsGet,
    requestUserProfile,
    requestMessageReact,
    requestMessageSenddm,
    requestMessageSend,
    requestChannelsCreate,
    requestChannelInvite,
    requestChannelDetails,
    requestDmCreate,
  } from '../wrappers';
  
  let user: session, userHandleStr: userProfileSuccess, channelId: number, channelName: string;
  
  beforeEach(() => {
    requestClear();
    user = requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott');
    userHandleStr = requestUserProfile(user.token, user.authUserId).user.handleStr;
    channelId = requestChannelsCreate(user.token, 'channel1', true).channelId;
    channelName = (requestChannelDetails(user.token, channelId) as channelDetailsSuccess).name;
  });
  
  describe('error cases', () => {
    test('token is the invalid string', () => {
      expect(requestNotificationsGet('invalid')).toStrictEqual(403);
    });
  });
  
  describe('success cases', () => {
    test('notification from adding in channel', () => {
      requestMessageSend(user.token, channelId, 'Turtle');
      const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session);
      requestChannelInvite(user.token, channelId, user2.authUserId);
      expect(requestNotificationsGet(user2.token).notifications).toStrictEqual([{ channelId: channelId, dmId: -1, notificationMessage: userHandleStr + ' added you to ' + channelName }]);
    });
    test('notification from adding in dm', () => {
      const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session);
      const user3 = (requestAuthRegister('emailthre@gmail.com', 'password3', 'not', 'ttobban') as session);
      const dmId = requestDmCreate(user.token, [user2.authUserId, user3.authUserId]).dmId;
      expect(requestNotificationsGet(user2.token).notifications).toStrictEqual([{ channelId: -1, dmId: dmId, notificationMessage: userHandleStr + ' added you to motttobba, notttobban, tomabbott' }]);
      expect(requestNotificationsGet(user3.token).notifications).toStrictEqual([{ channelId: -1, dmId: dmId, notificationMessage: userHandleStr + ' added you to motttobba, notttobban, tomabbott' }]);
    });
    test('notification from react in channel', () => {
      const messageId = requestMessageSend(user.token, channelId, 'Turtle').messageId;
      requestMessageReact(user.token, messageId, 1);
      expect(requestNotificationsGet(user.token).notifications).toStrictEqual([{ channelId: channelId, dmId: -1, notificationMessage: userHandleStr + ' reacted to your message in ' + channelName }]);
    });
    test('notification from react in dm', () => {
      const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session);
      const userHandleStr2 = (requestUserProfile(user2.token, user2.authUserId) as userProfileSuccess).user.handleStr;
      const dmId = (requestDmCreate(user.token, [user2.authUserId]) as dmCreateSuccess).dmId;
      const messageId = (requestMessageSenddm(user.token, dmId, 'Turtle') as messageSendSuccess).messageId;
      requestMessageReact(user.token, messageId, 1);
      expect(requestNotificationsGet(user.token).notifications).toStrictEqual([{ channelId: -1, dmId: dmId, notificationMessage: userHandleStr + ' reacted to your message in ' + userHandleStr2 + ', ' + userHandleStr }]);
    });
    test('notification from tagged in channel', () => {
      const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session);
      const userHandleStr2 = requestUserProfile(user2.token, user2.authUserId).user.handleStr;
      const messageStr: string = '@' + userHandleStr2;
      requestMessageSend(user.token, channelId, messageStr);
      const subMessageStr = messageStr.substring(0, 20);
      expect(requestNotificationsGet(user2.token).notifications).toStrictEqual([{ channelId: channelId, dmId: -1, notificationMessage: userHandleStr + ' tagged you in ' + channelName + ': ' + subMessageStr }]);
    });
    test('notification from tagged in dm', () => {
      const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session);
      const userHandleStr2 = requestUserProfile(user2.token, user2.authUserId).user.handleStr;
      const dmId = requestDmCreate(user.token, [user2.authUserId]).dmId;
      const messageStr: string = '@' + userHandleStr2;
      requestMessageSenddm(user.token, dmId, messageStr);
      const subMessageStr = messageStr.substring(0, 20);
      expect(requestNotificationsGet(user2.token).notifications).toStrictEqual([
        { channelId: -1, dmId: dmId, notificationMessage: userHandleStr + ' tagged you in motttobba, tomabbott: ' + subMessageStr },
        { channelId: -1, dmId: dmId, notificationMessage: userHandleStr + ' added you to motttobba, tomabbott' },
      ]);
    });
    test('multiple notifications', () => {
      const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session);
      const userHandleStr2 = (requestUserProfile(user2.token, user2.authUserId)).user.handleStr;
      const messageStr: string = '@' + userHandleStr2;
      const subMessageStr = messageStr.substring(0, 20);
      (requestMessageSend(user.token, channelId, messageStr) as messageSendSuccess);
      const dmId = (requestDmCreate(user.token, [user2.authUserId]) as dmCreateSuccess).dmId;
      requestMessageSenddm(user.token, dmId, messageStr);
      requestChannelInvite(user.token, channelId, user2.authUserId);
      expect(requestNotificationsGet(user2.token).notifications).toStrictEqual([
        { channelId: channelId, dmId: -1, notificationMessage: userHandleStr + ' added you to ' + channelName },
        { channelId: -1, dmId: dmId, notificationMessage: userHandleStr + ' tagged you in motttobba, tomabbott: ' + subMessageStr },
        { channelId: -1, dmId: dmId, notificationMessage: userHandleStr + ' added you to motttobba, tomabbott' },
        { channelId: channelId, dmId: -1, notificationMessage: userHandleStr + ' tagged you in ' + channelName + ': ' + subMessageStr },
      ]);
    });
  });
  
  