import {View, Text} from 'react-native'
import React from 'react'
import { Slot } from 'expo-router';
import {SafeAreaView} from "react-native-safe-area-context";

export default function _Layout() {
    return (
        <SafeAreaView>
            <Text>Auth_Layout</Text>
            <Slot />
        </SafeAreaView>

    )
}
