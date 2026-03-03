/**
 * InlineMCQ Component
 * MCQ that renders inline within chat messages - like ChatGPT
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import designSystem from '../utils/designSystem';

const {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
} = designSystem;

// Single MCQ Option
const MCQOption = ({ option, optionLetter, isSelected, isCorrect, isIncorrect, isDisabled, onPress }) => {
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
      onPress={() => onPress(optionLetter)}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <MaterialIcons name={getIconName()} size={20} color={getIconColor()} />
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

// Single Question Card
const QuestionCard = ({
  question,
  index,
  userAnswer,
  onSelectOption,
  showResult,
}) => {
  const correctAnswer = question.correct_answer;
  const isUserCorrect = userAnswer === correctAnswer;

  return (
    <View style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionBadge}>
          <Text style={styles.questionBadgeText}>Q{index + 1}</Text>
        </View>
        {showResult && (
          <View style={[
            styles.resultBadge,
            isUserCorrect ? styles.resultCorrect : styles.resultIncorrect
          ]}>
            <MaterialIcons
              name={isUserCorrect ? 'check' : 'close'}
              size={14}
              color={colors.neutral[0]}
            />
          </View>
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
              optionLetter={optionLetter}
              isSelected={userAnswer === optionLetter}
              isCorrect={showResult && optionLetter === correctAnswer}
              isIncorrect={showResult && userAnswer === optionLetter && userAnswer !== correctAnswer}
              isDisabled={showResult}
              onPress={onSelectOption}
            />
          );
        })}
      </View>

      {showResult && question.explanation && (
        <View style={[
          styles.explanationBox,
          isUserCorrect ? styles.explanationCorrect : styles.explanationIncorrect
        ]}>
          <View style={styles.explanationHeader}>
            <MaterialIcons
              name={isUserCorrect ? 'check-circle' : 'info'}
              size={16}
              color={isUserCorrect ? colors.success.main : colors.primary[500]}
            />
            <Text style={styles.explanationLabel}>
              {isUserCorrect ? 'Correct!' : 'Explanation'}
            </Text>
          </View>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );
};

// Score Summary
const ScoreSummary = ({ score, total, percentage }) => {
  const getResultStyle = () => {
    if (percentage >= 80) return { icon: 'emoji-events', color: colors.success.main, text: 'Excellent!' };
    if (percentage >= 60) return { icon: 'thumb-up', color: colors.warning.main, text: 'Good job!' };
    return { icon: 'school', color: colors.primary[500], text: 'Keep practicing!' };
  };

  const result = getResultStyle();

  return (
    <View style={styles.scoreSummary}>
      <View style={[styles.scoreIconWrapper, { backgroundColor: `${result.color}20` }]}>
        <MaterialIcons name={result.icon} size={28} color={result.color} />
      </View>
      <View style={styles.scoreContent}>
        <Text style={styles.scoreValue}>{score}/{total}</Text>
        <Text style={[styles.scoreLabel, { color: result.color }]}>{percentage}% - {result.text}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%`, backgroundColor: result.color }]} />
      </View>
    </View>
  );
};

export default function InlineMCQ({ mcqData, onSubmit }) {
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = mcqData?.questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(userAnswers).length;
  const allAnswered = answeredCount === totalQuestions;

  const handleOptionSelect = (questionId, optionLetter) => {
    if (showResults) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionLetter,
    }));
  };

  const handleSubmit = async () => {
    if (!allAnswered || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onSubmit(userAnswers);
      setResults(result);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting MCQ:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
    setResults(null);
  };

  if (!mcqData || !questions.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="quiz" size={20} color={colors.primary[500]} />
          <Text style={styles.headerTitle}>Practice Questions</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>
            {answeredCount}/{totalQuestions}
          </Text>
        </View>
      </View>

      {/* Score Summary (after submit) */}
      {showResults && results && (
        <ScoreSummary
          score={results.score}
          total={results.total}
          percentage={results.percentage}
        />
      )}

      {/* Questions */}
      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          userAnswer={userAnswers[question.id]}
          onSelectOption={(letter) => handleOptionSelect(question.id, letter)}
          showResult={showResults}
        />
      ))}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {!showResults ? (
          <TouchableOpacity
            style={[
              styles.submitButton,
              !allAnswered && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting
                ? 'Submitting...'
                : allAnswered
                  ? 'Submit Answers'
                  : `Answer all (${answeredCount}/${totalQuestions})`}
            </Text>
            {allAnswered && !isSubmitting && (
              <MaterialIcons name="send" size={18} color={colors.neutral[0]} />
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleReset}
            activeOpacity={0.7}
          >
            <MaterialIcons name="refresh" size={18} color={colors.primary[500]} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginVertical: spacing[2],
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  headerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  progressBadge: {
    backgroundColor: colors.primary[50],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primary[600],
  },
  scoreSummary: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[4],
    alignItems: 'center',
  },
  scoreIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  scoreContent: {
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  scoreValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700',
    color: colors.neutral[800],
  },
  scoreLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginTop: spacing[1],
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  questionCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  questionBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing[2.5],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  questionBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.primary[700],
  },
  resultBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCorrect: {
    backgroundColor: colors.success.main,
  },
  resultIncorrect: {
    backgroundColor: colors.error.main,
  },
  questionText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    color: colors.neutral[800],
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing[3],
  },
  optionsContainer: {
    gap: spacing[2],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    gap: spacing[2.5],
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
    fontSize: typography.fontSize.sm,
    color: colors.neutral[700],
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
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
  explanationBox: {
    marginTop: spacing[3],
    padding: spacing[3],
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
  },
  explanationCorrect: {
    backgroundColor: colors.success.light,
    borderLeftColor: colors.success.main,
  },
  explanationIncorrect: {
    backgroundColor: colors.neutral[100],
    borderLeftColor: colors.primary[500],
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1.5],
    marginBottom: spacing[1.5],
  },
  explanationLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: '700',
    color: colors.neutral[700],
  },
  explanationText: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[600],
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  actionsContainer: {
    marginTop: spacing[2],
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[500],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  submitButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  submitButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.neutral[0],
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary[50],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
  },
  retryButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.primary[600],
  },
});
