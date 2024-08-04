import { session, dmCreateSuccess } from '../../types';

import { requestClear, requestAuthRegister, requestMessageSenddm, requestDmCreate } from '../wrappers';

beforeEach(() => {
  requestClear();
});

describe('success', () => {
  test('Successfully sending message to DM', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    expect(requestMessageSenddm(userToken, dmId, 'Cow')).toStrictEqual({ messageId: 0 });
  });
  test('Successfully sending message to DM that consist of multiple people', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const uid2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).authUserId;
    const uid3 = (requestAuthRegister('emailthree@gmail.com', 'password3', 'tmo', 'bbotta') as session).authUserId;
    const dmId = (requestDmCreate(userToken, [uid2, uid3]) as dmCreateSuccess).dmId;
    expect(requestMessageSenddm(userToken, dmId, 'Cow')).toStrictEqual({ messageId: 0 });
  });
  test('Successfully sending message to DM', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    expect(requestMessageSenddm(userToken, dmId, 'Cow')).toStrictEqual({ messageId: 0 });
    expect(requestMessageSenddm(userToken, dmId, 'Moo')).toStrictEqual({ messageId: 1 });
  });
});
describe('error cases', () => {
  test('dmId does not refer to a valid DM', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    requestDmCreate(userToken, []);
    expect(requestMessageSenddm(userToken, 595959, 'Cow')).toStrictEqual(400);
  });
  test('length of message is less than 1', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    expect(requestMessageSenddm(userToken, dmId, '')).toStrictEqual(400);
  });
  test('length of message is over 1000 characters', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    expect(requestMessageSenddm(
      userToken,
      dmId,
      'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'
    )).toStrictEqual(400);
  });
  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    const userToken2 = (requestAuthRegister('emailtwo@gmail.com', 'password2', 'mot', 'ttobba') as session).token;
    expect(requestMessageSenddm(userToken2, dmId, 'Cow')).toStrictEqual(403);
  });
  test('token is invalid', () => {
    const userToken = (requestAuthRegister('emailone@gmail.com', 'password', 'tom', 'abbott') as session).token;
    const dmId = (requestDmCreate(userToken, []) as dmCreateSuccess).dmId;
    expect(requestMessageSenddm('123', dmId, 'Cow')).toStrictEqual(403);
  });
});

