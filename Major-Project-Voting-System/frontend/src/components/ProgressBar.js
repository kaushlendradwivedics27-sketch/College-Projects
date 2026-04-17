import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';

/**
 * ProgressBar — 3-step progress indicator with labels, maroon fill, gold active dot
 */
export default function ProgressBar({ currentStep, steps }) {
  return (
    <View style={styles.container}>
      <View style={styles.lineContainer}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <View key={index} style={styles.stepWrapper}>
              {/* Dot */}
              <View
                style={[
                  styles.dot,
                  isCompleted && styles.dotCompleted,
                  isActive && styles.dotActive,
                ]}
              >
                {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                {!isCompleted && (
                  <Text
                    style={[
                      styles.dotNumber,
                      (isCompleted || isActive) && styles.dotNumberActive,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {/* Label */}
              <Text
                style={[
                  styles.label,
                  (isCompleted || isActive) && styles.labelActive,
                ]}
              >
                {step}
              </Text>
              {/* Connector line */}
              {!isLast && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  dot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  dotNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textHint,
  },
  dotNumberActive: {
    color: colors.white,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  label: {
    fontSize: 11,
    color: colors.textHint,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.textMain,
    fontWeight: '700',
  },
  connector: {
    position: 'absolute',
    top: 17,
    left: '60%',
    right: '-40%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: 0,
  },
  connectorCompleted: {
    backgroundColor: colors.primary,
  },
});
