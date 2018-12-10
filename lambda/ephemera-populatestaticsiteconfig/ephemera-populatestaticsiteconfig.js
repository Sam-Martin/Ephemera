var AWS = require('aws-sdk');

exports.handler = function(event, context, callback) {
    console.log('Loaded handler');
    var s3 = new AWS.S3();
    var params = {
        Bucket: process.env.BUCKET_NAME,
        Key: 'js/config.json',
        Body: JSON.stringify({
            apiUrl: process.env.API_URL
        }),
        ACL: 'public-read'
    }
    s3.putObject(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    });
}
