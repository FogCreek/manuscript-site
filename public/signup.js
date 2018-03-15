//
// Assorted javascript to augment signup.html
//
// jQuery is available for use.

$(function(){
  
  // Populate the hidden timezone field with the client's timezone offset.
  var tzOffset = (new Date()).getTimezoneOffset();
  var input = document.getElementsByClassName('js-timezone')[0];
  input.value = tzOffset;
  
  function subdomainResponses(resp) {
    var message = "";
    switch (resp) {
      case "available":
        message = "🔰 This team name is available! 👍";
        break;
      case "taken":
        message = "❌ This team name is in use 😟";
        break;
      case "invalid":
        message = "❗️ This is not a valid Manuscript team name 🙅 <br/>  <span class='note'>Team names can contain letters, numbers, and hyphens ('-'), <br/> but cannot start or end with a hyphen.</span>";
        break;
      case "empty":
        message = "💮 Please choose a Manuscript team name 💫";
        break;
      default:
        message = "🚫 Error, try again 🙅";
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
      $(".Form__field-note.subdomain").removeClass().addClass('Form__field-note subdomain ' + status.resp);
      $(".Form__field-note.subdomain").empty().append(status.message); 
    });
  });
  
  function checkForBannedEmails() {
    $(".Form__field-note.email").empty();
    $(".Form__field-note.email").parent().removeClass("has-error");
    var email = $("input[type=email]").val().split("@")[1];
    $.get("https://raw.githubusercontent.com/willwhite/freemail/master/data/disposable.txt", function(result) {
      var domains = result.split(/\s+/);
      
      for (var i=0; i < domains.length; i++) {
        if (domains[i] == email) {
          $(".Form__field-note.email").parent().addClass("has-error");
          $(".Form__field-note.email").append("This address is not valid");
        }
      }
    })
  }
  
  
  $('#signup-form').submit(function(event){
    $('.TextInput').toggleClass("submitting");
    $('.Form__submit').empty().append("Submitting");
    event.preventDefault();
    checkForBannedEmails();
    $.post('/signup', $('#signup-form').serialize())
    .done(function(response){
      $('.TextInput').toggleClass("submitting");
      $('.Form__submit').empty().append("Let's Go!");
      console.log(response)
      var errors = response.errors;
      displayErrors(errors);
      var redirectUrl = response.redirectUrl;
      
      if(redirectUrl){
        window.location = redirectUrl;
        return;
      }
    })
    .fail(function(error){
      $('.TextInput').toggleClass("submitting");
      $('.Form__submit').empty().append("Let's Go!");
      $(".Form__field-note.global").append("Something went wrong, please try again");
    })
  })
});