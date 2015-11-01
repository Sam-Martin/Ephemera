variable "access_key" {}
variable "secret_key" {}
variable "region" {default = "eu-west-1"}


variable "private_bucket_name" {}
variable "public_bucket_name" {}
variable "ephemera_s3_url_signer" {default = "EphemeraS3Signer"}
variable "lambda_role_name" {default = "EphemeraLambda"}
variable "lambda_executor_role_name" {default = "EphemeraLambdaExecutor"}
variable "ephemera_lambda_zip" {default = "..\ephemera.zip"}