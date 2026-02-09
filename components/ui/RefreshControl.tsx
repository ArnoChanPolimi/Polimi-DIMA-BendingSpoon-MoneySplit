// components/ui/RefreshControl.tsx
import { useThemeColor } from "@/hooks/use-theme-color";
import { RefreshControl as RNRefreshControl, RefreshControlProps as RNRefreshControlProps } from "react-native";

interface RefreshControlProps extends RNRefreshControlProps {
  /**
   * Called when the user pulls down to refresh
   */
  onRefresh: () => void;
  /**
   * Whether the refresh is currently in progress
   */
  refreshing: boolean;
}

/**
 * A themed RefreshControl component that automatically adapts to light/dark theme
 * Typically used inside a ScrollView with scrollEnabled={true}
 * 
 * Example:
 * ```tsx
 * <ScrollView
 *   refreshControl={
 *     <RefreshControl 
 *       refreshing={loading} 
 *       onRefresh={handleRefresh}
 *     />
 *   }
 * >
 *   {children}
 * </ScrollView>
 * ```
 */
export default function RefreshControl({
  onRefresh,
  refreshing,
  ...props
}: RefreshControlProps) {
  // Get theme colors
  const tintColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  return (
    <RNRefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={tintColor}
      colors={[tintColor]}
      progressBackgroundColor={backgroundColor}
      {...props}
    />
  );
}
