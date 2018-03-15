//
// Assorted javascript to augment signup.html
//
// jQuery is available for use.

$(function(){
  
  function subdomainResponses(resp) {
    var message = "";
    switch (resp) {
      case "taken":
        message = "🔰 Team name found 👍";
        break;
      case "invalid":
        message = "❗️ This is not a valid Manuscript team name 🙅 <br/>  <span class='note'>Team names can contain letters, numbers, and hyphens ('-'), <br/> but cannot start or end with a hyphen.</span>";
        break;
      case "empty":
        message = "💮 Please enter a Manuscript team name 💫";
        break;
      default:
        message = "🙅 Couldn't find a team by that name. <a href='/try' class='note'>Claim it by signing up!</a>";
        break;
    }
    return {resp, message};
  }
   
  function displayErrors(errors) {
    // If the error has a 'field' property, put it on the field of that name
    // otherwise, put it in the banner above.
    errors.forEach(function(err) {
      if (err.field == null) {
        $(".Form__field-note.global").empty();
        $(".Form__field-note.global").append(err.error);
      } else {
        $(".Form__field-note."+err.field).empty();
        if (err.field == "subdomain") {
          var message = subdomainResponses(err.error).message;
          $(".Form__field-note."+err.field).parent().addClass("has-error");
          $(".Form__field-note."+err.field).append(message);
        } else {
          $(".Form__field-note."+err.field).parent().addClass("has-error");
          $(".Form__field-note."+err.field).append(err.error);
        }
      }
    })
    console.log("Errors", errors);
  }
  
  //as-you-type checking of URL validity and availability
  $('.URLInputGroup__input').keyup(function () { 
    var name = encodeURIComponent($('input[name=subdomain]').val());
    $.get("/signup/name-check?name="+ name, function(resp) {
      var status = subdomainResponses(resp.status);
      $(".Form__field-note.subdomain").removeClass().addClass('Form__field-note subdomain ' + (status.resp === 'taken' ? 'available' : 'nope'));
      $(".Form__field-note.subdomain").empty().append(status.message);
      
      var buttonEnabled = status.resp === 'taken';
      $('#login-form [type="submit"]').prop('disabled', !buttonEnabled);
    });
  });
  
 
  
  $('#login-form').submit(function(event){
    event.preventDefault();

    var siteName = $('#login-form [name=subdomain]').val();
    var redirectUrl = "https://" + encodeURIComponent(siteName) + ".manuscript.com/login";
    window.location = redirectUrl;
  })
});