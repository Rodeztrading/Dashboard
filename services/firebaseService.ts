import {
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { VisualTrade } from '../types';

// Collection name for trades
const TRADES_COLLECTION = 'trades';

/**
 * Upload an image to Firebase Storage
 * @param file - Image file to upload
 * @param tradeId - Trade ID to associate with the image
 * @returns Download URL of the uploaded image
 */
export const uploadTradeImage = async (file: File, tradeId: string): Promise<string> => {
    try {
        const timestamp = Date.now();
        const fileName = `trades/${tradeId}/${timestamp}_${file.name}`;
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
 * @returns The saved trade with Firestore ID
 */
export const saveTrade = async (trade: Omit<VisualTrade, 'id'>): Promise<VisualTrade> => {
    try {
        const tradeData = {
            ...trade,
            createdAt: Timestamp.fromMillis(trade.createdAt),
        };

        const docRef = await addDoc(collection(db, TRADES_COLLECTION), tradeData);

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
 * Get all trades from Firestore
 * @returns Array of trades ordered by creation date (newest first)
 */
export const getAllTrades = async (): Promise<VisualTrade[]> => {
    try {
        const q = query(
            collection(db, TRADES_COLLECTION),
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
 */
export const updateTrade = async (
    tradeId: string,
    updates: Partial<Omit<VisualTrade, 'id' | 'createdAt'>>
): Promise<void> => {
    try {
        const tradeRef = doc(db, TRADES_COLLECTION, tradeId);
        await updateDoc(tradeRef, updates);
    } catch (error) {
        console.error('Error updating trade:', error);
        throw new Error('Failed to update trade');
    }
};

/**
 * Delete a trade from Firestore
 * @param tradeId - ID of the trade to delete
 */
export const deleteTrade = async (tradeId: string): Promise<void> => {
    try {
        const tradeRef = doc(db, TRADES_COLLECTION, tradeId);
        await deleteDoc(tradeRef);
    } catch (error) {
        console.error('Error deleting trade:', error);
        throw new Error('Failed to delete trade');
    }
};

/**
 * Migrate trades from localStorage to Firestore
 * @param localTrades - Array of trades from localStorage
 */
export const migrateLocalTradesToFirebase = async (localTrades: VisualTrade[]): Promise<void> => {
    try {
        const promises = localTrades.map(trade => {
            const { id, ...tradeData } = trade;
            return saveTrade(tradeData);
        });

        await Promise.all(promises);
        console.log(`Successfully migrated ${localTrades.length} trades to Firebase`);
    } catch (error) {
        console.error('Error migrating trades:', error);
        throw new Error('Failed to migrate trades');
    }
};
