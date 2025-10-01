import React, {useEffect, useState} from 'react';
import {Platform, View, Text, Button, Alert, Linking} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

const LocationTracker = ({navigation}) => {
  const [location, setLocation] = useState(null);

  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    if (permissionStatus === RESULTS.GRANTED && location) {
      navigation.navigate('Dashboard');
    }
  }, [permissionStatus, location]);

  useEffect(() => {
    const checkLocationPermission = async () => {
      const permissionResult = await checkPermission();

      if (permissionResult === RESULTS.GRANTED) {
        setPermissionStatus(permissionResult);
        checkGpsEnabled();
      } else {
        requestPermissions();
      }
    };

    const checkPermission = async () => {
      const permission = Platform.select({
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      });

      const result = await check(permission);
      return result;
    };

    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        console.log("I am running");
    
        try {
          // Request both read and write storage permissions
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          ]);
    
          console.log("Permissions status:", granted);
    
          // Check if both permissions are granted
          if (
            granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
          ) {
            setHasPermission(true);
            console.log('Both permissions granted');
          } else {
            console.log('Storage permissions denied');
          }
        } catch (error) {
          console.log('Error requesting permissions:', error);
        }
      }
    };












    
    const checkGpsEnabled = () => {
      Geolocation.getCurrentPosition(
        position => {
          setLocation(position.coords);
        },
        error => {
          console.log('Error checking GPS:', error);
          Alert.alert('GPS Not Enabled', 'Please enable GPS to use this app.', [
            {
              text: 'Open Settings',
              onPress: () => {
                Linking.openSettings();
              },
            },
          ]);
        },
        {enableHighAccuracy: true},
      );
    };

    checkLocationPermission();
  }, []);

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>
        Requesting location permission... Please allow all permissions to access
        this App and restart
      </Text>
    </View>
  );
};

export default LocationTracker;
