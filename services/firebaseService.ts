import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    writeBatch,
    setDoc
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage, auth } from '../config/firebase';
import { VisualTrade, CustodyOverride } from '../types';

/**
 * Upload an image from base64 to Firebase Storage
 * @param base64 - Base64 string of the image
 * @param mimeType - Mime type of the image
 * @param tradeId - Trade ID to associate with the image
 * @returns Download URL of the uploaded image
 */
export const uploadTradeImageFromBase64 = async (base64: string, mimeType: string, tradeId: string): Promise<string> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const timestamp = Date.now();
        const fileName = `users/${user.uid}/trades/${tradeId}/${timestamp}_image`;
        const storageRef = ref(storage, fileName);

        // Convert base64 to Blob
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });

        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading base64 image:', error);
        throw new Error('Failed to upload image from base64');
    }
};

/**
 * Upload an image to Firebase Storage
 * @param file - Image file to upload
 * @param tradeId - Trade ID to associate with the image
 * @returns Download URL of the uploaded image
 */
export const uploadTradeImage = async (file: File, tradeId: string): Promise<string> => {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');

        const timestamp = Date.now();
        // Ruta corregida: users/{userId}/trades/{tradeId}/{fileName}
        const fileName = `users/${user.uid}/trades/${tradeId}/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
};

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - URL of the image to delete
 */
export const deleteTradeImage = async (imageUrl: string): Promise<void> => {
    try {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error) {
        console.error('Error deleting image:', error);
        // Don't throw error if image doesn't exist
    }
};

/**
 * Save a trade to Firestore
 * @param trade - Trade data to save
 * @param userId - ID of the user owning the trade
 * @returns The saved trade with Firestore ID
 */
export const saveTrade = async (trade: Omit<VisualTrade, 'id'>, userId: string): Promise<VisualTrade> => {
    try {
        const tradeData = {
            ...trade,
            createdAt: Timestamp.fromMillis(trade.createdAt),
        };

        const docRef = await addDoc(collection(db, `users/${userId}/trades`), tradeData);

        return {
            ...trade,
            id: docRef.id,
        };
    } catch (error) {
        console.error('Error saving trade:', error);
        throw new Error('Failed to save trade');
    }
};

/**
 * Get all trades from Firestore for a specific user
 * @param userId - ID of the user
 * @returns Array of trades ordered by creation date (newest first)
 */
export const getAllTrades = async (userId: string): Promise<VisualTrade[]> => {
    try {
        const q = query(
            collection(db, `users/${userId}/trades`),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);

        const trades: VisualTrade[] = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                id: doc.id,
                createdAt: data.createdAt.toMillis(),
            } as VisualTrade;
        });

        return trades;
    } catch (error) {
        console.error('Error getting trades:', error);
        throw new Error('Failed to get trades');
    }
};

/**
 * Update a trade in Firestore
 * @param tradeId - ID of the trade to update
 * @param updates - Partial trade data to update
 * @param userId - ID of the user
 */
export const updateTrade = async (
    tradeId: string,
    updates: Partial<Omit<VisualTrade, 'id' | 'createdAt'>>,
    userId: string
): Promise<void> => {
    try {
        const tradeRef = doc(db, `users/${userId}/trades`, tradeId);
        await updateDoc(tradeRef, updates);
    } catch (error) {
        console.error('Error updating trade:', error);
        throw new Error('Failed to update trade');
    }
};

/**
 * Delete a trade from Firestore
 * @param tradeId - ID of the trade to delete
 * @param userId - ID of the user
 */
export const deleteTrade = async (tradeId: string, userId: string): Promise<void> => {
    try {
        const tradeRef = doc(db, `users/${userId}/trades`, tradeId);
        await deleteDoc(tradeRef);
    } catch (error) {
        console.error('Error deleting trade:', error);
        throw new Error('Failed to delete trade');
    }
};

/**
 * Migrate trades from localStorage to Firestore
 * @param localTrades - Array of trades from localStorage
 * @param userId - ID of the user
 */
export const migrateLocalTradesToFirebase = async (localTrades: VisualTrade[], userId: string): Promise<void> => {
    try {
        const promises = localTrades.map(trade => {
            const { id, ...tradeData } = trade;
            return saveTrade(tradeData, userId);
        });

        await Promise.all(promises);
        console.log(`Successfully migrated ${localTrades.length} trades to Firebase`);
    } catch (error) {
        console.error('Error migrating trades:', error);
        throw new Error('Failed to migrate trades');
    }
};

/**
 * Migrate trades from the old global 'trades' collection to the user's collection
 * @param userId - ID of the user
 * @returns Number of trades migrated
 */
export const migrateLegacyGlobalTrades = async (userId: string): Promise<number> => {
    try {
        // Query the old root collection
        // Note: This requires temporary read access to 'trades' in Firestore Rules
        const q = query(collection(db, 'trades'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return 0;
        }

        let count = 0;
        const promises = querySnapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();

            // Check if this trade already exists in user's collection to avoid duplicates
            // (Simple check by ID if we preserved it, but here we are generating new IDs usually. 
            // We'll just add it for now, assuming migration is run once)

            // We use the same data, but ensure it's saved under the user
            await addDoc(collection(db, `users/${userId}/trades`), data);
            count++;
        });

        await Promise.all(promises);
        return count;
    } catch (error) {
        console.error('Error migrating legacy global trades:', error);
        throw new Error('Failed to migrate legacy trades. Check permissions.');
    }
};

/**
 * Reset all user data by deleting all documents in user's subcollections
 * @param userId - ID of the user
 */
export const resetUserData = async (userId: string): Promise<void> => {
    try {
        const collectionsToDelete = [
            'trades',
            'accounts',
            'transactions',
            'categories',
            'budgets',
            'recurringDebts',
            'custody_overrides'
        ];

        for (const colName of collectionsToDelete) {
            const colRef = collection(db, `users/${userId}/${colName}`);
            const snapshot = await getDocs(colRef);

            if (snapshot.empty) continue;

            // Delete in batches of 500 (Firestore limit)
            const batches = [];
            let batch = writeBatch(db);
            let operationCount = 0;

            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
                operationCount++;

                if (operationCount === 500) {
                    batches.push(batch.commit());
                    batch = writeBatch(db);
                    operationCount = 0;
                }
            });

            if (operationCount > 0) {
                batches.push(batch.commit());
            }

            await Promise.all(batches);
            console.log(`Deleted collection: ${colName}`);
        }
    } catch (error) {
        console.error('Error resetting user data:', error);
        throw new Error('Failed to reset user data');
    }
};

/**
 * Save a custody override to Firestore
 * @param override - Override data
 * @param userId - ID of the user
 */
export const saveCustodyOverride = async (override: Omit<CustodyOverride, 'id' | 'createdAt'>, userId: string): Promise<CustodyOverride> => {
    try {
        const overrideData = {
            ...override,
            createdAt: Date.now(),
        };

        // Use date as ID to ensure one override per day
        const docRef = doc(db, `users/${userId}/custody_overrides`, override.date);
        await setDoc(docRef, overrideData);

        return {
            ...overrideData,
            id: override.date,
        };
    } catch (error) {
        console.error('Error saving custody override:', error);
        throw new Error('Failed to save custody override');
    }
};

/**
 * Get all custody overrides for a user
 * @param userId - ID of the user
 */
export const getCustodyOverrides = async (userId: string): Promise<CustodyOverride[]> => {
    try {
        const q = query(collection(db, `users/${userId}/custody_overrides`));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
        } as CustodyOverride));
    } catch (error) {
        console.error('Error getting custody overrides:', error);
        throw new Error('Failed to get custody overrides');
    }
};

/**
 * Delete a custody override
 * @param date - Date of the override (YYYY-MM-DD)
 * @param userId - ID of the user
 */
export const deleteCustodyOverride = async (date: string, userId: string): Promise<void> => {
    try {
        const docRef = doc(db, `users/${userId}/custody_overrides`, date);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting custody override:', error);
        throw new Error('Failed to delete custody override');
    }
};
