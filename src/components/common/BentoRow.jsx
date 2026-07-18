import React from 'react';
import { View, StyleSheet } from 'react-native';

export const BentoRow = ({ children, style }) => {
  return (
    <View style={[styles.row, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginBottom: 12,
    gap: 12,
  },
});
export default BentoRow;
