import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export class NotificationService {
  private isInitialized = false;

  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications only available on native platforms');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      // Request permission
      const result = await PushNotifications.requestPermissions();
      if (result.receive === 'granted') {
        console.log('Push notification permission granted');
        
        // Register for push notifications
        await PushNotifications.register();
        
        // Setup listeners
        this.setupListeners();
        
        this.isInitialized = true;
      } else {
        console.log('Push notification permission denied');
      }
    } catch (error) {
      console.error('Error initializing push notifications:', error);
    }
  }

  private setupListeners() {
    // Registration listener
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Send this token to your backend
      this.sendTokenToBackend(token.value);
    });

    // Registration error listener
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Push notification received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ' + JSON.stringify(notification));
      // Handle the notification when app is in foreground
    });

    // Push notification action performed
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed: ' + JSON.stringify(notification));
      // Handle user interaction with notification
    });
  }

  private async sendTokenToBackend(token: string) {
    try {
      // Send token to your backend API
      const response = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ token, platform: Capacitor.getPlatform() }),
      });

      if (response.ok) {
        console.log('Push token registered successfully');
      }
    } catch (error) {
      console.error('Error sending push token to backend:', error);
    }
  }

  async scheduleLocalNotification(options: {
    title: string;
    body: string;
    id?: number;
    schedule?: { at: Date };
    largeBody?: string;
    summaryText?: string;
  }) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(options.title, {
          body: options.body,
          icon: '/icon-192.png',
        });
      }
      return;
    }

    try {
      const notifications = [
        {
          id: options.id || Date.now(),
          title: options.title,
          body: options.body,
          largeBody: options.largeBody,
          summaryText: options.summaryText,
          schedule: options.schedule ? { at: options.schedule.at } : undefined,
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample',
          iconColor: '#488AFF',
        },
      ];

      await LocalNotifications.schedule({
        notifications,
      });
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async cancelLocalNotification(id: number) {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
    } catch (error) {
      console.error('Error canceling local notification:', error);
    }
  }

  async cancelAllLocalNotifications() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await LocalNotifications.cancel();
    } catch (error) {
      console.error('Error canceling all local notifications:', error);
    }
  }

  async getPendingLocalNotifications() {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    try {
      const result = await LocalNotifications.getPending();
      return result.notifications;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }

  async requestBrowserPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async unregister() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      await PushNotifications.unregister();
      this.isInitialized = false;
    } catch (error) {
      console.error('Error unregistering push notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();