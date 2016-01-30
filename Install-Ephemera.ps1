# Get the params we need
param(
    [Parameter(Mandatory=$true)]
    [string]$swaggerImporterPath,
    [Parameter(Mandatory=$true)]
    [string]$kmsKeyID,
    [Parameter(Mandatory=$true)]
    [string]$kmsRegion,
    $TerraformConfigPath= "$PSScriptRoot\terraform"
)
$terraformVars = @()

Remove-Module Install-Ephemera -ErrorAction SilentlyContinue
Import-Module $PSScriptRoot\Install-Ephemera.psm1



Write-Verbose "Check the output folder exists"
if(!(Test-Path $PSScriptRoot\output)){New-Item $PSScriptRoot\output -ItemType container}

Write-Verbose "Perform the initial Terraform create with placeholder values"
Invoke-Terraform -action 'Apply' -TerraformConfigPath $TerraformConfigPath | Out-Null

Write-Verbose "Encrypt the S3 user's API Secret Key for use in signing URLs"
$APISecretKey = Invoke-Terraform -action 'output' -TerraformArgs 's3_signer_secret_key' -TerraformConfigPath $TerraformConfigPath
$encryptedOutput = Get-Base64KMSEncryptedString -inputString $APISecretKey -kmsKeyID $kmsKeyID -kmsRegion $kmsRegion
$script:terraformVars += "-var 'encrypted_s3_url_signer_secret=$encryptedOutput'"

Write-Verbose "Populate the lambda config"
Invoke-Terraform -action 'Apply' -TerraformConfigPath $TerraformConfigPath -TerraformArgs $TerraformVars | Out-Null
$lambdaConfig = Invoke-Terraform -action 'Output' -TerraformConfigPath $TerraformConfigPath  -TerraformArgs 'lambda-config'
$lambdaConfig | Set-Content $PSScriptRoot\lambda\common\ephemera-config.js 

Write-Verbose "Create the lambda zip"
Remove-Item $PSScriptRoot\ephemera.zip -Force -ErrorAction SilentlyContinue
ZipFiles -zipfilename $PSScriptRoot\ephemera.zip -sourcedir $PSScriptRoot\lambda\

Write-Verbose "Taint the lambda functions so they get recreated"
Write-Verbose (Invoke-Terraform -action 'taint' -TerraformConfigPath $TerraformConfigPath -TerraformArgs 'aws_lambda_function.ephemera-getsignedurl')
Write-Verbose (Invoke-Terraform -action 'taint' -TerraformConfigPath $TerraformConfigPath -TerraformArgs 'aws_lambda_function.ephemera-addtextsecret')
Write-Verbose (Invoke-Terraform -action 'taint' -TerraformConfigPath $TerraformConfigPath -TerraformArgs 'aws_lambda_function.ephemera-getsecret')

Write-Verbose "Recreate the lambda functions with the new config specifying our signer secret"
Invoke-Terraform -action 'Apply' -TerraformConfigPath $TerraformConfigPath -TerraformArgs $TerraformVars | Out-Null

Write-Verbose "Populate the swagger file"
Invoke-Terraform -action 'output' -TerraformArgs 'swagger' -TerraformConfigPath $TerraformConfigPath | Set-Content -Path $PSScriptRoot\output\ephemera-swagger-spec.json


Write-Verbose "Cleanup any old api gateways"
$apiID = Invoke-Terraform -action 'output' -TerraformArgs 'api_gateway_id' -TerraformConfigPath $TerraformConfigPath
if($apiID -ne 'placeholder'){
    Write-Verbose "Cleaning up $apiID"
    try{
        Remove-AGRestApi -RestApiId $apiID -Force -ErrorAction SilentlyContinue 
    }catch{
    }
}

Write-Verbose "Execute the swagger importer to create the api gateway"
$swaggerImporterOutput = Invoke-AWSSwaggerImporter -action 'create' -swaggerImporterPath $swaggerImporterPath -swaggerSpecificationPath $PSScriptRoot\output\ephemera-swagger-spec.json

Write-Verbose "Extract the api ID and add it to the global terraform vars"
$swaggerImporterOutput | %{$_ -match "api id \w{10,10}"} | Out-Null
$apiID = $matches[$matches.length-1] -replace 'api id ',''
$script:terraformVars += "-var 'api_gateway_id=$apiID'"

Write-Verbose "Update Terraform with the API ID"

# Get AWS Region
$AWSRegion = Invoke-Terraform -action 'output' -TerraformArgs 'aws_region' -TerraformConfigPath $TerraformConfigPath

# Filter out existing values which will replace and rewrite the config file
$(Get-Content "$TerraformConfigPath\terraform.tfvars" | Where-Object {$_ -notmatch 'api_gateway_id' -and $_ -notmatch "api_url"}) | Set-Content "$TerraformConfigPath\terraform.tfvars"
# Add values
"api_gateway_id = `"$apiID`"" | Add-Content "$TerraformConfigPath\terraform.tfvars"
"api_url = `"https://$apiID.execute-api.$AWSRegion.amazonaws.com/prod/v1`"" | Add-Content "$TerraformConfigPath\terraform.tfvars"

Write-Verbose "Re-run terraform to update the frontend S3 bucket's config files"
Invoke-Terraform -action 'Apply' -TerraformConfigPath $TerraformConfigPath -TerraformArgs $TerraformVars | Out-Null

Write-Verbose "Publish the API Gateway"
New-AGDeployment -RestApiId $apiID -StageName "prod" -ErrorAction Stop | Out-Null

Write-Verbose "Generate frontend config"
Invoke-Terraform -action 'output' -TerraformArgs 'frontend-config ' -TerraformConfigPath $TerraformConfigPath | Set-content $PSScriptRoot\output\frontend_config.js -Force -ErrorAction SilentlyContinue
$script:terraformVars += "-var 'frontend_config_location=output\frontend_config.js'"

Write-Verbose "Upload the latest files"
Invoke-Terraform -action 'Apply' -TerraformConfigPath $TerraformConfigPath -TerraformArgs $TerraformVars | Out-Null

Write-Verbose "Grant KMS Decrypt to Lambda Role"
$lambdaRoleARN = Invoke-Terraform -action 'output' -TerraformArgs 'lambda_role_arn' -TerraformConfigPath $TerraformConfigPath 
New-KMSGrant -KeyId $kmsKeyID -GranteePrincipal $lambdaRoleARN -Operation @("Decrypt") -region $kmsRegion -Name "ephemera-terraform" | Out-Null