// components/Header.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  leftIconColor?: string;
  rightIconColor?: string;
  showLeftIcon?: boolean;
  showRightIcon?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon = 'chevron-back',
  rightIcon = 'menu',
  onLeftPress,
  onRightPress,
  leftIconColor = '#000',
  rightIconColor = '#000',
  showLeftIcon,
  showRightIcon,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Icon */}
      <TouchableOpacity onPress={onLeftPress} style={styles.iconContainer} disabled={!onLeftPress}>
        {showLeftIcon && leftIcon && <Ionicons name={leftIcon} size={24} color={leftIconColor} />}
      </TouchableOpacity>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Right Icon */}
      <TouchableOpacity
        onPress={onRightPress}
        style={styles.iconContainer}
        disabled={!onRightPress}
      >
        {rightIcon && showRightIcon && (
          <Ionicons name={rightIcon} size={24} color={rightIconColor} />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Roboto-Bold',
    textAlign: 'center',
  },
});

export default Header;
