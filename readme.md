# Ephemera - One time secret distribution
 [![GitHub license](http://i.imgur.com/fkMVzNe.png)]() [![Build Status](https://travis-ci.org/Sam-Martin/Ephemera.svg?branch=master)](https://travis-ci.org/sam-martin/Ephemera)  
 ![Screenshot](http://i.giphy.com/l41lHcOVaBJnKnbEs.gif)  
This repository contains the Node.js, HTML, JavaScript, and supporting Terraform templates to upload secrets securely to S3 and deliver a one-time URL back to the user.
## Demo
[Ephemera Demo](http://ephemera.sammart.in/)  
All secrets submitted here are deleted after 24hrs, and for obvious reasons security reasons do not use this as an hosted secret transfer solution!
## Setup
There are a number of resources required in AWS, so it's recommended you follow the [Terraform Setup Guide](https://github.com/Sam-Martin/Ephemera/wiki/Setup-With-Terraform), which will simplify matters.  
If you'd rather do it yourself, follow the [Manual Setup Guide](https://github.com/Sam-Martin/Ephemera/wiki/Manual-Setup)
## Overview  
Ephemera is a one-time secret transfer tool intended to help you in the transition from legacy tools which do not allow secure secret communication (e.g. via password reset URLs or key fingerprints).  
Ephemera is intended to be simple enough to be audited by someone with a basic understanding of JavaScript and AWS to validate that it is a non-malicous method for password transfer that you can setup in your own AWS account.  
It is not intended to be a replacement for proper user-centric secret management, but merely a transitional phase to help eradicate secrets attached to plaintext emails.  
This project is currently functional but needs work to tidy up unit tests etc.
## How it Works
Ephemera uses three components

1. AWS S3 for website hosting and secret storage (separate buckets)
2. AWS Lambda for GUID creation and one-time S3 upload URL signing
3. AWS API Gateway as a front-end for Lambda allowing the JavaScript from the S3 website to retrieve GUIDs and one-time upload URLs

The user is presented with a website that gives them the option to upload a text or an image secret . 
### Uploading a Text Secret
When uploading a text secret, the user submits the secret via a text box, the contents of which are submitted to the API Gateway `addTextSecret` method. This method generates a GUID and saves the secret in the private S3 bucket as with that GUID as its key. The method then returns the GUID combined with the specified websiteURL for the address of the secret return page which the user can then give to the person they wish to transmit the secret to.
### Uploading an Image Secret
When uploading an image secret the user submits the the secret using a multi-part form upload. The action of this form is a JavaScript call to the `getSecretUploadSignature` API Gateway method. This method generates a GUID and uses the AWS secret key (encrypted with a KMS key) to sign a one-time URL for *upload* to the private S3 bucket for the generate GUID key from the client. Once that upload URL is returned, the multi-part form is submitted to the S3 endpoint and once the upload is complete the user is returned to the Ephemera page to retrieve the one-time URL.
### Retrieving a secret
When a user clicks on a one-time URL, the JavaScript on the page recognises that the URL contains a GUID and then calls the API Gateway `getSecret` method submitting that GUID for retrieval. The return of this method includes the secret (in base64 if it is an image secret, or in plaintext if not) along with a mimetype. If that mimetype is an image the base64 content is loaded directly into a an `<img/>` tag for display, otherwise it is simply displayed as text.

## Contributing
Please feel free to submit pull requests of any type, whether they're bugfixes, test improvements, new features, anything!  
Just make sure that if it necessitates a new AWS resource you represent it in the Terraform templates and that it does not require per hour services (e.g. EC2 or ECS).
## Author
Author:: Sam Martin (<samjackmartin@gmail.com>)
