console.log('Loading event');
var AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.REGION,
    endpoint: "https://dynamodb." + process.env.REGION + ".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var bucketKey

exports.handler = function(event, context, callback) {
    // Generate a UUID for a key
    bucketKey = generateUUID();
    encrypt(new Buffer(JSON.parse(event.body).secretText, 'utf-8')).then(saveSecret).catch(err => {
        return callback(null, {
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            statusCode: 200,
            isBase64Encoded: false,
            body: JSON.stringify({
                message: "Failed to insert record to database: " + err.message
            })
        });
    }).then(data => {console.log(JSON.stringify(data));returnSecret(callback)})
};

function returnSecret(callback) {
    console.log("Successfully put " + bucketKey + " into " + process.env.DYNAMODB_TABLE_NAME);
    callback(null, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        isBase64Encoded: false,
        body: JSON.stringify({
            key: bucketKey
        })
    });
}

function saveSecret(base64EncryptedString) {
    var params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            SecretID: bucketKey,
            SecretText: base64EncryptedString,
            Uploaded: new Date().getTime()
        }
    };
    return new Promise((resolve, reject) => {
        // Save the text to DynamoDB
        docClient.put(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

function encrypt(buffer) {
    const kms = new AWS.KMS({
        region: process.env.REGION,
        endpoint: "https://kms." + process.env.REGION + ".amazonaws.com"
    });
    return new Promise((resolve, reject) => {
        const params = {
            KeyId: process.env.KMS_KEY_ID,
            Plaintext: buffer
        };

        kms.encrypt(params, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(data.CiphertextBlob);
            }
        });
    });
}

// Stolen from http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
var generateUUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : r & 3 | 8).toString(16);
    });
    return uuid;
}
