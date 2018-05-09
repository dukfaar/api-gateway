import createRemoteWsLink from './createRemoteWsLink'

let authWsLink

export default () => {
  if(!authWsLink) {
    authWsLink = createRemoteWsLink(process.env.AUTH_BACKEND_WS || "ws://localhost:3002/subscriptions")
  }

  return authWsLink
}