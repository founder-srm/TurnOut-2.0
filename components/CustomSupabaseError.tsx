import { Text, View } from 'react-native';

export default function CustomSupabaseError({ error }: { error: string }) {
  return (
    <View>
      <Text>Supabase Error: {error}</Text>
    </View>
  );
}
