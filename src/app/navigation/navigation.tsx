import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack'
import { selectionAsync } from 'expo-haptics'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PreloadedQuery } from 'react-relay'
import { useAppDispatch, useAppSelector, useAppTheme } from 'src/app/hooks'
import { AccountDrawer } from 'src/app/navigation/AccountDrawer'
import { HomeScreenQueries, usePreloadedHomeScreenQueries } from 'src/app/navigation/hooks'
import { navigationRef } from 'src/app/navigation/NavigationContainer'
import { SwapButton } from 'src/app/navigation/SwapButton'
import { TabBarButton } from 'src/app/navigation/TabBarButton'
import {
  AppStackParamList,
  ExploreStackParamList,
  HomeStackParamList,
  OnboardingStackParamList,
  SettingsStackParamList,
  TabParamList,
} from 'src/app/navigation/types'
import DiscoverIconFilled from 'src/assets/icons/discover-filled.svg'
import DiscoverIcon from 'src/assets/icons/discover.svg'
import WalletIconFilled from 'src/assets/icons/wallet-filled.svg'
import WalletIcon from 'src/assets/icons/wallet.svg'
import { exploreTokensTabQuery } from 'src/components/explore/tabs/ExploreTokensTab'
import {
  ExploreTokensTabQuery,
  ExploreTokensTabQuery$variables,
} from 'src/components/explore/tabs/__generated__/ExploreTokensTabQuery.graphql'
import { Chevron } from 'src/components/icons/Chevron'
import { NetworkPollConfig } from 'src/constants/misc'
import { Priority, useQueryScheduler } from 'src/data/useQueryScheduler'
import { openModal } from 'src/features/modals/modalSlice'
import { OnboardingHeader } from 'src/features/onboarding/OnboardingHeader'
import { OnboardingEntryPoint } from 'src/features/onboarding/utils'
import { ModalName } from 'src/features/telemetry/constants'
import { selectFinishedOnboarding } from 'src/features/wallet/selectors'
import { ActivityScreen } from 'src/screens/ActivityScreen'
import { DevScreen } from 'src/screens/DevScreen'
import { EducationScreen } from 'src/screens/EducationScreen'
import { ExploreScreen } from 'src/screens/ExploreScreen'
import { ExternalProfileScreen } from 'src/screens/ExternalProfileScreen'
import { HomeScreen } from 'src/screens/HomeScreen'
import { ImportMethodScreen } from 'src/screens/Import/ImportMethodScreen'
import { RestoreCloudBackupPasswordScreen } from 'src/screens/Import/RestoreCloudBackupPasswordScreen'
import { RestoreCloudBackupScreen } from 'src/screens/Import/RestoreCloudBackupScreen'
import { SeedPhraseInputScreen } from 'src/screens/Import/SeedPhraseInputScreen'
import { SelectWalletScreen } from 'src/screens/Import/SelectWalletScreen'
import { WatchWalletScreen } from 'src/screens/Import/WatchWalletScreen'
import { NFTItemScreen } from 'src/screens/NFTItemScreen'
import { BackupScreen } from 'src/screens/Onboarding/BackupScreen'
import { CloudBackupPasswordScreen } from 'src/screens/Onboarding/CloudBackupPasswordScreen'
import { CloudBackupProcessingScreen } from 'src/screens/Onboarding/CloudBackupProcessingScreen'
import { EditNameScreen } from 'src/screens/Onboarding/EditNameScreen'
import { LandingScreen } from 'src/screens/Onboarding/LandingScreen'
import { ManualBackupScreen } from 'src/screens/Onboarding/ManualBackupScreen'
import { NotificationsSetupScreen } from 'src/screens/Onboarding/NotificationsSetupScreen'
import { OutroScreen } from 'src/screens/Onboarding/OutroScreen'
import { SecuritySetupScreen } from 'src/screens/Onboarding/SecuritySetupScreen'
import { OnboardingScreens, Screens, Stacks, Tabs } from 'src/screens/Screens'
import { SettingsChainsScreen } from 'src/screens/SettingsChainsScreen'
import { SettingsCloudBackupScreen } from 'src/screens/SettingsCloudBackupScreen'
import { SettingsCloudBackupStatus } from 'src/screens/SettingsCloudBackupStatus'
import { SettingsFaceIdScreen } from 'src/screens/SettingsFaceIdScreen'
import { SettingsScreen } from 'src/screens/SettingsScreen'
import { SettingsSupportScreen } from 'src/screens/SettingsSupportScreen'
import { SettingsTestConfigs } from 'src/screens/SettingsTestConfigs'
import { SettingsViewSeedPhraseScreen } from 'src/screens/SettingsViewSeedPhraseScreen'
import { SettingsWallet } from 'src/screens/SettingsWallet'
import { SettingsWalletEdit } from 'src/screens/SettingsWalletEdit'
import { SettingsWalletManageConnection } from 'src/screens/SettingsWalletManageConnection'
import { TokenDetailsScreen } from 'src/screens/TokenDetailsScreen'
import { WebViewScreen } from 'src/screens/WebViewScreen'
import { dimensions } from 'src/styles/sizing'
import { darkTheme } from 'src/styles/theme'

const Tab = createBottomTabNavigator<TabParamList>()
const OnboardingStack = createStackNavigator<OnboardingStackParamList>()
const AppStack = createNativeStackNavigator<AppStackParamList>()
const HomeStack = createNativeStackNavigator<HomeStackParamList>()
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>()
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>()

const Drawer = createDrawerNavigator()

export const TAB_NAVIGATOR_HEIGHT = 90

const NullComponent = () => {
  return null
}

const exploreTokensTabParams: ExploreTokensTabQuery$variables = {
  topTokensOrderBy: 'MARKET_CAP',
}

function TabNavigator({ homeScreenQueries }: { homeScreenQueries: HomeScreenQueries }) {
  const { t } = useTranslation()
  const theme = useAppTheme()
  const dispatch = useAppDispatch()

  const { queryReference: exploreTokensTabQueryRef } = useQueryScheduler<ExploreTokensTabQuery>(
    Priority.Idle,
    exploreTokensTabQuery,
    exploreTokensTabParams,
    NetworkPollConfig.Slow
  )

  const HomeStackNavigatorMemo = useCallback(
    () => <HomeStackNavigator queryRefs={homeScreenQueries} />,
    [homeScreenQueries]
  )

  // important to memoize to avoid the entire explore stack from getting re-rendered on tab switch
  const ExploreStackNavigatorMemo = useCallback(
    () =>
      exploreTokensTabQueryRef ? (
        <ExploreStackNavigator exploreTokensTabQueryRef={exploreTokensTabQueryRef} />
      ) : null,
    [exploreTokensTabQueryRef]
  )

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.textPrimary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          alignItems: 'center',
          backgroundColor: theme.colors.background0,
          borderTopColor: theme.colors.backgroundOutline,
          borderStyle: 'solid',
          borderTopWidth: 0.5,
          display: 'flex',
          height: TAB_NAVIGATOR_HEIGHT,
          justifyContent: 'center',
          paddingTop: theme.spacing.md,
        },
      }}>
      <Tab.Screen
        children={HomeStackNavigatorMemo}
        name={Tabs.Home}
        options={{
          tabBarLabel: t('Home'),
          tabBarIcon: ({ focused, color }) => (
            <TabBarButton
              Icon={WalletIcon}
              IconFilled={WalletIconFilled}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        component={NullComponent}
        name={Tabs.SwapButton}
        options={{
          tabBarButton: () => {
            return (
              <SwapButton
                onPress={() => {
                  selectionAsync()
                  dispatch(openModal({ name: ModalName.Swap }))
                }}
              />
            )
          },
        }}
      />
      <Tab.Screen
        component={ExploreStackNavigatorMemo}
        name={Tabs.Explore}
        options={{
          tabBarLabel: t('Explore'),
          tabBarShowLabel: false,
          tabBarIcon: ({ focused, color }) => (
            <TabBarButton
              Icon={DiscoverIcon}
              IconFilled={DiscoverIconFilled}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}

function SettingsStackGroup() {
  return (
    <SettingsStack.Navigator screenOptions={navOptions.noHeader}>
      <SettingsStack.Screen component={SettingsScreen} name={Screens.Settings} />
      <SettingsStack.Screen component={SettingsWallet} name={Screens.SettingsWallet} />
      <SettingsStack.Screen component={SettingsWalletEdit} name={Screens.SettingsWalletEdit} />
      <SettingsStack.Screen
        component={SettingsWalletManageConnection}
        name={Screens.SettingsWalletManageConnection}
      />
      <SettingsStack.Screen component={WebViewScreen} name={Screens.WebView} />
      <SettingsStack.Screen component={SettingsChainsScreen} name={Screens.SettingsChains} />
      <SettingsStack.Screen component={SettingsSupportScreen} name={Screens.SettingsSupport} />
      <SettingsStack.Screen component={SettingsTestConfigs} name={Screens.SettingsTestConfigs} />
      <SettingsStack.Screen component={DevScreen} name={Screens.Dev} />
      <SettingsStack.Screen component={SettingsFaceIdScreen} name={Screens.SettingsFaceId} />
      <SettingsStack.Screen
        component={SettingsViewSeedPhraseScreen}
        name={Screens.SettingsViewSeedPhrase}
      />
      <SettingsStack.Screen
        component={SettingsCloudBackupScreen}
        name={Screens.SettingsCloudBackupScreen}
      />
      <SettingsStack.Screen
        component={SettingsCloudBackupStatus}
        name={Screens.SettingsCloudBackupStatus}
      />
    </SettingsStack.Navigator>
  )
}

export function DrawerNavigator() {
  return (
    <Drawer.Navigator
      // useLegacyImplementation seems to fix a bug with the drawer sometimes opening or
      // closing twice, or sometimes not opening the first time you tap on it
      // https://stackoverflow.com/questions/71703096/drawer-reopen-sometime-when-change-screen
      useLegacyImplementation
      drawerContent={(props) => <AccountDrawer {...props} />}
      screenOptions={{
        drawerStyle: {
          width: SIDEBAR_WIDTH,
        },
        headerShown: false,
        overlayColor: darkTheme.colors.backgroundScrim,
      }}>
      <Drawer.Screen
        component={AppStackNavigator}
        name={Stacks.AppStack}
        options={() => ({
          swipeEnabled: getDrawerEnabled(),
          swipeEdgeWidth: SWIPE_WIDTH,
        })}
      />
    </Drawer.Navigator>
  )
}

function getDrawerEnabled() {
  if (!navigationRef.isReady()) {
    // On cases like app cold start, navigation reference may not be ready,
    // and we should allow drawer immediately for home screen
    return true
  }

  const routeName = navigationRef.getCurrentRoute()?.name
  return routeName ? DRAWER_ENABLED_SCREENS.includes(routeName) : false
}

export function HomeStackNavigator({ queryRefs }: { queryRefs: HomeScreenQueries }) {
  const homeScreenMemo = useCallback(() => <HomeScreen queryRefs={queryRefs} />, [queryRefs])
  return (
    <HomeStack.Navigator
      initialRouteName={Screens.Home}
      screenOptions={{
        ...navOptions.noHeader,
      }}>
      <HomeStack.Screen component={homeScreenMemo} name={Screens.Home} />
    </HomeStack.Navigator>
  )
}

export function ExploreStackNavigator({
  exploreTokensTabQueryRef,
}: {
  exploreTokensTabQueryRef: PreloadedQuery<ExploreTokensTabQuery>
}) {
  return (
    <ExploreStack.Navigator
      initialRouteName={Screens.Explore}
      screenOptions={{
        ...navOptions.noHeader,
      }}>
      <ExploreStack.Screen
        children={(props) => (
          <ExploreScreen exploreTokensTabQueryRef={exploreTokensTabQueryRef} {...props} />
        )}
        name={Screens.Explore}
      />
    </ExploreStack.Navigator>
  )
}

export function OnboardingStackNavigator() {
  const theme = useAppTheme()
  const insets = useSafeAreaInsets()
  return (
    <OnboardingStack.Navigator>
      <OnboardingStack.Group
        screenOptions={{
          headerMode: 'float',
          headerTitle: (props) => <OnboardingHeader {...props} />,
          headerBackTitleVisible: false,
          headerBackImage: () => (
            <Chevron color={theme.colors.textSecondary} height={28} width={28} />
          ),
          headerStatusBarHeight: insets.top + theme.spacing.xs,
          headerTransparent: true,
          headerTintColor: theme.colors.textSecondary,
          headerLeftContainerStyle: { paddingLeft: theme.spacing.md },
          headerRightContainerStyle: { paddingRight: theme.spacing.md },
        }}>
        <OnboardingStack.Screen
          component={LandingScreen}
          name={OnboardingScreens.Landing}
          options={{ headerShown: false }}
        />
        <OnboardingStack.Screen component={EditNameScreen} name={OnboardingScreens.EditName} />
        <OnboardingStack.Screen component={BackupScreen} name={OnboardingScreens.Backup} />
        <OnboardingStack.Screen
          component={NotificationsSetupScreen}
          name={OnboardingScreens.Notifications}
        />
        <OnboardingStack.Screen component={SecuritySetupScreen} name={OnboardingScreens.Security} />
        <OnboardingStack.Screen
          component={ManualBackupScreen}
          name={OnboardingScreens.BackupManual}
        />
        <OnboardingStack.Screen component={OutroScreen} name={OnboardingScreens.Outro} />
        <OnboardingStack.Screen
          component={CloudBackupProcessingScreen}
          name={OnboardingScreens.BackupCloudProcessing}
        />
        <OnboardingStack.Screen
          component={CloudBackupPasswordScreen}
          name={OnboardingScreens.BackupCloudPassword}
        />
        <OnboardingStack.Screen
          component={ImportMethodScreen}
          name={OnboardingScreens.ImportMethod}
        />
        <OnboardingStack.Screen
          component={RestoreCloudBackupScreen}
          name={OnboardingScreens.RestoreCloudBackup}
        />
        <OnboardingStack.Screen
          component={RestoreCloudBackupPasswordScreen}
          name={OnboardingScreens.RestoreCloudBackupPassword}
        />
        <OnboardingStack.Screen
          component={SeedPhraseInputScreen}
          name={OnboardingScreens.SeedPhraseInput}
        />
        <OnboardingStack.Screen
          component={SelectWalletScreen}
          name={OnboardingScreens.SelectWallet}
        />
        <OnboardingStack.Screen
          component={WatchWalletScreen}
          name={OnboardingScreens.WatchWallet}
        />
      </OnboardingStack.Group>
    </OnboardingStack.Navigator>
  )
}

export function AppStackNavigator() {
  const finishedOnboarding = useAppSelector(selectFinishedOnboarding)

  // preload home screen queries before `finishedOnboarding` is truthy
  // this helps load the home screen fast from a fresh install
  const homeScreenQueries = usePreloadedHomeScreenQueries()

  const tabNavigator = useCallback(
    () => <TabNavigator homeScreenQueries={homeScreenQueries} />,
    [homeScreenQueries]
  )

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      {finishedOnboarding && (
        <AppStack.Screen children={tabNavigator} name={Screens.TabNavigator} />
      )}
      <AppStack.Screen
        component={OnboardingStackNavigator}
        name={Screens.OnboardingStack}
        navigationKey={
          finishedOnboarding
            ? OnboardingEntryPoint.Sidebar.valueOf()
            : OnboardingEntryPoint.FreshInstall.valueOf()
        }
      />
      <AppStack.Screen component={ExternalProfileScreen} name={Screens.ExternalProfile} />
      <AppStack.Screen component={TokenDetailsScreen} name={Screens.TokenDetails} />
      <AppStack.Screen component={NFTItemScreen} name={Screens.NFTItem} />
      <AppStack.Screen component={ActivityScreen} name={Screens.Activity} />
      <AppStack.Screen component={WebViewScreen} name={Screens.WebView} />
      <AppStack.Screen component={SettingsStackGroup} name={Screens.SettingsStack} />
      <AppStack.Screen
        component={SettingsWalletManageConnection}
        name={Screens.SettingsWalletManageConnection}
      />
      <AppStack.Group screenOptions={navOptions.presentationModal}>
        <AppStack.Screen component={EducationScreen} name={Screens.Education} />
      </AppStack.Group>
    </AppStack.Navigator>
  )
}

const navOptions = {
  noHeader: { headerShown: false },
  presentationModal: { presentation: 'modal' },
} as const

// These should remain enabled to support swipe to close. But to prevent swipe to open set SIDEBAR_WIDTH to 0.
const DRAWER_ENABLED_SCREENS = [
  Screens.Home.valueOf(),
  Screens.Explore.valueOf(),
  Tabs.Explore.valueOf(),
]
const SIDEBAR_WIDTH = Math.min(dimensions.fullWidth * 0.8, 320)
const SWIPE_WIDTH = dimensions.fullWidth * 0.125
