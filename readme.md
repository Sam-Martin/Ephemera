# Ephemera - One Time Secret Distribution
 [![GitHub license](http://i.imgur.com/fkMVzNe.png)]() [![Build Status](https://ci.appveyor.com/api/projects/status/9cgvg2f1y0oolleg/branch/master?svg=true)](https://ci.appveyor.com/project/Sam-Martin/ephemera)  
 ![Screenshot](http://i.giphy.com/l41lHcOVaBJnKnbEs.gif)  
This repository contains the Node.js, HTML, JavaScript, and supporting [Serverless](https://github.com/serverless/serverless) definition to upload secrets securely to DynamoDB and deliver a one-time URL back to the user.
## Demo
[Ephemera Demo](http://ephemera.sammart.in/)  
All secrets submitted here are deleted after 24hrs, and for obvious reasons security reasons do not use this as an hosted secret transfer solution!

## Setup
Either use `invoke-psake` or:

```
npm install serverless -g
npm install serverless-s3-sync --save
serverless deploy
```

**IMPORTANT:** You will need to tweak `config.yml` to make bucket names etc. unique.

## Overview  
Ephemera is a one-time secret transfer tool intended to help you in the transition from legacy tools which do not allow secure secret communication (e.g. via password reset URLs or key fingerprints).  
It is intended to be simple enough to be audited by someone with a basic understanding of JavaScript and AWS to validate that it is a non-malicious method for password transfer that you can setup in your own AWS account.  
It is not intended to be a replacement for proper user-centric secret management, but merely a transitional phase to help eradicate secrets attached to plaintext emails.  
This project is currently functional but needs work to add unit tests etc.

## How it Works
Ephemera uses five components

1. AWS S3 for website hosting
2. AWS Lambda for GUID creation and secret management
3. AWS API Gateway as a front-end for Lambda allowing the JavaScript from the S3 website to add/retrieve secrets
4. AWS DynamoDB for secret storage
5. AWS KMS for secret encryption

The user is presented with a website that gives them the option to upload a text secret.

### Uploading a Secret
When uploading a text secret, the user submits the secret via a text box, the contents of which are submitted to the API Gateway `addTextSecret` method. This method generates a GUID and saves the secret in the private S3 bucket as with that GUID as its key. The method then returns the GUID combined with the specified websiteURL for the address of the secret return page which the user can then give to the person they wish to transmit the secret to.

### Retrieving a Secret
When a user clicks on a one-time URL, the JavaScript on the page recognises that the URL contains a GUID and then calls the API Gateway `getSecret` method submitting that GUID for retrieval. The return of this method includes the secret which is displayed for the user.

## HTTPS Support
Ephemera uses client-side JavaScript to connect over HTTPS to API Gateway for adding and accessing secrets. It is therefore not absolutely mandatory to enable HTTPS on the S3 website, but this can be done if desried using the `use_https_ui` setting in `config.yml`. This will additionally create an AWS CloudFront distribution to front the S3 Website and update the S3 Bucket Policy accordingly.

**NOTE:** You will need to request or import an SSL Certificate in ACM in the `us-east-1` Region (See https://docs.aws.amazon.com/acm/latest/userguide/acm-regions.html) before enabling the HTTPS feature, and add the resultant ACM Certificate `Identifier` to the `acm_certificate_id` setting.

## Contributing
Please feel free to submit pull requests of any type, whether they're bugfixes, test improvements, new features, anything!  
Just make sure that if it necessitates a new AWS resource you represent it in the Terraform templates and that it does not require per hour services (e.g. EC2 or ECS).

## Author
Author:: Sam Martin (<samjackmartin@gmail.com>)
