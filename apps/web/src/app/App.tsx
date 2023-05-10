import './App.css'

import { createHashRouter, RouterProvider } from 'react-router-dom'
import { Complete } from 'wallet/src/features/onboarding/Complete'
import { ImportMnemonic } from 'wallet/src/features/onboarding/ImportMnemonic'
import { IntroScreen } from 'wallet/src/features/onboarding/IntroScreen'
import { OnboardingWrapper } from 'wallet/src/features/onboarding/OnboardingWrapper'
import { Password } from 'wallet/src/features/onboarding/Password'
import { OnboardingRoutes, TopLevelRoutes } from 'wallet/src/navigation/constants'
import { Provider } from 'wallet/src/provider'
import { Store } from 'webext-redux'
import { WebNavigation } from './navigation'

const router = createHashRouter([
  {
    path: `/${TopLevelRoutes.Onboarding}`,
    element: <OnboardingWrapper />,
    children: [
      {
        path: OnboardingRoutes.Import,
        element: <ImportMnemonic />,
      },
      {
        path: OnboardingRoutes.Password,
        element: <Password />,
      },
      {
        path: OnboardingRoutes.Complete,
        element: <Complete />,
      },
      {
        path: '',
        element: <IntroScreen />,
      },
    ],
  },
  // TODO: flesh out notifications route
  {
    path: `/${TopLevelRoutes.Notifications}`,
    element: <div>Notifications</div>,
  },
  {
    path: '',
    element: <WebNavigation />,
  },
])

function App({ store }: { store: Store }): JSX.Element {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}

export default App
