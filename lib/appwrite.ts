import { Client, Account, Avatars, Databases, ID, Query } from "react-native-appwrite";
import {CreateUserParams, SignInParams} from "@/type";


export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    platform: "com.jsm.foodordering",
    databaseId: '68fd993b002ebff28d33',
    userTableId: 'user'
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
const avatars = new Avatars(client);

export const createUser= async ({ email, password, name}: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name);

        if(!newAccount) throw Error;

        await signIn({email, password});

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            ID.unique(),
            {email, name,accountId: newAccount.$id, avatar: avatarUrl}
        );


    } catch(e) {
        throw new Error(e as string);
    }
}

export const signIn = async ({email, password}: SignInParams) => {
    try{
        const session = await account.createEmailPasswordSession(email, password);
    } catch(e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userTableId,
            [Query.equal('accountId', currentAccount.$id)]
        )
        if(!currentAccount) throw Error;
        return currentUser.documents[0];
    } catch(e) {
        console.log(e);
        throw new Error(e as string);
    }
}