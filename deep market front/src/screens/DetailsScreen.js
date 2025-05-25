import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, StatusBar, SafeAreaView, Animated } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import api from '../services/api';

const palette = {
  darkBlue: '#0a183d',
  blue: '#207cff',
  blueLight: '#41b6ff',
  white: '#fff',
  cardLight: '#e6ecff',
  neon: '#5bbaff',
};

const ranges = [
  { label: '5d', value: '5d' },
  { label: '7d', value: '7d' },
  { label: '1m', value: '1m' },
  { label: '1y', value: '1y' },
];

export default function DetailsScreen({ route, navigation }) {
  const { crypto, darkMode } = route.params;
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('7d');
  const anim = useRef(new Animated.Value(0)).current;
  const colorGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadHistory();
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [range]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorGlow, { toValue: 1, duration: 1500, useNativeDriver: false }),
        Animated.timing(colorGlow, { toValue: 0, duration: 1500, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  async function loadHistory() {
    setLoading(true);
    try {
      const res = await api.get(`/cryptos/${crypto.id}/history?range=${range}`);
      setHistory(res.data);
    } catch (error) {
      setHistory(null);
    }
    setLoading(false);
  }

  const theme = {
    bg: darkMode ? palette.darkBlue : palette.white,
    text: darkMode ? palette.white : palette.darkBlue,
    subtitle: darkMode ? palette.blueLight : palette.blue,
    card: darkMode ? palette.blue : palette.cardLight,
    chartBg: darkMode ? '#132855' : '#e6ecff',
    chartLine: colorGlow.interpolate({
      inputRange: [0, 1],
      outputRange: [palette.blue, palette.neon],
    }),
    dot: darkMode ? palette.blueLight : palette.blue,
    neon: palette.neon,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />
      <Animated.View style={{
        flex: 1,
        opacity: anim,
        padding: 18,
        paddingTop: 24,
      }}>
        {/* Botão voltar com animação */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 18 }}>
          <Animated.Text style={{
            fontSize: 17,
            color: colorGlow.interpolate({
              inputRange: [0, 1],
              outputRange: [theme.text, theme.neon],
            }),
            fontWeight: 'bold'
          }}>
            {'← Voltar'}
          </Animated.Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: theme.text }]}>{crypto.name} ({crypto.symbol.toUpperCase()})</Text>
        <Text style={[styles.price, { color: theme.text }]}>${Number(crypto.current_price).toLocaleString()}</Text>
        <Text style={[styles.marketCap, { color: theme.text }]}>Market Cap: ${Number(crypto.market_cap).toLocaleString()}</Text>
        <Text style={[styles.subtitle, { color: theme.subtitle, marginTop: 6 }]}>Escolha o período do gráfico:</Text>

        {/* Botões de range */}
        <View style={styles.rangeRow}>
          {ranges.map(r => (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.rangeButton,
                range === r.value && { backgroundColor: theme.subtitle },
              ]}
              onPress={() => setRange(r.value)}
              activeOpacity={0.7}
            >
              <Text style={{
                color: range === r.value ? palette.white : theme.text,
                fontWeight: 'bold',
                fontSize: 16,
              }}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gráfico */}
        {loading ? (
          <ActivityIndicator size="large" color={palette.neon} style={{ marginTop: 40 }} />
        ) : history && (
          <LineChart
            data={{
              labels: history.prices.map((_, idx) =>
                idx % Math.ceil(history.prices.length / 5) === 0
                  ? new Date(history.prices[idx][0]).toLocaleDateString('pt-BR')
                  : ''),
              datasets: [{ data: history.prices.map(p => p[1]) }]
            }}
            width={Dimensions.get('window').width - 36}
            height={230}
            yAxisLabel="$"
            chartConfig={{
              backgroundGradientFrom: theme.chartBg,
              backgroundGradientTo: theme.chartBg,
              decimalPlaces: 2,
              color: (opacity = 1) => palette.neon,
              labelColor: (opacity = 1) => theme.text,
              propsForDots: { r: "4", strokeWidth: "2", stroke: palette.neon },
              propsForBackgroundLines: { stroke: darkMode ? "#192450" : "#e0e8fa" }
            }}
            bezier
            style={{
              borderRadius: 16,
              marginVertical: 16,
              elevation: 6,
              shadowColor: palette.neon,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 18,
            }}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 29, fontWeight: 'bold', marginBottom: 3, letterSpacing: 0.5 },
  price: { fontSize: 23, fontWeight: 'bold', marginVertical: 2 },
  marketCap: { fontSize: 15, marginBottom: 4, fontWeight: '500' },
  subtitle: { fontSize: 16, fontWeight: 'bold' },
  rangeRow: { flexDirection: 'row', marginTop: 12, marginBottom: 5 },
  rangeButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    backgroundColor: '#e6ecff',
    borderRadius: 15,
    marginHorizontal: 4,
    borderWidth: 1.3,
    borderColor: '#41b6ff'
  }
});
