import { Account, Client } from 'appwrite';


const endpoint = "https://fra.cloud.appwrite.io/v1";
const projectID = "68457033001c656e4898";

const client = new Client();
client.setEndpoint(endpoint).setProject(projectID);

const account = new Account(client);

export { account };

