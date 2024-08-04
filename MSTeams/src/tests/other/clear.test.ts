import { session } from '../../types';
import { requestClear, requestAuthRegister, requestChannelsListAll, requestChannelsCreate, requestUsersAll } from '../wrappers';

test('return type', () => {
  expect(requestClear()).toStrictEqual({});
});

describe('users', () => {
  test('clears single user', () => {
    const authToken = (
      requestAuthRegister(
        'emailone@gmail.com',
        'password',
        'tom',
        'abbott'
      ) as session
    ).token;

    requestClear();
    expect(requestUsersAll(authToken)).toStrictEqual(403);
  });
  test('clears multiple users', () => {
    const authToken = (
      requestAuthRegister(
        'emailone@gmail.com',
        'password',
        'tom',
        'abbott'
      ) as session
    ).token;
    const emails = [
      'emailtwo@gmail.com',
      'emailthree@gmail.com',
      'emailfour@gmail.com',
    ];
    for (const email of emails) {
      requestAuthRegister(email, 'password', 'tom', 'abbott');
    }
    requestClear();

    // Expect the user to be cleared, so their token invalid
    expect(requestUsersAll(authToken)).toStrictEqual(403);
  });

  describe('channels', () => {
    test('clears single channel', () => {
      // Create a user to create the channel
      let userToken = (
        requestAuthRegister(
          'emailone@gmail.com',
          'password',
          'tom',
          'abbott'
        ) as session
      ).token;
      requestChannelsCreate(userToken, 'channel1', true);

      requestClear();

      userToken = (
        requestAuthRegister(
          'emailone@gmail.com',
          'password',
          'tom',
          'abbott'
        ) as session
      ).token;
      // If channel has been cleared, list should be empty.
      expect(requestChannelsListAll(userToken)).toStrictEqual({ channels: [] });
    });
    test('clears multiple channels', () => {
      // Create a user to create the channels
      let userToken = (
        requestAuthRegister(
          'emailone@gmail.com',
          'password',
          'tom',
          'abbott'
        ) as session
      ).token;
      requestChannelsCreate(userToken, 'channel1', true);
      requestChannelsCreate(userToken, 'channel2', true);
      requestClear();

      userToken = (
        requestAuthRegister(
          'emailone@gmail.com',
          'password',
          'tom',
          'abbott'
        ) as session
      ).token;

      // If both channels have been cleared, list should be empty.
      expect(requestChannelsListAll(userToken)).toStrictEqual({ channels: [] });
    });
  });

  // NOTE: UNCOMMENT WHEN DM FUNCTIONS IMPLEMETED

  //   describe('dms', () => {
  //     test('clears multiple dms', () => {
  //       const userOne = requestAuthRegister(
  //         'emailone@gmail.com',
  //         'password',
  //         'tom1',
  //         'abbott1'
  //       ) as session;
  //       const userTwo = requestAuthRegister(
  //         'emailtwo@gmail.com',
  //         'password',
  //         'tom2',
  //         'abbott2'
  //       ) as session;
  //       let userThree = requestAuthRegister(
  //         'emailthree@gmail.com',
  //         'password',
  //         'tom3',
  //         'abbott3'
  //       ) as session;
  //       requestDmCreate(userOne.token, [userTwo.authUserId, userThree.authUserId]);
  //       requestDmCreate(userTwo.token, [userThree.authUserId]);
  //       requestClear();

  //       // Recreate the third user to ensure DM's list is empty.
  //       userThree = requestAuthRegister(
  //         'emailthree@gmail.com',
  //         'password',
  //         'tom3',
  //         'abbott3'
  //       ) as session;
  //       expect(requestDmList(userThree.token).dms.length).toStrictEqual(0);

// //       // First user should return error since the user does not exist.
// //       expect(requestDmList(userOne.token)).toStrictEqual(ERROR);
// //     });
// //   });
});

