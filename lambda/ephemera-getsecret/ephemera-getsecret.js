console.log('loading event');
var AWS = require('aws-sdk');
AWS.config.update({
  region: process.env.REGION,
  endpoint: "https://dynamodb."+process.env.REGION+".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
  var secretKey = event.queryStringParameters.key

  var params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: {
        SecretID: secretKey
    }
  };

  // Save the text to DynamoDB
  docClient.get(params, function(err, data) {
      if (err) {
        returnResponse({message:"Unable to get item. Error JSON:" + JSON.stringify(err, null, 2)}, callback)
        return
      }

      if(!Object.keys(data).length){
        returnResponse({message:"Secret not found"}, callback)
        return
      }
      console.log("Successfully got " + secretKey + " from " + process.env.DYNAMODB_TABLE_NAME + ". deleting...");
      var params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: {
            SecretID: secretKey
          }
      };

      docClient.delete(params, function(err, data) {
        if (err) {
            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        }
      })
      returnResponse({secretText: data.Item.SecretText}, callback)


  });
}

var returnResponse = function(body, callback){
  callback(null, {
    headers: {
      "Access-Control-Allow-Origin" : "*"
    },
    statusCode: 200,
    isBase64Encoded: false,
    body: JSON.stringify(body)
  });
}
