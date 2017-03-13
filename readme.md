# Ephemera - One time secret distribution
 [![GitHub license](http://i.imgur.com/fkMVzNe.png)]() [![Build Status](https://ci.appveyor.com/api/projects/status/9cgvg2f1y0oolleg/branch/master?svg=true)](https://ci.appveyor.com/project/Sam-Martin/ephemera)  
 ![Screenshot](http://i.giphy.com/l41lHcOVaBJnKnbEs.gif)  
This repository contains the Node.js, HTML, JavaScript, and supporting [Serverless](https://github.com/serverless/serverless) definition to upload secrets securely to S3 and deliver a one-time URL back to the user.
## Demo
[Ephemera Demo](http://ephemera.sammart.in/)  
All secrets submitted here are deleted after 24hrs, and for obvious reasons security reasons do not use this as an hosted secret transfer solution!
## Setup
There are a number of resources required in AWS, so it's recommended you follow the [PSake Setup Guide](https://github.com/Sam-Martin/Ephemera/wiki/PSake-&-Serverless-Setup-Guide), which will simplify matters significantly.  
Currently there's no documentation on how to do it yourself, but you can look in the `default.ps1` file to figure out what's going on. Really if you're doing this without [Serverless](https://github.com/serverless/serverless) you're doing it wrong!
## Overview  
Ephemera is a one-time secret transfer tool intended to help you in the transition from legacy tools which do not allow secure secret communication (e.g. via password reset URLs or key fingerprints).  
Ephemera is intended to be simple enough to be audited by someone with a basic understanding of JavaScript and AWS to validate that it is a non-malicous method for password transfer that you can setup in your own AWS account.  
It is not intended to be a replacement for proper user-centric secret management, but merely a transitional phase to help eradicate secrets attached to plaintext emails.  
This project is currently functional but needs work to tidy up unit tests etc.
## How it Works
Ephemera uses three components

1. AWS S3 for website hosting and secret storage (separate buckets)
2. AWS Lambda for GUID creation and secret upload
3. AWS API Gateway as a front-end for Lambda allowing the JavaScript from the S3 website to add/retrieve secrets

The user is presented with a website that gives them the option to upload a text secret. 
### Uploading a Text Secret
When uploading a text secret, the user submits the secret via a text box, the contents of which are submitted to the API Gateway `addTextSecret` method. This method generates a GUID and saves the secret in the private S3 bucket as with that GUID as its key. The method then returns the GUID combined with the specified websiteURL for the address of the secret return page which the user can then give to the person they wish to transmit the secret to.
### Retrieving a secret
When a user clicks on a one-time URL, the JavaScript on the page recognises that the URL contains a GUID and then calls the API Gateway `getSecret` method submitting that GUID for retrieval. The return of this method includes the secret which is displayed for the user.

## Contributing
Please feel free to submit pull requests of any type, whether they're bugfixes, test improvements, new features, anything!  
Just make sure that if it necessitates a new AWS resource you represent it in the Terraform templates and that it does not require per hour services (e.g. EC2 or ECS).
## Author
Author:: Sam Martin (<samjackmartin@gmail.com>)
