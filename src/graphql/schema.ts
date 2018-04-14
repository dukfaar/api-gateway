import { makeExecutableSchema, 
  makeRemoteExecutableSchema, mergeSchemas, introspectSchema 
} from 'graphql-tools'

import { HttpLink } from 'apollo-link-http'
import fetch from 'node-fetch'

import * as _ from 'lodash'

import { GraphQLSchema } from 'graphql'

const createRemoteSchema = async (uri: string): Promise<GraphQLSchema> => {
  const link = new HttpLink({uri, fetch})
  const schema = await introspectSchema(link)

  return makeRemoteExecutableSchema({schema, link})
}

export const getSchema = async () => {
  const linkSchemaDefs = `
    extend type Item { namespace: Namespace }
    extend type Namespace { items: [Item] }
  `

  const remoteUris = ['http://localhost:3000', 'http://localhost:3001']

  return Promise.all(
    remoteUris.map(createRemoteSchema)
  ).then(remoteSchemas => {
    const schemas:(GraphQLSchema|string)[] = [...remoteSchemas]
    schemas.push(linkSchemaDefs)

    return mergeSchemas({
      schemas: schemas,
      resolvers: mergeInfo => ({
        Item: {
          namespace: {
            fragment: 'fragment ItemFragment on Item { namespaceId }',
            resolve: (parent, params, context, info) => {
              return mergeInfo.delegate('query', 'namespace', {id: parent.namespaceId}, context, info)
            }
          }
        }
      })
    })
  })
  .catch(error => {
    console.error('Got an error while building the schema: ' + error)
  })
}