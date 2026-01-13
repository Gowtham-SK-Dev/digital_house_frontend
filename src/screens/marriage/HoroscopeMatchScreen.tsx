// Frontend/src/screens/marriage/HoroscopeMatchScreen.tsx
// Display horoscope compatibility matching

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Card, ProgressBar, Chip, Button } from 'react-native-paper';
import { apiService } from '../../services/api.service';

const HoroscopeMatchScreen = ({ navigation, route }: any) => {
  const { profileId } = route.params;
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHoroscopeMatch();
  }, []);

  const fetchHoroscopeMatch = async () => {
    try {
      // Need to get current user's profile first
      const meResponse = await apiService.get('/api/marriage/profile/me');
      const userProfileId = meResponse.data.id;

      const response = await apiService.get(
        `/api/marriage/profile/${userProfileId}/horoscope-match?withProfile=${profileId}`
      );
      setMatch(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.notFound}>
        <Text>Could not calculate horoscope match</Text>
      </View>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#8BC34A';
      case 'average':
        return '#FFC107';
      case 'poor':
        return '#F44336';
      default:
        return '#999';
    }
  };

  const renderPoruthamScore = (name: string, score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    return (
      <Card style={styles.poruthamCard} key={name}>
        <Card.Content>
          <View style={styles.poruthamHeader}>
            <Text variant="bodyMedium" style={styles.poruthamName}>
              {name}
            </Text>
            <Text variant="bodyMedium" style={styles.poruthamScore}>
              {score}/{maxScore}
            </Text>
          </View>
          <ProgressBar
            progress={percentage / 100}
            color={getRatingColor(percentage > 75 ? 'excellent' : percentage > 50 ? 'good' : 'average')}
            style={styles.progressBar}
          />
        </Card.Content>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Overall Score */}
      <Card style={styles.overallCard}>
        <Card.Content>
          <View style={styles.overallHeader}>
            <View>
              <Text variant="bodySmall" style={styles.overallLabel}>
                Overall Compatibility
              </Text>
              <Text variant="displaySmall" style={styles.overallScore}>
                {match.percentage.toFixed(1)}%
              </Text>
            </View>
            <Chip
              label={match.rating.toUpperCase()}
              style={{
                backgroundColor: getRatingColor(match.rating),
              }}
              textColor="#fff"
            />
          </View>

          <ProgressBar
            progress={match.percentage / 100}
            color={getRatingColor(match.rating)}
            style={styles.overallProgressBar}
          />

          <Text variant="bodySmall" style={styles.totalScore}>
            Total Score: {match.totalScore}/45
          </Text>
        </Card.Content>
      </Card>

      {/* Interpretation */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What This Means
          </Text>
          <Text variant="bodySmall" style={styles.interpretation}>
            {getInterpretation(match.percentage)}
          </Text>
        </Card.Content>
      </Card>

      {/* Individual Poruthams */}
      <Card style={styles.card}>
        <Card.Title title="10 Poruthams Breakdown" />
        <Card.Content>
          {renderPoruthamScore('Dina Porutham', match.dinaPorutham, 4)}
          {renderPoruthamScore('Gana Porutham', match.ganaPorutham, 6)}
          {renderPoruthamScore('Yoni Porutham', match.yoniPorutham, 4)}
          {renderPoruthamScore('Rasi Porutham', match.rasiPorutham, 7)}
          {renderPoruthamScore('Rajju Porutham', match.rajjuPorutham, 8)}
          {renderPoruthamScore('Vasya Porutham', match.vasyaPorutham, 2)}
          {renderPoruthamScore('Mahendra Porutham', match.mahendraPouthram, 5)}
          {renderPoruthamScore('Stri Dirgha Porutham', match.striDirghaPorutham, 3)}
          {renderPoruthamScore('Vedha Porutham', match.vedhaPorutham, 2)}
          {renderPoruthamScore('Bhakut Porutham', match.bhakutPorutham, 4)}
        </Card.Content>
      </Card>

      {/* Legend */}
      <Card style={styles.card}>
        <Card.Title title="About Horoscope Matching" />
        <Card.Content>
          <Text variant="bodySmall" style={styles.legend}>
            In Tamil astrology, 10 poruthams (aspects) are analyzed to determine the compatibility
            between a bride and groom. A higher score indicates better compatibility for marriage.
          </Text>

          <Text variant="labelSmall" style={styles.legendLabel}>
            Scoring Guide:
          </Text>
          <Text variant="bodySmall">85%+ : Excellent match - Highly compatible</Text>
          <Text variant="bodySmall">70-85% : Good match - Very compatible</Text>
          <Text variant="bodySmall">50-70% : Average match - Compatible</Text>
          <Text variant="bodySmall">&lt;50% : Poor match - May need discussion</Text>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={() => navigation.navigate('ProfileDetail', { profileId })}
        style={styles.viewProfileButton}
      >
        View Full Profile
      </Button>
    </ScrollView>
  );
};

const getInterpretation = (percentage: number): string => {
  if (percentage >= 85) {
    return 'Excellent match! Your horoscopes are highly compatible. This is considered an ideal match in traditional astrology.';
  } else if (percentage >= 70) {
    return 'Good match. Your horoscopes show strong compatibility in most aspects. A favorable match for marriage.';
  } else if (percentage >= 50) {
    return 'Average match. You have some compatible aspects. Consider consulting with an astrologer for detailed analysis.';
  } else {
    return 'This combination may have some doshas (defects). We recommend getting a detailed astrological consultation before proceeding.';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overallCard: {
    margin: 16,
    backgroundColor: '#f9f9f9',
  },
  overallHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  overallLabel: {
    color: '#999',
    textTransform: 'uppercase',
  },
  overallScore: {
    fontWeight: '700',
    color: '#333',
  },
  overallProgressBar: {
    height: 8,
    borderRadius: 4,
    marginVertical: 12,
  },
  totalScore: {
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    margin: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  interpretation: {
    lineHeight: 22,
    color: '#666',
  },
  poruthamCard: {
    marginVertical: 8,
  },
  poruthamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  poruthamName: {
    fontWeight: '600',
    flex: 1,
  },
  poruthamScore: {
    fontWeight: '600',
    color: '#0066cc',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  legend: {
    lineHeight: 20,
    marginVertical: 8,
  },
  legendLabel: {
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  viewProfileButton: {
    margin: 16,
    marginBottom: 32,
  },
});

export default HoroscopeMatchScreen;
