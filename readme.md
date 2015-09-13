# Ephemera - One time secret distribution
 [![GitHub license](https://img.shields.io/github/license/Sam-Martin/Ephemera.svg)](LICENSE) [![Build Status](https://travis-ci.org/Sam-Martin/Ephemera.svg)](https://travis-ci.org/sam-martin/Ephemera)  
This repository contains the Node.js, HTML, JavaScript, and supporting jQuery plugins to upload secrets securely to S3 and deliver a one-time URL back to the user.
## Demo
[Ephemera Demo](http://ephemera.sammart.in/)
## Overview
This project is currently functional but needs work to tidy up unit tests etc.
## Permissions
### EphemeraS3Signer - IAM User 
This IAM user has their access key encrypted using KMS in order that they can sign S3 upload policies (which can't be done with roles).  
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1440938489000",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject*"
            ],
            "Resource": [
                "arn:aws:s3:::ephemera-upload",
                "arn:aws:s3:::ephemera-upload/*"
            ]
        }
    ]
}
```
### EphemeraLambda - IAM Role
This IAM role is the role under which the lambda functions execute
#### S3Uploader - IAM Policy
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1440938489000",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject*",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::image-upload-smartin",
                "arn:aws:s3:::image-upload-smartin/*",
                "arn:aws:s3:::ephemera-upload",
                "arn:aws:s3:::ephemera-upload/*"
            ]
        }
    ]
}
```
#### Lambda Logger - IAM Policy
```
{
  "Version": "2012-10-17", 
  "Statement": [
    {
      "Action": [ 
        "logs:*"
      ],
      "Effect": "Allow", 
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```
### EphemeraLambdaExecutor - IAM Role
This role is assumed by the API gateway to give it access to execute the lambda functions. (Called `APIGatewayLambdaExecRole` in the example.)
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1442056373000",
            "Effect": "Allow",
            "Action": [
                "lambda:InvokeFunction"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Sid": "Stmt1442056419000",
            "Effect": "Allow",
            "Action": [
                "iam:PassRole"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```
## Author
Author:: Sam Martin (<samjackmartin@gmail.com>)
