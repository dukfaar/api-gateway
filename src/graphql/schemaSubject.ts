import { GraphQLSchema } from 'graphql'
import { BehaviorSubject } from 'rxjs'

const schemaSubject: BehaviorSubject<GraphQLSchema> = new BehaviorSubject(null)

export default schemaSubject