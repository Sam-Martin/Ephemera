
var apiUrl = 'https://licotqtmvg.execute-api.eu-west-1.amazonaws.com/staging/v1'
var valuesSet
$(document).ready(function () {
    
    // Upload a file
    $('#file-form').submit(function(ev){
        if(valuesSet){
            return true;
        }
            ev.preventDefault();
        
        $.get(apiUrl+'/getSecretUploadSignature',{'Content-Type':$('#file-select')[0].files[0].type}, function(result){
            
            $('#file-form [name=AWSAccessKeyId]').val(result.AWSAccessKeyId)
            $('#file-form [name=key]').val(result.key)
            $('#file-form [name=acl]').val(result.acl)
            $('#file-form [name=success_action_redirect]').val(result.success_action_redirect)
            $('#file-form [name=policy]').val(result.policy)
            $('#file-form [name=signature]').val(result.signature)
            $('#file-form [name=Content-Type]').val(result['Content-Type'])
            valuesSet = true
            $('#file-form').submit();
            valuesSet = false;
        })
    })

    // Upload a string
    $('#text-form').submit(function(ev){
        ev.preventDefault();

        $.post(apiUrl+'/addTextSecret',JSON.stringify({"secretText":$('#secret-text').val()}), function(result){
            if(result.objectURL){
                
                // Populate the resulting URL
                $('#secretURL').text(result.objectURL)
                
                // Clear out the secret field
                $('#secret-text').val('');

                // Slide down the output
                $('#secretOutput').slideDown();
            }
        })
    })
}); 