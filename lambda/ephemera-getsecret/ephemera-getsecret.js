console.log('loading event');
var AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.REGION,
    endpoint: "https://dynamodb." + process.env.REGION + ".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();
var secretValue, secretKey

exports.handler = function(event, context, callback) {
    secretKey = event.queryStringParameters.key

    getSecret(secretKey).catch(err => {
        returnResponse({
            message: "Unable to get item. Error: " + JSON.stringify(err, null, 2)
        }, callback)
    }).then(decrypt).catch(err => {
        returnResponse({
            message: "Failed decrypting secret: " + err
        }, callback);
    }).then(deleteSecret).catch(err => {
        console.error("Unable to delete item. Error: ", JSON.stringify(err, null, 2));
    }).then(data => {
        returnResponse({
            secretText: secretValue
        }, callback);
    })

}

function deleteSecret() {

    console.log("Successfully decrypted secret, deleting...")
    var params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            SecretID: secretKey
        }
    };
    return new Promise((resolve, reject) => {
        docClient.delete(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        });

    })


}

function getSecret(secretKey) {
    var params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            SecretID: secretKey
        }
    };

    return new Promise((resolve, reject) => {
        // Save the text to DynamoDB
        docClient.get(params, function(err, data) {
            if (err) {
                reject(err)
            } else if (!Object.keys(data).length) {
                reject("Secret not found")
            } else {
                console.log("Successfully got " + secretKey + " from " + process.env.DYNAMODB_TABLE_NAME + ". decrypting...");
                resolve(new Buffer(data.Item.SecretText, 'utf-8'))
            }
        });
    })
}

var returnResponse = function(body, callback) {
    callback(null, {
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        isBase64Encoded: false,
        body: JSON.stringify(body)
    });
}

function decrypt(buffer) {
    const kms = new AWS.KMS({
        region: process.env.REGION,
        endpoint: "https://kms." + process.env.REGION + ".amazonaws.com"
    });
    return new Promise((resolve, reject) => {
        const params = {
            CiphertextBlob: buffer
        };
        kms.decrypt(params, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                secretValue = data.Plaintext.toString('utf-8')
                resolve(secretValue);
            }
        });
    });
}
