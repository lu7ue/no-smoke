import React from 'react';
import {View, Animated} from 'react-native';
import {Tabs} from "expo-router";
import {icons} from "../../constants/icons";

const TabIcon = ({ focused, icon }: any) => {
    const scaleValue = focused ? 1 : 0.8; // 放大一点

    return (
        <View className="size-full justify-center items-center mt-4">
            <Animated.Image
                source={icon}
                tintColor={focused ? '#374151' : '#6b7280'}
                style={{
                    width: 30,
                    height: 30,
                    transform: [{ scale: scaleValue }],
                }}
            />
        </View>
    );
};

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle:{
                    width:'100%',
                    height:'100%',
                    justifyContent:'center',
                    alignItems:'center'
                },
                tabBarStyle:{
                    // borderTopWidth: 0.5,
                    // borderTopColor: '#6b7280',
                    height:70
,                }
            }}
        >
            <Tabs.Screen
            name="index"
            options={{
                title: "No Smoke", // home
                headerShown: true,
                tabBarIcon: ({ focused }) => (
                    <TabIcon
                    focused={focused}
                    icon={icons.home}
                    />
                )
            }}
            />
            <Tabs.Screen
                name="records"
                options={{
                    title: "No Smoke", // Records
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.records}
                        />
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "No Smoke", // Profile
                    headerShown: true,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            focused={focused}
                            icon={icons.profile}
                        />
                    )
                }}
            />
        </Tabs>
    )
}

export default _Layout;