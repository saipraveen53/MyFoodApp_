import { Redirect, useRootNavigationState } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
 
export default function Index() {
  const rootNavigationState = useRootNavigationState();
 
  if (!rootNavigationState?.key) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }
 
  return <Redirect href="/login" />;
}