import { session, user } from '../../types';
import { requestUsersAll, requestClear, requestAuthRegister } from '../wrappers';

let userOne: session;

beforeEach(() => {
  requestClear();
  userOne = createUser('one');
});

function createUser(emailSuffix: string): session {
  return requestAuthRegister(
    `example${emailSuffix}@gmail.com`,
    'password',
    'namefirst',
    'namelast'
  ) as session;
}

describe('error cases', () => {
  test('token is invalid', () => {
    expect(requestUsersAll(userOne.token + '1')).toStrictEqual(
      403
    );
  });
});

describe('success', () => {
  // Note - there will always be atleast one user to call the function.
  test('one user', () => {
    expect(requestUsersAll(userOne.token)).toStrictEqual({
      users: [
        {
          uId: userOne.authUserId,
          email: 'exampleone@gmail.com',
          nameFirst: 'namefirst',
          nameLast: 'namelast',
          handleStr: 'namefirstnamelast',
          profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
        },
      ],
    });
  });
  test('multiple users', () => {
    for (const object of ['two', 'three', 'four']) {
      createUser(object);
    }
    expect(
      requestUsersAll(userOne.token)
    ).toStrictEqual({
      users:
      [
        {
          uId: 3,
          email: 'examplefour@gmail.com',
          nameFirst: 'namefirst',
          nameLast: 'namelast',
          handleStr: 'namefirstnamelast2',
          profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
        },
        {
          uId: 2,
          email: 'examplethree@gmail.com',
          nameFirst: 'namefirst',
          nameLast: 'namelast',
          handleStr: 'namefirstnamelast1',
          profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
        },
        {
          uId: 1,
          email: 'exampletwo@gmail.com',
          nameFirst: 'namefirst',
          nameLast: 'namelast',
          handleStr: 'namefirstnamelast0',
          profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
        },
        {
          uId: 0,
          email: 'exampleone@gmail.com',
          nameFirst: 'namefirst',
          nameLast: 'namelast',
          handleStr: 'namefirstnamelast',
          profileImgUrl: 'http://localhost:43201/imgs/banana.jpg',
        },
      ]
        .sort((a: user, b: user) => b.uId - a.uId)
    });
  });
});
