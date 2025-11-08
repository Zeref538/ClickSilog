import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import App from './App';
import { setupGlobalErrorHandler } from './src/utils/errorHandler';
import 'react-native-get-random-values';

// Enable LogBox to see all errors
LogBox.ignoreAllLogs(false);

// Setup global error handler with safe fallbacks
setupGlobalErrorHandler();

registerRootComponent(App);


