const SpotGachaLineBot = require(__dirname + '/spotgacha_linebot.js');
const Restaurant = require(__dirname + '/restaurant.js');

const callLambdaResponse = function (context) {
  const lambdaResponse = {
    statusCode: 200,
    headers: {
      "X-Line-Status": "OK"
    },
    body: JSON.stringify({
      "result": "completed"
    })
  };
  context.succeed(lambdaResponse);
}

exports.handler = async function (event, context) {
  console.log(JSON.stringify(event));
  const restaurant = new Restaurant();
  const linebot = new SpotGachaLineBot("spotgacha_linebot", process.env.ACCESSTOKEN);
  for (const lineMessage of event.events) {
    if (lineMessage.type == "follow") {
      await linebot.follow(lineMessage.source.userId, lineMessage.timestamp);
      // await linebot.linkRichMenu(lineMessage.source.userId, process.env.RICHMENUID1);
      callLambdaResponse(context);
    } else if (lineMessage.type == "unfollow") {
      await linebot.unfollow(lineMessage.source.userId, lineMessage.timestamp);
      // await linebot.unlinkRichMenu(lineMessage.source.userId, process.env.RICHMENUID1);
      callLambdaResponse(context);
    } else if (lineMessage.type == "postback") {
      const receiveData = JSON.parse(lineMessage.postback.data);
      console.log(receiveData);
    } else if (lineMessage.type == "message") {
      const restaurantObjects = await restaurant.searchRestaurant(lineMessage);
      const replyMessageObj = linebot.convertReplayMessageObj(restaurantObjects);
      const recordObj = await linebot.recordResponseMessage(lineMessageObj, restaurantObjects);
      console.log(recordObj);
      const replyed = await linebot.replayMessage(lineMessage.replyToken, replyMessageObj);
      console.log(replyed);
      callLambdaResponse(context);
    }
  }
};