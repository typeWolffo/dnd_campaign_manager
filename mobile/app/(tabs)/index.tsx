import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StyleSheet
} from 'react-native';
import {
  Card,
  Button,
  Badge,
  Avatar,
  ActivityIndicator,
  FAB
} from 'react-native-paper';
import { router } from 'expo-router';
import { useSession, signOut } from '../../lib/auth-client';
import { useRooms } from '../../lib/api-hooks';

interface Room {
  id: string;
  name: string;
  description?: string | null;
  gmId?: string | null;
  createdAt?: string | Date;
  members?: Array<{
    id: string;
    userId: string;
    role: string;
    userName?: string | null;
    userEmail: string;
  }>;
}

export default function DashboardScreen() {
  const { data: session, isPending } = useSession();
  const { data: rooms, isLoading, error, refetch } = useRooms();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.replace('/auth/sign-in');
    }
  }, [session, isPending]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace('/auth/sign-in');
        },
      },
    });
  };

  const handleViewRoom = (roomId: string) => {
    // TODO: Navigate to campaign detail screen when implemented
    console.log('View room:', roomId);
  };

  const handleCreateRoom = () => {
    // TODO: Implement create room modal
    console.log('Create room');
  };

  if (isPending) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // For now, show debug info instead of redirecting
  // if (!session) {
  //   return null; // Will redirect in useEffect
  // }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.title}>D&D Campaign Manager</Text>
            <Text style={styles.subtitle}>
              Welcome back! (Debug mode)
            </Text>
          </View>
          <Button mode="outlined" onPress={handleSignOut} compact>
            Sign out
          </Button>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Debug Info Card */}
        <Card style={styles.card}>
          <Card.Title title="Debug Info" />
          <Card.Content>
            <Text style={styles.debugText}>
              Auth Status: {session ? 'Authenticated' : 'Not authenticated'}
            </Text>
            <Text style={styles.debugText}>
              Rooms Loading: {isLoading ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              Rooms Error: {error ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.debugText}>
              Rooms Count: {Array.isArray(rooms) ? rooms.length : 'N/A'}
            </Text>
          </Card.Content>
        </Card>

        {/* Campaigns Section */}
        <Card style={styles.card}>
          <Card.Title
            title="My Campaigns"
            subtitle={`${Array.isArray(rooms) ? rooms.length : 0} campaign${(Array.isArray(rooms) && rooms.length !== 1) ? 's' : ''}`}
          />
          <Card.Content>
            {isLoading ? (
              <View style={styles.statusContainer}>
                <ActivityIndicator />
                <Text style={styles.statusText}>Loading campaigns...</Text>
              </View>
            ) : error ? (
              <View style={styles.statusContainer}>
                <Text style={styles.errorText}>Failed to load campaigns</Text>
                <Text style={styles.debugText}>
                  Error: {error.toString()}
                </Text>
              </View>
            ) : !Array.isArray(rooms) || rooms.length === 0 ? (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>
                  No campaigns yet. Create your first campaign to get started!
                </Text>
              </View>
            ) : (
              <View style={styles.campaignsList}>
                {rooms.slice(0, 3).map((room: Room) => {
                  const memberCount = room.members?.length || 0;

                  return (
                    <TouchableOpacity
                      key={room.id}
                      onPress={() => handleViewRoom(room.id)}
                      style={styles.campaignItem}
                    >
                      <View style={styles.campaignHeader}>
                        <Text style={styles.campaignName} numberOfLines={1}>
                          {room.name || 'Unnamed Campaign'}
                        </Text>
                        <Badge>Campaign</Badge>
                      </View>

                      {room.description && (
                        <Text style={styles.campaignDescription} numberOfLines={1}>
                          {room.description}
                        </Text>
                      )}

                      <View style={styles.campaignFooter}>
                        <Text style={styles.memberCount}>
                          {memberCount} player{memberCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {rooms.length > 3 && (
                  <TouchableOpacity
                    onPress={() => {/* TODO: Navigate to all campaigns */}}
                    style={styles.viewAllButton}
                  >
                    <Text style={styles.viewAllText}>
                      View all {rooms.length} campaigns
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Create Campaign FAB */}
      <FAB
        icon="plus"
        label="New Campaign"
        onPress={handleCreateRoom}
        style={styles.fab}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  debugText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  statusText: {
    marginTop: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorText: {
    color: '#dc2626',
    textAlign: 'center',
  },
  campaignsList: {
    gap: 12,
  },
  campaignItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  campaignDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  campaignFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewAllButton: {
    padding: 12,
    alignItems: 'center',
  },
  viewAllText: {
    color: '#2563eb',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
  },
});
