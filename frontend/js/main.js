var valuesSet;
// Stolen from http://stackoverflow.com/questions/4656843/jquery-get-querystring-from-url
// Read a page's GET URL variables and return them as an associative array.
function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}
var populateSecretURL = function (secretURL) {
  $('#secretURL').text(secretURL);
  
  // Clear out the secret field
  $('#secret-text').val('');
  
  // Slide down the output
  $('#secretOutput').slideDown();
};
$(document).ready(function () {

  urlVars = getUrlVars();
  if (typeof urlVars != 'undefined' && urlVars.bucket) {
    
    // if bucket is defined as a GET variable we've just uploaded something
    populateSecretURL(window.location.origin + '?key=' + urlVars.key);
  } else if(typeof urlVars != 'undefined' && window.location.href.match(/getSecret.html/)){

    // if we don't have a secret key, but we're on getSecret.html, tell the user they can't do anything useful here
    $('#secretOutput').html('<div class="alert alert-danger" role="alert"><strong>Error:</strong> No secret key defined. If you\'re trying to upload a secret, you may not have access to do so.</html>');
  
    // Slide down the output
    $('#secretOutput').slideDown();

  } else if (typeof urlVars != 'undefined' && urlVars.key) {
    
    // if key is defined without bucket then we're retrieving a secret
    var secretArea = $('#pageBody');
    $('#pageSubtitle p').text('Displaying a secret once...');
    secretArea.html('<h1>Loading Secret...</h1>');
    $.get($.apiUrl + '/getSecret', { key: urlVars.key }, function (result) {
      secretArea.html('<h1>Secret</h1>');
      if (result.errorMessage) {
        secretArea.append('Secret no longer exists');
      } else if (result['Content-Type'] == 'text/plain') {
        secretArea.append(result.body);
      } else {
        secretArea.append('<img src="data:' + result['Content-Type'] + ';base64,' + result.body + '"/>');
      }
    });
  }
  
  // Upload a file
  $('#file-form').submit(function (ev) {
    
    if (valuesSet) {
      return true;
    }

    ev.preventDefault();
    $.get($.apiUrl + '/getSecretUploadSignature', {
      'Content-Type': $('#file-select')[0].files[0].type,
      redirectTo: location.href
    }, function (result) {
      if (result.errorMessage) {
        alert(result.errorMessage);
        return;
      }
      $('#file-form [name=AWSAccessKeyId]').val(result.AWSAccessKeyId);
      $('#file-form [name=key]').val(result.key);
      $('#file-form [name=acl]').val(result.acl);
      $('#file-form [name=success_action_redirect]').val(result.success_action_redirect);
      $('#file-form [name=policy]').val(result.policy);
      $('#file-form [name=signature]').val(result.signature);
      $('#file-form [name=Content-Type]').val(result['Content-Type']);
      $('#file-form').attr('action', 'https://'+$.s3BucketName+'.s3.amazonaws.com/');
      valuesSet = true;
      $('#file-form').submit();
      valuesSet = false;
    });
  });
  
  // Upload a string
  $('#text-form').submit(function (ev) {
    ev.preventDefault();
    $.post($.apiUrl + '/addTextSecret', JSON.stringify({ 'secretText': $('#secret-text').val() }), function (result) {
      if(result.ErrorMessage){
        alert(result.ErrorMessage);
      } else {
        populateSecretURL(window.location.origin + '?key=' + result.key);
      }
    });
  });
});