import React, { useState, useEffect } from 'react';
import AlertDialog from './AlertDialog';
import { alertService } from '../../services/alertService';

const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const handleAlert = (alertData) => {
      setAlert(alertData);
    };

    alertService.on('alert', handleAlert);

    return () => {
      alertService.off('alert', handleAlert);
    };
  }, []);

  const handleClose = () => {
    if (alert) {
      setAlert({ ...alert, visible: false });
      setTimeout(() => {
        setAlert(null);
        alertService.hide();
      }, 200);
    }
  };

  const handleButtonPress = (button) => {
    if (button.onPress) {
      button.onPress();
    }
    handleClose();
  };

  return (
    <>
      {children}
      {alert && (
        <AlertDialog
          visible={alert.visible}
          onClose={handleClose}
          title={alert.title}
          message={alert.message}
          buttons={alert.buttons.map(btn => ({
            ...btn,
            onPress: () => handleButtonPress(btn),
          }))}
          type={alert.type}
        />
      )}
    </>
  );
};

export default AlertProvider;

