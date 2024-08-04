import { getData } from './dataStore';
import { session, userInfo, user, store, channelInfo } from './types';
// import HTTPError from 'http-errors';
import crypto from 'crypto';
import nodeemailer from 'nodemailer';
import { Request } from 'express';

/**
 * returns true if a user token is valid and false if not
 *
 * @param { string } token  - string identifying the authorized users session
 *
 * @returns { boolean } returns true, or false depending on wether the token is valid or not.
 */
export function isValidToken(token: string): boolean {
  const sessions: session[] = getData().sessions;

  for (const item of sessions) {
    if (item.token === token) {
      return true;
    }
  }

  return false;
}

/**
 * returns a users number given a valid token
 *
 * @param { string } token  - string identifying the authorized users session
 *
 * @returns { number } returns the userId associated with that number, or -1 if the user does not exist
 **/
export function getUId(token: string): number {
  const sessions: session[] = getData().sessions;

  for (const item of sessions) {
    if (item.token === token) {
      return item.authUserId;
    }
  }

  return -1;
}

/**
 * given a valid userId, returns a user object
 *
 * @param { number } uId  - uId identifying the authorized user
 *
 * @returns { user } returns user object corresponding to that user
 **/
export function userObject(uId: number): user {
  const users: userInfo[] = getData().users;

  const userInfo: userInfo = users.find(x => x.uId === uId);

  return {
    uId: userInfo.uId,
    email: userInfo.email,
    nameFirst: userInfo.nameFirst,
    nameLast: userInfo.nameLast,
    handleStr: userInfo.handleStr,
    profileImgUrl: userInfo.profileImgUrl
  };
}

// /**
//  * given a valid reactId, returns a react object
//  *
//  * @param { number } uId  - uId identifying the authorized user
//  *
//  * @returns { react } returns react object corresponding to that reactId
//  **/
// export function reactObject(reactId: number): react {
//   const reacts: reactInfo[] = getData().reacts;

//   const reactInfo: reactInfo = reacts.find(x => x.reactId === reactId);

//   return {
//     reactId: reactInfo.reactId,
//     uIds: reactInfo.uIds,
//     isThisUserReacted: reactInfo.isThisUserReacted,
//   };
// }

/**
 * given a valid userId, returns wether or not they are a global owner
 *
 * @param { number } uId  - uId identifying the authorized user
 *
 * @returns { boolean } returns wether the user is a global owner or not
 **/
export function isGlobalOwner(uId: number): boolean {
  const users: userInfo[] = getData().users;

  const userInfo: userInfo = users.find(x => x.uId === uId);

  if (userInfo === undefined) {
    return false;
  }

  if (userInfo.permissionId === 1) {
    return true;
  }

  return false;
}

/**
 * given a string, returns a hashed string
 *
 * @param { string } token  - string identifying the authorized users session
 *
 * @returns  { string } hash - returns a hashed version of the given token
 **/
export function hashString(str: string): string {
  const SECRET = process.env.SECRET || 'DEFAULT_SECRET';
  const hash = crypto.createHash('sha256');
  hash.update(str + SECRET);
  return hash.digest('hex');
}

/**
 * given a string and the hashed version, returns a boolean that checks if it
 * has been hashed correctly
 *
 * @param { string } token  - string identifying the authorized users session
 * @param { string } hash  - hashed version of the token
 *
 * @returns  { boolean }  - returns whether or not the string has been hashed
 * correctly
 **/
export function hashVerify(str: string, hash: string): boolean {
  return hashString(str) === hash;
}

/**
 * given a token from a req obejct this helper function returns a hashed token
 *
 * @param { string } token  - string identifying the authorized users session
 *
 * @returns  { string } hash - returns a hashed version of the given token
 **/
export function tokenFromHeader(req: Request): string {
  const token = req.header('token');

  //   if (!isValidToken(token)) {
  //     throw HTTPError(403, 'token is invalid');
  //   }

  return token;
}

/**
 * creates the big standup message to return
 *
 * @param { number } channelId  - which channel the standup is in
 *
 * @returns  { string } bigMessage - returns concatenated message
 **/
export function getStandupMessage(channelId: number): string {
  const ds: store = getData();

  const channel: channelInfo = ds.channels.find((x) => x.channelId === channelId);

  let bigMessage = '';
  let n = 0;

  for (const message of channel.sMessages) {
    bigMessage += `${message.handleStr}: ${message.message}`;
    n++;
    if (n !== channel.sMessages.length) {
      bigMessage += '\n';
    }
  }

  return bigMessage;
}

/*
 * given a message, returns the array of tagged uIds within the message
 *
 * @param { string } message  - message string being checked
 *
 * @returns { number[] } taggedUids - returns tagged uIds in an array
 **/
export function tagCheck(message: string): number[] {
  const ds = getData();
  const taggedTrigger = /@(\w+)/g;
  const tags = new Set<string>();
  let checked;
  const taggedUIds: number[] = [];

  while ((checked = taggedTrigger.exec(message)) !== null) {
    tags.add(checked[1]);
  }

  tags.forEach(x => {
    const taggedUser = ds.users.find((user) => user.handleStr === x);
    if (taggedUser !== undefined) {
      taggedUIds.push(taggedUser.uId);
    }
  });

  return taggedUIds;
}

export function sendEmail(recipient: string, resetcode: string) {
  const transporter = nodeemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: 'h09beggs@hotmail.com',
      pass: 'strongpassword1',
    }
  });

  transporter.sendMail({
    from: 'h09beggs@hotmail.com',
    to: recipient,
    subject: 'Reset code for UNSW Memes',
    text: `Heyoooooo. Here is your code if you want it, just wablam it into the given box and wapow you can get a new password. If you didn't send this request, unlucky:
    
${resetcode}

    `
  });
}

