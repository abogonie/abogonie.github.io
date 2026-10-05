Aleksander Bogoniewski research site
====================================

This folder is a complete static website. It has no build step.

  index.html   the whole site (styles and scripts are inside)
  img/         your micrographs and the original mouse vs human figures

Keep index.html and the img folder together. The page loads its images
from img/ and its fonts from Google Fonts, so it needs an internet
connection to look exactly as designed.

To preview it on your computer, double-click index.html.


Option A: Netlify Drop (fastest, no account setup beyond sign-in)
-----------------------------------------------------------------
1. Unzip this package so you have the "website" folder.
2. Go to app.netlify.com/drop and sign in.
3. Drag the whole "website" folder onto the page.
4. Netlify gives you a public link right away. You can rename the
   site in its settings.


Option B: GitHub Pages (free, good for a long-lived site)
---------------------------------------------------------
1. Create a free account at github.com and make a new public
   repository, for example "my-research-site".
2. Click "Add file" > "Upload files" and drag in index.html and the
   img folder, then commit.
3. In the repository, open Settings > Pages. Under "Build and
   deployment" choose "Deploy from a branch", pick the main branch and
   the / (root) folder, and save.
4. After a minute or two the site is live at
   https://YOUR-USERNAME.github.io/my-research-site/


Using your own domain (optional)
--------------------------------
Both hosts let you attach a custom domain such as yourname.com in
their site settings. You buy the domain from a registrar, then follow
the host's "custom domain" instructions to point it at the site.


Editing the site later
----------------------
Open index.html in a text editor to change wording, or ask Claude to
update the page and send you a fresh copy of this folder.
Things worth updating: the contact email, the Google Scholar link, and
the approximate mouse vs human values if you get the exact table.
