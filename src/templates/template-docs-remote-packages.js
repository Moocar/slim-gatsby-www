import React from "react"
import { graphql } from "gatsby"

class DocsRemotePackagesTemplate extends React.Component {
  render() {
    return (
      <p>remotePackage</p>
    )
  }
}

export default DocsRemotePackagesTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      ...MarkdownPageFooter
    }
    npmPackage(slug: { eq: $slug }) {
      name
      description
      keywords
      lastPublisher {
        name
        avatar
      }
      repository {
        url
      }
      readme {
        childMarkdownRemark {
          html
          timeToRead
        }
      }
    }
  }
`
