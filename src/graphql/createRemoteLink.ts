import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http'

import fetch from 'node-fetch'

export default (uri: string): ApolloLink => {
  return ApolloLink.from([
    setContext((request, previousContext) => {
      const graphqlContext = previousContext && previousContext.graphqlContext
      const cookies = graphqlContext && graphqlContext.cookies
      const headers = graphqlContext && graphqlContext.headers
      let authCookie = cookies && cookies.Authorization
      let authHeader = headers && headers.Authorization
      let authValue = authHeader || authCookie

      return authValue ? { headers: { Authorization: authHeader || authCookie }} : {}
    }),
    new HttpLink({uri, fetch})
  ])
}