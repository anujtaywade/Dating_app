import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  useWindowDimensions,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';

import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "@/config/firebase";
import { loginWithFirebaseToken } from "@/services/authApi";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";




// ─── Types ────────────────────────────────────────────────────────────────────
interface OtpVerifyScreenProps {
  navigation?: { navigate: (screen: string) => void; goBack: () => void };
  route?: { params?: { phone?: string } };
}

const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 30;

// ─── Animated ring ────────────────────────────────────────────────────────────
const PulseRing: React.FC<{ size: number; color: string; delay: number }> = ({ size, color, delay }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1.55, duration: 1600, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 1600, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 1, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.4, duration: 0, useNativeDriver: true }),
        ]),
        Animated.delay(800),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, opacity, scale]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// ─── Single OTP box ───────────────────────────────────────────────────────────
interface OtpBoxProps {
  value: string;
  isFocused: boolean;
  isError: boolean;
  index: number;
  entryAnim: Animated.Value;
}

const OtpBox: React.FC<OtpBoxProps> = ({ value, isFocused, isError, index, entryAnim }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isError) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [isError, shakeAnim]);

  useEffect(() => {
    if (value) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.12, duration: 80, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 6, useNativeDriver: true }),
      ]).start();
    }
  }, [scaleAnim, value]);

  const translateY = entryAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const borderColor = isError
    ? '#d95f3b'
    : isFocused
    ? '#e8845a'
    : value
    ? '#c8a07a'
    : '#e8d0b8';

  const bg = isError
    ? 'rgba(217,95,59,0.07)'
    : isFocused
    ? '#fff8f2'
    : value
    ? '#fdf2e8'
    : '#fdf0e4';

  return (
    <Animated.View
      style={{
        transform: [{ translateX: shakeAnim }, { scale: scaleAnim }, { translateY }],
        opacity: entryAnim,
      }}
    >
      <View
        style={[
          styles.otpBox,
          {
            borderColor,
            backgroundColor: bg,
          },
        ]}
      >
        <Text style={[styles.otpChar, isError && { color: '#d95f3b' }]}>
          {value ? '•' : ''}
        </Text>
        {isFocused && !value && <View style={styles.cursor} />}
      </View>
    </Animated.View>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const OtpVerifyScreen: React.FC<OtpVerifyScreenProps> = ({ navigation, route }) => {
  const { width, height } = useWindowDimensions();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
 const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState<boolean>(false);
  const router = useRouter();
const { verificationId, phone: phoneParam } = useLocalSearchParams();
const phoneNumber = Array.isArray(phoneParam) ? phoneParam[0] : phoneParam ?? '';
  const inputRefs = useRef<(TextInput | null)[]>(Array(OTP_LENGTH).fill(null));
  const btnScale = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Entry animations per box
  const entryAnims = useRef(
    Array.from({ length: OTP_LENGTH }, () => new Animated.Value(0))
  ).current;

  // Header anims
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerY = useRef(new Animated.Value(-20)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Stagger entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(headerY, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(cardY, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      ]),
      Animated.stagger(
        60,
        entryAnims.map(a =>
          Animated.spring(a, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true })
        )
      ),
    ]).start(() => {
      inputRefs.current[0]?.focus();
    });
  }, [cardOpacity, cardY, entryAnims, headerOpacity, headerY]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = useCallback(
    (text: string, index: number) => {
      const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
      const newOtp = [...otp];
      newOtp[index] = cleaned;
      setOtp(newOtp);
      setIsError(false);

      if (cleaned && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [otp]
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (e.nativeEvent.key === 'Backspace') {
        if (!otp[index] && index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputRefs.current[index - 1]?.focus();
        }
      }
    },
    [otp]
  );

  const handleVerify = async () => {
  try {
    const code = otp.join("");

    const credential = PhoneAuthProvider.credential(
      verificationId as string,
      code
    );

    const userCredential = await signInWithCredential(auth, credential);

    const firebaseToken = await userCredential.user.getIdToken();

    const res = await loginWithFirebaseToken(firebaseToken);

    console.log("LOGIN SUCCESS", res);

    router.replace("/(tabs)");
  } catch (err) {
    console.log(err);
    setIsError(true);
    Alert.alert("Invalid OTP");
  }
};

  const handleResend = (): void => {
    if (!canResend) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    setIsError(false);
    setIsSuccess(false);
    setCountdown(RESEND_COUNTDOWN);
    setCanResend(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
    console.log('OTP resent');
  };

  const isSmall = height < 680;
  const cardPaddingTop = isSmall
    ? Platform.OS === 'ios' ? 44 : 28
    : Platform.OS === 'ios' ? 64 : 48;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6ee" />

      {/* Background */}
      <View style={styles.bg} />
      <View style={[styles.bgOrb1, { width: width * 0.75, height: width * 0.75, borderRadius: width * 0.375 }]} />
      <View style={[styles.bgOrb2, { width: width * 0.55, height: width * 0.55, borderRadius: width * 0.275 }]} />

      {/* Back button */}
      <TouchableOpacity
        style={[styles.backBtn, { top: cardPaddingTop - 8 }]}
        onPress={() => navigation?.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={[styles.scroll, { paddingTop: cardPaddingTop, paddingHorizontal: Math.max(16, width * 0.05) }]}>

        {/* ── Header ── */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerY }] }]}>
          {/* Icon with pulse rings */}
          <View style={styles.iconWrap}>
            <PulseRing size={72} color="#e8845a" delay={0} />
            <PulseRing size={72} color="#e8845a" delay={700} />
            <View style={styles.iconCircle}>
              <Text style={styles.iconGlyph}>✦</Text>
            </View>
          </View>

          <Text style={[styles.heading, { fontSize: isSmall ? 22 : 26 }]}>Verify your number</Text>
          <Text style={styles.subheading}>
            We sent a 6-digit code to{'\n'}
            <Text style={styles.phoneHighlight}>+91 {phoneNumber}</Text>
          </Text>
        </Animated.View>

        {/* ── Card ── */}
        <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardY }] }]}>

          {/* OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <View key={i} style={{ position: 'relative' }}>
                <OtpBox
                  value={digit}
                  isFocused={focusedIndex === i}
                  isError={isError}
                  index={i}
                  entryAnim={entryAnims[i]}
                />
                {/* Hidden real input */}
                <TextInput
                  ref={el => { inputRefs.current[i] = el; }}
                  style={styles.hiddenInput}
                  value={digit}
                  onChangeText={text => handleChange(text, i)}
                  onKeyPress={e => handleKeyPress(e, i)}
                  onFocus={() => setFocusedIndex(i)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={1}
                  caretHidden
                  selectTextOnFocus
                />
              </View>
            ))}
          </View>

          {/* Error hint */}
          {isError && (
            <Text style={styles.errorHint}>Please fill in all 6 digits</Text>
          )}

          {/* Verify button */}
          <Animated.View style={[{ transform: [{ scale: btnScale }] }, { marginTop: isError ? 12 : 24 }]}>
            <TouchableOpacity
              style={[styles.ctaBtn, isSuccess && styles.ctaBtnSuccess]}
              onPress={handleVerify}
              activeOpacity={0.88}
            >
              {isSuccess ? (
                <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, transform: [{ scale: successScale }], opacity: successOpacity }}>
                  <Text style={styles.ctaLabel}>Verified  ✓</Text>
                </Animated.View>
              ) : (
                <Text style={styles.ctaLabel}>Verify OTP →</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendMuted}>Didn&apos;t receive it? </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.resendTimer}>Resend in {countdown}s</Text>
            )}
          </View>

        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpVerifyScreen;

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
  bgOrb1: {
    position: 'absolute',
    top: -100,
    right: -70,
    backgroundColor: '#f5c9a0',
    opacity: 0.28,
  },
  bgOrb2: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    backgroundColor: '#e8845a',
    opacity: 0.1,
  },

  scroll: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backBtn: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fdf0e4',
    borderWidth: 1,
    borderColor: '#e8d0b8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#6b3f1e',
    fontWeight: '600',
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  iconWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(232,132,90,0.12)',
    borderWidth: 2,
    borderColor: '#e8845a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e8845a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  iconGlyph: {
    fontSize: 26,
    color: '#e8845a',
  },
  heading: {
    fontWeight: '800',
    color: '#2d1a0e',
    letterSpacing: 0.2,
    marginBottom: 8,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    color: '#a07050',
    textAlign: 'center',
    lineHeight: 22,
  },
  phoneHighlight: {
    fontWeight: '700',
    color: '#6b3f1e',
  },

  // Card
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#fffaf4',
    borderRadius: 24,
    padding: 26,
    borderWidth: 1,
    borderColor: '#f0dcc8',
    shadowColor: '#c07040',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },

  // OTP
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpChar: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d1a0e',
  },
  cursor: {
    width: 2,
    height: 22,
    backgroundColor: '#e8845a',
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    width: 46,
    height: 54,
    opacity: 0,
  },

  errorHint: {
    fontSize: 12,
    color: '#d95f3b',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
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
  ctaBtnSuccess: {
    backgroundColor: '#5a9e6e',
    shadowColor: '#5a9e6e',
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },

  // Resend
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  resendMuted: {
    fontSize: 13,
    color: '#a07050',
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e8845a',
  },
  resendTimer: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c09070',
  },
});
