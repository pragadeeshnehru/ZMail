import React, { useState } from 'react';
import { Button, View } from 'react-native';
import * as Google from 'expo-google-auth-session';

const AuthScreen = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '776534625493-ol7npn2dt2bcf7p9imk0i8pqlr54g8je.apps.googleusercontent.com',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      // Send id_token to your backend for validation and further processing
    }
  }, [response]);

  return (
    <View>
      <Button
        disabled={!request}
        title="Login with Google"
        onPress={() => {
          promptAsync();
        }}
      />
    </View>
  );
};

export default AuthScreen;
