import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[];
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

const data = dummyData as DummyData;

async function clearAll(tableId: string): Promise<void> {
    const list = await databases.listDocuments(
        appwriteConfig.databaseId,
        tableId
    );

    await Promise.all(
        list.documents.map((doc) =>
            databases.deleteDocument(appwriteConfig.databaseId, tableId, doc.$id)
        )
    );
}

async function clearStorage(): Promise<void> {
    const list = await storage.listFiles(appwriteConfig.bucketId);

    await Promise.all(
        list.files.map((file) =>
            storage.deleteFile(appwriteConfig.bucketId, file.$id)
        )
    );
}

async function seed(): Promise<void> {
    // Clear database + bucket
    await clearAll(appwriteConfig.categoriesTableId);
    await clearAll(appwriteConfig.customizationsTableId);
    await clearAll(appwriteConfig.menuTableId);
    await clearAll(appwriteConfig.menuCustomizationsTableId);
    await clearStorage();

    // Create categories
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesTableId,
            ID.unique(),
            cat
        );
        categoryMap[cat.name] = doc.$id;
    }

    // Create customizations
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsTableId,
            ID.unique(),
            {
                name: cus.name,
                price: cus.price,
                type: cus.type,
            }
        );
        customizationMap[cus.name] = doc.$id;
    }

    // Create menu items
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
        const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuTableId,
            ID.unique(),
            {
                name: item.name,
                description: item.description,
                image_url: item.image_url, // ✅ no uploading, just use remote link
                price: item.price,
                rating: item.rating,
                calories: item.calories,
                protein: item.protein,
                categories: categoryMap[item.category_name], // ✅ relation only
            }
        );

        menuMap[item.name] = doc.$id;

        // Link menu to customizations
        for (const cusName of item.customizations) {
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.menuCustomizationsTableId,
                ID.unique(),
                {
                    menu: doc.$id,
                    customizations: customizationMap[cusName],
                }
            );
        }
    }

    console.log("✅ Seeding complete");
}

export default seed;
