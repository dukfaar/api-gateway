import { ApolloLink, Operation } from 'apollo-link'

export default new ApolloLink((operation: Operation & {Authorization: string|undefined}, forward):any => {
    let context = operation.getContext()
    let auth = context && context.graphqlContext && context.graphqlContext.Authorization

    operation.Authorization = auth 

    return forward(operation)
})
