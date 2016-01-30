{
  "swagger": "2.0",
  "info": {
    "version": "1.0.0",
    "description":"Submit single-access secrets to the Ephemera API",
    "title": "${api_gateway_name}"
  },
  "basePath": "/",
  "schemes": [
    "https"
  ],
  "paths": {
    "/v1/addTextSecret": {
      "post": {
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "in": "body",
            "name": "secretText",
            "required": true,
            "schema": {
              "$ref": "#/definitions/secretText"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "200 response",
            "schema": {
              "$ref": "#/definitions/Keyoftheuploadsecret"
            },
            "headers": {
              "Access-Control-Allow-Origin": {
                "type": "string"
              },
              "Access-Control-Allow-Methods": {
                "type": "string"
              },
              "Access-Control-Allow-Headers": {
                "type": "string"
              }
            }
          },
          "400": {
            "description": "400 response",
            "schema": {
              "$ref": "#/definitions/Error"
            },
            "headers": {}
          }
        },
        "x-amazon-apigateway-integration": {
          "credentials": "${lambda_executor_role}",
          "responses": {
            "default": {
              "statusCode": "200",
              "responseParameters": {
                "method.response.header.Access-Control-Allow-Methods": "'GET,POST'",
                "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization'",
                "method.response.header.Access-Control-Allow-Origin": "'${public_bucket_url}'"
              }
            }
          },
          "requestTemplates": {
            "application/json": "{ \"secretText\": \"$input.params('secretText')\" }"
          },
          "uri": "arn:aws:apigateway:${aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${aws_region}:${aws_account_id}:function:${ephemera_addtextsecret_function_name}/invocations",
          "httpMethod": "POST",
          "type": "aws"
        }
      }
    },
    "/v1/getSecret": {
      "get": {
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "key",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "200 response",
            "schema": {
              "$ref": "#/definitions/Bodyofthesecret"
            },
            "headers": {
              "Access-Control-Allow-Origin": {
                "type": "string"
              },
              "Access-Control-Allow-Methods": {
                "type": "string"
              },
              "Access-Control-Allow-Headers": {
                "type": "string"
              }
            }
          },
          "400": {
            "description": "400 response",
            "schema": {
              "$ref": "#/definitions/Error"
            },
            "headers": {}
          }
        },
        "x-amazon-apigateway-integration": {
          "credentials": "${lambda_executor_role}",
          "responses": {
            "default": {
              "statusCode": "200",
              "responseParameters": {
                "method.response.header.Access-Control-Allow-Methods": "'GET,POST'",
                "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization'",
                "method.response.header.Access-Control-Allow-Origin": "'${public_bucket_url}'"
              }
            }
          },
          "requestTemplates": {
            "application/json": "{ \"key\": \"$input.params('key')\" }"
          },
          "uri": "arn:aws:apigateway:${aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${aws_region}:${aws_account_id}:function:${ephemera_getsecret_function_name}/invocations",
          "httpMethod": "POST",
          "type": "aws"
        }
      }
    },
    "/v1/getSecretUploadSignature": {
      "get": {
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "Content-Type",
            "in": "query",
            "required": true,
            "type": "string"
          },
          {
            "name": "redirectTo",
            "in": "query",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "200 response",
            "schema": {
              "$ref": "#/definitions/NecessaryfieldstosubmitasignedS3upload"
            },
            "headers": {
              "Access-Control-Allow-Origin": {
                "type": "string"
              },
              "Access-Control-Allow-Methods": {
                "type": "string"
              },
              "Access-Control-Allow-Headers": {
                "type": "string"
              }
            }
          },
          "400": {
            "description": "400 response",
            "schema": {
              "$ref": "#/definitions/Error"
            },
            "headers": {}
          }
        },
        "x-amazon-apigateway-integration": {
          "credentials": "${lambda_executor_role}",
          "responses": {
            "default": {
              "statusCode": "200",
              "responseParameters": {
                "method.response.header.Access-Control-Allow-Methods": "'GET,POST'",
                "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization'",
                "method.response.header.Access-Control-Allow-Origin": "'${public_bucket_url}'"
              }
            }
          },
          "requestTemplates": {
            "application/json": "{ \"Content-Type\": \"$input.params('Content-Type')\", \"redirectTo\": \"$input.params('redirectTo')\" }"
          },
          "uri": "arn:aws:apigateway:${aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${aws_region}:${aws_account_id}:function:${ephemera_getsignedurl_function_name}/invocations",
          "httpMethod": "POST",
          "type": "aws"
        }
      }
    }
  },
  "definitions": {
    "secretText": {
      "type": "object",
      "properties": {
        "secretText": {
          "type": "string",
          "description": "Value of a secret to be stored ephemerally"
        }
      }
    },
    "NecessaryfieldstosubmitasignedS3uploadItem": {
      "type": "object",
      "properties": {
        "key": {
          "type": "string",
          "description": "Key name for the file in the s3 bucket, a GUID"
        },
        "AWSAccessKeyId": {
          "type": "string",
          "description": "ID of the access key authenticating the upload"
        },
        "acl": {
          "type": "string",
          "description": "Acl for the uploaded file (always public)"
        },
        "success_action_redirect": {
          "type": "string",
          "description": "The URL the user will be sent to after the upload"
        },
        "policy": {
          "type": "string",
          "description": "A Base64-encoded policy document"
        },
        "signature": {
          "type": "string",
          "description": "The content type (mime type) that will be applied to the uploaded file"
        },
        "Content-Type": {
          "type": "string",
          "description": "A Base64-encoded policy document"
        }
      }
    },
    "KeyoftheuploadsecretItem": {
      "type": "object",
      "properties": {
        "key": {
          "type": "string",
          "description": "Key name for the file in the s3 bucket, a GUID"
        }
      }
    },
    "Bodyofthesecret": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/BodyofthesecretItem"
      }
    },
    "BodyofthesecretItem": {
      "type": "object",
      "properties": {
        "Content-Type": {
          "type": "string",
          "description": "Type of content"
        },
        "body": {
          "type": "string",
          "description": "base64 encoded content of the secret"
        }
      }
    },
    "Error": {
      "type": "object",
      "properties": {
        "code": {
          "type": "integer",
          "format": "int32"
        },
        "message": {
          "type": "string"
        },
        "fields": {
          "type": "string"
        }
      }
    },
    "NecessaryfieldstosubmitasignedS3upload": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/NecessaryfieldstosubmitasignedS3uploadItem"
      }
    },
    "Keyoftheuploadsecret": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/KeyoftheuploadsecretItem"
      }
    }
  }
}