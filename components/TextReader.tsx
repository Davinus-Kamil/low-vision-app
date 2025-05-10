import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Speech from 'expo-speech';
// import { speak } from './utils/tts';

interface TextReaderProps {
  text: string;
  onComplete?: () => void;
  highlightColor?: string;
  pauseBetweenWords?: number;
  start?: boolean;
  fontSize?: number;
  textColor?: string;
  backgroundColor?: string;
  buttonColor?: string;
  buttonActiveColor?: string;
}

export default function TextReader({
  text,
  onComplete,
  highlightColor = 'rgba(255, 255, 0, 0.3)',
  pauseBetweenWords = 100,
  start = false,
  fontSize = 16,
  textColor = 'white',
  backgroundColor = 'rgba(0, 0, 0, 0.7)',
  buttonColor = '#007AFF',
  buttonActiveColor = '#FF3B30',
}: TextReaderProps) {
  const [phrases, setPhrases] = useState<string[]>([]);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(-1);
  const [isReading, setIsReading] = useState<boolean>(false);
  const isReadingRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const wordHeight = fontSize * 1.5; // Approximate height based on font size

  // Helper: Split text into phrases, grouping normal words, but spelling out long numbers
  function splitTextToPhrases(text: string): string[] {
    const tokens = text
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(word => word.length > 0);
    const phrases: string[] = [];
    let currentPhrase: string[] = [];
    const flushPhrase = () => {
      if (currentPhrase.length > 0) {
        phrases.push(currentPhrase.join(' '));
        currentPhrase = [];
      }
    };
    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      if (/^\d{7,}$/.test(word)) {
        // Long number: flush current phrase, then add spelled-out number
        flushPhrase();
        phrases.push(word.split('').join(' '));
      } else {
        currentPhrase.push(word);
      }
    }
    flushPhrase();
    return phrases;
  }

  useEffect(() => {
    setPhrases(splitTextToPhrases(text));
  }, [text]);

  useEffect(() => {
    setIsReading(false);
    setCurrentPhraseIndex(-1);
    if (start && text) {
      startReading();
    }
  }, [text, start]);

  const startReading = async () => {
    if (isReading) {
      try {
        await Speech.stop();
        setIsReading(false);
        isReadingRef.current = false;
        setCurrentPhraseIndex(-1);
      } catch (error) {
        console.error('Error stopping speech:', error);
      }
      return;
    }

    setIsReading(true);
    isReadingRef.current = true;
    setCurrentPhraseIndex(-1);

    try {
      for (let i = 0; i < phrases.length; i++) {
        if (!isReadingRef.current) break;
        setCurrentPhraseIndex(i);
        // Scroll to the current phrase (approximate)
        scrollViewRef.current?.scrollTo({
          y: i * wordHeight * 2,
          animated: true
        });
        await new Promise<void>((resolve) => {
          Speech.speak(phrases[i], {
            onDone: () => resolve(),
            onError: (error) => { console.error('Speech error:', error); resolve(); },
            rate: 0.8,
            pitch: 1.0,
            language: 'en',
          });
        });
        await new Promise(resolve => setTimeout(resolve, pauseBetweenWords));
      }
    } catch (error) {
      console.error('Error during text-to-speech:', error);
      Alert.alert('Error', 'Failed to read text. Please try again.');
    } finally {
      setIsReading(false);
      isReadingRef.current = false;
      setCurrentPhraseIndex(-1);
      if (onComplete) onComplete();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor,
      borderRadius: 10,
      padding: 15,
      margin: 10,
    },
    scrollView: {
      maxHeight: 200,
    },
    contentContainer: {
      flexGrow: 1,
    },
    textContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 10,
      flexShrink: 1,
      flexBasis: 'auto',
    },
    word: {
      color: textColor,
      fontSize,
      marginRight: 4,
      lineHeight: wordHeight,
    },
    currentPhrase: {
      backgroundColor: highlightColor,
      borderRadius: 4,
    },
    button: {
      backgroundColor: buttonColor,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonActive: {
      backgroundColor: buttonActiveColor,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.textContainer}>
          {phrases.map((phrase, pIdx) => {
            const isCurrent = pIdx === currentPhraseIndex;
            const phraseKey = `phrase-${pIdx}`;
            return (
              <Text
                key={phraseKey}
                style={[styles.word, isCurrent && styles.currentPhrase]}
                accessibilityLabel={`${phrase}${isCurrent ? ', currently reading' : ''}`}
              >
                {phrase + ' '}
              </Text>
            );
          })}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={[styles.button, isReading && styles.buttonActive]}
        onPress={() => { startReading(); }}
        accessibilityLabel={isReading ? 'Stop reading' : 'Start reading'}
        accessibilityHint={isReading ? 'Stops the text-to-speech reading' : 'Starts reading the text naturally'}
      >
        <Text style={styles.buttonText}>
          {isReading ? 'Stop Reading' : 'Start Reading'}
        </Text>
      </TouchableOpacity>
    </View>
  );
} 