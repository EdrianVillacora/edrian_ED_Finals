import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import CampusBackground from '@/components/CampusBackground';
import CampusButton from '@/components/CampusButton';
import { CAMPUS } from '@/constants/colors';
// import { STUDENT_ID } from '@/constants/student';
 import { useAuth } from '@/lib/auth';
import { registerAttendance } from '@/lib/attendance';
// import { registerAttendance } from '@/lib/database';

export default function ScanScreen() {
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const frameSize = Math.max(150, Math.min(250, width - 64, height * 0.37));
  const compact = width < 390 || height < 700;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastData, setLastData] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <CampusBackground />

        <View style={styles.permissionTile}>
          <Ionicons name="camera-outline" size={36} color={CAMPUS.accent} />
        </View>

        <Text style={styles.title}>Camera Permission Needed</Text>
        <Text style={styles.subtitle}>
          We need access to your camera to scan QR codes.
        </Text>

        <View style={styles.permissionButton}>
          <CampusButton
            variant="primary"
            title="Grant Permission"
            icon="camera"
            onPress={requestPermission}
          />
        </View>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setLastData(data);
    // registerAttendance(data, STUDENT_ID).then((result) => {
      const studentId = user?.id ?? 'unknown';
     registerAttendance(data, studentId).then((result) => {
      setMessage(result.message);
      setSuccess(result.success);
    });
  };

  const handleScanAgain = () => {
    setScanned(false);
    setLastData(null);
    setMessage(null);
  };

  // Look-only: colour of the scan frame and the status icon
  const hasResult = scanned && message !== null;
  const frameColor = hasResult
    ? success
      ? CAMPUS.mint
      : CAMPUS.danger
    : CAMPUS.accent;

  const statusIcon: keyof typeof Ionicons.glyphMap = hasResult
    ? success
      ? 'checkmark-circle'
      : 'alert-circle'
    : scanned
      ? 'scan'
      : 'qr-code-outline';

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Scanner frame */}
      <View style={styles.frameLayer} pointerEvents="none">
        <View style={[styles.topPill, { top: compact ? 10 : 20 }]}>
          <View style={[styles.pillDot, { backgroundColor: frameColor }]} />
          <Text style={styles.pillText}>
            {scanned ? 'CODE CAPTURED' : 'SCANNING'}
          </Text>
        </View>

        <View style={[styles.frame, { width: frameSize, height: frameSize, marginBottom: compact ? 115 : 90 }]}>
          <View style={[styles.corner, styles.cTL, { borderColor: frameColor }]} />
          <View style={[styles.corner, styles.cTR, { borderColor: frameColor }]} />
          <View style={[styles.corner, styles.cBL, { borderColor: frameColor }]} />
          <View style={[styles.corner, styles.cBR, { borderColor: frameColor }]} />
        </View>
      </View>

      <View style={[styles.overlay, compact && { left: 10, right: 10, bottom: 100, padding: 12, borderRadius: 19 }]}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusTile,
              { borderColor: frameColor, shadowColor: frameColor },
            ]}
          >
            <Ionicons name={statusIcon} size={22} color={frameColor} />
          </View>

          <Text style={styles.overlayText}>
            {scanned ? 'QR Code detected!' : 'Point your camera at a QR code'}
          </Text>
        </View>

        {scanned && message && (
          <View
            style={[
              styles.resultBox,
              success ? styles.resultSuccess : styles.resultError,
            ]}
          >
            <Text
              style={[styles.scanResult, success ? styles.success : styles.error]}
            >
              {message}
            </Text>
          </View>
        )}

        {scanned && lastData && (
          <Text style={styles.scanData} numberOfLines={2}>
            {lastData}
          </Text>
        )}

        {scanned && (
          <View style={styles.againButton}>
            <CampusButton
              variant="primary"
              title="Scan Again"
              icon="refresh"
              onPress={handleScanAgain}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const FRAME = 250;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CAMPUS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },

  /* Permission screen */
  permissionTile: {
    width: 80,
    height: 80,
    borderRadius: 26,
    backgroundColor: 'rgba(239,197,171,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,197,171,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: CAMPUS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: CAMPUS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: CAMPUS.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    maxWidth: 340,
  },
  permissionButton: {
    width: '100%',
    maxWidth: 340,
  },

  /* Scanner frame */
  frameLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topPill: {
    position: 'absolute',
    top: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(10,15,30,0.7)',
    borderWidth: 1,
    borderColor: CAMPUS.border,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pillText: {
    fontFamily: CAMPUS.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: CAMPUS.text,
  },
  frame: {
    width: FRAME,
    height: FRAME,
    marginBottom: 90,
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
  },
  cTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 22,
  },
  cTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 22,
  },
  cBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 22,
  },
  cBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 22,
  },

  /* Bottom glass panel */
  overlay: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 40,
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: 'rgba(10,15,30,0.86)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CAMPUS.border,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTile: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  overlayText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: CAMPUS.text,
  },
  resultBox: {
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  resultSuccess: {
    backgroundColor: 'rgba(87,227,162,0.12)',
    borderColor: 'rgba(87,227,162,0.4)',
  },
  resultError: {
    backgroundColor: CAMPUS.dangerBg,
    borderColor: CAMPUS.dangerBorder,
  },
  scanResult: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: 20,
  },
  success: {
    color: CAMPUS.mint,
  },
  error: {
    color: CAMPUS.danger,
  },
  scanData: {
    fontFamily: CAMPUS.mono,
    fontSize: 11,
    color: CAMPUS.textFaint,
    textAlign: 'center',
    marginTop: 12,
  },
  againButton: {
    marginTop: 14,
  },
});