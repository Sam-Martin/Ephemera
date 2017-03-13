# Get endpoint URL
Push-Location serverless-ephemera
$ServerlessInfo = &"serverless" "info" | Out-String
Pop-Location

$ConfigFile = Get-Content 'serverless-ephemera\config.yml' | Out-String
$Config = ConvertFrom-Yaml -Yaml $ConfigFile

$global:PublicWebsite = "http://{0}.s3-website-{1}.amazonaws.com" -f $config.public_bucket_name, $config.region
    
$ServerlessInfo -match 'POST - (?<url>.*/v1)' | Out-Null
$APIUrl = $Matches.url

Describe "Ephemera" {
    It "Returns a valid secret url!" {
        $global:TestSecret = "I am a secret, ssh!"
        $Payload = @{secretText = $TestSecret} | ConvertTo-Json
        $global:AddSecretResult = (Invoke-WebRequest -uri "$APIUrl/addTextSecret" -Body $Payload -UseBasicParsing -Method POST -ContentType "Application/JSON" -verbose).Content | ConvertFrom-Json
        $AddSecretResult.Key | Should match '[\d\w]{8}-[\d\w]{4}-[\d\w]{4}-[\d\w]{4}-[\d\w]{12}'
    }
    It "Should return the correct secret!" {
        $GetSecretResult = (Invoke-WebRequest -uri "$APIUrl/getSecret?key=$($AddSecretResult.Key)" -UseBasicParsing -Method GET -verbose).Content | ConvertFrom-Json
        $GetSecretResult.body | Should Be $TestSecret
    }
    It "Should NOT return the correct secret twice!" {
        $GetSecretResult = (Invoke-WebRequest -uri "$APIUrl/getSecret?key=$($AddSecretResult.Key)" -UseBasicParsing -Method GET -verbose).Content | ConvertFrom-Json
        $GetSecretResult.body | Should Not Be $TestSecret
    }
    It "Should return a 200 on the public URL" {
        (Invoke-WebRequest $global:PublicWebsite -UseBasicParsing).StatusCode | Should Be 200
    }
}
