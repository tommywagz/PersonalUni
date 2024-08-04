import { session, channelsCreateSuccess } from '../../types';
import { requestClear, requestAuthRegister, requestChannelsCreate, requestMessageSendLater } from '../wrappers';
const sleep = require('atomic-sleep');

beforeEach(() => {
  requestClear();
});
describe('error cases', () => {
  test('Token is invalud', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 5);

    expect(requestMessageSendLater(userToken + 100, channelId, message, timeSent)).toStrictEqual(403);
  });
  test('Invalid channelId', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 5);

    expect(requestMessageSendLater(userToken, channelId + 100, message, timeSent)).toStrictEqual(400);
  });
  test('Message is too long', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    let message = '';
    for (let i = 0; i < 1000; i++) {
      message = message + 'aA';
    }
    const timeSent = Math.floor(Date.now() / 1000 + 5);
    expect(requestMessageSendLater(userToken, channelId, message, timeSent)).toStrictEqual(400);
  });
  test('Time sent is a time in the past', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'What is going OONNN!?';
    const timeStart = Math.floor(Date.now() / 1000 - 5); // if this doens't work try using

    expect(requestMessageSendLater(userToken, channelId, message, timeStart)).toStrictEqual(400);
  });
  test('User is not a member of the channel', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const timeStart = Math.floor(Date.now() / 1000 + 3);

    expect(requestMessageSendLater(user2, channelId, message, timeStart)).toStrictEqual(403);
  });
});
describe('success', () => {
  test('Successful message sent a long time after', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 5);
    const timeout = timeSent - Math.floor(Date.now() / 1000);
    sleep(timeout * 1010);
    expect(requestMessageSendLater(userToken, channelId, message, timeSent)).toStrictEqual({ messageId: 0 });
  });
  test('Successful message sent soon after', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 1.5);
    const timeout = timeSent - Math.floor(Date.now() / 1000);

    sleep(timeout * 1000 + 0.5);
    expect(requestMessageSendLater(userToken, channelId, message, timeSent)).toStrictEqual({ messageId: 0 });
  });
  test('Successful message sent now', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const channelId = (requestChannelsCreate(userToken, 'channel1', true) as channelsCreateSuccess).channelId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000);

    expect(requestMessageSendLater(userToken, channelId, message, timeSent)).toStrictEqual({ messageId: 0 });
  });
});

// setTimout is the ts package needed
