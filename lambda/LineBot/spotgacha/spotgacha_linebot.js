const requireRoot = require('app-root-path').require;
const LineBot = requireRoot("/libs/linebot");
const underscore = require('underscore');

export default class SpotGachaLineBot extends LineBot {
  constructor(applicationName, accessToken) {
    super(applicationName, accessToken);
  }

  async recordResponseMessage(lineMessageObj, response_object) {
    const insertObject = {
      message_id: lineMessageObj.message.id,
      message_type: lineMessageObj.message.type,
      user_id: lineMessageObj.source.userId,
      reply_token: lineMessageObj.replyToken,
      application_name: this.applicationName,
      input_text: lineMessageObj.message.title,
      input_location: {
        latitude: lineMessageObj.message.latitude,
        longitude: lineMessageObj.message.longitude,
        address: lineMessageObj.message.address
      },
      response_object: response_object,
      created_at: lineMessageObj.timestamp
    }
    return dynamodb.createPromise("bot_messages", insertObject);
  }

  convertReplyMessageObj(restaurantObjs) {
    const messageObj = {
      type: "template",
      altText: "お店の候補はこちら!!",
      template: {
        type: "carousel",
        columns: underscore.map(restaurantObjs, function (restaurantObj) {
          //TODO Use Flex Message
          var carouselActions = []
          if (restaurantObj.url) {
            carouselActions.push({
              type: "uri",
              label: "詳細を見る",
              uri: restaurantObj.url
            });
          }
          if (restaurant.id) {
            carouselActions.push({
              type: "postback",
              label: "場所を知りたい",
              data: JSON.stringify({
                type: "showLocation",
                restaurantId: restaurantObj.id
              })
            });
          }
          if (restaurantObj.phone_number) {
            carouselActions.push({
              type: "uri",
              label: "予約する",
              uri: "tel:" + restaurantObj.phone_number,
            });
          }
          if (restaurantObj.coupon_url) {
            carouselActions.push({
              type: "uri",
              label: "クーポンを使う",
              uri: restaurantObj.coupon_url
            });
          }
          return {
            thumbnailImageUrl: restaurantObj.icon_url,
            title: restaurantObj.place_name,
            text: restaurantObj.place_description,
            actions: carouselActions.slice(0, 3),
          }
        })
      }
    };
    return messageObj;
  }
}