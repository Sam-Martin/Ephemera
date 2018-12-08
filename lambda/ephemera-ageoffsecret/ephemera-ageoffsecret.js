console.log('loading event');
var AWS = require('aws-sdk');
var YAML = require("yamljs");
var config = YAML.load('config.yml');
AWS.config.update({
  region: config.region,
  endpoint: "https://dynamodb."+config.region+".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {  
  console.log('Loaded handler');

  var params = {
      TableName: config.dynamodb_table_name,
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
