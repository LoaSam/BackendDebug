import notifier from 'node-notifier';

export class NotificationService {
  notify(title, message) {
    console.log(`\n🔔 ${title}: ${message}`);
    
    // Show system notification
    notifier.notify({
      title,
      message,
      sound: true
    });
  }
}
