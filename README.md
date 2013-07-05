# Focused.io

Focused.io app is a standalone web app who permits you to manage content.

## Launching the schmilblick 

### Launching the client

```
$ cd client
$ npm install
$ grunt
```

Then connect to `http://localhost:9001`

### Launching the server (for pushing on Github)

```
$ cd gatekeeper
$ npm install
$ node server.js
```

You can now push content to Github.

## How focused.io works ?

Once you are on `http://localhost:9001` you have to :

### Authorize DCMS app to access to Dropbox

- Click on the button `Dropbox login`. It will redirects you to Dropbox, authorize folder creation (it will create the folder `DCMS` in a new folder called `Apps`)
- Then you will be redirected back to the app. You can now create stuff !

### Creating a project

- On the main page click on the blue `+`
- Fill the popup by the name of your new project

In the background DCMS has created a new folder tree in `Apps/DCMS/my_proj_name/` !

### Creating a new content type

- Click on `Types` in the left menu
- Click on `+` icon on the top. A form will appear at the right side of the screen
- Fill the form, add fields 
- `Submit type`

Success, you created a new content type ! 

In the background, DCMS has created a new folder file in `Apps/DCMS/my_proj_name/settings/content_type_name.json` who describes the structure of your new content.

### Creating a new content

Now that you have a new content type, you can now create contents ! Cheers !

- Click on Posts left menu
- Click on the `+` in the top
- Select the type of the content you want to create
- Fill the form 
- Submit !

You created a new content ! The file will appear in your Dropbox in 
```
Apps/DCMS/my_proj_name/contents/content_type_name/filename.yaml
```

![fromage](http://www.cantobre-france.eu/wp-content/uploads/2012/02/Roquefort_Caves.jpg)

### Pushing the Tree from the Dropbox forest to Github

**Don't forget to launch the server (cf Launching the schmilblick)**
**Still in beta and the code is not clean**

- Go to `Pusher`
- Click on Github, authorize DCMS
- The listing of your repos will appear
- Click on the repo you want 
- Wait
- Select the right branch on which to push
- Click on the push button
- Wait
- Pushed !
- Wouho

# Remember, remember, the Fifth of November

The [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/yaml-front-matter) Markdown file editor allows users to conveniently create and edit markdown files with a YAML Front Matter, such as seen in Jekyll.

![Doodle](https://f.cloud.github.com/assets/306868/333283/014f8f6a-9c4e-11e2-8601-8c475a4eca01.png)

The basic idea is to:

1. Split YAML Front Matter Markdown files in two, with one part being the YAML header and the other one being the markdown body of the file, with an independent editing experience for each part:
    1. YAML headers are edited as key/value pairs, through a simple form,
    1. A WYSIWYG editor, such as [HalloJS](http://hallojs.org/), to edit the markdown body,
1. Moreover we specify the expected format of the YAML header in a [JSON Schema](http://json-schema.org/) compliant file (which effectively describe what can be referred as a content type).
