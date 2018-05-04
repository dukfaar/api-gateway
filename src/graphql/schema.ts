import { makeExecutableSchema, mergeSchemas } from 'graphql-tools'

import { ApolloLink } from 'apollo-link'

import fetch from 'node-fetch'

import * as _ from 'lodash'

import { GraphQLSchema } from 'graphql'

import * as ws from 'ws'

import createRemoteLink from './createRemoteLink'
import createRemoteHttpLink from './createRemoteHttpLink'
import createRemoteSchema from './createRemoteSchema'

import getAuthBackendLink from './authBackendLink'

import { pubsub } from '../pubsub'

export const getSchema = async () => {
  const itemNamespaceLink = `
    extend type Item { namespace: Namespace }
    extend type Namespace { items: [Item] }
  `

  let itemBackendLink = createRemoteLink(createRemoteHttpLink(process.env.ITEM_BACKEND_URL || "http://localhost:3000"), null)
  let namespaceBackendLink = createRemoteLink(createRemoteHttpLink(process.env.NAMESPACE_BACKEND_URL || "http://localhost:3001"), null)
 
  let urlString = _.trim(process.env.GRAPHQL_URLS)
  let remoteGraphQLUris = (urlString.length > 0) ? _.split(urlString, ',') : []

  let remoteGraphQLLinks = remoteGraphQLUris.map(createRemoteHttpLink).map(httpLink => createRemoteLink(httpLink, null))

  return Promise.all(
    [
      itemBackendLink, 
      namespaceBackendLink, 
      getAuthBackendLink(),
      ...remoteGraphQLLinks,
    ].map(createRemoteSchema)
  ).then(remoteSchemas => {
    let schemas: Array<GraphQLSchema|string> = []
    
    _.forEach(remoteSchemas, schema => {
      if(schema) schemas.push(schema)
    })

    let resolversDefinition = { }

    const [itemBackendSchema, namespaceBackendSchema, authBackendSchema] = remoteSchemas
    
    if(itemBackendSchema && namespaceBackendSchema) {
      schemas.push(itemNamespaceLink)
    }

    return mergeSchemas({
      schemas: schemas,
      resolvers: mergeInfo => {
        let resolvers:any = {}

        if(itemBackendSchema && namespaceBackendSchema) {
          _.assign(resolvers, {
            Item: {
              namespace: {
                fragment: 'fragment ItemFragment on Item { namespaceId }',
                resolve: (parent, params, context, info) => {
                  return mergeInfo.delegate('query', 'namespace', {id: parent.namespaceId}, context, info)
                }
              }
            }
          })
        }

        return resolvers
      }
    })
  })
  .catch(error => {   
    console.error('Got an error while building the schema: ' + error)
  })
}