import React, { useCallback, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { useFocusEffect } from 'expo-router';

interface ScreenTransitionProps {
  children: React.ReactNode;
  /** Duration in ms. Default: 280 */
  duration?: number;
  /** Vertical offset to slide from. Default: 16 */
  slideOffset?: number;
  /** Delay before animation starts. Default: 0 */
  delay?: number;
}

/**
 * Wrap any screen's root element with this component to get a smooth
 * fade + upward slide animation every time the screen gains focus.
 *
 * Usage:
 *   <ScreenTransition>
 *     <YourExistingContent />
 *   </ScreenTransition>
 */
export function ScreenTransition({
  children,
  duration = 280,
  slideOffset = 16,
  delay = 0,
}: ScreenTransitionProps) {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(slideOffset)).current;

  useFocusEffect(
    useCallback(() => {
      // Reset before animating so re-visits replay the transition
      opacity.setValue(0);
      translateY.setValue(slideOffset);

      const anim = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          delay,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]);

      anim.start();
      return () => anim.stop();
    }, [duration, delay, slideOffset])
  );

  return (
    <Animated.View style={[styles.fill, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
