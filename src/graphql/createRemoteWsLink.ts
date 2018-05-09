import { SubscriptionClient, Middleware } from 'subscriptions-transport-ws/dist/client'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloLink, Operation, concat } from 'apollo-link'

import * as ws from 'ws'

const wsAuth = new ApolloLink((operation: Operation & {Authorization: string|undefined}, forward):any => {
    let context = operation.getContext()
    let auth = context && context.graphqlContext && context.graphqlContext.Authorization

    operation.Authorization = auth 

    return forward(operation)
})

const httpAuth = new ApolloLink((operation, forward) => {
    operation.setContext(oldContext => {
        return {
            ...oldContext,
            Authorization: oldContext && oldContext.graphqlContext && oldContext.graphqlContext.Authorization ,
        }
    })

    return forward(operation)
})

export default (uri: string): ApolloLink => {
    let client = new SubscriptionClient(uri,{
        reconnect: true,
    }, ws)

    let link = new WebSocketLink(client)

    return ApolloLink.from([
        wsAuth,
        link
    ])
}