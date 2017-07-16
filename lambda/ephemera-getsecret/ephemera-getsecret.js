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
        SecretID: event.query.key
    }
  };

  // Save the text to DynamoDB
  docClient.get(params, function(err, data) {
      if (err) {
        return callback(null, {
          Error: "Unable to get item. Error JSON:" + JSON.stringify(err, null, 2)
        });

      } else {
        console.log("Successfully got " + event.query.key + " from " + config.dynammodb_table_name + ". deleting...");
        var params = {
            TableName: config.dynamodb_table_name,
            Key: {
              SecretID: event.query.key
            }
        };

        docClient.delete(params, function(err, data) {
          if (err) {
              console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          } 
        })
        return  callback(null, {
          body: data.SecretText
        });
      
      }
  });
}
