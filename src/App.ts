import * as express from 'express'
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'
import * as cookie from 'cookie'
import * as url from 'url'
import * as _ from 'lodash'

import { filter } from 'rxjs/operators'

import { createServer } from 'http'

import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { SubscriptionClient } from 'subscriptions-transport-ws/dist/client'

import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import { schemaSubject } from './graphql/schema'

export class App {
  private expressApp
  private expressServer
  private port = process.env.PORT || 3000

  constructor() {
    this.expressApp = express()
    this.expressServer = createServer(this.expressApp)

    this.expressApp.use(cookieParser())
    this.expressApp.use(bodyParser.json())
    this.expressApp.use(bodyParser.urlencoded({ extended: false }))

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

    this.listen()
  }

  async loadRoutes() {
    this.expressApp.get('/graphiql',
      graphiqlExpress(req => ({
        endpointURL: '/',
        subscriptionsEndpoint: url.format({
          host: req.get('host'),
          protocol: process.env.GRAPHIQL_PROTOCOL || 'ws',
          pathname: '/subscriptions'
        })
      }))
    )

    this.expressApp.post('/', (req, res, next) => {
      //TODO: add authentication middleware here

      next()
    },
      graphqlExpress(req => {
        return {
          schema: schemaSubject.getValue(),
          context: {
            ...req,
            Authorization: req.cookies.Authorization
          }
        }
      })
    )
  }

  listen() {
    this.expressServer.listen(this.port, (err) => {
      if (err) throw err

      let subscriptionServer

      schemaSubject.pipe(filter(schema => !_.isNull(schema)))
      .subscribe(schema => {
        if(!schema) return
        if(subscriptionServer) subscriptionServer.close()
        subscriptionServer = new SubscriptionServer({
          execute, subscribe, schema,
          onConnect: (connectionParams, webSocket, context) => {
            const request = context.request
            const headers = request && request.headers
            const cookies = headers && headers.cookie && cookie.parse(headers.cookie)
  
            let authCookie = cookies && cookies.Authorization
            let authValue = authCookie
  
            return {
              Authorization: authValue
            }
          }
        }, {
            server: this.expressServer,
            path: '/subscriptions'
          }
        )
      })

      

      return console.log(`server is listening on ${this.port}`)
    })
  }
}