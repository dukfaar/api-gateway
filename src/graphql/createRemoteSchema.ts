import { ApolloLink } from 'apollo-link'
import { makeRemoteExecutableSchema, introspectSchema } from 'graphql-tools'
import { GraphQLSchema } from 'graphql'

export default async (link: ApolloLink): Promise<GraphQLSchema> => {
  try {
    const schema = await introspectSchema(link)

    return makeRemoteExecutableSchema({schema, link})
  } catch(exception) {
    return null
  }
}