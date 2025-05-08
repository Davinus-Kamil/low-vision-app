import React from 'react';
import { StyleProp, TextStyle, OpaqueColorValue } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; // ✅ Correct way

const MAPPING = {
  'gallery.fill': 'photo-library',
  'camera.fill': 'photo-camera',
  'pdf.fill': 'picture-as-pdf',
} as const;

export type IconSymbolName = keyof typeof MAPPING;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <MaterialIcons
      name={MAPPING[name] as keyof typeof MaterialIcons.glyphMap}
      size={size}
      color={color}
      style={style}
    />
  );
}
