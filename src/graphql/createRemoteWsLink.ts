import { SubscriptionClient } from 'subscriptions-transport-ws/dist/client'
import * as ws from 'ws'

export default (uri: string): SubscriptionClient => {
    return new SubscriptionClient(uri,{
        reconnect: true
    }, ws)
}