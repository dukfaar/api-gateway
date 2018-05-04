import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import { createServer } from 'http'

import { getSchema } from './graphql/schema'
import {graphqlExpress, graphiqlExpress} from 'graphql-server-express'
import { SubscriptionClient } from 'subscriptions-transport-ws/dist/client'

import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

export class App {
  private expressApp
  private expressServer
  private port = process.env.PORT || 3000
  private schema

  constructor() {
    this.expressApp = express()
    this.expressServer = createServer(this.expressApp)

    this.expressApp.use(cookieParser())
    this.expressApp.use(bodyParser.json())
		this.expressApp.use(bodyParser.urlencoded({extended: false}))	
		
		this.expressApp.use('*', (req, res, next) => {
			res.header('Access-Control-Allow-Origin', '*')
			res.header('Access-Control-Allow-Credentials', true)
			res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT')
			res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
			res.header('Access-Control-Max-Age', '600')
			next()
    })
    
    this.expressApp.options('*', (req, res) => { res.send('OK') })
  }

  async start() {
    await this.loadRoutes()

    setInterval(async () =>  {
      this.schema = await getSchema()
    }, process.env.SCHEMA_REFRESH_INTERVAL || 60000)

    this.listen()
  }

  async loadRoutes() {
    this.schema = await getSchema()
  
    this.expressApp.get('/graphiql', (req, res, next) => {
      //TODO: add authentication middleware here

			next()
    },
    graphiqlExpress({
      endpointURL: '/',
      subscriptionsEndpoint: `ws://localhost:${this.port}/subscriptions`
    })
    )
    
    this.expressApp.post('/', (req, res, next) => {
      //TODO: add authentication middleware here

			next()
    },
    graphqlExpress(req => {
      return {
        schema: this.schema,
        context: req
      }
    })
    )
  }

  listen() {
    this.expressServer.listen(this.port, (err) => {
      if (err) throw err

      new SubscriptionServer({
        execute, subscribe, schema: this.schema
      }, {
        server: this.expressServer,
        path: '/subscriptions'
      })
      
			return console.log(`server is listening on ${this.port}`)
		})
  }
}