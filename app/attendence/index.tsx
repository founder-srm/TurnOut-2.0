import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Alert, Text, Button } from 'react-native';

export default function History() {
  const router = useRouter();
  const { qrLink } = useLocalSearchParams();

  const [students, setStudents] = useState([
    { regNo: 'RA2211003010663', color: 'red' },
    { regNo: 'RA2211003010686', color: 'red' },
    { regNo: 'RA2211003010660', color: 'red' },
    { regNo: 'RA2211003010661', color: 'red' },
  ]);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem('students');
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents));
        }
      } catch (error) {
        console.log('Error loading student data from AsyncStorage:', error);
      }
    };

    loadAttendance();
  }, []);

  useEffect(() => {
    if (qrLink) {
      handleQrScan(qrLink);
    }
  }, [qrLink]);

  const handleQrScan = async (scannedRegNo: any) => {
    const formattedScannedRegNo = scannedRegNo.trim().toUpperCase();

    const studentIndex = students.findIndex(
      (student) => student.regNo.toUpperCase() === formattedScannedRegNo
    );

    if (studentIndex !== -1) {
      if (students[studentIndex].color === 'green') {
        Alert.alert('Already marked as present', 'This student is already marked as present.');
      } else {
        const updatedStudents = students.map((student, i) =>
          i === studentIndex ? { ...student, color: 'green' } : student
        );
        setStudents(updatedStudents);
        await saveAttendance(updatedStudents);
      }
    } else {
      Alert.alert(
        'No Match',
        'The scanned QR code does not match any student registration number.'
      );
    }
  };

  const toggleAttendance = async (index: any) => {
    const updatedStudents = students.map((student, i) =>
      i === index ? { ...student, color: student.color === 'red' ? 'green' : 'red' } : student
    );
    setStudents(updatedStudents);
    await saveAttendance(updatedStudents);
  };

  const saveAttendance = async (updatedStudents: any) => {
    try {
      await AsyncStorage.setItem('students', JSON.stringify(updatedStudents));
    } catch (error) {
      console.log('Error saving student data to AsyncStorage:', error);
    }
  };

  return (
    <View className="flex-1 bg-[#333] items-center p-6">
      <View
        className="absolute top-12 left-5 z-10 bg-[#333] p-2 rounded-xl shadow-lg shadow-black"
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color="#FDB623" size={24} />
        </TouchableOpacity>
      </View>
      <Text className="mt-12 text-[#FDB623] text-3xl font-bold mb-5 text-center">
        Attendance
      </Text>

      {students.map((student, index) => (
        <Button
          key={student.regNo}
          title={student.regNo}
          color="#D9D9D9"
          className={`text-xl font-extrabold w-80 mb-2 ${student.color === 'red' ? 'bg-red-600' : 'bg-green-500'}`}
          onPress={() => toggleAttendance(index)}
        />
      ))}
    </View>
  );
}
