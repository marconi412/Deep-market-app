import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  StatusBar,
  SafeAreaView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import api from '../services/api';

const palette = {
  petrol: '#194568',
  blueGray: '#2a415d',
  royal: '#2176ff',
  gold: '#f6c851',
  snow: '#f8fafc',
  dark: '#1a2232',
  cardLight: '#eaf0f7',
  neon: '#24aaff',
  shadow: '#15365144',
};

export default function HomeScreen({ navigation }) {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const scales = useRef([]).current;
  const headerAnim = useRef(new Animated.Value(0)).current;
  const colorGlow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCryptos();
  }, []);

  async function loadCryptos() {
    setLoading(true);
    try {
      const response = await api.get('/cryptos');
      setCryptos(response.data);
    } catch (error) {
      console.error('Erro ao carregar criptos:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: darkMode ? 1 : 0,
      duration: 500,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [darkMode]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorGlow, { toValue: 1, duration: 1700, useNativeDriver: false }),
        Animated.timing(colorGlow, { toValue: 0, duration: 1700, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const theme = {
    bg: darkMode ? palette.dark : palette.snow,
    card: darkMode ? palette.blueGray : palette.cardLight,
    text: darkMode ? palette.snow : palette.petrol,
    subtitle: darkMode ? palette.royal : palette.petrol,
    neon: palette.neon,
    percent: darkMode ? palette.gold : palette.royal,
    gold: palette.gold,
    border: darkMode ? '#2a415d' : '#eaf0f7',
    shadow: palette.shadow,
    footerBg: darkMode ? palette.petrol : '#eef1f5',
    footerText: darkMode ? palette.gold : palette.royal,
  };

  const getScaleRef = (index) => {
    if (!scales[index]) scales[index] = new Animated.Value(1);
    return scales[index];
  };

  const renderItem = ({ item, index }) => {
    const scale = getScaleRef(index);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 25,
        bounciness: 12,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1.09,
        useNativeDriver: true,
        speed: 12,
        bounciness: 6,
      }).start(() =>
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 8,
          bounciness: 4,
        }).start()
      );
    };

    return (
      <TouchableWithoutFeedback
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => navigation.navigate('Details', { crypto: item, darkMode })}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowColor: theme.shadow,
              borderColor: theme.border,
              transform: [{ scale }],
            },
          ]}
        >
          <Text style={[styles.name, { color: theme.text }]}>
            <Animated.Text
              style={{
                color: colorGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [theme.text, theme.neon],
                }),
                fontSize: 21,
                fontWeight: '900',
                letterSpacing: 0.5,
              }}
            >
              {item.name}
            </Animated.Text>{' '}
            <Text style={{ fontWeight: '900' }}>({item.symbol.toUpperCase()})</Text>
          </Text>
          <Text style={[styles.value, { color: theme.gold, fontSize: 18 }]}>
            <Text style={{ fontSize: 21 }}>💰</Text> ${Number(item.current_price).toLocaleString()}
          </Text>
          <Text style={[styles.marketCap, { color: theme.text }]}>
            <Text style={{ fontSize: 18 }}>📊</Text> Market Cap: ${Number(item.market_cap).toLocaleString()}
          </Text>
          <Text style={[styles.percent, { color: theme.percent }]}>
            <Text style={{ fontSize: 18 }}>⚡</Text> 24h: {(item.price_change_percentage_24h ?? 0).toFixed(2)}%
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  };

  const renderFooter = () => (
    <View style={[styles.footer, { backgroundColor: theme.footerBg }]}>
      <Text style={[styles.footerText, { color: theme.footerText }]}>
        Powered by DEEP MARKET © {new Date().getFullYear()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bg}
      />
      {}
      <Animated.View
        style={[
          styles.headerFixed,
          {
            backgroundColor: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [palette.snow, palette.petrol],
            }),
            borderBottomWidth: 2,
            borderBottomColor: colorGlow.interpolate({
              inputRange: [0, 1],
              outputRange: [theme.neon, theme.subtitle],
            }),
            shadowColor: theme.neon,
            shadowOpacity: 0.14,
            shadowRadius: 11,
            elevation: 12,
          },
        ]}
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[styles.headerTop, { color: theme.subtitle }]}>DEEP</Text>
          <Text style={[styles.headerBottom, { color: theme.gold }]}>MARKET</Text>
        </View>
        <TouchableWithoutFeedback onPress={() => setDarkMode(dm => !dm)}>
          <Animated.View style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: colorGlow.interpolate({
              inputRange: [0, 1],
              outputRange: ['#fff0', '#41b6ff44'],
            }),
            elevation: 3,
            position: 'absolute',
            right: 20,
            top: Platform.OS === 'ios' ? 24 : 16,
          }}>
            <Animated.Text style={{
              fontSize: 28,
              color: headerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [palette.royal, palette.gold],
              }),
            }}>
              {darkMode ? '🌙' : '☀️'}
            </Animated.Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </Animated.View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.neon} />
        </View>
      ) : (
        <FlatList
          data={cryptos}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          ListFooterComponent={renderFooter}
          contentContainerStyle={{ paddingVertical: 16, paddingHorizontal: 10, paddingBottom: 40, paddingTop: 24 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerFixed: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 42 : 28,
    paddingBottom: 6,
    flexDirection: 'row',
    minHeight: 84,
    zIndex: 30,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative'
  },
  headerTop: {
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: 3,
    lineHeight: 25,
  },
  headerBottom: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 7,
    lineHeight: 32,
    marginTop: -2,
  },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
  },
  card: {
    marginBottom: 22,
    borderRadius: 22,
    padding: 22,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    borderWidth: 0.7,
    borderColor: '#41b6ff22',
    backgroundColor: '#eaf0f7',
    elevation: 6,
  },
  name: { fontSize: 22, fontWeight: '900', marginBottom: 7, letterSpacing: 0.5 },
  value: { fontWeight: '700', marginBottom: 3 },
  marketCap: { fontSize: 15, marginBottom: 3, fontWeight: '500' },
  percent: { fontSize: 17, marginTop: 2, fontWeight: 'bold' },
  footer: {
    width: '100%',
    marginTop: 28,
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1.2,
    borderTopColor: '#dbeafe',
  },
  footerText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
});
