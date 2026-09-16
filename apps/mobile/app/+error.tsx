import { ErrorBoundaryProps } from 'expo-router';
import { StyleSheet, Text, View, Button } from 'react-native';
import { useEffect } from 'react';

export default function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to error reporting service
    console.error(error);
  }, [error]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong!</Text>
      <Text style={styles.message}>{error.message}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Try Again" onPress={retry} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 15,
  },
});
