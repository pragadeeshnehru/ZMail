import * as Google from 'expo-auth-session';

const fetchEmails = async (accessToken) => {
  const response = await fetch(
    'https://www.googleapis.com/gmail/v1/users/me/messages',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  const data = await response.json();
  return data.messages;
};

const getEmails = async () => {
  const { accessToken } = await Google.logInAsync({
    androidClientId: 'YOUR_ANDROID_CLIENT_ID',
    iosClientId: 'YOUR_IOS_CLIENT_ID',
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });

  const emails = await fetchEmails(accessToken);
  return emails;
};

export default getEmails;
