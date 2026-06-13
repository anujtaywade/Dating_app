console.log("LoginScreen rendering");

import React, { useState, useRef, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

import { useRouter } from 'expo-router';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useGoogleLogin } from '@/hooks/useGoogleAuth';
import { loginWithFirebaseToken } from '@/services/authApi';
import { signInWithPhoneNumber } from "firebase/auth";



// ─── Types ────────────────────────────────────────────────────────────────────
interface LoginScreenProps {
  navigation?: { navigate: (screen: string) => void };
}

type FocusedField = 'phone' | null;

// ─── Dot particle ─────────────────────────────────────────────────────────────
interface DotProps { x: number; y: number; delay: number }

const Dot: React.FC<DotProps> = ({ x, y, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 1200, useNativeDriver: true }),
        Animated.delay(2200),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, opacity]);
  return (
    <Animated.View style={{
      position: 'absolute', left: x, top: y,
      width: 5, height: 5, borderRadius: 3,
      backgroundColor: '#e8845a', opacity,
    }} />
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { width, height } = useWindowDimensions();
  const router = useRouter();
  const [googleRequest, googleResponse, promptGoogleLogin] = useGoogleLogin();

  const [phone, setPhone] = useState<string>('');
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [confirmation, setConfirmation] = useState(null);

  const headerY = useRef(new Animated.Value(-24)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formY = useRef(new Animated.Value(32)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.spring(headerY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(formY, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(formOpacity, { toValue: 1, duration: 480, useNativeDriver: true }),
      ]),
    ]).start();
  }, [formOpacity, formY, headerOpacity, headerY]);

  useEffect(() => {
    const completeGoogleLogin = async () => {

       console.log("Google Response:", JSON.stringify(googleResponse));
      
      if (googleResponse?.type !== 'success') {
        return;
      }

      const idToken =
        googleResponse.authentication?.idToken || googleResponse.params?.id_token;

        console.log("Google Params:", googleResponse.params);
console.log("ID Token:", idToken);

      if (!idToken) {
        Alert.alert('Google sign in failed', 'Google did not return an ID token.');
        setIsGoogleLoading(false);
        return;
      }

      try {
  console.log("🔥 Step 1: Firebase credential create");

  const credential = GoogleAuthProvider.credential(idToken);

  const userCredential = await signInWithCredential(auth, credential);

  console.log("🔥 Step 2: Firebase sign-in success");

  const firebaseToken = await userCredential.user.getIdToken();

  console.log("🔥 Step 3: Firebase token received");

  const res = await loginWithFirebaseToken(firebaseToken);

  console.log("🔥 Step 4: Backend response:", res);

  if (!res?.success) {
    throw new Error("Backend login failed");
  }

  router.replace('/(tabs)');
} catch (error) {
  Alert.alert(
    'Google sign in failed',
    error instanceof Error ? error.message : 'Please try again.'
  );
  console.error("❌ Full auth error:", error);
} finally {
  setIsGoogleLoading(false);
}
    };

    completeGoogleLogin();
  }, [googleResponse, router]);

 const handleLogin = async () => {
  try {
    const fullPhone = "+91" + phone;

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=${process.env.EXPO_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: fullPhone,
          recaptchaToken: "ignored"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const data = await res.json();

    console.log("OTP SENT:", data);

    router.push({
      pathname: "/(auth)/Otpverifyscreen",
      params: {
        sessionInfo: data.sessionInfo,
        phone: fullPhone
      }
    });

  } catch (err) {
    console.log(err);
    Alert.alert("OTP send failed");
  }
};

  const handleGoogleLogin = async (): Promise<void> => {
  try {
    console.log("REQUEST BEFORE PROMPT:", googleRequest);
    if (!googleRequest) {
      Alert.alert('Not ready', 'Google login not initialized yet');
      return;
    }
    setIsGoogleLoading(true);
    await promptGoogleLogin();
  } catch (error) {
    setIsGoogleLoading(false);
    Alert.alert(
      'Google sign in failed',
      error instanceof Error ? error.message : 'Please try again.'
    );
  }
};

  // Responsive sizing
  const isSmall = height < 680;
  const logoSize = isSmall ? 52 : 64;
  const logoFontSize = isSmall ? 22 : 28;
  const appNameSize = isSmall ? 26 : 30;
  const headerMarginBottom = isSmall ? 20 : 32;
  const cardPadding = isSmall ? 20 : 26;
  const cardPaddingTop = isSmall ? Platform.OS === 'ios' ? 52 : 36 : Platform.OS === 'ios' ? 72 : 52;

  const dots: DotProps[] = [
    { x: width * 0.06, y: height * 0.10, delay: 0 },
    { x: width * 0.88, y: height * 0.16, delay: 600 },
    { x: width * 0.12, y: height * 0.70, delay: 1200 },
    { x: width * 0.84, y: height * 0.62, delay: 900 },
    { x: width * 0.50, y: height * 0.06, delay: 400 },
    { x: width * 0.93, y: height * 0.42, delay: 1500 },
    { x: width * 0.04, y: height * 0.40, delay: 700 },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6ee" />

      <View style={styles.bg} />
      <View style={[styles.bgAccentTop, { width: width * 0.75, height: width * 0.75, borderRadius: width * 0.375 }]} />
      <View style={[styles.bgAccentBottom, { width: width * 0.65, height: width * 0.65, borderRadius: width * 0.325 }]} />

      {dots.map((d, i) => <Dot key={i} {...d} />)}

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: cardPaddingTop, paddingHorizontal: Math.max(16, width * 0.05) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <Animated.View style={[styles.header, { marginBottom: headerMarginBottom, opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
          <View style={[styles.logoRing, { width: logoSize, height: logoSize, borderRadius: logoSize / 2, marginBottom: isSmall ? 10 : 14 }]}>
            <Text style={[styles.logoGlyph, { fontSize: logoFontSize }]}>⊕</Text>
          </View>
          <Text style={[styles.appName, { fontSize: appNameSize }]}>CrossCampus</Text>
          <Text style={styles.tagline}>meet people where you are</Text>
        </Animated.View>

        {/* ── Card ── */}
        <Animated.View style={[styles.card, { padding: cardPadding, opacity: formOpacity, transform: [{ translateY: formY }] }]}>

          {/* Title centered */}
          <Text style={styles.cardTitle}>Sign in</Text>
          <Text style={styles.cardSub}>Good to have you back ✦</Text>

          {/* Phone input */}
          <View style={[styles.inputBox, focusedField === 'phone' && styles.inputBoxFocused]}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇮🇳  +91</Text>
            </View>
            <View style={styles.inputDivider} />
            <TextInput
              style={styles.inputText}
              placeholder="98765 43210"
              placeholderTextColor="#c4a98a"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* CTA */}
          <View style={{ height: 8 }} />
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity style={styles.ctaBtn} onPress={handleLogin} activeOpacity={0.88}>
              <Text style={styles.ctaLabel}>Send OTP →</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            activeOpacity={0.85}
            disabled={isGoogleLoading}
            onPress={handleGoogleLogin}
          >
            <View style={styles.googleIconWrap}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            {isGoogleLoading ? (
              <ActivityIndicator color="#4a2c10" />
            ) : (
              <Text style={styles.googleLabel}>Continue with Google</Text>
            )}
          </TouchableOpacity>

        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fdf6ee',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fdf6ee',
  },
  bgAccentTop: {
    position: 'absolute',
    top: -100,
    right: -60,
    backgroundColor: '#f5c9a0',
    opacity: 0.3,
  },
  bgAccentBottom: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    backgroundColor: '#e8845a',
    opacity: 0.11,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
  },

  // Header
  header: {
    alignItems: 'center',
    width: '100%',
  },
  logoRing: {
    borderWidth: 2,
    borderColor: '#e8845a',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,132,90,0.08)',
    shadowColor: '#e8845a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  logoGlyph: {
    color: '#e8845a',
  },
  appName: {
    fontWeight: '800',
    color: '#2d1a0e',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 13,
    color: '#a07050',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#fffaf4',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#f0dcc8',
    shadowColor: '#c07040',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d1a0e',
    marginBottom: 3,
    textAlign: 'center',
  },
  cardSub: {
    fontSize: 13,
    color: '#a07050',
    marginBottom: 22,
    textAlign: 'center',
  },

  // Inputs
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdf0e4',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e8d0b8',
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputBoxFocused: {
    borderColor: '#e8845a',
    backgroundColor: '#fff8f2',
  },
  inputEmoji: {
    fontSize: 16,
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: '#2d1a0e',
    letterSpacing: 0.2,
  },
  countryCode: {
    paddingRight: 10,
  },
  countryCodeText: {
    fontSize: 14,
    color: '#6b3f1e',
    fontWeight: '600',
  },
  inputDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#e0c8b0',
    marginRight: 12,
  },
  // CTA
  ctaBtn: {
    backgroundColor: '#e8845a',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#e8845a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e8d0b8',
  },
  dividerLabel: {
    fontSize: 12,
    color: '#b08060',
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Google
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e0cdb8',
    paddingVertical: 13,
    backgroundColor: '#fdf6ee',
  },
  googleIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0d0c0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a2c10',
    letterSpacing: 0.2,
  },
});
