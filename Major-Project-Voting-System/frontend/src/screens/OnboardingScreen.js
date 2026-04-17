import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '🗳️',
    title: 'Your Vote Matters',
    subtitle: 'Shape the future of IILM student life with your voice',
  },
  {
    id: '2',
    icon: '🔒',
    title: 'Safe & Verified',
    subtitle: 'Multi-step authentication with your Student ID',
  },
  {
    id: '3',
    icon: '📊',
    title: 'Live Results',
    subtitle: 'Watch votes count in real-time with transparent data',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('ElectionInfo');
    }
  };

  const renderSlide = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const contentOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });

    const contentTranslateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
            alignItems: 'center',
          }}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination */}
      <View style={styles.paginationContainer}>
        <View style={styles.dotsRow}>
          {SLIDES.map((_, index) => {
            const dotScaleX = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [1, 3.5, 1],
              extrapolate: 'clamp',
            });

            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    transform: [{ scaleX: dotScaleX }],
                    opacity: dotOpacity,
                  },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title={currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="gold"
            style={styles.button}
          />
          {currentIndex < SLIDES.length - 1 && (
            <PrimaryButton
              title="Skip"
              onPress={() => navigation.replace('ElectionInfo')}
              variant="ghost"
              textStyle={styles.skipText}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(184,134,11,0.25)',
  },
  icon: {
    fontSize: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    paddingBottom: 56,
    paddingHorizontal: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: '100%',
  },
  skipText: {
    color: 'rgba(255,255,255,0.5)',
    textDecorationLine: 'none',
  },
});
