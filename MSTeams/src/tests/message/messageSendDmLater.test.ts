import { session, dmCreateSuccess } from '../../types';
import { requestClear, requestAuthRegister, requestDmCreate, requestMessageSendDmLater } from '../wrappers';
const sleep = require('atomic-sleep');
beforeEach(() => {
  requestClear();
});

describe('success', () => {
  test('Successful message sent a long time after', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session);
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'dan', 'wall') as session);
    const dmId = (requestDmCreate(userToken, [user2.authUserId, user3.authUserId]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 5);
    const timeNow = Math.floor(Date.now() / 1000);

    sleep((timeSent - timeNow) * 1010);
    expect(requestMessageSendDmLater(userToken, dmId, message, timeSent)).toStrictEqual({ messageId: 0 });
  });
  test('Successful message sent soon after', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session);
    const dmId = (requestDmCreate(userToken, [user2.authUserId]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 1.5);
    const timeNow = Math.floor(Date.now() / 1000);

    sleep((timeSent - timeNow) * 1010);
    expect(requestMessageSendDmLater(userToken, dmId, message, timeSent)).toStrictEqual({ messageId: 0 });
  });
  test('Successful message sent now', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'dan', 'wall') as session);
    const dmId = (requestDmCreate(userToken, [user3.authUserId]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000);

    expect(requestMessageSendDmLater(user3.token, dmId, message, timeSent)).toStrictEqual({ messageId: 0 });
  });
});

describe('error cases', () => {
  test('Invalid token', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 5);

    expect(requestMessageSendDmLater(userToken + 10, dmId, message, timeSent)).toStrictEqual(403);
  });
  test('Invalid dmId', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session);
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'dan', 'wall') as session);
    const dmId = (requestDmCreate(userToken, [user3.authUserId, user2.authUserId]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const timeSent = Math.floor(Date.now() / 1000 + 5);

    expect(requestMessageSendDmLater(userToken, dmId + 100, message, timeSent)).toStrictEqual(400);
  });
  test('Message is too long', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'dan', 'wall') as session);
    const dmId = (requestDmCreate(userToken, [user3.authUserId]) as dmCreateSuccess).dmId;
    let message = '';
    for (let i = 0; i < 1000; i++) {
      message = message + 'aA';
    }
    const timeSent = Math.floor(Date.now() / 1000 + 5);
    expect(requestMessageSendDmLater(user3.token, dmId, message, timeSent)).toStrictEqual(400);
  });
  test('Time sent is a time in the past', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const timeStart = Math.floor(Date.now() / 1000 - 1);

    expect(requestMessageSendDmLater(userToken, dmId, message, timeStart)).toStrictEqual(400);
  });
  test('User is not a member of the dm', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'wagz') as session).token;
    const user2 = (requestAuthRegister('emailtwo@gmail.com', 'password', 'tom', 'wagner') as session);
    const user3 = (requestAuthRegister('emailthree@gmail.com', 'password', 'dan', 'wall') as session);
    const dmId = (requestDmCreate(userToken, [user2.authUserId]) as dmCreateSuccess).dmId;
    const message = 'This is a test';
    const timeStart = Math.floor(Date.now() / 1000) + 2;

    expect(requestMessageSendDmLater(user3.token, dmId, message, timeStart)).toStrictEqual(403);
  });
});
