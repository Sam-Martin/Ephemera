resource "aws_lambda_function" "ephemera-getsignedurl" {
    filename = "${var.ephemera_lambda_zip}"
    function_name = "${var.ephemera_getsignedurl_function_name}"
    role = "${aws_iam_role.ephemera_lambda_role.arn}"
    handler = "lambda/ephemera-getsignedurl/ephemera-getsignedurl.handler"
}

resource "aws_lambda_function" "ephemera-addtextsecret" {
    filename = "${var.ephemera_lambda_zip}"
    function_name = "${var.ephemera_addtextsecret_function_name}"
    role = "${aws_iam_role.ephemera_lambda_role.arn}"
    handler = "lambda/ephemera-addtextsecret/ephemera-addtextsecret.handler"
}

resource "aws_lambda_function" "ephemera-getsecret" {
    filename = "${var.ephemera_lambda_zip}"
    function_name = "${var.ephemera_getsecret_function_name}"
    role = "${aws_iam_role.ephemera_lambda_role.arn}"
    handler = "lambda/ephemera-getsecret/ephemera-getsecret.handler"
}