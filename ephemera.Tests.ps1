if(!$stage){
    $stage = 'dev'
}

# Get endpoint URL
$ServerlessInfo = &"serverless" "info" "--stage" $stage | Out-String

$ConfigFile = Get-Content 'config.yml' | Out-String
$Config = ConvertFrom-Yaml -Yaml $ConfigFile
$global:addTextSecret = ($ServerlessInfo | select-string 'POST - (https://.*)').Matches[0].Groups[1].Value
$global:getTextSecret = ($ServerlessInfo | select-string 'GET - (https://.*)').Matches[0].Groups[1].Value
$global:PublicWebsite = "http://{0}.s3-website.{1}.amazonaws.com" -f $config.public_bucket_name, $config.region
$global:PublicWebsite = $global:PublicWebsite -replace "\`${self:custom.config.stage}", $config.stage
$ServerlessInfo -match 'POST - (?<url>.*/v2)' | Out-Null
$APIUrl = $Matches.url
Write-Verbose "Checking stage: $stage"
Write-Verbose "Checking API URL: $addTextSecret and $getTextSecret"

Describe "Ephemera" {
    It "Returns a valid secret url!" {
        $global:TestSecret = "I am a secret, ssh!"
        $Payload = @{secretText = $TestSecret} | ConvertTo-Json
        $global:AddSecretResult = (Invoke-WebRequest -uri $global:addTextSecret -Body $Payload -UseBasicParsing -Method POST -ContentType "Application/JSON" -verbose).Content | ConvertFrom-Json
        $global:AddSecretResult.Key | Should match '[\d\w]{8}-[\d\w]{4}-[\d\w]{4}-[\d\w]{4}-[\d\w]{12}'
    }
    It "Should return the correct secret!" {
        $Parameters = [System.Web.HttpUtility]::ParseQueryString([String]::Empty)
        $Parameters['key'] =  $global:AddSecretResult.Key
        $Request = [System.UriBuilder]$global:getTextSecret
        $Request.Query = $Parameters.ToString()
        $GetSecretResult = ([char[]](Invoke-WebRequest -uri $request.uri -Method GET -UseBasicParsing -verbose).Content  -join '') | ConvertFrom-Json
        $GetSecretResult.secretText | Should Be $TestSecret
    }
    It "Should NOT return the correct secret twice!" {

        $Parameters = [System.Web.HttpUtility]::ParseQueryString([String]::Empty)
        $Parameters['key'] =  $global:AddSecretResult.Key
        $Request = [System.UriBuilder]$global:getTextSecret
        $Request.Query = $Parameters.ToString()
        $GetSecretResult = ([char[]](Invoke-WebRequest -uri $request.uri -Method GET -UseBasicParsing -verbose).Content  -join '') | ConvertFrom-Json
        $GetSecretResult.secretText | Should Not Be $TestSecret
    }
    It "Should return a 200 on the public URL" {
        (Invoke-WebRequest $global:PublicWebsite -UseBasicParsing).StatusCode | Should Be 200
    }
    It "Should have the API URL in the front end config json" {

        $Request = [System.UriBuilder]($global:PublicWebsite+"/js/config.json")
        $GetConfig = Invoke-RestMethod -uri $request.uri -Method GET -UseBasicParsing
        $GetConfig.apiUrl.length | should BeGreaterThan 0
    }
}
