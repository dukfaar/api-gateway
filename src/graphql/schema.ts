import { makeExecutableSchema, mergeSchemas } from 'graphql-tools'

import { ApolloLink } from 'apollo-link'

import fetch from 'node-fetch'

import * as _ from 'lodash'

import { GraphQLSchema } from 'graphql'

import createRemoteLink from './createRemoteLink'
import createRemoteSchema from './createRemoteSchema'

import getAuthBackendLink from './authBackendLink'

export const getSchema = async () => {
  const itemNamespaceLink = `
    extend type Item { namespace: Namespace }
    extend type Namespace { items: [Item] }
  `

  let itemBackendLink = createRemoteLink(process.env.ITEM_BACKEND_URL || "http://localhost:3000")
  let namespaceBackendLink = createRemoteLink(process.env.NAMESPACE_BACKEND_URL || "http://localhost:3001")
 
  let urlString = _.trim(process.env.GRAPHQL_URLS)
  let remoteGraphQLUris = (urlString.length > 0) ? _.split(urlString, ',') : []

  let remoteGraphQLLinks = remoteGraphQLUris.map(createRemoteLink)

  return Promise.all(
    [itemBackendLink, namespaceBackendLink, getAuthBackendLink(), ...remoteGraphQLLinks].map(createRemoteSchema)
  ).then(remoteSchemas => {   
    let schemas:(GraphQLSchema|string)[] = [..._.filter(remoteSchemas, schema => schema)]

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