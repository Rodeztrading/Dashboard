import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { VisualTrade } from "../types";

export interface UserData {
  trades: VisualTrade[];
  tradingPlan: string;
  theme: string;
}

export const saveUserData = async (userId: string, data: UserData): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving user data to Firestore:", error);
    throw error;
  }
};

export const getUserData = async (userId: string): Promise<UserData | null> => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user data from Firestore:", error);
    throw error;
  }
};

export const updateUserTrades = async (userId: string, trades: VisualTrade[]): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { trades });
  } catch (error) {
    console.error("Error updating user trades in Firestore:", error);
    throw error;
  }
};

export const updateUserTradingPlan = async (userId: string, tradingPlan: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { tradingPlan });
  } catch (error) {
    console.error("Error updating user trading plan in Firestore:", error);
    throw error;
  }
};

export const updateUserTheme = async (userId: string, theme: string): Promise<void> => {
  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, { theme });
  } catch (error) {
    console.error("Error updating user theme in Firestore:", error);
    throw error;
  }
};
