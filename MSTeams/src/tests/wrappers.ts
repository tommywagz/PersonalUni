import request, { HttpVerb, Response } from 'sync-request';
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

// ========================================================================= //

// HELPERS - adapted from lab05 automarking

function parseResponse(res: Response, path: string) {
  let caughtError = 'Unknown error';
  let hint = 'No hint available for this error.';
  try {
    return JSON.parse(res.getBody() as string);
  } catch (e) {
    caughtError = e.message;
    if (res.statusCode === 404) {
      hint = `The route '${path}' does not exist on your server (i.e. in server.ts). Check that you do not have any typos and your routes begin with a '/'`;
      caughtError = `Missing route ${path}`;
    } else if (res.statusCode === 500) {
      hint =
        'Server has crashed. Check the terminal running the server to see the error stack trace';
    } else {
      hint =
        'Routes may not be returning a valid JSON response - for example, the clear route should still return an empty object, {}';
    }
  }
  const ret = {
    statusCode: res.statusCode,
    caughtError,
    hint,
  };
  console.log('Logging Error:', ret);
  return ret;
}

function requestHelper(method: HttpVerb, path: string, headers: any, payload: object) {
  let qs = {};
  let json = {};
  // GET/DELETE
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    // PUT/POST
    json = payload;
  }

  const res = request(method, SERVER_URL + path, { headers, qs, json, timeout: 20000 });

  if (res.statusCode !== 200) {
    // Return error code number instead of object in case of error.
    return res.statusCode;
  }

  return parseResponse(res, path);
}

// =============================== OTHER =================================== //
export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', { header: undefined }, {});
}

// =============================== ADMIN =================================== //
export function requestAdminUserRemove(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', { token }, { uId });
}

export function requestAdminUserpermissionChange(token: string, uId: number, permissionId: number) {
  return requestHelper('POST', '/admin/userpermission/change/v1', { token }, { uId, permissionId });
}

// =============================== AUTH =================================== //
export function requestAuthRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { header: undefined }, { email, password, nameFirst, nameLast });
}

export function requestAuthLogin(email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', { header: undefined }, { email, password });
}

export function requestAuthLogout(token: string) {
  return requestHelper('POST', '/auth/logout/v2', { token }, {});
}

export function requestAuthPasswordresetRequest(email: string) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', { header: undefined }, { email });
}

export function requestAuthPasswordresetReset(resetCode: string, newPassword: string) {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', { header: undefined }, { resetCode, newPassword });
}

// =============================== USER =================================== //
export function requestUserProfile(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { token }, { uId });
}

export function requestUserProfileSetname(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v2', { token }, { nameFirst, nameLast });
}

export function requestUserProfileSetemail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v2', { token }, { email });
}

export function requestUserProfileSethandle(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v2', { token }, { handleStr });
}

export function requestUserProfileUploadphoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  return requestHelper('POST', '/user/profile/uploadphoto/v1', { token }, { imgUrl, xStart, yStart, xEnd, yEnd });
}

// =============================== USERS =================================== //
export function requestUsersAll(token: string) {
  return requestHelper('GET', '/users/all/v2', { token }, {});
}

// ============================= CHANNEL ================================= //
export function requestChannelDetails(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { token }, { channelId });
}

export function requestChannelJoin(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { token }, { channelId });
}

export function requestChannelInvite(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { token }, { channelId, uId });
}

export function requestChannelMessages(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { token }, { channelId, start });
}

export function requestChannelLeave(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { token }, { channelId });
}

export function requestChannelAddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', { token }, { channelId, uId });
}

export function requestChannelRemoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { token }, { channelId, uId });
}

// ============================= CHANNELS ================================= //
export function requestChannelsCreate(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { token }, { name, isPublic });
}

export function requestChannelsListAll(token: string) {
  return requestHelper('GET', '/channels/listall/v3', { token }, {});
}

export function requestChannelsList(token: string) {
  return requestHelper('GET', '/channels/list/v3', { token }, {});
}

// ============================= MESSAGE ================================= //
export function requestMessageSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { token }, { channelId, message });
}

export function requestMessageSenddm(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { token }, { dmId, message });
}

export function requestMessageRemove(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { token }, { messageId });
}

export function requestMessageEdit(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { token }, { messageId, message });
}

export function requestMessageUnreact(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/unreact/v1', { token }, { messageId, reactId });
}

export function requestMessagePin(token: string, messageId: number) {
  return requestHelper('POST', '/message/pin/v1', { token }, { messageId });
}

export function requestMessageReact(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/react/v1', { token }, { messageId, reactId });
}
export function requestMessageUnpin(token: string, messageId: number) {
  return requestHelper('PUT', '/message/unpin/v1', { token }, { messageId });
}

export function requestMessageShare(token: string, ogMessageId: number, channelId: number, dmId: number, message?: string) {
  return requestHelper('POST', '/message/share/v1', { token }, { ogMessageId, channelId, dmId, message });
}

export function requestMessageSendLater(token: string, channelId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlater/v1', { token }, { channelId, message, timeSent });
}

export function requestMessageSendDmLater(token: string, dmId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlaterdm/v1', { token }, { dmId, message, timeSent });
}

// =============================== DM =================================== //
export function requestDmCreate(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', { token }, { uIds });
}

export function requestDmDetails(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { token }, { dmId });
}

export function requestDmList(token: string) {
  return requestHelper('GET', '/dm/list/v2', { token }, {});
}

export function requestDmLeave(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { token }, { dmId });
}

export function requestDmMessages(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { token }, { dmId, start });
}

export function requestDmRemove(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { token }, { dmId });
}

// =============================== SEARCH =================================== //
export function requestSearch(token: string, queryStr: string) {
  return requestHelper('GET', '/search/v1', { token }, { queryStr });
}

// ============================= STANDUP ================================= //
export function requestStandupStart(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { token }, { channelId, length });
}

export function requestStandupActive(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { token }, { channelId });
}

export function requestStandupSend(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { token }, { channelId, message });
}

// =========================== NOTIFICATIONS =============================== //
export function requestNotificationsGet(token: string) {
  return requestHelper('GET', '/notifications/get/v1', { token }, {});
}
