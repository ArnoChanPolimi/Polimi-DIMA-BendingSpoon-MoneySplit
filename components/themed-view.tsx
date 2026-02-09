
import { View, type ViewProps } from 'react-native';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // 默认透明背景，让背景图片透出来
  const backgroundColor = 'transparent';

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
