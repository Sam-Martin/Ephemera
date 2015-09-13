console.log('loading event');
var aws = require('aws-sdk');
var s3 = new aws.S3();
var config = require('../common/ephemera-config.js').config();
exports.handler = function (event, context, params) {
  s3.getObject({
    Bucket: config.bucketName,
    'Key': event.key
  }, function (err, getData) {
    if (err)
      context.fail('Error loading object' + JSON.stringify(err.stack));
    // Delete the object before we return its contnets
    s3.deleteObject({
      Bucket: config.bucketName,
      'Key': event.key
    }, function (err, deleteData) {
      if (err)
        context.fail('Error deleting object' + JSON.stringify(err.stack));
      console.log('Loaded handler');
      if (getData.ContentType == 'text/plain') {
        body = getData.Body.toString();
      } else {
        body = getData.Body.toString('base64').replace(/\n|\r/, '');
      }
      context.done(null, {
        body: body,
        'Content-Type': getData.ContentType
      });
    });
  });
};