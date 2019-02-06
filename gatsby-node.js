const fs = require(`fs-extra`)
const path = require(`path`)
const JSONStream = require(`JSONStream`)
const crypto = require(`crypto`)
const slash = require(`slash`)
const parseFilepath = require(`parse-filepath`)
const moment = require(`moment`)
const _ = require(`lodash`)
const url = require(`url`)

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`)

function createNode(context, hit) {
  const { createNodeId, actions } = context
  const { createNode } = actions
  const parentId = createNodeId(`plugin ${hit.objectID}`)
  const readmeNode = {
    id: createNodeId(`readme ${hit.objectID}`),
    parent: parentId,
    slug: `/packages/en/${hit.objectID}`,
    children: [],
    internal: {
      type: `NPMPackageReadme`,
      mediaType: `text/markdown`,
      content: hit.readme !== undefined ? hit.readme : ``,
    },
  }
  readmeNode.internal.contentDigest = createContentDigest(readmeNode)
  // Remove unneeded data
  delete hit.readme
  delete hit.versions

  const node = {
    ...hit,
    deprecated: `${hit.deprecated}`,
    created: new Date(hit.created),
    modified: new Date(hit.modified),
    id: parentId,
    parent: null,
    children: [],
    slug: `/packages/${hit.objectID}/`,
    readme___NODE: readmeNode.id,
    title: `${hit.objectID}`,
    internal: {
      type: `NPMPackage`,
      content: hit.readme !== undefined ? hit.readme : ``,
    },
  }
  node.internal.contentDigest = createContentDigest(node)
  createNode(readmeNode)
  createNode(node)
}

function loadNpmSearchResults(context) {
  const stream = fs.createReadStream(path.resolve(`data/npm-search-results.json`))
  const jsonStream = JSONStream.parse(`*`)
  stream.pipe(jsonStream)
  jsonStream.on(`data`, hit => createNode(context, hit))
  return new Promise((resolve, reject) => {
    jsonStream.on(`end`, resolve)
  })
}

exports.sourceNodes = async (context) => {
  await loadNpmSearchResults(context)
}

// convert a string like `/some/long/path/name-of-docs/` to `name-of-docs`
const slugToAnchor = slug =>
      slug
      .split(`/`) // split on dir separators
      .filter(item => item !== ``) // remove empty values
      .pop() // take last item

exports.onCreateNode = context => {
  const { node, actions, getNode } = context
  const { createNodeField } = actions
  let slug
  if (node.internal.type === `File`) {
    const parsedFilePath = parseFilepath(node.relativePath)
    if (node.sourceInstanceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }
    }
    if (slug) {
      createNodeField({ node, name: `slug`, value: slug })
    }
  } else if (
    node.internal.type === `MarkdownRemark` &&
    getNode(node.parent).internal.type === `File`
  ) {
    const fileNode = getNode(node.parent)
    const parsedFilePath = parseFilepath(fileNode.relativePath)
    if (fileNode.sourceInstanceName === `docs`) {
      if (parsedFilePath.name !== `index` && parsedFilePath.dir !== ``) {
        slug = `/${parsedFilePath.dir}/${parsedFilePath.name}/`
      } else if (parsedFilePath.dir === ``) {
        slug = `/${parsedFilePath.name}/`
      } else {
        slug = `/${parsedFilePath.dir}/`
      }

      // Set released status and `published at` for blog posts.
      if (_.includes(parsedFilePath.dir, `blog`)) {
        let released = false
        const date = _.get(node, `frontmatter.date`)
        if (date) {
          released = moment().isSameOrAfter(moment.utc(date))
        }
        createNodeField({ node, name: `released`, value: released })

        const canonicalLink = _.get(node, `frontmatter.canonicalLink`)
        const publishedAt = _.get(node, `frontmatter.publishedAt`)

        createNodeField({
          node,
          name: `publishedAt`,
          value: canonicalLink
            ? publishedAt || url.parse(canonicalLink).hostname
            : null,
        })
      }
    }
    // Add slugs for package READMEs.
    if (
      fileNode.sourceInstanceName === `packages` &&
      parsedFilePath.name === `README`
    ) {
      slug = `/packages/${parsedFilePath.dir}/`
      createNodeField({
        node,
        name: `title`,
        value: parsedFilePath.dir,
      })
      createNodeField({ node, name: `package`, value: true })
    }
    if (slug) {
      createNodeField({ node, name: `anchor`, value: slugToAnchor(slug) })
      createNodeField({ node, name: `slug`, value: slug })
    }
  }
}

const remotePackageTemplate = path.resolve(
  `src/templates/template-docs-remote-packages.js`
)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const result = await graphql(`
    query {
      allNpmPackage {
        edges {
          node {
            id
            title
            slug
          }
        }
      }
    }
  `)
  if (result.errors) {
    throw new Error(result.errors)
  }

  const allPackages = result.data.allNpmPackage.edges
  // Create package readme
  allPackages.forEach(edge => {
    createPage({
      path: edge.node.slug,
      component: slash(remotePackageTemplate),
      context: {
        slug: edge.node.slug,
        id: edge.node.id,
        layout: `plugins`,
      },
    })
  })
  

}
