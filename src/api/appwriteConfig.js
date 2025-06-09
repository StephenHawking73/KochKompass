import { Account, Client } from 'appwrite';
import { Platform } from 'react-native';

const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.EXPO_PUBLIC_APPWRTIE_PROCJECT_ID); // Your project ID

switch (Platform.OS) {
  case 'ios':
    client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_BUNDLE_ID);
    break;
  case 'android':
    client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PACKAGE_NAME);
    break;
}

const account = new Account(client);

export { account };
