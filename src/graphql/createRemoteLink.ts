import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http'
import { getMainDefinition } from 'apollo-utilities'

import fetch from 'node-fetch'

export default (httpLink: HttpLink, wsLink): ApolloLink => {
    let link = httpLink
    
    if (wsLink) {
        ApolloLink.split(({ query }) => {
            console.log(query)
            let { kind, operation }: any = getMainDefinition(query)
            return kind === 'OperationDefinition' && operation === 'subscription'
        }, wsLink, httpLink)
    }

    return ApolloLink.from([
        setContext((request, previousContext) => {
            const graphqlContext = previousContext && previousContext.graphqlContext
            const cookies = graphqlContext && graphqlContext.cookies
            const headers = graphqlContext && graphqlContext.headers
            let authCookie = cookies && cookies.Authorization
            let authHeader = headers && headers.Authorization
            let authValue = authHeader || authCookie

            return authValue ? { headers: { Authorization: authHeader || authCookie } } : {}
        }),
        link
    ])
}