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
          <Stack.Screen
              name="(modals)/settings/money"
              options={{
                  title: '设置目标',
                  headerBackTitle: '返回',
                  headerBackVisible: true
              }}
          />
          <Stack.Screen
              name="(modals)/settings/info"
              options={{
                  title: '健康状态总览',
                  headerBackTitle: '返回',
                  headerBackVisible: true
              }}
          />
          <Stack.Screen
              name="(modals)/settings/export"
              options={{
                  title: '导出数据',
                  headerBackTitle: '返回',
                  headerBackVisible: true
              }}
          />
          <Stack.Screen
              name="(modals)/settings/import"
              options={{
                  title: '从JSON文件恢复数据',
                  headerBackTitle: '返回',
                  headerBackVisible: true
              }}
          />
      </Stack>
  );
}