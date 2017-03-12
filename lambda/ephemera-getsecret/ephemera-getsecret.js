console.log('loading event');
var aws = require('aws-sdk');
var YAML = require("yamljs");
var s3 = new aws.S3();
var config = YAML.load('config.yml');
exports.handler = function (event, context, callback) {  
  s3.getObject({
    Bucket: config.private_bucket_name,
    'Key': event.query.key
  }, function (err, getData) {
    if (err){
      callback(new Error('Error loading object' + JSON.stringify(err.stack)));
      return;
    }
    // Delete the object before we return its contnets
    s3.deleteObject({
      Bucket:  config.private_bucket_name,
      'Key': event.query.key
    }, function (err, deleteData) {
      if (err){
        callback(new Error('Error deleting object' + JSON.stringify(err.stack)));
        return;
      }
      console.log('Loaded handler');
      if (getData.ContentType == 'text/plain') {
        body = getData.Body.toString();
      } else {
        body = getData.Body.toString('base64').replace(/\n|\r/, '');
      }
      callback(null, {
        body: body,
        'Content-Type': getData.ContentType
      });
    });
  });
};