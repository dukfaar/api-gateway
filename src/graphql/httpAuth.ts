import { ApolloLink } from 'apollo-link'

const httpAuth = new ApolloLink((operation, forward) => {
    operation.setContext(oldContext => {
        return {
            ...oldContext,
            Authorization: oldContext && oldContext.graphqlContext && oldContext.graphqlContext.Authorization ,
        }
    })

    return forward(operation)
})