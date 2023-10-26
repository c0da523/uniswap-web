import gql from 'graphql-tag'

import { ActivityQuery } from './__generated__/types-and-hooks'

gql`
  fragment NFTAssetParts on NftAsset {
    id
    name
    nftContract {
      id
      chain
      address
    }
    tokenId
    image {
      id
      url
    }
    collection {
      id
      name
    }
  }

  fragment NFTTransferParts on NftTransfer {
    id
    asset {
      ...NFTAssetParts
    }
    nftStandard
    sender
    recipient
    direction
  }

  fragment TokenAssetParts on Token {
    id
    name
    symbol
    address
    decimals
    chain
    standard
    project {
      id
      isSpam
      logo {
        id
        url
      }
    }
  }

  fragment TokenTransferParts on TokenTransfer {
    id
    asset {
      ...TokenAssetParts
    }
    tokenStandard
    quantity
    sender
    recipient
    direction
    transactedValue {
      id
      currency
      value
    }
  }

  fragment TokenApprovalParts on TokenApproval {
    id
    asset {
      ...TokenAssetParts
    }
    tokenStandard
    approvedAddress
    quantity
  }

  fragment NFTApprovalParts on NftApproval {
    id
    asset {
      ...NFTAssetParts
    }
    nftStandard
    approvedAddress
  }

  fragment NFTApproveForAllParts on NftApproveForAll {
    id
    asset {
      ...NFTAssetParts
    }
    nftStandard
    operatorAddress
    approved
  }

  fragment TransactionParts on Transaction {
    id
    blockNumber
    hash
    status
    to
    from
    nonce
  }

  fragment TransactionDetailsParts on TransactionDetails {
    id
    type
    from
    to
    hash
    nonce
    status
    assetChanges {
      __typename
      ... on TokenTransfer {
        ...TokenTransferParts
      }
      ... on NftTransfer {
        ...NFTTransferParts
      }
      ... on TokenApproval {
        ...TokenApprovalParts
      }
      ... on NftApproval {
        ...NFTApprovalParts
      }
      ... on NftApproveForAll {
        ...NFTApproveForAllParts
      }
    }
  }

  fragment SwapOrderDetailsParts on SwapOrderDetails {
    id
    offerer
    hash
    orderStatus: status
    inputToken {
      ...TokenAssetParts
    }
    inputTokenQuantity
    outputToken {
      ...TokenAssetParts
    }
    outputTokenQuantity
  }

  fragment AssetActivityParts on AssetActivity {
    id
    timestamp
    chain
    details {
      __typename
      ... on TransactionDetails {
        ...TransactionDetailsParts
      }
      ... on SwapOrderDetails {
        ...SwapOrderDetailsParts
      }
    }
  }

  query Activity($accounts: [String!]!) {
    portfolios(ownerAddresses: $accounts) {
      id
      ownerAddress
      assetActivities(pageSize: 100, page: 1, includeOffChain: true) {
        ...AssetActivityParts
      }
    }
  }
`
type Portfolio = NonNullable<ActivityQuery['portfolios']>[number]
export type AssetActivity = NonNullable<Portfolio['assetActivities']>[number]
export type AssetActivityDetails = AssetActivity['details']