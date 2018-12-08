console.log('loading event');
var AWS = require('aws-sdk');
AWS.config.update({
  region: config.REGION,
  endpoint: "https://dynamodb."+config.REGION+".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  console.log('Loaded handler');

  var params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {

      },
      ConditionExpression:"Uploaded <= :val",
      ExpressionAttributeValues: {
        ":val": new Date().getTime()
      }
  };

  docClient.delete(params, function(err, data) {
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    }
  })


}
