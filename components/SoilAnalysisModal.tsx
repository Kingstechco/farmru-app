import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { BlurView } from 'expo-blur';
import { AppIcon as MaterialIcons } from './ui/AppIcon';
import { useThemeColors } from '@/hooks/useThemeColors';
import { store } from '@/utils/store';
import * as Haptics from 'expo-haptics';

interface SoilAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
}

type Mode = 'select' | 'iot' | 'manual';

export const SoilAnalysisModal = ({ visible, onClose }: SoilAnalysisModalProps) => {
  const theme = useThemeColors();
  const styles = getStyles(theme);
  const [mode, setMode] = useState<Mode>('select');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Manual form state
  const [n, setN] = useState('45');
  const [p, setP] = useState('32');
  const [k, setK] = useState('54');
  const [ph, setPh] = useState('6.8');

  useEffect(() => {
    if (!visible) {
      setMode('select');
      setIsScanning(false);
      setScanProgress(0);
    }
  }, [visible]);

  const startIoTScan = () => {
    setMode('iot');
    setIsScanning(true);
    setScanProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.1;
      setScanProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        completeScan();
      }
    }, 200);
  };

  const completeScan = () => {
    setIsScanning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.updateSoilData({
      nitrogen: 48,
      phosphorus: 34,
      potassium: 56,
      ph: 6.9
    });
    store.addActivity({ 
      title: 'IoT Soil Scan Complete', 
      subtitle: 'All nodes synchronized', 
      icon: 'sync', 
      color: theme.tintGreen 
    });
    setTimeout(onClose, 800);
  };

  const handleManualSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.updateSoilData({
      nitrogen: parseFloat(n),
      phosphorus: parseFloat(p),
      potassium: parseFloat(k),
      ph: parseFloat(ph)
    });
    store.addActivity({ 
      title: 'Lab Results Logged', 
      subtitle: 'Nutrient profiles updated', 
      icon: 'biotech', 
      color: theme.soilBrown 
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <BlurView intensity={theme.isDark ? 50 : 30} tint="dark" style={StyleSheet.absoluteFill} />
        </TouchableOpacity>

        <View style={styles.modalContent}>
          <BlurView intensity={theme.isDark ? 90 : 95} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
          
          <View style={styles.header}>
            <Text style={styles.title}>Soil Analysis Hub</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={20} color={theme.textSub} />
            </TouchableOpacity>
          </View>

          {mode === 'select' && (
            <View style={styles.selectionBody}>
              <Text style={styles.description}>How would you like to analyze your soil health?</Text>
              
              <TouchableOpacity style={styles.optionCard} onPress={startIoTScan}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                  <MaterialIcons name="sensors" size={28} color="#38bdf8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>IoT Rapid Scan</Text>
                  <Text style={styles.optionSub}>Sync with Field Nodes in real-time</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.textDim} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionCard} onPress={() => setMode('manual')}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(193, 154, 92, 0.1)' }]}>
                  <MaterialIcons name="biotech" size={28} color={theme.soilBrown} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionTitle}>Manual Lab Entry</Text>
                  <Text style={styles.optionSub}>Input detailed laboratory report data</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.textDim} />
              </TouchableOpacity>
            </View>
          )}

          {mode === 'iot' && (
            <View style={styles.scanBody}>
               <View style={styles.scanAnimationBox}>
                 <ActivityIndicator size="large" color={theme.tintGreen} />
                 <Text style={[styles.scanText, { marginTop: 24 }]}>
                   {scanProgress < 1 ? 'Handshaking with Nodes...' : 'Syncing Tactical Data...'}
                 </Text>
                 <View style={styles.progressBarBg}>
                   <View style={[styles.progressBarFill, { width: `${scanProgress * 100}%`, backgroundColor: theme.tintGreen }]} />
                 </View>
               </View>
            </View>
          )}

          {mode === 'manual' && (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.manualBody}>
              <Text style={styles.formTitle}>Enter Lab Results</Text>
              <View style={styles.formGrid}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nitrogen (N)</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={n} 
                    onChangeText={setN} 
                    keyboardType="numeric" 
                    placeholderTextColor={theme.textDim}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phosphorus (P)</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={p} 
                    onChangeText={setP} 
                    keyboardType="numeric" 
                    placeholderTextColor={theme.textDim}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Potassium (K)</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={k} 
                    onChangeText={setK} 
                    keyboardType="numeric" 
                    placeholderTextColor={theme.textDim}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>pH Level</Text>
                  <TextInput 
                    style={styles.textInput} 
                    value={ph} 
                    onChangeText={setPh} 
                    keyboardType="numeric" 
                    placeholderTextColor={theme.textDim}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
                <Text style={styles.submitBtnText}>Update Soil Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backBtn} onPress={() => setMode('select')}>
                <Text style={styles.backBtnText}>Go Back</Text>
              </TouchableOpacity>
            </ScrollView>
          )}

        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.glassBorder,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme.cardIconBg,
  },
  selectionBody: {
    zIndex: 1,
  },
  description: {
    fontSize: 14,
    color: theme.textSub,
    fontFamily: 'Outfit_400Regular',
    marginBottom: 24,
    lineHeight: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    marginBottom: 16,
    gap: 16,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_700Bold',
    color: theme.textMain,
  },
  optionSub: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: theme.textSub,
    marginTop: 2,
  },
  scanBody: {
    paddingVertical: 32,
    alignItems: 'center',
    zIndex: 1,
  },
  scanAnimationBox: {
    alignItems: 'center',
    width: '100%',
  },
  scanText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: theme.textMain,
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: theme.glassBorder,
    borderRadius: 4,
    marginTop: 24,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  manualBody: {
    zIndex: 1,
  },
  formTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: theme.textSub,
    marginBottom: 16,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  inputGroup: {
    width: '47%',
    gap: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: theme.textSub,
  },
  textInput: {
    backgroundColor: theme.glassBackground,
    borderWidth: 1,
    borderColor: theme.glassBorder,
    borderRadius: 12,
    padding: 12,
    color: theme.textMain,
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 16,
  },
  submitBtn: {
    backgroundColor: theme.tintGreen,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnText: {
    color: '#FFF',
    fontFamily: 'Outfit_700Bold',
    fontSize: 16,
  },
  backBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  backBtnText: {
    color: theme.textSub,
    fontFamily: 'Outfit_500Medium',
    fontSize: 14,
  }
});
