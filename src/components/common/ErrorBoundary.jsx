import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Button from './Button';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[XpenZ App Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.emoji}>Oops! 😵</Text>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.description}>
            The application encountered an unexpected error. Please restart the app or tap below to reset.
          </Text>
          <Button
            title="Reset Application"
            onPress={() => this.setState({ hasError: false })}
            variant="primary"
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: '#f8fafc',
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    color: '#1e1b4b',
  },
  description: {
    fontFamily: typography.fontFamily,
    fontSize: typography.sizes.md,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: typography.lineHeights.sm,
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
  },
});
export default ErrorBoundary;
