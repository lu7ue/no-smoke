import { Stack } from "expo-router";
import './globals.css';

export default function RootLayout() {
  return (
      <Stack>
        <Stack.Screen
            name="(tabs)"
            options={{ headerShown: false }}
        />
        <Stack.Screen
            name="(modals)/settings/date"
            options={{
              title: '设置戒烟开始时间',
              headerBackTitle: '返回',
              headerBackVisible: true
            }}
        />
      </Stack>
  );
}