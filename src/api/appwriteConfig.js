import { Account, Client, Databases } from 'appwrite';


const endpoint = "https://fra.cloud.appwrite.io/v1";
const projectID = "68457033001c656e4898";

const client = new Client();
client.setEndpoint(endpoint).setProject(projectID);

const account = new Account(client);
const databases = new Databases(client);

export { account, databases };

