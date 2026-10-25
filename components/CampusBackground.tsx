import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';
export default function CampusBackground(){return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
  <Svg width="100%" height="100%"><Defs>
    <LinearGradient id="base" x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#182431"/><Stop offset="0.65" stopColor="#111A24"/><Stop offset="1" stopColor="#16232E"/></LinearGradient>
    <RadialGradient id="warm" cx="94%" cy="4%" r="78%"><Stop offset="0" stopColor="#C17E63" stopOpacity="0.21"/><Stop offset="1" stopColor="#C17E63" stopOpacity="0"/></RadialGradient>
    <RadialGradient id="cool" cx="0%" cy="100%" r="82%"><Stop offset="0" stopColor="#8CA9A4" stopOpacity="0.13"/><Stop offset="1" stopColor="#8CA9A4" stopOpacity="0"/></RadialGradient>
    <Pattern id="lines" width="65" height="65" patternUnits="userSpaceOnUse"><Path d="M65 0H0V65" stroke="rgba(242,230,208,0.025)" fill="none" strokeWidth="1"/></Pattern>
  </Defs><Rect width="100%" height="100%" fill="url(#base)"/><Rect width="100%" height="100%" fill="url(#warm)"/><Rect width="100%" height="100%" fill="url(#cool)"/><Rect width="100%" height="100%" fill="url(#lines)"/></Svg>
</View>}
