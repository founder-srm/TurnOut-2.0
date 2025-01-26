import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Linking, Alert, Text, Image } from 'react-native';

import dlt from '../../assets/delete.png';
import qr_logo from '../../assets/qr_logo.png';

interface QRData {
  link: string;
  scanTime: string;
}

export default function Two() {
  const [qrDataList, setQrDataList] = useState<QRData[]>([]);
  const { qrLink, scanTime } = useLocalSearchParams();
  const router = useRouter();

  const loadQrData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('qrDataList');
      if (storedData) {
        setQrDataList(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Failed to load QR data:', error);
    }
  };

  const saveQrData = async (data: QRData[]) => {
    try {
      await AsyncStorage.setItem('qrDataList', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save QR data:', error);
    }
  };

  useEffect(() => {
    loadQrData();
  }, []);

  useEffect(() => {
    if (qrLink && scanTime && !qrDataList.some((item) => item.link === qrLink)) {
      const updatedData = [...qrDataList, { link: qrLink as string, scanTime: scanTime as string }];
      setQrDataList(updatedData);
      saveQrData(updatedData);
    }
  }, [qrLink, scanTime, qrDataList]);

  const handleDelete = (indexToDelete: number) => {
    const updatedData = qrDataList.filter((_, index) => index !== indexToDelete);
    setQrDataList(updatedData);
    saveQrData(updatedData);
  };

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Something went wrong. Unable to open the link.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open the link.');
    }
  };

  return (
    <View className="flex-1 p-8 bg-[#333]">
      <View className="absolute top-12 left-5 z-10 bg-[#333] shadow-lg p-2 rounded">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#FDB623" size={24} />
        </TouchableOpacity>
      </View>

      <Text className="mt-12 text-[#FDB623] text-2xl font-bold text-center mb-5">
        History
      </Text>

      <ScrollView className="p-1 bg-[#333]">
        {qrDataList.length === 0 ? (
          <Text className="text-[#D9D9D9] mt-5 text-center">No QR codes scanned yet.</Text>
        ) : (
          qrDataList.map((item, index) => (
            <View
              key={index}
              className="mt-7 bg-[#303030] rounded-lg shadow-black shadow-xl h-16 w-84 justify-between items-center px-2"
            >
              <Image source={qr_logo} className="h-8 w-8" />
              <View className="flex-1 ml-2">
                <TouchableOpacity onPress={() => handleOpenLink(item.link)}>
                  <Text className="text-[#D9D9D9] text-lg" numberOfLines={1}>
                    {item.link}
                  </Text>
                  <Text className="text-[#A4A4A4] text-xs mt-1">
                    Scanned At: {item.scanTime}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => handleDelete(index)}>
                <Image source={dlt} className="h-6 w-6" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
