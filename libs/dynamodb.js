const AWS = require('aws-sdk');
AWS.config.update({
  region: 'ap-northeast-1',
});
const dynamo = new AWS.DynamoDB.DocumentClient();

export default class DynamoDB {
  async getPromise(tablename, filterObject) {
    const params = {
      TableName: tablename,
      Key: filterObject
    };
    return dynamo.get(params).promise();
  };

  async updatePromise(tablename, filterObject, updateObject) {
    const updateExpressionString = "set ";
    const updateExpressionAttributeValues = {}
    const keys = Object.keys(updateObject);
    for (let i = 0; i < keys.length; ++i) {
      const praceholder = ":Attr" + i.toString();
      updateExpressionString = updateExpressionString + keys[i] + " = " + praceholder;
      if (i !== keys.length - 1) {
        updateExpressionString = updateExpressionString + ", ";
      }
      updateExpressionAttributeValues[praceholder] = updateObject[keys[i]];
    }
    const params = {
      TableName: tablename,
      Key: filterObject,
      UpdateExpression: updateExpressionString,
      ExpressionAttributeValues: updateExpressionAttributeValues,
      ReturnValues: "UPDATED_NEW"
    };
    return dynamo.update(params).promise();
  };

  async createPromise(tablename, putObject) {
    const params = {
      TableName: tablename,
      Item: putObject
    };
    return dynamo.put(params).promise();
  };
}