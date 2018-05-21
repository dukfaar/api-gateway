import { GraphQLSchema } from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'

import { ApolloLink } from 'apollo-link'

import fetch from 'node-fetch'

import * as _ from 'lodash'

import * as ws from 'ws'
import { BehaviorSubject } from 'rxjs'

import createRemoteHttpLink from './createRemoteHttpLink'
import createRemoteSchema from './createRemoteSchema'
import createRemoteWsLink from './createRemoteWsLink'

import { pubsub } from '../pubsub'

import remoteSchemaSubject from './remoteSchemaSubject'
import schemaSubject from './schemaSubject'

import createCombinedSchemas from './createCombinedSchemas'

remoteSchemaSubject.subscribe(createCombinedSchemas)

const itemBackendLink = createRemoteWsLink(
  process.env.ITEM_BACKEND_WS || "ws://localhost:3000/subscriptions",
  () => fetchRemoteSchema(itemBackendLink, 0)
)

const namespaceBackendLink = createRemoteWsLink(
  process.env.NAMESPACE_BACKEND_WS || "ws://localhost:3001/subscriptions",
  () => fetchRemoteSchema(namespaceBackendLink, 1)
)

const authBackendLink = createRemoteWsLink(
  process.env.AUTH_BACKEND_WS || "ws://localhost:3002/subscriptions",
  () => fetchRemoteSchema(authBackendLink, 2)
)

function fetchRemoteSchema(link: ApolloLink, index: number) {
  return createRemoteSchema(link)
  .then(newSchema => {
    let remoteSchemas = remoteSchemaSubject.getValue()
    let oldSchema = remoteSchemas[index]
    
    if(oldSchema != newSchema) {
      remoteSchemas[index] = newSchema
      remoteSchemaSubject.next(remoteSchemas)
    }  
  })
}

export {
  schemaSubject
}