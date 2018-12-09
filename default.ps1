properties {
    if(!$stage){
        $global:stage = 'dev';
    }else{
        $global:stage = $stage;
    }
}
task default -depends deploy-serverless, test

task prerequisites {
    if(!(Get-Command 'npm')){
        throw "NPM not found! Please install nodejs"
    }
    if(!(Get-Command 'serverless' -EA SilentlyContinue)){
        throw "serverless not found! Please run 'npm install serverless'"
    }
    if(!(Get-Command 'Write-S3Object' -EA SilentlyContinue)){
        throw "AWS cmdlets not found! Please install AWS PowerShell cmdlets"
    }
    if(!(Get-Command 'ConvertFrom-YAML' -EA SilentlyContinue)){
        throw "Powershell-Yaml not found! Please run 'Install-Module -Name powershell-yaml'";
    }
    if(!(Get-Command 'Invoke-Pester' -EA SilentlyContinue)){
        throw "Pester not found! Please run 'Install-Module -name pester'"
    }
    Write-Verbose "Pre-requisites checked successfully"
}

task deploy-serverless {
    serverless deploy --stage $stage
}

task test {
    $testResultsFile = 'TestsResults.xml'
    $testResults = Invoke-Pester -OutputFormat NUnitXml -OutputFile $testResultsFile -PassThru

    if ($env:APPVEYOR){
        Write-Host "Uploading test results to AppVeyor..."
        (New-Object 'System.Net.WebClient').UploadFile("https://ci.appveyor.com/api/testresults/nunit/$($env:APPVEYOR_JOB_ID)", (Resolve-Path $testResultsFile))
    }

    if ($testResults.FailedCount -gt 0) {
        $testResults | Format-List
        Write-Error -Message 'One or more Pester tests failed. Build cannot continue!'
    }
}
