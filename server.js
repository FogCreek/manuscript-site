// server.js
// where your node app starts

// init project
const express      = require('express');
const sass         = require('node-sass');
const autoprefixer = require('autoprefixer');
const postcss      = require('postcss');
const fs           = require('fs');
const nunjucks     = require('nunjucks');
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');

var fb = require('./fogbugz.js')(process.env.FB_SITE_NAME, process.env.TOKEN);

const app = express();
app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.enable('trust proxy');

nunjucks.configure('views', {
  autoescape: true,
  express: app,
  watch: true
});

let winston = require('winston');
require('winston-loggly-bulk');
winston.add(winston.transports.Loggly, {
  token: process.env.LOGGLY_TOKEN,
  subdomain: process.env.LOGGLY_ACCOUNT,
  tags: ["Winston-NodeJS", process.env.PROJECT_DOMAIN],
  json:true
}); 


const renderSass = () => {
  const styles = sass.renderSync({
    file: __dirname + '/styles/index.scss',
    outputStyle: 'compressed',
    outFile: __dirname + '/public/styles.css',
  });

  postcss([autoprefixer])
    .process(styles.css)
    .then(result => {
      fs.writeFile(__dirname + '/public/styles.css', result.css, (err) => {
        if (err) throw err;
      });
    });  
}

app.get("/", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'homepage',
    title: 'Manuscript - Project Management for Software Teams',
    description: 'Go beyond done and craft great software with Project Management for Software Teams',
  };
  response.render(__dirname + '/views/index.html', vars);
});

app.get("/try", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'try',
    title: 'Manuscript - Try for Free',
    description: 'Trial Manuscript: Get Started with 14 Days Free',
  };
  response.render(__dirname + '/views/signup.html', vars);
});

app.post("/try", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'try',
    title: 'Manuscript - Try for Free',
    description: 'Trial Manuscript: Get Started with 14 Days Free',
    email: request.body.email,
  };
  response.render(__dirname + '/views/signup.html', vars);
});

app.get("/signup/name-check", require("./shop-proxy").siteNameHandler);
app.post("/signup", require("./shop-proxy").signupHandler);

/*app.get("/contact", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'contact',
    title: 'Manuscript - Contact',
    description: 'Contact Us: Get in touch with your questions',
  };
  response.render(__dirname + '/views/contact.html', vars);
});*/

app.get("/enterprise", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'enterprise',
    title: 'Manuscript - Enterprise',
    description: 'Enterprise: Manuscript, your way. Value-added services & enhanced support.',
  };
  response.render(__dirname + '/views/enterprise.html', vars);
});

app.get("/enterprise/professional-services", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'etnerprise/professional-services',
    title: 'Manuscript - Professional Services',
    description: 'Professional Services: Maximize your value from our tools',
  };
  response.render(__dirname + '/views/professional-services.html', vars);
});

app.get("/how-it-works", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'how-it-works',
    title: 'Manuscript - How it works',
    description: 'Manuscript - How Manuscript project management works for software teams',
  };
  response.render(__dirname + '/views/how-it-works.html', vars);
});

app.get("/fys-mop", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'fys-mop',
    title: 'Manuscript - From FYS to On Premises',
    description: 'Manuscript - From FYS to On Premises, here\'s what you\'ve been missing out on',
  };
  response.render(__dirname + '/views/fysmop.html', vars);
});

app.get("/pricing", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'pricing',
    title: 'Manuscript - Pricing',
    description: 'Manuscript Pricing',
  };
  response.render(__dirname + '/views/pricing.html', vars);
});

app.post("/add", function(request, response) {
  var today = new Date();
  var tomorrowsDate = today.getDate() + 1;
  var tomorrow = new Date(today.setDate(tomorrowsDate));
  var type;
  if (request.body.type === 'true') {
    type = "Manuscript On Premises."
  } else {
    type = "Manuscript for 250+ users."
  }

  console.log(request.body);
  fb.new({
    sTitle: "I'm interested in Manuscript!", 
    ixProject: 24,
    ixArea: 99,
    ixPersonAssignedTo: 45, 
    sCustomerEmail: request.body.email,
    sEvent: request.body.email + " is interested in learning more about " + type,
    dtDue: tomorrow
  });  
  response.sendStatus(200)
});

app.get("/integrations", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'integrations',
    title: 'Manuscript - Integrations',
    description: 'Manuscript integrations',
  };
  response.render(__dirname + '/views/integrations.html', vars);
});

app.get("/eula", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'eula',
    title: 'Manuscript - EULA',
    description: 'Manuscript End User License Agreement',
  };
  response.render(__dirname + '/views/eula.html', vars);
});

app.get("/privacy", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'privacy',
    title: 'Manuscript - Privacy Poicy',
    description: 'Manuscript Priacy policy',
  };
  response.render(__dirname + '/views/privacy.html', vars);
});

app.get("/features/task-management", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/task-management',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Task Management',
    description: 'Task Management: Assign, prioritize and manage tasks from idea to done.',
  };
  response.render(__dirname + '/views/features/task-management.html', vars);
});

app.get("/features/time-tracking", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/time-tracking',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Time Tracking',
    description: 'Time Tracking: Deliver projects on time with data, not guesses.',
  };
  response.render(__dirname + '/views/features/time-tracking.html', vars);
});

app.get("/features/support-helpdesk", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/support-helpdesk',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Support Helpdesk',
    description: 'Email Support: Customer feedback and issues together, in one place.',
  };
  response.render(__dirname + '/views/features/support-helpdesk.html', vars);
});

app.get("/features/smart-scheduling", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/smart-scheduling',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Smart Scheduling',
    description: 'Smart Scheduling: Know when you\'ll really complete that project.',
  };
  response.render(__dirname + '/views/features/smart-scheduling.html', vars);
});

app.get("/features/integrated-wiki", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/integrated-wiki',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Document Collaboration',
    description: 'Document Collaboration: Collaborate, share knowledge and gather feedback.',
  };
  response.render(__dirname + '/views/features/integrated-wiki.html', vars);
});

app.get("/features/scrum-boards", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/scrum-boards',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Scrum Boards',
    description: 'Scrum Boards: Agile Sprint and Iteration planning and management.',
  };
  response.render(__dirname + '/views/features/scrum-boards.html', vars);
});

app.get("/features/kanban-boards", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/kanban-boards',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Kanban Boards',
    description: 'Kanban Boards: Keep your Agile work flowing.',
  };
  response.render(__dirname + '/views/features/kanban-boards.html', vars);
});

app.get("/features/crash-reporting", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/crash-reporting',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Crash Reporting',
    description: 'Crash Reporting: Resolve issues before customers even notice them.',
  };
  response.render(__dirname + '/views/features/crash-reporting.html', vars);
});

app.get("/features/version-control", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/version-control',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Version Control',
    description: 'Code Management: Version Control and Source Code Hosting for Git and Mercurial.',
  };
  response.render(__dirname + '/views/features/version-control.html', vars);
});

app.get("/features/code-reviews", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/code-reviews',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Code Reviews',
    description: 'Code Reviews: Flexible peer code reviews to discuss changes and share knowledge.',
  };
  response.render(__dirname + '/views/features/code-reviews.html', vars);
});

app.get("/features/security", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/security',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Security',
    description: 'Security Features: To reassure, and protect your data.',
  };
  response.render(__dirname + '/views/features/security.html', vars);
});

app.get("/features/infrastructure", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/infrastructure',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Secure Infrastructure',
    description: 'Security Infrastructure',
  };
  response.render(__dirname + '/views/features/infrastructure.html', vars);
});

app.get("/features/git", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/git',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Git',
    description: 'Git Version Control',
  };
  response.render(__dirname + '/views/features/git.html', vars);
});

app.get("/features/mercurial", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/mercurial',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - Mercurial',
    description: 'Mercurial Version Control',
  };
  response.render(__dirname + '/views/features/mercurial.html', vars);
});

app.get("/features/jira-alternative", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/jira-alternative',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - JIRA Alternative',
    description: 'Manuscript: A simple to use, easily configured alternative to JIRA',
  };
  response.render(__dirname + '/views/jira-alternative.html', vars);
});

app.get("/features/github-issues-alternative", (request, response) => {
  renderSass();
  const vars = {
    pageSlug: 'features/github-issues-alternative',
    pageType: 'feature',
    colorway: 'blue',
    title: 'Manuscript - GitHub Issues Alternative',
    description: 'Manuscript: A GitHub Issues alternative for your whole team, not just developers.',
  };
  response.render(__dirname + '/views/github-issues-alternative.html', vars);
});

app.get("/sitemap", (request, response) => {
  response.set('Content-Type', 'application/xml');
  response.render(__dirname + '/views/sitemap.xml');
});

app.get("/login", (request, response) => {
  // Login has dynamic content from site history, so disable caching.
  response.setHeader('Cache-Control', 'no-cache');
  
  renderSass();
  let siteHistory = request.cookies.manuscriptSiteHistory || [];
  console.log(siteHistory);
  const vars = {
    pageSlug: 'Login',
    title: 'Manuscript - Log in to your Manuscript site',
    description: 'Select your Manuscript site name and log in.',
    history: siteHistory,
  };
  response.render(__dirname + '/views/login.html', vars);
});

app.use(function (req, res, next) {
  renderSass();
  const vars = {
    pageSlug: '404',
    pageType: 'error',
    title: 'Manuscript - Page Not Found'
  };
  res.status(404).render(__dirname + '/views/404.html', vars);
})

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
