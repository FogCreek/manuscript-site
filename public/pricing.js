$('.js-toggle-od').click(function() {
  $(this).addClass('checked');
  $('.js-toggle-op').removeClass('checked');
  $('.OnDemand').show();
  $('.OnPrem').hide();
  price();
});

$('.js-toggle-op').click(function() {
  $(this).addClass('checked');
  $('.js-toggle-od').removeClass('checked');
  $('.OnDemand').hide();
  $('.OnPrem').show();
});

$('.tab').click(function() {
  $('.tab').removeClass('active');
  $(this).addClass('active');
  price();
});

$('#AddKiln').click(price);
$('.UserDropdown select').change(price);

function price() {
  
  const basePrice = [75, 150, 225, 375, 525, 600, 750, 1050, 1350];
  
  var includeKiln = $('#AddKiln').is(':checked');
  var numUsers = $('.UserDropdown select').val();
  var discount = 1;
  var numMonths = 12;
  var monthlyTotal = NaN;
  var grandTotal = NaN;
  var numYears = " total for one year";
    
  if($('.active').attr('id') == 'oneYear') {
    discount = 0.9; //10% discount
  } else if ($('.active').attr('id') == 'twoYears') {
    discount = 0.85; //15%
    numMonths = 24;
    numYears = " total for two years";
  } else if ($('.active').attr('id') == 'threeYears') {
    discount = 0.825; //17.5%
    numMonths = 36;
    numYears = " total for three years";
  }
  
  if (includeKiln) {
    monthlyTotal = basePrice[numUsers]*discount*2;
    grandTotal = monthlyTotal*numMonths;
  } else {
    monthlyTotal = basePrice[numUsers]*discount;
    grandTotal = monthlyTotal*numMonths;
  };
  
  if (isNaN(monthlyTotal)) {
    $('.OnDemand .Table, .AddKilnCheckbox, form').hide();
    $('.OnPrem').show();
  } else {
    $('.OnPrem').hide();
    $('.OnDemand .Table, .AddKilnCheckbox, form').show()
    $('.InfoBox .monthly').text("$" + Math.round(monthlyTotal).toLocaleString() + "/month");
    $('.InfoBox .annual').text("$" + Math.round(grandTotal).toLocaleString() + numYears);
  };
};

$(".emailSubmit").click(function(e) {
    if($(".mopEmail").val() != "") {
    $.ajax({
      type: "POST",
      url: "/add",
      data: {email: $('.mopEmail').val(), type: $('.js-toggle-op').hasClass('checked')},
      success: function() {
        $('input[name="email"]').val('');
        $(".Thanks").show();
        $(".Email").hide();
      }
    });
    return false;
  } else {
    e.preventDefault();
  };
})

//smooth scroll for anchor link
// Select all links with hashes
$('a[href*="#"]')
  // Remove links that don't actually link to anything
  .not('[href="#"]')
  .not('[href="#0"]')
  .click(function(event) {
    // On-page links
    if (
      location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
      && 
      location.hostname == this.hostname
    ) {
      // Figure out element to scroll to
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      // Does a scroll target exist?
      if (target.length) {
        // Only prevent default if animation is actually gonna happen
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top - 100
        }, 1000, function() {
          // Callback after animation
          // Must change focus!
          var $target = $(target);

        });
      }
    }
  });