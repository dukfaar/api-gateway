import { GraphQLSchema } from 'graphql'
import { BehaviorSubject } from 'rxjs'

const remoteSchemaSubject: BehaviorSubject<GraphQLSchema[]> = new BehaviorSubject([null, null, null])

export default remoteSchemaSubject