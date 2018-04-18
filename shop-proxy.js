// This module exposes the legacy shop.fogcreek.com interactions
// as workable responses in the node.js world

module.exports = {
  siteNameHandler: nameTestHandler,
  signupHandler: signup,
};

const winston = require('winston');
const rq = require("request-promise-native");

async function nameTestHandler(request, response) {
  let name = request.query.name;
  let result = await shopNameTest(name);
  return response.send(result);
}

async function shopNameTest(name) {
  let status = "error";

  try {
    const shopUrl = "https://shop.fogcreek.com/FogBugz/?sCategory=HOSTEDFB&HFBix=-1&fUniqueSiteNameTest=1";
    let shopResponse = await rq({
      url: shopUrl,
      qs: { sUniqueSiteName: name },
      timeout: 3000,
    });
    status = parseShopResponse(shopResponse);
  } catch (err) {
    winston.error("Error in shopNameTest function of shop-proxy.js: ", err);
  }
  
  return {
    name: name,
    status: status,
  };
}

function parseShopResponse(shopResponse) {
  if(typeof shopResponse !== "string"){
    return "unknown";
  }

  // Blank string == Valid and available
  if(shopResponse === "") {
    return "available";
  }

  // Reserved or held by another account;  not available.
  if(shopResponse.startsWith("This URL is in use")){
    return "taken";
  }

  // Not a valid account name, and therefore not available.
  if(shopResponse.startsWith("Please enter a valid URL")){
    return "invalid";
  }
  
  // this is shop"s response to an empty string.
  if(shopResponse.startsWith("Please choose a URL")){
    return "empty";
  }
  
  return "unknown";
}

// Ajaxily post here!
// On success, we'll populate redirectUrl, and the client should navigate themselves there.
// On failure, we'll put details in into the errors array
async function signup(request, response){
  
  let data = {
    errors: [],
    redirectUrl: "",
  };
  
  winston.info("Trial signup!", request.body && request.body.subdomain);
  
  // For testing display of global errors on the client:
  // data.errors.push({error: "test error");
  // return response.send(data);
  
  let validationResult = await validateSignup(request.body);
  let validatedBody = validationResult.shopForm;
  let validationErrors = validationResult.errors;
  if(validationErrors.length > 0) {
    // Form validation failed.
    // Bounce the form and pass the error along to the user.
    data.errors = data.errors.concat(validationErrors);
    winston.error("Form validation errors", validationErrors);
    return response.send(data);
  }
  
  // Pass through client IP for GeoIP lookup - case 3261972
  let headers = {};
  let clientIP = (request.headers["x-forwarded-for"]||"").split(',')[0];
  if(clientIP) {
    headers["x-forwarded-for"] = clientIP;
  }

  // Post to shop and redirect the user to the resulting page.
  // (if it's an error page, log it!)
  const shopNewTrialUrl = "https://shop.fogcreek.com/FogBugz/default.asp?sCategory=HOSTEDFB&HFBix=-1";
  rq({
      url: shopNewTrialUrl,
      method: "POST",
      headers: headers,
      form: validatedBody,
      simple: false, // Don't trigger promise rejections from 302"s
  }, (err, res, body) => {
    if(err) {
      sendBugzScout(request.body, err);
      data.errors.push({error: "Ack, something went wrong!  Please try again."});
      return response.send(data);
    }
    
    // Trial signup success
    if (res.statusCode === 302) {
      data.redirectUrl = res.headers.location;
      
      //todo: If redirect URL dosen't look like a success URL,
      // catch and handle that failure.
      return response.send(data);
    }
    
    // Oh no, form validation bounced unexpectedly!
    // Todo:  Log what made it throw (so we can fix it!), and alert!
    //console.log("Form validation failed. The shop body was:", body);
    sendBugzScout(request.body, body);
    data.errors.push({error: "Ack, something went wrong!  Please try again."});
    // to debug this inspect the shop body result output.
    // data.shopBody = body;
    return response.send(data);
  });
}


// Validates the signup post, and outputs any validation errors
// in addition to an object been tranlated for posting to SHOP
async function validateSignup(data) {
  let errors = [];

  let shopForm = {
    sStep:"stepProcessOrder",
    HFB_fShowUniqueURLSection: 1,
    HFB_fURL_helper: 1,
    HFB_fEnterBillingInfoNow: "False",
    HFB_fTOSChecked:"True",
    HFB_fBroadStreet: 1,
  };
  
  // Validation: check against nameTest
  let nameCheckResult = await shopNameTest(data.subdomain || "");
  if(["taken", "invalid","empty"].includes(nameCheckResult.status)) {
    errors.push({field:"subdomain", error:nameCheckResult.status});
  } else {
    //available or "unknown" get a pass
    shopForm.HFB_sUniqueSiteName = data.subdomain;
  }
  
  //Validation: after trimming, full name must not be blank.
  let trimmedName = (data.full_name || "").trim();
  if(trimmedName === "") {
    errors.push({field:"full_name", error:"Name must not be blank or only whitespace"});
  } else {
    shopForm.HFB_sFullName = data.full_name;
  }
  
  // Validation: shop wants the email to match this regex: "^[\w\.\-\+]+@[\w\.\-]+\.[a-zA-Z]+$"
  let regex = /^[\w\.\-\+]+@[\w\.\-]+\.[a-zA-Z]+$/;
  if(!regex.test(data.email||"")) {
    errors.push({field:"email", error:'Email must be in the form of "email@example.com"'});
  } else {
    shopForm.HFB_sEmail = data.email;
  }

  // Validation: no requirements on Phone field.
  shopForm.HFB_sPhone = data.phone;
  
  // Validation: Password may not begin or end with whitespace; must be at least 6 characters.
  let trimmedPassword = (data.password || "").trim();
  if(trimmedPassword !== data.password) {
    errors.push({field: "password", error: "Password may not begin or end with white space"});
  } else if (trimmedPassword.length < 6) {
    errors.push({field: "password", error: "Password must be at least 6 characters long"});
  } else {
    shopForm.HFB_sPassword = data.password;
  }
  
  // Validation: Needs to match one of Shop's expected values.
  shopForm.HFB_sTimeZoneKey = shopTimeZoneStringFromOffset(data.timezone);
  
  //validation: Terms should be accepted.
  if(data.accept_terms !== "on"){
    errors.push({field: "accept_terms", error: "Please accept the terms of service"});
  }
  
  return {
    shopForm: shopForm,
    errors: errors,
  };
}

function shopTimeZoneStringFromOffset(offset) {
  // These values must map to the <options> values on #HFB_sTimeZoneKey
  // on https://shop.fogcreek.com/FogBugz/default.asp?sCategory=HOSTEDFB&sStep=stepEnterEmailAddress&HFB_fManuscript=1
  // If they don't, you'll raise the dark ones.
  // case 3256709
  
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
  let hoursOffset = -1 * offset / 60;
  let tz = [];
  tz[-12] = "Dateline Standard Time"; // (UTC-12:00) International Date Line West
  tz[-11] = "UTC-11"; // (UTC-11:00) Coordinated Universal Time-11
  tz[-10] = "Hawaiian Standard Time"; //(UTC-10:00) Hawaii
  tz[-9 ] = "Alaskan Standard Time"; //(UTC-09:00) Alaska
  tz[-8 ] = "Pacific Standard Time"; //(UTC-08:00) Pacific Time (US &amp; Canada)
  tz[-7 ] = "Mountain Standard Time"; //(UTC-07:00) Mountain Time (US &amp; Canada)
  tz[-6 ] = "Central Standard Time"; //(UTC-06:00) Central Time (US &amp; Canada)
  tz[-5 ] = "Eastern Standard Time"; //(UTC-05:00) Eastern Time (US &amp; Canada)
  tz[-4 ] = "Atlantic Standard Time"; //(UTC-04:00) Atlantic Time (Canada)
  tz[-3 ] = "Argentina Standard Time"; //(UTC-03:00) City of Buenos Aires
  tz[-2 ] = "UTC-02"; //(UTC-02:00) Coordinated Universal Time-02
  tz[-1 ] = "Azores Standard Time"; //(UTC-01:00) Azores
  tz[0  ] = "UTC" //(UTC) Coordinated Universal Time
  tz[1  ] = "W. Europe Standard Time" //(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna
  tz[2  ] = "FLE Standard Time"; //(UTC+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius
  tz[3  ] = "Russian Standard Time"; //(UTC+03:00) Moscow, St. Petersburg, Volgograd
  tz[4  ] = "Arabian Standard Time"; //(UTC+04:00) Abu Dhabi, Muscat
  tz[5  ] = "Pakistan Standard Time"; //(UTC+05:00) Islamabad, Karachi
  tz[5.5] = "India Standard Time"; //(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi
  tz[7  ] = "SE Asia Standard Time" //(UTC+07:00) Bangkok, Hanoi, Jakarta
  tz[8  ] = "China Standard Time"; //(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi
  tz[9  ] = "Korea Standard Time"; //(UTC+09:00) Seoul
  tz[10 ] = "AUS Eastern Standard Time" //(UTC+10:00) Canberra, Melbourne, Sydney
  tz[11 ] = "Magadan Standard Time"; //(UTC+11:00) Magadan
  tz[12 ] = "New Zealand Standard Time" //(UTC+12:00) Auckland, Wellington
  tz[13 ] = "Samoa Standard Time"; //(UTC+13:00) Samoa
    
  return tz[hoursOffset] || tz[-5]; // If no exact match, default to Eastern Standard Time
}

function sendBugzScout(data, error) {
    let extra = `
    Customer Full Name: ${data.full_name}
    Customer Phone: ${data.phone}
    Customer Email: ${data.email}
    Customer Time Zone: ${data.timezone}
  
    Error: ${error}
  `
  rq({
    url: process.env.BUGZSCOUT_ENDPOINT,
    method: "POST",
    form: {
      ScoutUserName: "BugzScout",
      ScoutProject: "Fog Creek Web Sites",
      ScoutArea: "manuscript.com",
      Description: `Error creating trial for ${data.subdomain}.manuscript.com`,
      Extra: extra,
      Email: `"${data.full_name}" <${data.email}>`
      } 
  }, (err, res, body) => {
    winston.info("Trial signup failed. Scout sent.")
    if(err) {
      winston.error(`Trial signup failed.  Bugscout also failed.  Have sales reach out to ${data.full_name} at ${data.email}.`);
    }
  })
}