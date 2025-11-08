// Simple event emitter for React Native
class SimpleEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
}

class AlertService extends SimpleEventEmitter {
  constructor() {
    super();
    this.currentAlert = null;
  }

  show(title, message, buttons, type = 'info') {
    this.currentAlert = {
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK' }],
      type,
    };
    this.emit('alert', this.currentAlert);
  }

  hide() {
    if (this.currentAlert) {
      this.currentAlert.visible = false;
      this.emit('alert', this.currentAlert);
      this.currentAlert = null;
    }
  }

  // Convenience methods
  success(title, message, buttons) {
    this.show(title, message, buttons, 'success');
  }

  error(title, message, buttons) {
    this.show(title, message, buttons, 'error');
  }

  warning(title, message, buttons) {
    this.show(title, message, buttons, 'warning');
  }

  info(title, message, buttons) {
    this.show(title, message, buttons, 'info');
  }

  // Alert.alert compatible method
  alert(title, message, buttons) {
    // Convert Alert.alert format to our format
    const convertedButtons = (buttons || []).map(btn => ({
      text: btn.text || 'OK',
      onPress: btn.onPress,
      style: btn.style || 'default',
    }));
    
    // If no buttons provided, add default OK button
    if (!convertedButtons.length) {
      convertedButtons.push({ text: 'OK' });
    }

    // Determine type from title/message
    let type = 'info';
    const titleLower = (title || '').toLowerCase();
    const messageLower = (message || '').toLowerCase();
    if (titleLower.includes('error') || titleLower.includes('failed') || messageLower.includes('error') || messageLower.includes('failed')) {
      type = 'error';
    } else if (titleLower.includes('success') || messageLower.includes('success')) {
      type = 'success';
    } else if (titleLower.includes('warning') || titleLower.includes('invalid') || messageLower.includes('warning') || messageLower.includes('invalid')) {
      type = 'warning';
    }

    this.show(title, message, convertedButtons, type);
  }
}

export const alertService = new AlertService();

