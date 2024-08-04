// DATASTORE TYPES
export type userInfo = {
    uId: number,
    nameFirst: string,
    nameLast: string,
    password: string,
    email: string,
    handleStr: string,
    permissionId: number,
    resetCode: string,
    deleted: boolean,
    profileImgUrl: string,
}

export type standupMessageInfo = {
    handleStr: string;
    message: string;
  };

export type channelInfo = {
    channelId: number,
    name: string,
    allMemberIds: number[],
    ownerMemberIds: number[],
    isPublic: boolean,
    sIsActive: boolean,
    sMessages: standupMessageInfo[],
    sLength: number,
    sFinish: number,
}

export type messageInfo = {
    uId: number,
    messageId: number,
    channelId: number,
    dmId: number,
    message: string,
    timeSent: number,
    reacts: number[],
    isPinned: boolean,
}

export type reactInfo = {
    messageId: number,
    reactId: number,
    uIds: number[],
    isThisUserReacted: boolean,
}

export type dmInfo = {
  dmId: number,
  name: string,
  ownerId: number,
  memberIds: number[],
};

export type standupInfo = {
    channelId: number;
    length: number;
    timeFinish: number;
    isActive: boolean;
    standupMessage: standupMessageInfo[];
  };

export type notificationInfo = {
    uId: number,
    channelId: number,
    dmId: number,
    notificationMessage: string,
}

export type session = {
    token: string,
    authUserId: number,
}

export type store = {
    users: userInfo[],
    channels: channelInfo[],
    messages: messageInfo[],
    sessions: session[],
    dms: dmInfo[],
    reacts: reactInfo[],
    notifications: notificationInfo[],
    standups: standupInfo[];
}

// OUTPUT TYPES
export type channel = {
    channelId: number,
    name: string,
}

export type user = {
    uId: number,
    email: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string,
    profileImgUrl: string,
}

export type react = {
    reactId: number,
    uIds: number[],
    isThisUserReacted: boolean,
}

export type message = {
    messageId: number,
    uId: number,
    message: string,
    timeSent: number,
    reacts: react[],
    isPinned: boolean,
}

export type dm = {
    dmId: number,
    name: string,
}

// FUNCTION RETURN TYPES
export type channelDetailsSuccess = {
    name: string,
    isPublic: boolean,
    ownerMembers: user[],
    allMembers: user[],
}

export type dmDetailsSuccess = {
    name: string,
    members: user[],
}

export type dmListSuccess = {
    dms: dm[],
}

export type channelsCreateSuccess = {
    channelId: number,
}

export type channelsListSuccess = {
    channels: channel[]
}

export type channelMessagesSuccess = {
    messages: message[],
    start: number,
    end: number,
}

export type messageSendSuccess = {
    messageId: number
}

export type userProfileSuccess = {
    user: user
}

export type error = {
    error: string
}

export type usersAllSuccess = {
    users: user[]
}

export type dmCreateSuccess = {
    dmId: number
}

export type dmMessagesSuccess = {
    messages: message[],
    start: number,
    end: number,
}

export type notificationGetSuccess = {
    channelId: number,
    dmId: number,
    notificationMessage: string,
}

export type standupActiveSuccess = {
    isActive: boolean,
    timeFinish: number,
}

export type messageShareSuccess = {
  sharedMessageId: number
}
