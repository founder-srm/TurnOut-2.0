// app/(app)/attendance.tsx
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';

import { supabase } from '~/utils/supabase';

type Event = {
  id: string;
  title: string;
};

type Registration = {
  id: string;
  email: string;
  attendance: string;
  eventTitle: string;
};

export default function AttendanceScreen() {
  const router = useRouter();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showEventPicker, setShowEventPicker] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchRegistrations();
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEvents(data);
      if (data.length > 0) {
        setSelectedEventId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    }
  };

  const fetchRegistrations = async () => {
    if (!selectedEventId) return;

    try {
      setLoading(true);
      console.log('Fetching registrations for event:', selectedEventId);

      const { data, error } = await supabase
        .from('eventsregistrations')
        .select('id, registration_email, attendance, event_title')
        .eq('event_id', selectedEventId)
        .eq('is_approved', 'ACCEPTED')
        .order('attendance', { ascending: false });

      if (error) throw error;

      const formattedRegistrations = data.map((registration) => ({
        id: registration.id,
        email: registration.registration_email,
        attendance: registration.attendance,
        eventTitle: registration.event_title,
      }));

      formattedRegistrations.sort((a, b) => {
        if (a.attendance !== b.attendance) {
          return a.attendance === 'Present' ? -1 : 1;
        }
        return a.email.localeCompare(b.email);
      });

      setRegistrations(formattedRegistrations);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      Alert.alert('Error', 'Failed to load registration data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAttendance = async (registrationId: string) => {
    try {
      const { error } = await supabase.rpc('mark_attendance', { registration_id: registrationId });

      if (error) throw error;
      await fetchRegistrations();
      Alert.alert('Success', 'Attendance marked successfully');
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance. Please try again.');
    }
  };

  const resetAttendance = async () => {
    if (!selectedEventId) return;

    Alert.alert('Confirm Reset', 'Are you sure you want to reset attendance for all students?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const { error } = await supabase.rpc('reset_attendance', {
              input_event_id: selectedEventId,
            });

            if (error) throw error;
            await fetchRegistrations();
            Alert.alert('Success', 'Attendance has been reset for all registrations');
          } catch (error) {
            console.error('Error resetting attendance:', error);
            Alert.alert('Error', 'Failed to reset attendance. Please try again.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRegistrations();
  }, [selectedEventId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FDB623" style={styles.loader} />
      </View>
    );
  }

  const presentCount = registrations.filter((r) => r.attendance === 'Present').length;
  const selectedEvent = events.find((event) => event.id === selectedEventId);

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft color="#FDB623" size={24} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.eventSelector} onPress={() => setShowEventPicker(true)}>
        <Text style={styles.eventSelectorText}>{selectedEvent?.title || 'Select Event'}</Text>
      </TouchableOpacity>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Present: {presentCount} / {registrations.length}
        </Text>
      </View>

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FDB623" />
        }>
        {registrations.length > 0 ? (
          registrations.map((registration) => (
            <TouchableOpacity
              key={registration.id}
              style={[
                styles.studentItem,
                { backgroundColor: registration.attendance === 'Present' ? '#34D399' : '#F87171' },
              ]}
              onPress={() => markAttendance(registration.id)}>
              <View style={styles.studentInfo}>
                <Text style={styles.emailText}>{registration.email}</Text>
              </View>
              <Text style={styles.statusText}>{registration.attendance}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>No registrations found for this event.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.resetButton} onPress={resetAttendance}>
        <Text style={styles.resetButtonText}>Reset Attendance</Text>
      </TouchableOpacity>

      <Modal
        visible={showEventPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEventPicker(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Event</Text>
            <ScrollView>
              {events.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventItem}
                  onPress={() => {
                    setSelectedEventId(event.id);
                    setShowEventPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.eventItemText,
                      selectedEventId === event.id && styles.selectedEventText,
                    ]}>
                    {event.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowEventPicker(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333',
    alignItems: 'center',
    padding: 16,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#333333',
    borderRadius: 5,
  },
  eventSelector: {
    marginTop: 100,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#444444',
    borderRadius: 8,
    width: '100%',
  },
  eventSelectorText: {
    color: '#FDB623',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#444444',
    borderRadius: 8,
    width: '100%',
  },
  statsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  studentItem: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  studentInfo: {
    flex: 1,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FDB623',
    marginBottom: 16,
    textAlign: 'center',
  },
  eventItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444444',
  },
  eventItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedEventText: {
    color: '#FDB623',
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 16,
    backgroundColor: '#444444',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
