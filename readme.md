# Ephemera - One time secret distribution
 [![GitHub license](https://img.shields.io/github/license/Sam-Martin/Ephemera.svg)](LICENSE) [![Build Status](https://travis-ci.org/Sam-Martin/Ephemera.svg)](https://travis-ci.org/sam-martin/Ephemera)  
This repository contains the Node.js, HTML, JavaScript, and supporting jQuery plugins to upload secrets securely to S3 and deliver a one-time URL back to the user.
## Demo
[Ephemera Demo](http://ephemera.sammart.in/)
## Overview
This project is currently functional but needs work to tidy up unit tests etc.
## Setup
Ensure you have the AWS PowerShell cmdlets [installed and configured](http://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-started.html).
##### 0) Create the S3 buckets
1. Create a bucket to house the uploads (no special policy needs to be set).
2. Create a bucket to house the website that interfaces with the API [(setting the policy to allow it to serve as a website)](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html).

##### 1) Create the IAM roles/users/policies as per the below 
1. See `Permissions` below, replacing the bucket names with the bucket you created (saving the API & secret key you create for the user)

##### 2) Create a KMS encryption key
1. As per the [AWS Getting Started Guide](http://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
2. Give the `EphemeraLambda` role permission to read the key

##### 3) Clone the repository & update the config
1. `git clone https://github.com/Sam-Martin/Ephemera.git`
2. Generate an encrypted version of the Secret Key you created earlier using the output from
`aws kms encrypt --key-id my-key-id --plaintext "SecretKey" --query CiphertextBlob --output text` or [this PowerShell](https://gist.github.com/Sam-Martin/1955ac4ef3972bb9e8a8).
3. Edit `Ephemera\lambda\common\ephemera-config.js` to reflect the `bucketName`, `bucketRegion`, `accessKey`, and `encryptedSecret` you created earlier.

##### 4) Create the Lambda functions
1. `cd .\Ephemera`
2. Execute the below replacing the ARN with the ARN of your equivalent role
````
function ZipFiles
{
    param( $zipfilename, $sourcedir )
    Add-Type -Assembly System.IO.Compression.FileSystem 
    $compressionLevel = [System.IO.Compression.CompressionLevel]::Optimal
    [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcedir,
        $zipfilename, $compressionLevel, $true) 
}
$repoDir = Get-Location;
$LambdaARN = "arn:aws:iam::080863329876:role/LambdaS3ImageUpload";
remove-item $repoDir\ephemera.zip -Force -ErrorAction Silent
zipfiles -zipfilename $repoDir\ephemera.zip -sourcedir D:\Dropbox\Dropbox\code\sites\password-dissemination\lambda\

@('ephemera-getsignedurl','ephemera-addtextsecret', 'ephemera-getsecret') |% {Remove-LMFunction -FunctionName $_ -Force}
Publish-LMFunction -FunctionName ephemera-getsignedurl -FunctionZip $repoDir\ephemera.zip -role $LambdaARN -Runtime "nodejs" -Handler "lambda/ephemera-getsignedurl/ephemera-getsignedurl.handler"
Publish-LMFunction -FunctionName ephemera-addtextsecret -FunctionZip $repoDir\ephemera.zip -role $LambdaARN -Runtime "nodejs" -Handler "lambda/ephemera-addtextsecret/ephemera-addtextsecret.handler"
Publish-LMFunction -FunctionName ephemera-getsecret -FunctionZip $repoDir\ephemera.zip -role $lambdaARN -Runtime "nodejs" -Handler "lambda/ephemera-getsecret/ephemera-getsecret.handler"
````

##### 5) Create the API  using AWS API Swagger Importer
1. [Install Maven](https://maven.apache.org/)
2. `cd ..`  
3. `git clone https://github.com/awslabs/aws-apigateway-swagger-importer.git`  
4. `cd .\aws-apigateway-swagger-importer\`  
5. `mvn assembly:assembly`  
6. Edit `Ephemera\api-gateway\ephemera-swagger-spec.json` and replace the arn in `credentials` with the ARN of the role you created tha thas permission to execute the lambda functions.
6. `.\aws-api-import.cmd -c ..\Ephemera\api-gateway\ephemera-swagger-spec.json`

##### 6) Setup the website
1. Edit `Epherema/frontend/index.html` and replace `action="https://ephemera-upload.s3.amazonaws.com/"` with your s3 bucket for private uploads
2. Edit `Ephemera/frontend/js/main.js` and replace `var apiUrl = 'https://licotqtmvg.execute-api.eu-west-1.amazonaws.com/staging/v1';` with the api URL of the API Gateway Staging created by the Swagger Importer. *(Hint: you can find this in the AWS Console by browsing to "Stages" under the API Gateway section of the AWS console in the region you set as default.)*
3. Upload the contents of `Ephemera\frontend` to the S3 bucket you setup to work as a website

##### 7) Done!
1. Browse your website bucket's URL and try uploading a secret!


## Permissions
##### EphemeraS3Signer - IAM User 
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
##### EphemeraLambda - IAM Role
This IAM role is the role under which the lambda functions execute
###### S3Uploader - IAM Policy  
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
###### Lambda Logger - IAM Policy
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
##### EphemeraLambdaExecutor - IAM Role
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
