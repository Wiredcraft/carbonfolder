# YFMM-Editor

The [YAML Front Matter](https://github.com/mojombo/jekyll/wiki/yaml-front-matter) Markdown file editor allows users to conveniently create and edit markdown files with a YAML Front Matter, such as seen in Jekyll.

![Doodle](https://f.cloud.github.com/assets/306868/333283/014f8f6a-9c4e-11e2-8601-8c475a4eca01.png)

The basic idea is to:

1. Split YAML Front Matter Markdown files in two, with one part being the YAML header and the other one being the markdown body of the file, with an independent editing experience for each part:
    1. YAML headers are edited as key/value pairs, through a simple form,
    1. A WYSIWYG editor, such as [HalloJS](http://hallojs.org/), to edit the markdown body,
1. Moreover we specify the expected format of the YAML header in a [JSON Schema](http://json-schema.org/) compliant file (which effectively describe what can be referred as a content type).
