import createRemoteLink from './createRemoteLink'

let authLink

export default () => {
  if(!authLink) authLink = createRemoteLink(process.env.AUTH_BACKEND_URL || "http://localhost:3002")

  return authLink
}