resource "template_file" "swagger" {
    filename = "${path.module}/templates/ephemera-swagger-spec.json.tpl"
    vars {
    	lambda_executor_role = "${aws_iam_role.ephemera_lambda_executor_role.arn}"
    	aws_region = "${var.region}"
    	ephemera_getsecret_function_name = "${var.ephemera_getsecret_function_name}"
    	ephemera_addtextsecret_function_name = "${var.ephemera_addtextsecret_function_name}"
    	ephemera_getsignedurl_function_name = "${var.ephemera_getsignedurl_function_name}"
    	aws_account_id = "${var.aws_account_id}"
    	public_bucket_url = "${var.public_bucket_url}"
    }
}
output "swagger" {
    value = "${template_file.swagger.rendered}"
}