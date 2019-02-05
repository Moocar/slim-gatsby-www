import React from "react"
import { graphql } from "gatsby"
import EditIcon from "react-icons/lib/md/create"

export default class MarkdownPageFooter extends React.Component {
  constructor() {
    super()
    this.state = { feedbackSubmitted: false }
  }
  render() {
    return (
      <p>Footer</p>
    )
  }
}

export const fragment = graphql`
  fragment MarkdownPageFooter on MarkdownRemark {
    parent {
      ... on File {
        relativePath
      }
    }
  }
`
