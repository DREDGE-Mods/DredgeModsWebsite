# Dredge Mods Website
A website for DREDGE mods.

The site contains a list of all mods generated off of the [DREDGE mod database](https://github.com/xen-42/DredgeModDatabase). A page is created for each mod with some general info (author, download count, description), and the body of the page will display the readme from that mod's GitHub repo.

The site is also meant to direct users to the [DREDGE mod manager](https://github.com/xen-42/DredgeModManager), which is used to install and manage mods from the database.

## Development

To build and deploy locally, run:

`npm install`

`npm run dev`

To build mod pages locally first cd into the scripts folder then run:

`npm install`

`npm run test`

Don't do it too often to not get rate limited by Github.
