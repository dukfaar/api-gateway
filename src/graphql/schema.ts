import { makeExecutableSchema, 
  makeRemoteExecutableSchema, mergeSchemas, introspectSchema 
} from 'graphql-tools'

import { HttpLink } from 'apollo-link-http'
import fetch from 'node-fetch'

import * as _ from 'lodash'

import { GraphQLSchema } from 'graphql'

const createRemoteSchema = async (uri: string): Promise<GraphQLSchema> => {
  const link = new HttpLink({uri, fetch})
  try {
    const schema = await introspectSchema(link)

    return makeRemoteExecutableSchema({schema, link})
  } catch(exception) {
    console.log('fetching schema from ' + uri + 'failed')
    return null
  }
}

export const getSchema = async () => {
  const itemNamespaceLink = `
    extend type Item { namespace: Namespace }
    extend type Namespace { items: [Item] }
  `

  let remoteUris = [
    process.env.ITEM_BACKEND_URL || "http://localhost:3000", 
    process.env.NAMESPACE_BACKEND_URL || "http://localhost:3001"
  ]

  if(_.trim(process.env.GRAPHQL_URLS).length > 0) {
    const unnamedServices = _.split(_.trim(process.env.GRAPHQL_URLS) || "", ',')

    remoteUris = _.concat(remoteUris, unnamedServices)
  }

  return Promise.all(
    remoteUris.map(createRemoteSchema)
  ).then(remoteSchemas => {   
    let schemas:(GraphQLSchema|string)[] = [..._.filter(remoteSchemas, schema => schema)]

    let resolversDefinition = { }

    const [itemBackendSchema, namespaceBackendSchema] = remoteSchemas
    
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