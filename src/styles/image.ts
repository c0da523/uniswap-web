import { ImageResizeMode, ImageStyle } from 'react-native'
import { theme } from 'src/styles/theme'

export const resizeModeContain: ImageResizeMode = 'contain'

export const nftCollectionBlurImageStyle: ImageStyle = {
  borderRadius: theme.borderRadii.md,
  opacity: 0.4,
}
