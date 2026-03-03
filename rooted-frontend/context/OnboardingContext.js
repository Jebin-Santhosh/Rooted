/**
 * Onboarding Context
 * Manages onboarding state and user profile data
 * Syncs with Firebase Firestore
 * Requires authentication before accessing main app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, saveUserProfile, getUserProfile, onAuthChange, signOut } from '../config/firebase';

const ONBOARDING_KEY = '@rooted_onboarding';
const USER_PROFILE_KEY = '@rooted_user_profile';

const OnboardingContext = createContext(null);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

const initialProfile = {
  uid: '',
  firstName: '',
  lastName: '',
  email: '',
  photoUrl: '',
  professionalStatus: '', // 'BDS', 'MDS', 'UG', 'Masters', 'Practicing'
  currentYear: '', // For students
  experienceYears: '', // For practicing dentists
  instituteName: '', // College/Institute name for students
  clinicName: '', // Clinic/Hospital name for practicing
  usageGoals: [], // ['presentations', 'exam_prep', 'practice_knowledge', 'research', 'patient_education']
};

export const OnboardingProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // User logged in with Google
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false); // Completed onboarding flow
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Total steps in onboarding
  const totalSteps = 5; // Auth, Name, Professional, Year/Exp + Institute, Goals

  // Helper to load profile from AsyncStorage (fallback)
  const loadFromAsyncStorage = async () => {
    try {
      const [storedOnboarding, storedProfile] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        AsyncStorage.getItem(USER_PROFILE_KEY),
      ]);

      if (storedOnboarding === 'complete' && storedProfile) {
        const profile = JSON.parse(storedProfile);
        return { profile, isComplete: true };
      }
      return { profile: null, isComplete: false };
    } catch (error) {
      console.error('Error reading AsyncStorage:', error);
      return { profile: null, isComplete: false };
    }
  };

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      setFirebaseUser(user);

      if (user) {
        // User is authenticated
        setIsAuthenticated(true);

        // First, check AsyncStorage for cached profile (fast, local)
        const localData = await loadFromAsyncStorage();

        if (localData.isComplete && localData.profile?.uid === user.uid) {
          // Local cache is valid and matches current user
          console.log('Loaded profile from AsyncStorage cache');
          setUserProfile({ ...initialProfile, ...localData.profile });
          setIsOnboardingComplete(true);
          setCurrentStep(totalSteps);
          setIsLoading(false);

          // Sync with Firebase in background (don't block UI)
          getUserProfile(user.uid).then(firebaseProfile => {
            if (firebaseProfile && firebaseProfile.onboardingComplete) {
              setUserProfile(prev => ({ ...prev, ...firebaseProfile }));
            }
          }).catch(err => console.log('Background Firebase sync failed:', err));

          return; // Exit early, don't wait for Firebase
        }

        // No valid local cache, try Firebase
        try {
          const firebaseProfile = await getUserProfile(user.uid);
          if (firebaseProfile && firebaseProfile.onboardingComplete) {
            // User has completed onboarding before
            setUserProfile({ ...initialProfile, ...firebaseProfile });
            setIsOnboardingComplete(true);
            setCurrentStep(totalSteps);

            // Update local cache
            await Promise.all([
              AsyncStorage.setItem(ONBOARDING_KEY, 'complete'),
              AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(firebaseProfile)),
            ]);
          } else {
            // User is authenticated but hasn't completed onboarding
            setUserProfile(prev => ({
              ...prev,
              uid: user.uid,
              email: user.email || '',
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
              photoUrl: user.photoURL || '',
            }));
            setIsOnboardingComplete(false);
            setCurrentStep(1);
          }
        } catch (error) {
          console.error('Error loading Firebase profile:', error);

          // Fallback: Check AsyncStorage even if user.uid doesn't match perfectly
          // (handles edge case where uid might have changed)
          if (localData.isComplete && localData.profile) {
            console.log('Firebase failed, using AsyncStorage fallback');
            setUserProfile({ ...initialProfile, ...localData.profile, uid: user.uid });
            setIsOnboardingComplete(true);
            setCurrentStep(totalSteps);
          } else {
            // No fallback available, start onboarding
            setUserProfile(prev => ({
              ...prev,
              uid: user.uid,
              email: user.email || '',
            }));
            setIsOnboardingComplete(false);
            setCurrentStep(1);
          }
        }
      } else {
        // User is not authenticated
        setIsAuthenticated(false);
        setIsOnboardingComplete(false);
        setCurrentStep(0);
        setUserProfile(initialProfile);
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateProfile = (updates) => {
    setUserProfile((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
    }
  };

  const completeOnboarding = async () => {
    try {
      const profileToSave = {
        ...userProfile,
        onboardingComplete: true,
      };

      // Save to local storage
      await Promise.all([
        AsyncStorage.setItem(ONBOARDING_KEY, 'complete'),
        AsyncStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profileToSave)),
      ]);

      // Save to Firebase if user is authenticated
      if (userProfile.uid) {
        await saveUserProfile(userProfile.uid, profileToSave);
        console.log('Profile saved to Firebase successfully');
      }

      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_KEY),
        AsyncStorage.removeItem(USER_PROFILE_KEY),
      ]);
      setIsOnboardingComplete(false);
      setCurrentStep(0);
      setUserProfile(initialProfile);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  // Logout function - signs out and resets state
  const logout = async () => {
    try {
      await signOut();
      await resetOnboarding();
      setIsAuthenticated(false);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const value = {
    isAuthenticated,
    isOnboardingComplete,
    isLoading,
    currentStep,
    totalSteps,
    userProfile,
    firebaseUser,
    updateProfile,
    nextStep,
    prevStep,
    goToStep,
    completeOnboarding,
    resetOnboarding,
    logout,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
