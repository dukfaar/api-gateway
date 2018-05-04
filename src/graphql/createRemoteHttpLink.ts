import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http'

import fetch from 'node-fetch'

export default (uri: string): HttpLink => {
  return new HttpLink({uri, fetch})
}