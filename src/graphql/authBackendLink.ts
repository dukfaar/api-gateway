import createRemoteLink from './createRemoteLink'
import createRemoteHttpLink from './createRemoteHttpLink'
import createRemoteWsLink from './createRemoteWsLink'

let authLink
let authHttpLink
let authWsLink

export default () => {
  if(!authHttpLink) {
    authHttpLink = createRemoteHttpLink(process.env.AUTH_BACKEND_URL || "http://localhost:3002")
  }

  if(!authWsLink) {
    authWsLink = createRemoteWsLink(process.env.AUTH_BACKEND_WS || "ws://localhost:3002/subscriptions")
  }

  if(!authLink) {
    authLink = createRemoteLink(authHttpLink, authWsLink)
  }

  return authLink
}