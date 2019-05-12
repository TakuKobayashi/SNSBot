const line = require('@line/bot-sdk');
const fs = require('fs');

const userStatusEnum = {
  follow: 0,
  unfollow: 1,
}

const requireRoot = require('app-root-path').require;
const DynamoDB = requireRoot("/libs/dynamodb");
const dynamodb = new DynamoDB();

export default class LineBot {
  constructor(applicationName, accessToken) {
    this.applicationName = applicationName;
    this.lineClient = new line.Client({
      channelAccessToken: accessToken
    });
  }

  async getUserProfile(user_id) {
    return this.lineClient.getProfile(user_id);
  }

  async follow(user_id, timestamp) {
    const finsByUserObj = {
      user_id: user_id
    }
    const profile = await this.getUserProfile(user_id);
    const userProfileObj = Object.assign({
      userId: user_id
    }, profile);
    const userData = await dynamodb.getPromise("users", finsByUserObj);
    if (userData.Item) {
      const updateObject = {
        updated_at: timestamp
      }
      updateObject[this.applicationName] = userStatusEnum.follow;
      return dynamodb.updatePromise("users", finsByUserObj, updateObject);
    } else {
      const insertObject = {
        user_id: userProfileObj.userId,
        name: userProfileObj.displayName,
        icon_url: userProfileObj.pictureUrl,
        description: userProfileObj.statusMessage,
        updated_at: timestamp
      }
      insertObject[this.applicationName] = userStatusEnum.follow
      return dynamodb.createPromise("users", insertObject);
    }
  }

  async unfollow(user_id, timestamp) {
    const finsByUserObj = {
      user_id: user_id
    }
    const userData = await dynamodb.getPromise("users", finsByUserObj);
    if (userData.Item) {
      const updateObject = {
        updated_at: timestamp
      }
      updateObject[this.applicationName] = userStatusEnum.unfollow
      return dynamodb.updatePromise("users", finsByUserObj, updateObject);
    }
    return null;
  }

  async replyMessage(replyToken, replyObj) {
    return this.lineClient.replyMessage(replyToken, replyObj);
  }

  async setRichmenuImage(richMenuId, filePath) {
    return this.lineClient.setRichMenuImage(richMenuId, fs.readFileSync(filePath));
  }

  async deleteRichMenu(richMenuId) {
    return this.lineClient.deleteRichMenu(richMenuId);
  };

  async getRichMenuList() {
    return this.lineClient.getRichMenuList();
  }

  async linkRichMenu(userId, richMenuId) {
    return this.lineClient.linkRichMenuToUser(userId, richMenuId)
  }

  async unlinkRichMenu(userId) {
    return this.lineClient.unlinkRichMenuFromUser(userId)
  }

  async createRichMenu(richMenuObj) {
    return this.lineClient.createRichMenu(richMenuObj);
  }
}