/**
 * MCQContainer Component
 * Modern MCQ quiz container - Web compatible
 */

import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import designSystem from '../utils/designSystem';

const {
  colors,
  spacing,
  borderRadius,
  shadows,
  typography,
  scale,
  verticalScale,
} = designSystem;

// Single MCQ Option Component
const MCQOption = ({ option, isSelected, isCorrect, isIncorrect, isDisabled, onPress }) => {
  const getOptionStyle = () => {
    if (isCorrect) return styles.optionCorrect;
    if (isIncorrect) return styles.optionIncorrect;
    if (isSelected) return styles.optionSelected;
    return styles.optionDefault;
  };

  const getIconName = () => {
    if (isCorrect) return 'check-circle';
    if (isIncorrect) return 'cancel';
    if (isSelected) return 'radio-button-checked';
    return 'radio-button-unchecked';
  };

  const getIconColor = () => {
    if (isCorrect) return colors.success.main;
    if (isIncorrect) return colors.error.main;
    if (isSelected) return colors.primary[500];
    return colors.neutral[400];
  };

  return (
    <TouchableOpacity
      style={[styles.option, getOptionStyle()]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <MaterialIcons name={getIconName()} size={22} color={getIconColor()} />
      <Text style={[
        styles.optionText,
        isSelected && styles.optionTextSelected,
        isCorrect && styles.optionTextCorrect,
        isIncorrect && styles.optionTextIncorrect,
      ]}>
        {option}
      </Text>
    </TouchableOpacity>
  );
};

// Explanation Card
const ExplanationCard = ({ explanation, isCorrect }) => (
  <View style={[
    styles.explanationCard,
    isCorrect ? styles.explanationCorrect : styles.explanationIncorrect,
  ]}>
    <View style={styles.explanationHeader}>
      <MaterialIcons
        name={isCorrect ? 'check-circle' : 'info'}
        size={18}
        color={isCorrect ? colors.success.main : colors.primary[500]}
      />
      <Text style={styles.explanationLabel}>
        {isCorrect ? 'Correct!' : 'Explanation'}
      </Text>
    </View>
    <Text style={styles.explanationText}>{explanation}</Text>
  </View>
);

// Score Card
const ScoreCard = ({ score, total, percentage }) => {
  const getMessage = () => {
    if (percentage >= 80) return { icon: 'emoji-events', text: 'Excellent!', color: colors.success.main };
    if (percentage >= 60) return { icon: 'thumb-up', text: 'Good job!', color: colors.warning.main };
    return { icon: 'school', text: 'Keep practicing!', color: colors.primary[500] };
  };

  const result = getMessage();

  return (
    <View style={styles.scoreCard}>
      <View style={[styles.scoreIconContainer, { backgroundColor: `${result.color}20` }]}>
        <MaterialIcons name={result.icon} size={40} color={result.color} />
      </View>
      <Text style={styles.scoreTitle}>Your Score</Text>
      <Text style={styles.scoreValue}>{score}/{total}</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${percentage}%`, backgroundColor: result.color },
          ]}
        />
      </View>
      <Text style={[styles.scorePercentage, { color: result.color }]}>
        {percentage}% - {result.text}
      </Text>
    </View>
  );
};

// Question Card
const QuestionCard = ({
  question,
  index,
  userAnswer,
  onSelectOption,
  showResults,
}) => {
  const correctAnswer = question.correct_answer;
  const isUserCorrect = userAnswer === correctAnswer;

  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>Q{index + 1}</Text>
        </View>
        {showResults && (
          <MaterialIcons
            name={isUserCorrect ? 'check-circle' : 'cancel'}
            size={24}
            color={isUserCorrect ? colors.success.main : colors.error.main}
          />
        )}
      </View>

      <Text style={styles.questionText}>{question.question}</Text>

      <View style={styles.optionsContainer}>
        {question.options.map((option, optionIndex) => {
          const optionLetter = option.charAt(0);
          return (
            <MCQOption
              key={optionIndex}
              option={option}
              isSelected={userAnswer === optionLetter}
              isCorrect={showResults && optionLetter === correctAnswer}
              isIncorrect={showResults && userAnswer === optionLetter && userAnswer !== correctAnswer}
              isDisabled={showResults}
              onPress={() => onSelectOption(question.id, optionLetter)}
            />
          );
        })}
      </View>

      {showResults && (
        <ExplanationCard
          explanation={question.explanation}
          isCorrect={isUserCorrect}
        />
      )}
    </View>
  );
};

export default function MCQContainer({ mcqData, onSubmit }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  const handleOptionSelect = (questionId, optionLetter) => {
    if (showResults) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  const handleSubmit = async () => {
    const totalQuestions = mcqData.questions.length;
    const answeredQuestions = Object.keys(userAnswers).length;

    if (answeredQuestions < totalQuestions) {
      return;
    }

    try {
      const result = await onSubmit(userAnswers);
      setResults(result);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting MCQ:', error);
    }
  };

  const allAnswered = Object.keys(userAnswers).length === mcqData.questions.length;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <MaterialIcons name="quiz" size={24} color={colors.primary[500]} />
          <Text style={styles.headerTitle}>Practice Questions</Text>
          <Text style={styles.headerSubtitle}>
            {mcqData.questions.length} questions
          </Text>
        </View>

        {/* Score Card (if submitted) */}
        {showResults && results && (
          <ScoreCard
            score={results.score}
            total={results.total}
            percentage={results.percentage}
          />
        )}

        {/* Questions */}
        {mcqData.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            userAnswer={userAnswers[question.id]}
            onSelectOption={handleOptionSelect}
            showResults={showResults}
          />
        ))}

        {/* Submit Button */}
        {!showResults && (
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                !allAnswered && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!allAnswered}
            >
              <Text style={styles.submitButtonText}>
                {allAnswered ? 'Submit Answers' : `Answer all questions (${Object.keys(userAnswers).length}/${mcqData.questions.length})`}
              </Text>
              {allAnswered && (
                <MaterialIcons name="send" size={20} color={colors.neutral[0]} />
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing[4],
    paddingBottom: spacing[10],
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing[6],
    gap: spacing[2],
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[500],
  },
  questionCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.sm,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  questionBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  questionBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.primary[700],
  },
  questionText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.neutral[800],
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing[4],
  },
  optionsContainer: {
    gap: spacing[2],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    gap: spacing[3],
  },
  optionDefault: {
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral[0],
  },
  optionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  optionCorrect: {
    borderColor: colors.success.main,
    backgroundColor: colors.success.light,
  },
  optionIncorrect: {
    borderColor: colors.error.main,
    backgroundColor: colors.error.light,
  },
  optionText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.neutral[700],
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  optionTextSelected: {
    fontWeight: '500',
    color: colors.primary[700],
  },
  optionTextCorrect: {
    fontWeight: '500',
    color: colors.success.dark,
  },
  optionTextIncorrect: {
    fontWeight: '500',
    color: colors.error.dark,
  },
  explanationCard: {
    marginTop: spacing[4],
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
  },
  explanationCorrect: {
    backgroundColor: colors.success.light,
    borderLeftColor: colors.success.main,
  },
  explanationIncorrect: {
    backgroundColor: colors.neutral[50],
    borderLeftColor: colors.primary[500],
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  explanationLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  explanationText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  scoreCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    marginBottom: spacing[6],
    alignItems: 'center',
    ...shadows.md,
  },
  scoreIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  scoreTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    color: colors.neutral[500],
    marginBottom: spacing[1],
  },
  scoreValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: spacing[4],
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing[3],
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  scorePercentage: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  submitContainer: {
    marginTop: spacing[4],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[4],
    borderRadius: borderRadius.xl,
    gap: spacing[2],
    ...shadows.primary,
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral[300],
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.neutral[0],
  },
});






