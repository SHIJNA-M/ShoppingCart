// Jest setup file for React Native testing
// Mocks native modules that aren't available in the test environment

// Mock react-native-gesture-handler (required by @react-navigation/stack)
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((component) => component),
    GestureHandlerRootView: View,
    Directions: {},
    GestureDetector: View,
    Gesture: {
      Tap: jest.fn(() => ({ onEnd: jest.fn().mockReturnThis(), runOnJS: jest.fn().mockReturnThis() })),
      Pan: jest.fn(() => ({ onUpdate: jest.fn().mockReturnThis(), runOnJS: jest.fn().mockReturnThis() })),
      Simultaneous: jest.fn(),
      Race: jest.fn(),
      Exclusive: jest.fn(),
    },
  };
});

// Mock react-native-screens
jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
  Screen: require('react-native').View,
  ScreenContainer: require('react-native').View,
  NativeScreen: require('react-native').View,
  NativeScreenContainer: require('react-native').View,
}));

// Mock @react-navigation/native's useNavigation and related hooks
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      dispatch: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});
