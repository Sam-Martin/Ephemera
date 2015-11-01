{
   "swagger":"2.0",
   "info":{
      "title":"Ephemera API",
      "description":"Submit single-access secrets to the Ephemera API",
      "version":"1.0.0"
   },
   "schemes":[
      "https"
   ],
   "basePath":"/v1",
   "produces":[
      "application/json"
   ],
   "paths":{
      "/getSecret":{
         "get":{
            "summary":"Get a secret",
            "description":"Retrieve a secret, deleting it in the process",
            "parameters":[
               {
                  "name":"key",
                  "in":"query",
                  "description":"Key of the secret to be retrieved",
                  "required":true,
                  "type":"string"
               }
            ],
            "responses":{
               "200":{
                  "description":"Body of the secret",
                  "schema":{
                     "type":"array",
                     "items":{
                        "$ref":"#/definitions/S3ObjectContent"
                     }
                  },
                  "headers":{
                     "Access-Control-Allow-Headers":{
                        "description":"Specifies the allowed headers",
                        "type":"string",
                        "default":"'Content-Type,X-Amz-Date,Authorization'"
                     },
                     "Access-Control-Allow-Methods":{
                        "description":"Specifies the allowed methods",
                        "type":"string",
                        "default":"'GET,POST'"
                     },
                     "Access-Control-Allow-Origin":{
                        "description":"Specifies the allowed origins",
                        "type":"string",
                        "default":"'*'"
                     }
                  }
               },
               "400":{
                  "description":"Bad request",
                  "schema":{
                     "$ref":"#/definitions/Error"
                  }
               },
               "default":{
                  "description":"Unexpected error",
                  "schema":{
                     "$ref":"#/definitions/Error"
                  }
               }
            },
            "x-amazon-apigateway-auth":{
               "type":"none"
            },
            "x-amazon-apigateway-integration":{
               "type":"aws",
               "uri":"arn:aws:apigateway:${aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${aws_region}:${aws_account_id}:function:${ephemera_getsecret_function_name}/invocations",
               "httpMethod":"POST",
               "credentials":${lambda_executor_role}",
               "requestTemplates":{
                  "application/json":"{ \"key\": \"$input.params('key')\" }"
               },
               "cacheNamespace":"cache-namespace",
               "cacheKeyParameters":[

               ],
               "responses":{
                  "2//d{2}":{
                     "statusCode":"200",
                     "responseParameters":{
                        "method.response.header.Access-Control-Allow-Headers":"'Content-Type,X-Amz-Date,Authorization'",
                        "method.response.header.Access-Control-Allow-Methods":"'GET,POST'",
                        "method.response.header.Access-Control-Allow-Origin":"'${public_bucket_url}'"
                     }
                  },
                  "default":{
                     "statusCode":"200",
                     "responseParameters":{
                        "method.response.header.Access-Control-Allow-Headers":"'Content-Type,X-Amz-Date,Authorization'",
                        "method.response.header.Access-Control-Allow-Methods":"'GET,POST'",
                        "method.response.header.Access-Control-Allow-Origin":"'${public_bucket_url}'"
                     }
                  }
               }
            }
         }
      },
      "/addTextSecret":{
         "post":{
            "summary":"Add a text secret",
            "description":"Add a text secret to the bucket and return an s3 key",
            "parameters":[
               {
                  "name":"secretText",
                  "in":"body",
                  "description":"Text of the secret to be communicated",
                  "required":true,
                  "schema":{
                     "$ref":"#/definitions/secretText"
                  }
               }
            ],
            "responses":{
               "200":{
                  "description":"Key of the upload secret",
                  "schema":{
                     "type":"array",
                     "items":{
                        "$ref":"#/definitions/S3Object"
                     }
                  },
                  "headers":{
                     "Access-Control-Allow-Headers":{
                        "description":"Specifies the allowed headers",
                        "type":"string",
                        "default":"'Content-Type,X-Amz-Date,Authorization'"
                     },
                     "Access-Control-Allow-Methods":{
                        "description":"Specifies the allowed methods",
                        "type":"string",
                        "default":"'GET,POST'"
                     },
                     "Access-Control-Allow-Origin":{
                        "description":"Specifies the allowed origins",
                        "type":"string",
                        "default":"'*'"
                     }
                  }
               },
               "400":{
                  "description":"Bad request",
                  "schema":{
                     "$ref":"#/definitions/Error"
                  }
               },
               "default":{
                  "description":"Unexpected error",
                  "schema":{
                     "$ref":"#/definitions/Error"
                  }
               }
            },
            "x-amazon-apigateway-auth":{
               "type":"none"
            },
            "x-amazon-apigateway-integration":{
               "type":"aws",
               "uri":"arn:aws:apigateway:${aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${aws_region}:${aws_account_id}:function:${ephemera_addtextsecret_function_name}/invocations",
               "httpMethod":"POST",
               "credentials":"${lambda_executor_role}",
               "requestTemplates":{
                  "application/json":"{ \"secretText\": \"$input.params('secretText')\" }"
               },
               "cacheNamespace":"cache-namespace",
               "cacheKeyParameters":[

               ],
               "responses":{
                  "2//d{2}":{
                     "statusCode":"200",
                     "responseParameters":{
                        "method.response.header.Access-Control-Allow-Headers":"'Content-Type,X-Amz-Date,Authorization'",
                        "method.response.header.Access-Control-Allow-Methods":"'GET,POST'",
                        "method.response.header.Access-Control-Allow-Origin":"'${public_bucket_url}'"
                     }
                  },
                  "default":{
                     "statusCode":"200",
                     "responseParameters":{
                        "method.response.header.Access-Control-Allow-Headers":"'Content-Type,X-Amz-Date,Authorization'",
                        "method.response.header.Access-Control-Allow-Methods":"'GET,POST'",
                        "method.response.header.Access-Control-Allow-Origin":"'${public_bucket_url}'"
                     }
                  }
               }
            }
         }
      },
      "/getSecretUploadSignature":{
         "get":{
            "summary":"Get signed S3 upload details",
            "description":"The getSecretUploadSignature endpoint allows you to submit a new secret and will return a unique URL to download that secret once.  \nSee [Browser Uploads to S3 using HTML POST Forms](https://aws.amazon.com/articles/1434) for more.\n",
            "parameters":[
               {
                  "name":"Content-Type",
                  "in":"query",
                  "description":"Mime-type of the file to be uploaded",
                  "required":true,
                  "type":"string"
               },
               {
                  "name":"redirectTo",
                  "in":"query",
                  "description":"URL to redirect to, will have a hashmap of the objectURL appended",
                  "required":true,
                  "type":"string"
               }
            ],
            "responses":{
               "200":{
                  "description":"Necessary fields to submit a signed S3 upload",
                  "schema":{
                     "type":"array",
                     "items":{
                        "$ref":"#/definitions/S3UploadSignature"
                     }
                  },
                  "headers":{
                     "Access-Control-Allow-Headers":{
                        "description":"Specifies the allowed headers",
                        "type":"string",
                        "default":"'Content-Type,X-Amz-Date,Authorization'"
                     },
                     "Access-Control-Allow-Methods":{
                        "description":"Specifies the allowed methods",
                        "type":"string",
                        "default":"'GET,POST'"
                     },
                     "Access-Control-Allow-Origin":{
                        "description":"Specifies the allowed origins",
                        "type":"string",
                        "default":"'*'"
                     }
                  }
               },
               "400":{
                  "description":"Bad request",
                  "schema":{
                     "$ref":"#/definitions/Error"
                  }
               },
               "default":{
                  "description":"Unexpected error",
                  "schema":{
                     "$ref":"#/definitions/Error"
                  }
               }
            },
            "x-amazon-apigateway-auth":{
               "type":"none"
            },
            "x-amazon-apigateway-integration":{
               "type":"aws",
               "uri":"arn:aws:apigateway:${aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${aws_region}:${aws_account_id}:function:${ephemera_getsignedurl_function_name}/invocations",
               "httpMethod":"POST",
               "credentials":"${lambda_executor_role}",
               "requestTemplates":{
                  "application/json":"{ \"Content-Type\": \"$input.params('Content-Type')\", \"redirectTo\": \"$input.params('redirectTo')\" }"
               },
               "cacheNamespace":"cache-namespace",
               "cacheKeyParameters":[

               ],
               "responses":{
                  "2//d{2}":{
                     "statusCode":"200",
                     "responseParameters":{
                        "method.response.header.Access-Control-Allow-Headers":"'Content-Type,X-Amz-Date,Authorization'",
                        "method.response.header.Access-Control-Allow-Methods":"'GET,POST'",
                        "method.response.header.Access-Control-Allow-Origin":"'${public_bucket_url}'"
                     }
                  },
                  "default":{
                     "statusCode":"200",
                     "responseParameters":{
                        "method.response.header.Access-Control-Allow-Headers":"'Content-Type,X-Amz-Date,Authorization'",
                        "method.response.header.Access-Control-Allow-Methods":"'GET,POST'",
                        "method.response.header.Access-Control-Allow-Origin":"'${public_bucket_url}'"
                     }
                  }
               }
            }
         }
      }
   },
   "definitions":{
      "S3Object":{
         "type":"object",
         "properties":{
            "key":{
               "type":"string",
               "description":"Key name for the file in the s3 bucket, a GUID"
            },
            "bucketName":{
               "type":"string",
               "description":"Name of the bucket"
            },
            "bucketRegion":{
               "type":"string",
               "description":"Region of the bucket"
            },
            "objectURL":{
               "type":"string",
               "description":"Name of the bucket"
            }
         }
      },
      "S3ObjectContent":{
         "type":"object",
         "properties":{
            "Content-Type":{
               "type":"string",
               "description":"Type of content"
            },
            "body":{
               "type":"string",
               "description":"base64 encoded content of the secret"
            }
         }
      },
      "secretText":{
         "type":"object",
         "properties":{
            "secretText":{
               "type":"string",
               "description":"Value of a secret to be stored ephemerally"
            }
         }
      },
      "S3UploadSignature":{
         "type":"object",
         "properties":{
            "key":{
               "type":"string",
               "description":"Key name for the file in the s3 bucket, a GUID"
            },
            "AWSAccessKeyId":{
               "type":"string",
               "description":"ID of the access key authenticating the upload"
            },
            "acl":{
               "type":"string",
               "description":"Acl for the uploaded file (always public)"
            },
            "success_action_redirect":{
               "type":"string",
               "description":"The URL the user will be sent to after the upload"
            },
            "policy":{
               "type":"string",
               "description":"A Base64-encoded policy document"
            },
            "signature":{
               "type":"string",
               "description":"The content type (mime type) that will be applied to the uploaded file"
            },
            "Content-Type":{
               "type":"string",
               "description":"A Base64-encoded policy document"
            }
         }
      },
      "Error":{
         "type":"object",
         "properties":{
            "code":{
               "type":"integer",
               "format":"int32"
            },
            "message":{
               "type":"string"
            },
            "fields":{
               "type":"string"
            }
         }
      }
   }
}