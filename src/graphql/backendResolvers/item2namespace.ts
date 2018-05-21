export const itemNamespaceLink = `
    extend type Item { namespace: Namespace }
    extend type Namespace { items: [Item] }
  `

export const itemNamespaceResolvers = mergeInfo => ({
  Item: {
    namespace: {
      fragment: 'fragment ItemFragment on Item { namespaceId }',
      resolve: (parent, params, context, info) => {
        return mergeInfo.delegate('query', 'namespace', {id: parent.namespaceId}, context, info)
      }
    }
  }
})