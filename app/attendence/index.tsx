import React, { useState, useEffect } from "react"
import { 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  RefreshControl 
} from "react-native"
import { ChevronLeft } from "lucide-react-native"
import { useRouter } from "expo-router"
import { supabase } from "../../utils/supabase"

const DEFAULT_EVENT_ID = "32d20028-3b40-41f5-b14f-bee9a993e046"

type Registration = {
  id: string
  rollNumber: string
  fullName: string
  attendance: string
  eventTitle: string
}

export default function AttendanceScreen() {
  const router = useRouter()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      console.log("Fetching registrations for event:", DEFAULT_EVENT_ID)

      const { data, error } = await supabase
        .from("eventsregistrations")
        .select("id, details, attendance, event_title")
        .eq("event_id", DEFAULT_EVENT_ID)
        .eq("is_approved", "ACCEPTED")
        .order('attendance', { ascending: false }) // Present first, then Absent

      if (error) throw error

      const formattedRegistrations = data.map((registration) => ({
        id: registration.id,
        rollNumber: registration.details.rollNumber,
        fullName: registration.details.fullName,
        attendance: registration.attendance,
        eventTitle: registration.event_title,
      }))

      // Sort by roll number within each attendance status
      formattedRegistrations.sort((a, b) => {
        if (a.attendance !== b.attendance) {
          return a.attendance === "Present" ? -1 : 1
        }
        return a.rollNumber.localeCompare(b.rollNumber, undefined, { numeric: true })
      })

      setRegistrations(formattedRegistrations)
    } catch (error) {
      console.error("Error fetching registrations:", error)
      Alert.alert(
        "Error", 
        "Failed to load registration data. Please try again."
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const markAttendance = async (registrationId: string) => {
    try {
      const { error } = await supabase.rpc(
        "mark_attendance", 
        { registration_id: registrationId }
      )

      if (error) throw error

      // Refresh the registrations list
      await fetchRegistrations()
      
      // Show success message
      Alert.alert("Success", "Attendance marked successfully")
    } catch (error) {
      console.error("Error marking attendance:", error)
      Alert.alert(
        "Error", 
        "Failed to mark attendance. Please try again."
      )
    }
  }

  const resetAttendance = async () => {
    Alert.alert(
      "Confirm Reset",
      "Are you sure you want to reset attendance for all students?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true)
              const { error } = await supabase.rpc(
                'reset_attendance', 
                { input_event_id: DEFAULT_EVENT_ID }
              )

              if (error) {
                console.error("Reset error:", error)
                throw error
              }

              // Refresh the registrations list
              await fetchRegistrations()
              
              // Show success message
              Alert.alert(
                "Success", 
                "Attendance has been reset for all registrations"
              )
            } catch (error) {
              console.error("Error resetting attendance:", error)
              Alert.alert(
                "Error", 
                "Failed to reset attendance. Please try again."
              )
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    fetchRegistrations()
  }, [])

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FDB623" style={{alignItems:'center',justifyContent:'center',flex:1}} />
      </View>
    )
  }

  const presentCount = registrations.filter(r => r.attendance === "Present").length

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft color="#FDB623" size={24} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        {registrations[0]?.eventTitle || "Attendance"}
      </Text>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Present: {presentCount} / {registrations.length}
        </Text>
      </View>

      {/* Student List */}
      <ScrollView 
        style={styles.listContainer} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FDB623"
          />
        }
      >
        {registrations.length > 0 ? (
          registrations.map((registration) => (
            <TouchableOpacity
              key={registration.id}
              style={[
                styles.studentItem, 
                { backgroundColor: registration.attendance === "Present" ? "#34D399" : "#F87171" }
              ]}
              onPress={() => markAttendance(registration.id)}
            >
              <View style={styles.studentInfo}>
                <Text style={styles.rollNumberText}>
                  {registration.rollNumber}
                </Text>
                <Text style={styles.nameText}>
                  {registration.fullName}
                </Text>
              </View>
              <Text style={styles.statusText}>
                {registration.attendance}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noDataText}>
            No registrations found for this event.
          </Text>
        )}
      </ScrollView>

      {/* Reset Button */}
      <TouchableOpacity 
        style={styles.resetButton} 
        onPress={resetAttendance}
      >
        <Text style={styles.resetButtonText}>Reset Attendance</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#333333",
    alignItems: "center",
    padding: 16,
  },
  backButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#333333",
    borderRadius: 5,
  },
  title: {
    marginTop: 100,
    marginBottom: 16,
    fontSize: 24,
    fontWeight: "bold",
    color: "#FDB623",
    textAlign: "center",
  },
  statsContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#444444",
    borderRadius: 8,
    width: "100%",
  },
  statsText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  listContainer: {
    width: "100%",
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  studentItem: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
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
  rollNumberText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  nameText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginTop: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "500",
    fontSize: 14,
  },
  noDataText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: "#EF4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
})