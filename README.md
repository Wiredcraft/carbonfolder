# Carbon Folder

A decentralized content management system.

## Install

### Install & run the client

```
$ cd client
$ npm install
$ grunt
```

Then go to `http://localhost:9001`.

### Install & run the server (required to push to GitHub pages)

```
$ cd server
$ npm install
$ node server.js
```

You can now push content to Github.

## Getting started

1. Go to `http://localhost:9001`,
2. Click on the `Dropbox login`.
3. Allow the app to create folders.
4. Done.

### Adding a project

1. On the main page click on the blue `+`
1. Fill the popup by the name of your new project

### Adding a new content type

1. Click on `Types` in the left menu
1. Click on `+` icon on the top. A form will appear at the right side of the screen
1. Fill the form, add fields 
1. `Submit type`

### Creating content

1. Click on Posts left menu
1. Click on the `+` in the top
1. Select the type of the content you want to create
1. Fill the form 
1. Submit !

### Pushing the content to GitHub pages

**You need the server launched for this to work (still very alpha).**

1. Go to `Pusher`
1. Click on Github, authorize DCMS
1. The listing of your repos will appear
1. Click on the repo you want 
1. Wait
1. Select the right branch on which to push
1. Click on the push button
1. Wait
1. Done.

## Remarks

All content is created and saved in a local folder (`Apps/DCMS/<PROJECT NAME>`):

- Content is saved as markdown with [YAML Front Matter](http://jekyllrb.com/docs/frontmatter/) (same as in [Jekyll](http://jekyllrb.com) in the `content` folder.
- Content types are saved as JSON schema files in the `settings` folder.
- Media assets are saved as is in the `media` folder.
