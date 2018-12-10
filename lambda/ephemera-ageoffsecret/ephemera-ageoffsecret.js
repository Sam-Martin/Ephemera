console.log('loading event');
var AWS = require('aws-sdk');
AWS.config.update({
    region: process.env.REGION,
    endpoint: "https://dynamodb." + process.env.REGION + ".amazonaws.com"
});
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context, callback) {
    console.log('Loaded handler');

    getOldSecrets().catch(err => {
        console.error("Unable to search for expired items. Error JSON:", JSON.stringify(err, null, 2));
    }).then(data => {
        data.Items.forEach(function(item) {
            deleteSecret(item).catch(err => {
                console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            }).then(item => {
                console.log("Successfully aged off: " + item.SecretID)
            })
        })
    })
}

function getOldSecrets() {
    var now = new Date();
    var params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        FilterExpression: "Uploaded <= :uploaded",
        ExpressionAttributeValues: {
            ":uploaded": now.setHours(now.getHours() - process.env.MAX_SECRET_AGE_HOURS)
        }
    };
    return new Promise((resolve, reject) => {
        docClient.scan(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

function deleteSecret(item) {
    var params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            "SecretID": item.SecretID
        }
    }
    return new Promise((resolve, reject) => {
        docClient.delete(params, function(err, data) {
            if (err) {
                reject(err)
            } else {
                resolve(item)
            }
        })
    })
}
