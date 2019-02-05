module.exports = {
  // mapping: {
  //   "MarkdownRemark.frontmatter.author": `AuthorYaml`,
  // },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `docs`,
        path: `${__dirname}/../gatsby/docs/`,
      },
    },
    `gatsby-transformer-remark`
  ],
  
}
