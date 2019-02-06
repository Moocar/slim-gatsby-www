# Slim www

A site that contains very similar data to [gatsby www](https://github.com/gatsbyjs/gatsby/tree/master/www) site but doesn't do all the network requests during source and transform nodes. This allows us to test performance changes with more confidence.

# Using it

Ensure this is checkout out at the same level as gatsby itself so we can find all the `docs/blogs` etc. Alternatively, you can update `gatsby-config.js` to point to other locations

```
gatsby $ ls
gatsby/     slim-www/
```

The usual install

```bash
yarn install
```

First, we need to download a dataset from npm packages so that we don't have to download it each time. In `slim-www`, Run:

```bash
node src/utils/download-npm.js
```

Now run the build as normal

```bash
gatsby build
```
