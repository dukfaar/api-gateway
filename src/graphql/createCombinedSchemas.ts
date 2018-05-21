import { GraphQLSchema } from 'graphql'
import { mergeSchemas }  from 'graphql-tools'
import * as _ from 'lodash'

import schemaSubject from './schemaSubject'
import { itemNamespaceLink, itemNamespaceResolvers } from './backendResolvers/item2namespace'

export default function createCombinedSchema(remoteSchemas: GraphQLSchema[]) { 
    let schemas: Array<GraphQLSchema|string> = _.reject(remoteSchemas, _.isNil)
   
    let resolversDefinition = { }
  
    const [itemBackendSchema, namespaceBackendSchema, authBackendSchema] = remoteSchemas
    
    if(itemBackendSchema && namespaceBackendSchema) {
      schemas.push(itemNamespaceLink)
    }
  
    schemaSubject.next(mergeSchemas({
      schemas: schemas,
      resolvers: mergeInfo => {
        let resolvers:any = {}
  
        if(itemBackendSchema && namespaceBackendSchema) {
          _.assign(resolvers, itemNamespaceResolvers(mergeInfo))
        }
  
        return resolvers
      }
    }))
  }