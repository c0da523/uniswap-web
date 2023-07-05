import { signTypedData } from '@uniswap/conedison/provider/signing'
import { DutchOrder, DutchOrderBuilder } from '@uniswap/gouda-sdk'
import { useWeb3React } from '@web3-react/core'
import { useCallback } from 'react'
import { DutchOrderTrade, TradeFillType } from 'state/routing/types'
import { trace } from 'tracing/trace'
import { UserRejectedRequestError } from 'utils/errors'
import { didUserReject, swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'

const DEFAULT_START_TIME_PADDING_SECONDS = 30

type DutchAuctionOrderError = { errorCode?: number; detail?: string }
type DutchAuctionOrderSuccess = { hash: string }
type DutchAuctionOrderResponse = DutchAuctionOrderError | DutchAuctionOrderSuccess

const isErrorResponse = (res: Response, order: DutchAuctionOrderResponse): order is DutchAuctionOrderError =>
  res.status < 200 || res.status > 202

export default function useUniswapXSwapCallback(trade: DutchOrderTrade | undefined) {
  const { account, provider } = useWeb3React()

  return useCallback(
    async () =>
      trace('swapx.send', async ({ setTraceData, setTraceStatus }) => {
        if (!account) throw new Error('missing account')
        if (!provider) throw new Error('missing provider')
        if (!trade) throw new Error('missing trade')

        const signDutchOrder = async (): Promise<{ signature: string; updatedOrder: DutchOrder }> => {
          try {
            const startTime = Math.floor(Date.now() / 1000) + DEFAULT_START_TIME_PADDING_SECONDS
            setTraceData('startTime', startTime)

            const endTime = startTime + trade.auctionPeriodSecs
            setTraceData('endTime', endTime)

            const deadline = endTime + trade.deadlineBufferSecs
            setTraceData('deadline', deadline)

            // Set timestamp and account based values when the user clicks 'swap' to make them as recent as possible
            const updatedOrder = DutchOrderBuilder.fromOrder(trade.order)
              .decayStartTime(startTime)
              .decayEndTime(endTime)
              .deadline(deadline)
              .swapper(account)
              .nonFeeRecipient(account)
              .build()

            const { domain, types, values } = updatedOrder.permitData()

            const signature = await signTypedData(provider.getSigner(account), domain, types, values)
            if (deadline < Math.floor(Date.now() / 1000)) {
              return signDutchOrder()
            }
            return { signature, updatedOrder }
          } catch (swapError) {
            if (didUserReject(swapError)) {
              setTraceStatus('cancelled')
              throw new UserRejectedRequestError(swapErrorToUserReadableMessage(swapError))
            }
            throw new Error(swapErrorToUserReadableMessage(swapError))
          }
        }

        const { signature, updatedOrder } = await signDutchOrder()

        // TODO(Gouda): Update with final URL
        const res = await fetch('https://***REMOVED***.execute-api.us-east-2.amazonaws.com/prod/dutch-auction/order', {
          method: 'POST',
          body: JSON.stringify({
            encodedOrder: updatedOrder.serialize(),
            signature,
            chainId: updatedOrder.chainId,
            quoteId: trade.quoteId,
          }),
        })

        const body = (await res.json()) as DutchAuctionOrderResponse

        // TODO(Gouda): For now, `errorCode` is not always present in the response, so we have to fallback
        // check for status code and perform this type narrowing.
        if (isErrorResponse(res, body)) {
          // TODO(Gouda): Provide a similar utility to `swapErrorToUserReadableMessage` once
          // backend team provides a list of error codes and potential messages
          throw new Error(`${body.errorCode ?? body.detail ?? 'Unknown error'}`)
        }

        return {
          type: TradeFillType.UniswapX as const,
          response: { orderHash: body.hash, deadline: updatedOrder.info.deadline },
        }
      }),
    [trade, provider, account]
  )
}