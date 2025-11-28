import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, Keyboard, ScrollView, StatusBar } from 'react-native';
// Usamos ícones do pacote padrão do Expo. Se der erro, rode: npx expo install @expo/vector-icons
import { Feather } from '@expo/vector-icons';

export default function ClimatikyApp() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_KEY = 'e4aeace8b9deda691ff644cf3026acac';

  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError(null);
    setWeatherData(null);
    Keyboard.dismiss();

    try {
      // Endpoint /forecast para obter 'pop' (probabilidade de precipitação)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=pt_br`
      );

      if (!response.ok) {
        throw new Error('Cidade não encontrada');
      }

      const data = await response.json();
      // Forecast retorna lista a cada 3h. Pegamos o primeiro item (atual/imediato).
      const current = data.list[0];
      
      const weatherPayload = {
        name: data.city.name,
        country: data.city.country,
        temp: current.main.temp,
        description: current.weather[0].description,
        id: current.weather[0].id,
        humidity: current.main.humidity,
        wind: current.wind.speed,
        feels_like: current.main.feels_like,
        // pop vem de 0 a 1 (ex: 0.5 = 50%)
        pop: Math.round(current.pop * 100), 
      };

      setWeatherData(weatherPayload);
    } catch (err) {
      setError('Cidade não localizada. Verifique o nome.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (id) => {
    const size = 64;
    const color = '#d4d4d8'; // zinc-300

    if (id >= 200 && id < 300) return <Feather name="cloud-lightning" size={size} color={color} />;
    if (id >= 300 && id < 500) return <Feather name="cloud-drizzle" size={size} color={color} />;
    if (id >= 500 && id < 600) return <Feather name="cloud-rain" size={size} color={color} />;
    if (id >= 600 && id < 700) return <Feather name="cloud-snow" size={size} color="#ffffff" />;
    if (id >= 700 && id < 800) return <Feather name="wind" size={size} color="#71717a" />; 
    if (id === 800) return <Feather name="sun" size={size} color="#ffffff" />;
    if (id > 800) return <Feather name="cloud" size={size} color={color} />;
    return <Feather name="cloud" size={size} color={color} />;
  };

  const renderTemperature = () => {
    if (!weatherData) return null;

    const isBrazil = weatherData.country === 'BR';
    const tempCelsius = weatherData.temp;
    
    const finalTemp = isBrazil ? tempCelsius : (tempCelsius * 9/5) + 32;
    const unit = isBrazil ? '°C' : '°F';

    return (
      <View style={styles.tempContainer}>
        <Text style={styles.tempText}>
          {Math.round(finalTemp)}
          <Text style={styles.tempUnit}>{unit}</Text>
        </Text>
      </View>
    );
  };

  const renderFeelsLike = () => {
     if (!weatherData) return null;
     const isBrazil = weatherData.country === 'BR';
     const fl = weatherData.feels_like;
     const val = isBrazil ? fl : (fl * 9/5) + 32;
     return Math.round(val) + '°';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#09090b" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>CLIMATIKY</Text>
          <Text style={styles.subtitle}>FORECAST APP</Text>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite o nome da cidade..."
            placeholderTextColor="#52525b"
            value={city}
            onChangeText={setCity}
            onSubmitEditing={fetchWeather}
          />
          <TouchableOpacity style={styles.searchButton} onPress={fetchWeather}>
            <Feather name="search" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {loading && (
            <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {!loading && !error && !weatherData && (
            <View style={styles.placeholderContainer}>
              <Feather name="cloud" size={48} color="#27272a" />
              <Text style={styles.placeholderText}>Busque uma cidade</Text>
            </View>
          )}

          {!loading && !error && weatherData && (
            <View style={styles.weatherContainer}>
              
              <View style={styles.locationBadge}>
                <Feather name="map-pin" size={12} color="#a1a1aa" />
                <Text style={styles.locationText}>
                  {weatherData.name}, {weatherData.country}
                </Text>
              </View>

              <View style={styles.iconContainer}>
                {getWeatherIcon(weatherData.id)}
              </View>
              
              {renderTemperature()}

              <Text style={styles.description}>
                {weatherData.description}
              </Text>

              <View style={styles.statsGrid}>
                
                <View style={styles.statCard}>
                  <Feather name="umbrella" size={20} color="#71717a" />
                  <Text style={styles.statValue}>{weatherData.pop}%</Text>
                  <Text style={styles.statLabel}>CHUVA</Text>
                </View>

                <View style={styles.statCard}>
                  <Feather name="droplet" size={20} color="#71717a" />
                  <Text style={styles.statValue}>{weatherData.humidity}%</Text>
                  <Text style={styles.statLabel}>UMIDADE</Text>
                </View>

                <View style={styles.statCard}>
                  <Feather name="wind" size={20} color="#71717a" />
                  <Text style={styles.statValue}>{Math.round(weatherData.wind)}</Text>
                  <Text style={styles.statLabel}>VENTO (m/s)</Text>
                </View>

                 <View style={styles.statCard}>
                  <Feather name="thermometer" size={20} color="#71717a" />
                  <Text style={styles.statValue}>{renderFeelsLike()}</Text>
                  <Text style={styles.statLabel}>SENSAÇÃO</Text>
                </View>

              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 10,
    color: '#71717a',
    letterSpacing: 2,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#09090b',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#e4e4e7',
    fontSize: 16,
  },
  searchButton: {
    position: 'absolute',
    right: 8,
    top: 6,
    backgroundColor: '#27272a',
    padding: 10,
    borderRadius: 12,
  },
  mainContent: {
    width: '100%',
    alignItems: 'center',
    minHeight: 400,
  },
  errorBox: {
    padding: 16,
    backgroundColor: 'rgba(69, 10, 10, 0.3)',
    borderColor: 'rgba(127, 29, 29, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
  },
  errorText: {
    color: '#fecaca',
  },
  placeholderContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  placeholderText: {
    color: '#52525b',
    marginTop: 12,
  },
  weatherContainer: {
    width: '100%',
    alignItems: 'center',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(63, 63, 70, 0.5)',
    marginBottom: 32,
    gap: 8,
  },
  locationText: {
    color: '#e4e4e7',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  tempContainer: {
    alignItems: 'center',
  },
  tempText: {
    fontSize: 80,
    fontWeight: '200',
    color: '#ffffff',
    letterSpacing: -4,
  },
  tempUnit: {
    fontSize: 32,
    color: '#71717a',
  },
  description: {
    fontSize: 18,
    color: '#a1a1aa',
    textTransform: 'capitalize',
    marginTop: 8,
    marginBottom: 40,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(9, 9, 11, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.5)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#52525b',
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
});