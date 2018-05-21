import { SubscriptionClient } from 'subscriptions-transport-ws/dist/client'
import { WebSocketLink } from 'apollo-link-ws'
import { ApolloLink } from 'apollo-link'

import * as ws from 'ws'

import wsAuth from './wsAuth'

export default (uri: string, connectionCallback): ApolloLink => {
    let client = new SubscriptionClient(uri,{
        reconnect: true,
        connectionCallback
    }, ws)

    let link = new WebSocketLink(client)

    return ApolloLink.from([
        wsAuth,
        link
    ])
}