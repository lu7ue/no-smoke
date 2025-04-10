import { Client, Databases } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('67f811d9000096544772');

const databases = new Databases(client);

export { databases };
