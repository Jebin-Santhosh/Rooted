/**
 * Onboarding Navigator
 * Handles step-by-step navigation through onboarding screens
 * Flow: LandingPage -> AuthScreen -> NameInput -> ProfessionalStatus -> Details -> Personalization
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useOnboarding } from '../../context/OnboardingContext';

import LandingPage from '../LandingPage';
import WelcomeAuthScreen from './WelcomeAuthScreen';
import NameInputScreen from './NameInputScreen';
import ProfessionalStatusScreen from './ProfessionalStatusScreen';
import DetailsInputScreen from './DetailsInputScreen';
import PersonalizationScreen from './PersonalizationScreen';

const OnboardingNavigator = () => {
  const { currentStep } = useOnboarding();

  const renderScreen = () => {
    switch (currentStep) {
      case 0:
        return <LandingPage />;
      case 1:
        return <WelcomeAuthScreen />;
      case 2:
        return <NameInputScreen />;
      case 3:
        return <ProfessionalStatusScreen />;
      case 4:
        return <DetailsInputScreen />;
      case 5:
        return <PersonalizationScreen />;
      default:
        return <LandingPage />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingNavigator;
