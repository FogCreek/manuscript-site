Before you change anything:
==========================
__Is this *development* (`manuscript-site`) or *production* (`manuscript`)?__

*Development* site: The first thing you should do is import the production site so that you have the most up-to-date version (sometimes hotfixes happen directly in prod). You should also alert in #websitedev that you're making changes, so folks know not to make hotfix changes while you're busy.

*Production* site: The first thing you should do is make sure that if you make live updates here, it won't cause issues. There may be larger changes going on in the development site, and we don't have a great way to merge the two.

### Ok, how do I do that?
*Development* site: The copying process to dev works by exporting `manuscript` to a GitHub repo, then importing that repo into `manuscript-site`. 

*Production* site: Check #websitedev for any notifications of people changing things. Most likely, nothing is in the works, but its better to check! If you're extra-concerned, you can double-check with Allyson or Gareth.

### And when I'm done?
*Development* site: Do the reverse! Export `manuscript-site` to GitHub, then import that repo to `manuscript`. Also alert in #websitedev that you're done, so we have a paper trail.

*Production* site: If you made changes that need to show up immediately, you'll want Io to kick the Cloudfront distribution for whatever page(s) you worked on. Send them a case. If you're ok with waiting, Cloudfront will recycle this on its own in 24-48 hours.




Welcome to the Manuscript Homepage!
=========================

Here’s a little information about how this website is set up.

# Overview
Okay, you are gonna be shocked to hear this is using a Node.js server running Express. I know, I know. Here’s the other stuff.

# Styles

### Organization/Basics
* Everything written in Sass
* We use [normalize.css](https://necolas.github.io/normalize.css/).
* _Almost_ all variables are store in `_vars-and-mixins.scss`.
* I use the [BEM class system](https://css-tricks.com/bem-101/), with the occasional modifier (e.g., `.has-error`).
* I have been writing a lot of React components in my other life, so the components are all PascalCase. This is obvious, but I’m writing this in case someone was offended and wondered why.

### Server Rendering

* Sass files are passed through `node-sass` and then `postcss/autoprefixer` in `server.js`.
* Sass files are being rendered with each page load. I _strongly_ recommend you modify this to be a manual render. Another option is to try [`node-sass-middleware`](https://github.com/sass/node-sass-middleware). It renders on file change, which would be better! I went down a small rabbithole trying to get it to play nicely with `postcss`, but had to move on to more pressing matters.

### Quirks

* I learned that you have to specify a height and width on SVGs in `img` tags for IE10 to display them.
* Browsers don’t particularly like rendering slanted lines, so it’s possible you may notice some unseemly gaps. I believe I caught them all, but FYI.
* Due to the slanty nature of the site, there is a lot of relative positioning on this site. I tried to get a reasonable system to make things modular, but I’m confident you’ll find a snag sooner or later.
* So almost every slanted shape is a div that has been `transform: skew`ed. In some cases, I used rotated rectangles (when the text was also slanted) or [CSS triangles](https://css-tricks.com/examples/ShapesOfCSS/).
* Finally, the font rendering of really light weights of Benton Sans on retina devices in Safari is not great. We may want to move up a weight at some point.

# Templates

* React.js seemed like overkill, so I went with something else familiar, the Jinja-like [Nunjucks](https://mozilla.github.io/nunjucks/). If you’ve spent any time in Django or Flask, you should feel pretty comfortable.
* When rendering the templates, I pass in a consistent set of variables that include the page title, description, and a slug you can use for targeting via CSS. There’s no reason why you can’t add additional ones as you start to fill in meta tags or further templatize the site.
* There are a handful of macros (for SVG icons and forms) and components, but mostly things are extending [`base.html`](https://glitch.com/edit/#!/dapper-beach?path=views/base.html).
* I used a relatively tiny amount of client-side Javascript to handle the navigation stickiness. It’s not heavily commented, but it’s pretty straightforward.
* Relatedly, I am not uglifying the JS, given its small size and my presumption that Glitch is gonna be all over this eventually.



-------------------

\ ゜o゜)ノ
