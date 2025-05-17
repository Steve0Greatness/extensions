# Contribution guide

To conribute your extension to this gallery, you first need an extension.

## Adding your extension

In this gallery, you should place your extension files all under a directory you
created specifically for your extension under the `extensions` directory. The
name of this directory should be similar to the name of your extension, and
should be in kabab case (kabab-case).

When placing your extension file into that directory, please name it the current
version of your project. This could mean the major version, 1.1 for any 1.1.X
version, or the minor version, 1.1.1 for 1.1.1.

### Licensing

All extensions are expected to use a free-software license. If you're unsure,
you may want to use one of the following:

* MIT
* GPL-v2-or-later
* Apache-2.0

Any other licenses should list under their SPDX short identifier.

### Metadata

Next, you want to add your metadata to `extensions.json5`.

```json5
{
    path: String,
    // Should be the same as your extension's directory's name.
    // Do not include the /extensions/ at the start.
    title: String,
    description: String,
    
    image: String,
    // This should be relative to your extension's directory
    versions: {
        // Version names. These are the names of your
        // JavaScript files, without the .js at the end.
        current: String,
        past: String[]
    },
    
    contributors: [
        {
            name: String,
            website: String,
            notes: Optional<String>
        },
    ],
    
    license: {
        extension: String,
        image: String
    },
    incompatible: [
        {
            type: String,
            value: String,
            broken: bool,
            // If excluded, defaults to false.
            reason: String
        },
    ],

    examples: Optional<[
        {
            name: String,
            description: String,
            path: String
            // path relative to extension's directory
        }
    ]>,

    /* External, optional links */
    documentation: Optional<String>,
    website: Optional<String>,
    source: Optional<String>,
},
```
