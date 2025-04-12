import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getDatabase } from '../../database/initDB.js';

type User = {
    avatar?: string;
    name?: string;
    target_days?: number;
    current_streak?: number;
};

const Profile = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const loadUser = async () => {
        const db = await getDatabase();
        const user = await db.getFirstAsync('SELECT * FROM users LIMIT 1');
        setUser(user);
        };
        
        loadUser();
    }, []);

    return (
        <View>
            <Text>Profile</Text>
            <Text>{user?.avatar}</Text>
            <Text>Name: {user?.name || 'NoSmoke User'}</Text>
            <Text>Target days: {user?.target_days}</Text>
            <Text>Current streak: {user?.current_streak}</Text>
        </View>
    )
}

export default Profile;
const styles = StyleSheet.create({})