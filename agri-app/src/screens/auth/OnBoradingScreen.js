import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { Text, Image, StyleSheet } from 'react-native';
const OnBoardingScreen = ({ onDone }) => {
  return (
    <Onboarding
      onSkip={onDone}
      onDone={onDone}
      imageContainerStyles={{}}
      titleStyles={{
        fontSize: 30,
        fontFamily: "Lobster-Regular",
        fontWeight: "Bold",
      }}
      subTitleStyles={{
        fontSize: 18,
        fontWeight: 500,
        fontOpacity: 0.5,
        margin: 20,
        marginTop: 10
      }}
      pages={[
        {
          backgroundColor: '#B6FFA1',
          image: <Image source={require('../../assets/images/img1.jpg')} style={styles.imageContain} />,
          title: "Buy and Sell Fresh Produce",
          subtitle: 'Easily connect with buyers and sellers across Mizoram.',
        },
        {
          backgroundColor: '#8fbbd6',
          image: <Image source={require('../../assets/images/img2.jpg')} style={styles.imageContain} />,
          title: 'Get Farming Tips and Advice',
          subtitle: 'Access valuable information on farming techniques, seasonal tips, and weather updates to improve your harvest.',
        },
        {
          backgroundColor: '#eccfac',
          image: <Image source={require('../../assets/images/img3.jpg')} style={styles.imageContain} />,
          title: 'Secure Financial Support',
          subtitle: 'Apply for agricultural loans directly through the app and track your application status.',
        },
      ]}
    />
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContain: {
    marginTop: -100,
    width: 300,
    height: 300,
    borderRadius: 50,
    opacity: 0.9
  }
})

export default OnBoardingScreen;
