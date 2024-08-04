import { session, dmCreateSuccess } from '../../types';
import { requestDmCreate, requestAuthRegister, requestClear, requestDmDetails, requestUserProfile } from '../wrappers';

let user1: session;
let user2: session;

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
  user1 = createUser('one');
  user2 = createUser('two');
});

describe('error cases', () => {
  test('dmId does not refer to valid dm', () => {
    const newDm = (requestDmCreate(user1.token, [user2.authUserId]) as dmCreateSuccess);
    newDm.dmId += 7;
    const result = requestDmDetails(user1.token, newDm.dmId);
    expect(result).toStrictEqual(400);
  });
  test('valid dmId, auth not member', () => {
    const user3 = createUser('three');
    const newDm = (requestDmCreate(user1.token, [user2.authUserId]) as dmCreateSuccess);
    const result = requestDmDetails(user3.token, newDm.dmId);
    expect(result).toStrictEqual(403);
  });
  test('invalid token', () => {
    const newDm = (requestDmCreate(user1.token, [user2.authUserId]) as dmCreateSuccess);
    const result = requestDmDetails(user1.token + 'error', newDm.dmId);
    expect(result).toStrictEqual(403);
  });
});

describe('success', () => {
  test('group of one user', () => {
    const newDm: dmCreateSuccess = (requestDmCreate(user1.token, []) as dmCreateSuccess);
    expect(requestDmDetails(user1.token, newDm.dmId)).toStrictEqual({
      name: 'namefirstnamelast',
      members: [requestUserProfile(user1.token, user1.authUserId).user]
    });
  });
  test('group of two users', () => {
    const newDm: dmCreateSuccess = (requestDmCreate(user1.token, [user2.authUserId]) as dmCreateSuccess);
    expect(requestDmDetails(user1.token, newDm.dmId)).toStrictEqual({
      name: 'namefirstnamelast, namefirstnamelast0',
      members: [requestUserProfile(user1.token, user1.authUserId).user,
        requestUserProfile(user2.token, user2.authUserId).user]
    });
  });
  test('group of three users', () => {
    const user3 = createUser('three');
    const newDm: dmCreateSuccess = (requestDmCreate(user1.token, [user2.authUserId, user3.authUserId]) as dmCreateSuccess);
    expect(requestDmDetails(user1.token, newDm.dmId)).toStrictEqual({
      name: 'namefirstnamelast, namefirstnamelast0, namefirstnamelast1',
      members: [requestUserProfile(user1.token, user1.authUserId).user,
        requestUserProfile(user2.token, user2.authUserId).user,
        requestUserProfile(user3.token, user3.authUserId).user]
    });
  });
});
