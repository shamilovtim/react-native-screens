import React, { PropsWithChildren } from 'react';
import {
  Animated,
  Image,
  ImageProps,
  requireNativeComponent,
  StyleSheet,
  UIManager,
  View,
  ViewProps,
} from 'react-native';

import {
  ScreenContainerProps,
  ScreenProps,
  ScreenStackHeaderConfigProps,
  ScreenStackProps,
  HeaderSubviewTypes,
} from './types';

let ENABLE_SCREENS = false;

export function enableScreens(shouldEnableScreens = true): void {
  ENABLE_SCREENS = shouldEnableScreens;
  if (ENABLE_SCREENS && !UIManager.getViewManagerConfig('RNSScreen')) {
    console.error(
      `Screen native module hasn't been linked. Please check the react-native-screens README for more details`
    );
  }
}

// const that tells if the library should use new implementation, will be undefined for older versions
export const shouldUseActivityState = true;

export function screensEnabled(): boolean {
  return ENABLE_SCREENS;
}

// We initialize these lazily so that importing the module doesn't throw error when not linked
// This is necessary coz libraries such as React Navigation import the library where it may not be enabled
let NativeScreenValue: React.ComponentType<ScreenProps>;
let NativeScreenContainerValue: React.ComponentType<ScreenContainerProps>;
let NativeScreenStack: React.ComponentType<ScreenStackProps>;
let NativeScreenStackHeaderConfig: React.ComponentType<ScreenStackHeaderConfigProps>;
let NativeScreenStackHeaderSubview: React.ComponentType<PropsWithChildren<
  ViewProps & { type: HeaderSubviewTypes }
>>;
let AnimatedNativeScreen: React.ComponentType<ScreenProps>;

const ScreensNativeModules = {
  get NativeScreen() {
    NativeScreenValue =
      NativeScreenValue || requireNativeComponent('RNSScreen');
    return NativeScreenValue;
  },

  get NativeScreenContainer() {
    NativeScreenContainerValue =
      NativeScreenContainerValue ||
      requireNativeComponent('RNSScreenContainer');
    return NativeScreenContainerValue;
  },

  get NativeScreenStack() {
    NativeScreenStack =
      NativeScreenStack || requireNativeComponent('RNSScreenStack');
    return NativeScreenStack;
  },

  get NativeScreenStackHeaderConfig() {
    NativeScreenStackHeaderConfig =
      NativeScreenStackHeaderConfig ||
      requireNativeComponent('RNSScreenStackHeaderConfig');
    return NativeScreenStackHeaderConfig;
  },

  get NativeScreenStackHeaderSubview() {
    NativeScreenStackHeaderSubview =
      NativeScreenStackHeaderSubview ||
      requireNativeComponent('RNSScreenStackHeaderSubview');
    return NativeScreenStackHeaderSubview;
  },
};

export class Screen extends React.Component<ScreenProps> {
  private ref: React.ElementRef<typeof View> | null = null;

  setNativeProps(props: ScreenProps): void {
    this.ref?.setNativeProps(props);
  }

  setRef = (ref: React.ElementRef<typeof View> | null): void => {
    this.ref = ref;
    this.props.onComponentRef?.(ref);
  };

  render(): JSX.Element {
    const { enabled = true } = this.props;

    if (!ENABLE_SCREENS || !enabled) {
      // Filter out active prop in this case because it is unused and
      // can cause problems depending on react-native version:
      // https://github.com/react-navigation/react-navigation/issues/4886

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { active, enabled, onComponentRef, ...rest } = this.props;

      return <Animated.View {...rest} ref={this.setRef} />;
    } else {
      AnimatedNativeScreen =
        AnimatedNativeScreen ||
        Animated.createAnimatedComponent(ScreensNativeModules.NativeScreen);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let { enabled, active, activityState, ...rest } = this.props;
      if (active !== undefined && activityState === undefined) {
        console.warn(
          'It appears that you are using old version of react-navigation library. Please update @react-navigation/bottom-tabs, @react-navigation/stack and @react-navigation/drawer to version 5.10.0 or above to take full advantage of new functionality added to react-native-screens'
        );
        activityState = active !== 0 ? 2 : 0; // in the new version, we need one of the screens to have value of 2 after the transition
      }
      return (
        <AnimatedNativeScreen
          {...rest}
          activityState={activityState}
          ref={this.setRef}
        />
      );
    }
  }
}

export class ScreenContainer extends React.Component<ScreenContainerProps> {
  render(): JSX.Element {
    const { enabled = true, ...rest } = this.props;

    if (!ENABLE_SCREENS || !enabled) {
      return <View {...rest} />;
    } else {
      return <ScreensNativeModules.NativeScreenContainer {...this.props} />;
    }
  }
}

const styles = StyleSheet.create({
  headerSubview: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export const ScreenStackHeaderBackButtonImage = (
  props: ImageProps
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    type="back"
    style={styles.headerSubview}>
    <Image resizeMode="center" fadeDuration={0} {...props} />
  </ScreensNativeModules.NativeScreenStackHeaderSubview>
);

export const ScreenStackHeaderRightView = (
  props: PropsWithChildren<ViewProps>
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    {...props}
    type="right"
    style={styles.headerSubview}
  />
);

export const ScreenStackHeaderLeftView = (
  props: PropsWithChildren<ViewProps>
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    {...props}
    type="left"
    style={styles.headerSubview}
  />
);

export const ScreenStackHeaderCenterView = (
  props: PropsWithChildren<ViewProps>
): JSX.Element => (
  <ScreensNativeModules.NativeScreenStackHeaderSubview
    {...props}
    type="center"
    style={styles.headerSubview}
  />
);

export const NativeScreen = ScreensNativeModules.NativeScreen;

export const ScreenStack = ScreensNativeModules.NativeScreenStack;

export const NativeScreenContainer = ScreensNativeModules.NativeScreenContainer;

export const ScreenStackHeaderConfig = ScreensNativeModules.NativeScreenStackHeaderConfig;

export const ScreenStackHeaderSubview = ScreensNativeModules.NativeScreenStackHeaderSubview;
