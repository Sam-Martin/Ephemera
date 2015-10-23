# Ephemera - One time secret distribution
 [![GitHub license](https://img.shields.io/github/license/Sam-Martin/Ephemera.svg)](LICENSE) [![Build Status](https://travis-ci.org/Sam-Martin/Ephemera.svg)](https://travis-ci.org/sam-martin/Ephemera)  
This repository contains the Node.js, HTML, JavaScript, and supporting jQuery plugins to upload secrets securely to S3 and deliver a one-time URL back to the user.
## Demo
[Ephemera Demo](http://ephemera.sammart.in/)
## Overview  
Ephemera is a one-time secret transfer tool intended to help you in the transition from legacy tools which do not allow secure secret communication (e.g. via password reset URLs or key fingerprints).  
Ephemera is intended to be simple enough to be audited by someone with a basic understanding of JavaScript and AWS to validate that it is a non-malicous method for password transfer that you can setup in your own AWS account.  
It is not intended to be a replacement for proper user-centric secret management, but merely a transitional phase to help eradicate secrets attached to plaintext emails.  
This project is currently functional but needs work to tidy up unit tests etc.
## Setup
Ensure you have the AWS PowerShell cmdlets [installed and configured](http://docs.aws.amazon.com/powershell/latest/userguide/pstools-getting-started.html).  

##### 1) Install Terraform
Install Terraform from https://terraform.io/intro/getting-started/install.html

##### 2) Create a KMS encryption key
As per the [AWS Getting Started Guide](http://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html).  
This is used to encrypt the API key we'll be using to sign the S3 upload URLs

##### 2) Clone the Repository & Create the Stack
1. `git clone https://github.com/Sam-Martin/Ephemera.git`
2. Create a zip of the `Ephemera\Lambda` folder called `ephemera.zip` (the zip should contain the folder `Lambda` and all its contents)
3. CD into the `terraform` directory and execute Terraform with `terraform apply -var 'public_bucket_name=your-public-bucket-name' -var 'private_bucket_name=your-private-bucket-name' -var 'access_key=AAAAAAAAAAAAAAAAAAAAA' -var 'secret_key=AAAAAAAAAAAAAAAAAAAAA'`
5. Generate an encrypted version of the secret key terraform created for the user EphemeraS3Signer (found in `Ephemera\terraform\terraform.tfstate`)
`aws kms encrypt --key-id my-key-id --plaintext "SecretKey" --query CiphertextBlob --output text` or [this PowerShell](https://gist.github.com/Sam-Martin/1955ac4ef3972bb9e8a8).
6.Edit `Ephemera\lambda\common\ephemera-config.js` to reflect the `bucketName`, `bucketRegion`, `accessKey`, and `encryptedSecret` you created earlier.  
7. Recreate the zip of the `Ephemera\Lambda` folder called `ephemera.zip`
8. Taint the lambda resources for recreation using   
        `terraform taint aws_lambda_function.ephemera-getsignedurl`  
        `terraform taint aws_lambda_function.ephemera-addtextsecret`  
        `terraform taint aws_lambda_function.ephemera-getsecret`
9. Re-run Terraform with the cmd you ran in 2.3
10. Grant `EphemeraS3Signer` access to read the KMS key you created earlier

##### 5) Create the API using AWS API Swagger Importer
1. [Install Maven](https://maven.apache.org/)
2. Ensure you have your AWS default credentials set (`$home\.aws\config`)
2. `cd ..`  
3. `git clone https://github.com/awslabs/aws-apigateway-swagger-importer.git`  
4. `cd .\aws-apigateway-swagger-importer\`  
5. `mvn assembly:assembly`  
6. Edit `Ephemera\api-gateway\ephemera-swagger-spec.json` and replace  
    1. The default AWS account ID `080863329876` with your own AWS account ID.
    2. The `Access-Control-Allow-Origin`  of `http://ephemera.sammart.in` with the url of your implementation
6. `.\aws-api-import.cmd -c ..\Ephemera\api-gateway\ephemera-swagger-spec.json`
7. `.\aws-api-import.cmd -c ..\Ephemera\api-gateway\ephemera-swagger-spec.json -d prod -u <api-id output from previous cmd>` 


##### 6) Setup the website
1. Edit `Epherema/frontend/index.html` and replace `action="https://ephemera-upload.s3.amazonaws.com/"` with the name of your s3 bucket for private uploads
2. Edit `Ephemera/frontend/js/main.js` and replace `var apiUrl = 'https://licotqtmvg.execute-api.eu-west-1.amazonaws.com/staging/v1';` with the api URL of the API Gateway Staging created by the Swagger Importer.  
(**Hint:** you can find this in the AWS Console by browsing to "Stages" under the API Gateway section of the AWS console in the region you set as default.)*
3. Upload the contents of `Ephemera\frontend` to the S3 bucket you setup to work as a website  

##### 7) Done!
1. Browse your website bucket's URL and try uploading a secret!  

## Author
Author:: Sam Martin (<samjackmartin@gmail.com>)
