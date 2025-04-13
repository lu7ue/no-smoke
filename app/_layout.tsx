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
          <Stack.Screen
              name="(modals)/settings/edit"
              options={{
                  title: '编辑用户信息',
                  headerBackTitle: '返回',
                  headerBackVisible: true
              }}
          />
      </Stack>
  );
}