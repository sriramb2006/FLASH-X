import React, { useState, useEffect } from 'react';
import {
  Compass,
  CloudSun,
  CloudRain,
  Sun,
  Moon,
  Wind,
  Droplets,
  DollarSign,
  Clock,
  ArrowRightLeft,
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
  Thermometer
} from 'lucide-react';

interface CityData {
  city: string;
  country: string;
  timezone: string;
  utcOffset: number; // in hours from UTC
  tempC: number;
  condition: string;
  humidity: number;
  windKm: number;
  aqi: number;
  currencyCode: string;
  currencySymbol: string;
  exchangeRateToInr: number; // 1 Foreign Currency = X INR
  forecast: { day: string; temp: number; icon: 'sun' | 'rain' | 'cloud' }[];
  advisory: string;
  emergencyNumber: string;
  peakHours: string;
}

const DESTINATION_DATABASE: Record<string, CityData> = {
  'Bengaluru': {
    city: 'Bengaluru',
    country: 'India (Karnataka)',
    timezone: 'Asia/Kolkata (IST)',
    utcOffset: 5.5,
    tempC: 24,
    condition: 'Pleasant & Breezy',
    humidity: 62,
    windKm: 14,
    aqi: 58,
    currencyCode: 'INR',
    currencySymbol: '₹',
    exchangeRateToInr: 1,
    forecast: [
      { day: 'Mon', temp: 25, icon: 'cloud' },
      { day: 'Tue', temp: 24, icon: 'rain' },
      { day: 'Wed', temp: 26, icon: 'sun' },
      { day: 'Thu', temp: 27, icon: 'sun' },
      { day: 'Fri', temp: 24, icon: 'cloud' }
    ],
    advisory: 'Optimal weather for transit. Light jacket recommended for night highway journeys.',
    emergencyNumber: '112 / 080-22942222',
    peakHours: '08:30 - 11:00 & 17:30 - 20:30'
  },
  'Chennai': {
    city: 'Chennai',
    country: 'India (Tamil Nadu)',
    timezone: 'Asia/Kolkata (IST)',
    utcOffset: 5.5,
    tempC: 31,
    condition: 'Sunny & Humid',
    humidity: 78,
    windKm: 18,
    aqi: 72,
    currencyCode: 'INR',
    currencySymbol: '₹',
    exchangeRateToInr: 1,
    forecast: [
      { day: 'Mon', temp: 32, icon: 'sun' },
      { day: 'Tue', temp: 31, icon: 'sun' },
      { day: 'Wed', temp: 30, icon: 'cloud' },
      { day: 'Thu', temp: 31, icon: 'sun' },
      { day: 'Fri', temp: 33, icon: 'sun' }
    ],
    advisory: 'Stay well-hydrated. Afternoon heat index is high; air-conditioned coach recommended.',
    emergencyNumber: '112 / 044-23452359',
    peakHours: '08:00 - 10:30 & 18:00 - 21:00'
  },
  'Coimbatore': {
    city: 'Coimbatore',
    country: 'India (Tamil Nadu)',
    timezone: 'Asia/Kolkata (IST)',
    utcOffset: 5.5,
    tempC: 27,
    condition: 'Mild & Sunny',
    humidity: 58,
    windKm: 12,
    aqi: 42,
    currencyCode: 'INR',
    currencySymbol: '₹',
    exchangeRateToInr: 1,
    forecast: [
      { day: 'Mon', temp: 27, icon: 'sun' },
      { day: 'Tue', temp: 28, icon: 'sun' },
      { day: 'Wed', temp: 26, icon: 'cloud' },
      { day: 'Thu', temp: 27, icon: 'sun' },
      { day: 'Fri', temp: 29, icon: 'sun' }
    ],
    advisory: 'Excellent air quality and moderate temperatures throughout the day.',
    emergencyNumber: '112 / 0422-2300970',
    peakHours: '09:00 - 10:30 & 17:30 - 19:30'
  },
  'Kochi': {
    city: 'Kochi',
    country: 'India (Kerala)',
    timezone: 'Asia/Kolkata (IST)',
    utcOffset: 5.5,
    tempC: 28,
    condition: 'Coastal Showers',
    humidity: 84,
    windKm: 16,
    aqi: 38,
    currencyCode: 'INR',
    currencySymbol: '₹',
    exchangeRateToInr: 1,
    forecast: [
      { day: 'Mon', temp: 28, icon: 'rain' },
      { day: 'Tue', temp: 27, icon: 'rain' },
      { day: 'Wed', temp: 29, icon: 'cloud' },
      { day: 'Thu', temp: 28, icon: 'sun' },
      { day: 'Fri', temp: 28, icon: 'cloud' }
    ],
    advisory: 'Intermittent coastal drizzle. Umbrella recommended for boarding / dropping points.',
    emergencyNumber: '112 / 0484-2394770',
    peakHours: '08:30 - 10:00 & 17:00 - 19:30'
  },
  'Hyderabad': {
    city: 'Hyderabad',
    country: 'India (Telangana)',
    timezone: 'Asia/Kolkata (IST)',
    utcOffset: 5.5,
    tempC: 29,
    condition: 'Clear Sky',
    humidity: 50,
    windKm: 11,
    aqi: 88,
    currencyCode: 'INR',
    currencySymbol: '₹',
    exchangeRateToInr: 1,
    forecast: [
      { day: 'Mon', temp: 30, icon: 'sun' },
      { day: 'Tue', temp: 31, icon: 'sun' },
      { day: 'Wed', temp: 29, icon: 'cloud' },
      { day: 'Thu', temp: 28, icon: 'sun' },
      { day: 'Fri', temp: 30, icon: 'sun' }
    ],
    advisory: 'Clear highway visibility on NH44 corridor. Smooth travel conditions expected.',
    emergencyNumber: '112 / 040-27852435',
    peakHours: '09:00 - 11:00 & 18:00 - 21:00'
  },
  'Dubai': {
    city: 'Dubai',
    country: 'United Arab Emirates',
    timezone: 'Asia/Dubai (GST)',
    utcOffset: 4.0,
    tempC: 34,
    condition: 'Hot & Clear',
    humidity: 45,
    windKm: 20,
    aqi: 95,
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    exchangeRateToInr: 22.85,
    forecast: [
      { day: 'Mon', temp: 34, icon: 'sun' },
      { day: 'Tue', temp: 35, icon: 'sun' },
      { day: 'Wed', temp: 36, icon: 'sun' },
      { day: 'Thu', temp: 34, icon: 'sun' },
      { day: 'Fri', temp: 33, icon: 'sun' }
    ],
    advisory: 'High daytime temperatures. Keep electronics out of direct sunlight.',
    emergencyNumber: '999 (Police) / 998 (Ambulance)',
    peakHours: '07:30 - 09:30 & 17:30 - 20:00'
  },
  'Singapore': {
    city: 'Singapore',
    country: 'Singapore',
    timezone: 'Asia/Singapore (SGT)',
    utcOffset: 8.0,
    tempC: 29,
    condition: 'Tropical Humid',
    humidity: 80,
    windKm: 10,
    aqi: 32,
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    exchangeRateToInr: 63.40,
    forecast: [
      { day: 'Mon', temp: 29, icon: 'rain' },
      { day: 'Tue', temp: 30, icon: 'cloud' },
      { day: 'Wed', temp: 29, icon: 'rain' },
      { day: 'Thu', temp: 30, icon: 'sun' },
      { day: 'Fri', temp: 31, icon: 'cloud' }
    ],
    advisory: 'Frequent brief tropical showers. Clean air with high moisture index.',
    emergencyNumber: '999 (Police) / 995 (Ambulance)',
    peakHours: '08:00 - 09:30 & 18:00 - 20:00'
  },
  'London': {
    city: 'London',
    country: 'United Kingdom',
    timezone: 'Europe/London (BST/GMT)',
    utcOffset: 1.0,
    tempC: 16,
    condition: 'Overcast & Cool',
    humidity: 72,
    windKm: 22,
    aqi: 28,
    currencyCode: 'GBP',
    currencySymbol: '£',
    exchangeRateToInr: 108.50,
    forecast: [
      { day: 'Mon', temp: 15, icon: 'cloud' },
      { day: 'Tue', temp: 16, icon: 'rain' },
      { day: 'Wed', temp: 14, icon: 'rain' },
      { day: 'Thu', temp: 17, icon: 'sun' },
      { day: 'Fri', temp: 18, icon: 'cloud' }
    ],
    advisory: 'Brisk temperatures and occasional rain. Waterproof outerwear advised.',
    emergencyNumber: '999 / 112',
    peakHours: '07:30 - 09:30 & 17:00 - 19:30'
  }
};

const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rateToInr: 83.95 },
  { code: 'EUR', name: 'Euro', symbol: '€', rateToInr: 91.20 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rateToInr: 108.50 },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', rateToInr: 22.85 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rateToInr: 63.40 },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', rateToInr: 2.45 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rateToInr: 0.58 }
];

export const DestinationSnapshotWidget: React.FC = () => {
  const [selectedCityKey, setSelectedCityKey] = useState<string>('Bengaluru');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Currency Converter State
  const [convAmount, setConvAmount] = useState<number>(1000);
  const [sourceCurrency, setSourceCurrency] = useState<string>('INR');
  const [targetCurrency, setTargetCurrency] = useState<string>('USD');

  // Clock Ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cityData = DESTINATION_DATABASE[selectedCityKey] || DESTINATION_DATABASE['Bengaluru'];

  // Calculate destination local time based on UTC offset
  const getDestinationTime = (utcOffset: number) => {
    const now = new Date();
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const destMs = utcMs + utcOffset * 3600000;
    return new Date(destMs);
  };

  const destTime = getDestinationTime(cityData.utcOffset);
  const destHours = destTime.getHours();
  const isNight = destHours < 6 || destHours >= 19;

  // Currency Calculation
  const getRate = (code: string) => {
    if (code === 'INR') return 1;
    const item = COMMON_CURRENCIES.find(c => c.code === code);
    return item ? item.rateToInr : 1;
  };

  const calculateConvertedAmount = () => {
    const fromRate = getRate(sourceCurrency);
    const toRate = getRate(targetCurrency);
    // In INR terms: amount * fromRate
    const amountInInr = convAmount * fromRate;
    const converted = amountInInr / toRate;
    return converted.toFixed(2);
  };

  const handleSwapCurrencies = () => {
    const prevSrc = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(prevSrc);
  };

  const displayTemp = (celsius: number) => {
    if (tempUnit === 'C') return `${celsius}°C`;
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  };

  return (
    <div className="bg-[#16181F] border border-white/10 rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl font-mono">
      
      {/* Header & City Selector */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display font-bold text-white text-lg">Destination Snapshot™</h3>
              <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                Real-Time Telemetry
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Live weather forecast, multi-currency converter, and destination local clock dashboard.
            </p>
          </div>
        </div>

        {/* City Selection Dropdown & Pills */}
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
          <select
            value={selectedCityKey}
            onChange={(e) => {
              setSelectedCityKey(e.target.value);
              if (DESTINATION_DATABASE[e.target.value]?.currencyCode !== 'INR') {
                setTargetCurrency(DESTINATION_DATABASE[e.target.value].currencyCode);
              }
            }}
            className="bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {Object.keys(DESTINATION_DATABASE).map((cityName) => (
              <option key={cityName} value={cityName}>
                {cityName} ({DESTINATION_DATABASE[cityName].country})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: 3 Core Widgets (Weather, Local Time & Clock, Currency Converter) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* ==========================================
            1. REAL-TIME WEATHER INTELLIGENCE
           ========================================== */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase">
              <CloudSun className="w-4 h-4" />
              <span>Weather Intelligence</span>
            </div>
            <button
              onClick={() => setTempUnit(tempUnit === 'C' ? 'F' : 'C')}
              className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] text-gray-300 transition-colors cursor-pointer"
            >
              Switch to °{tempUnit === 'C' ? 'F' : 'C'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-display font-extrabold text-white tracking-tight">
                {displayTemp(cityData.tempC)}
              </div>
              <div className="text-xs text-cyan-300 font-semibold mt-0.5">
                {cityData.condition}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              {cityData.condition.includes('Rain') || cityData.condition.includes('Shower') ? (
                <CloudRain className="w-8 h-8" />
              ) : isNight ? (
                <Moon className="w-8 h-8 text-indigo-300" />
              ) : (
                <Sun className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>

          {/* Micro Telemetry Metrics */}
          <div className="grid grid-cols-3 gap-2 text-[10px] bg-white/5 p-2 rounded-xl border border-white/5">
            <div>
              <span className="text-gray-400 block">Humidity</span>
              <span className="text-white font-bold">{cityData.humidity}%</span>
            </div>
            <div>
              <span className="text-gray-400 block">Wind</span>
              <span className="text-white font-bold">{cityData.windKm} km/h</span>
            </div>
            <div>
              <span className="text-gray-400 block">Air Quality</span>
              <span className="text-emerald-400 font-bold">AQI {cityData.aqi}</span>
            </div>
          </div>

          {/* 5-Day Outlook Pills */}
          <div className="space-y-1.5">
            <span className="text-[9px] text-gray-400 uppercase tracking-wider block">5-Day Outlook</span>
            <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
              {cityData.forecast.map((f, i) => (
                <div key={i} className="p-1.5 rounded-lg bg-white/5 border border-white/5 space-y-1">
                  <span className="text-gray-400 block text-[9px]">{f.day}</span>
                  <span className="text-white font-bold block">{displayTemp(f.temp)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[10px] text-cyan-200">
            💡 {cityData.advisory}
          </div>
        </div>

        {/* ==========================================
            2. DESTINATION LOCAL TIME & WORLD CLOCK
           ========================================== */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 relative flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase">
              <Clock className="w-4 h-4" />
              <span>Destination Clock</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center space-x-1 ${
              isNight ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'
            }`}>
              {isNight ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
              <span>{isNight ? 'Night' : 'Daytime'}</span>
            </span>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-3xl font-mono font-extrabold text-white tracking-widest tabular-nums">
              {destTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-xs text-purple-300 font-semibold">
              {destTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-gray-400">Timezone:</span>
              <span className="font-bold text-white">{cityData.timezone}</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-gray-400">UTC Offset:</span>
              <span className="font-bold text-white">UTC {cityData.utcOffset >= 0 ? `+${cityData.utcOffset}` : cityData.utcOffset}</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span className="text-gray-400">Peak Traffic Hours:</span>
              <span className="font-bold text-amber-300 text-[10px]">{cityData.peakHours}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[10px] text-purple-200">
            🛡️ Local Emergency: <strong className="text-white">{cityData.emergencyNumber}</strong>
          </div>
        </div>

        {/* ==========================================
            3. MULTI-CURRENCY CONVERTER
           ========================================== */}
        <div className="p-5 rounded-2xl bg-black/40 border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center space-x-2 text-[#E7CB58] text-xs font-bold uppercase">
              <DollarSign className="w-4 h-4" />
              <span>Currency Converter</span>
            </div>
            <span className="text-[10px] text-gray-400">Live Interbank</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Amount & Source Currency */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 block uppercase">You Convert</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={convAmount}
                  onChange={(e) => setConvAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#E7CB58]"
                />
                <select
                  value={sourceCurrency}
                  onChange={(e) => setSourceCurrency(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-xl px-2.5 py-2 text-white text-xs font-bold cursor-pointer"
                >
                  <option value="INR">INR (₹)</option>
                  {COMMON_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Swap Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleSwapCurrencies}
                className="p-1.5 rounded-full bg-white/10 hover:bg-[#E7CB58]/20 hover:text-[#E7CB58] text-gray-300 transition-all cursor-pointer border border-white/10"
                title="Swap currencies"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Target Currency & Result */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-gray-400 block uppercase">Converted Value</label>
                <select
                  value={targetCurrency}
                  onChange={(e) => setTargetCurrency(e.target.value)}
                  className="bg-black/60 border border-white/20 rounded-lg px-2 py-1 text-white text-[10px] font-bold cursor-pointer"
                >
                  <option value="INR">INR (₹)</option>
                  {COMMON_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-[#E7CB58]/10 border border-[#E7CB58]/30 flex items-center justify-between">
                <span className="text-xl font-display font-extrabold text-[#E7CB58]">
                  {calculateConvertedAmount()} {targetCurrency}
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  1 {sourceCurrency} ≈ {(getRate(sourceCurrency) / getRate(targetCurrency)).toFixed(3)} {targetCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Amount Buttons */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/5 text-[10px]">
            {[500, 1000, 2500, 5000].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setConvAmount(val)}
                className="px-2 py-1 rounded bg-white/5 hover:bg-white/15 text-gray-300 transition-colors cursor-pointer"
              >
                ₹{val}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
