import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/config/firebase";
import { apiService } from "./api";
import { FirebaseAuthResult, AuthUser } from "@/types/auth";

class FirebaseAuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.addScope("email");
    this.googleProvider.addScope("profile");
  }

  async signInWithGoogle(): Promise<FirebaseAuthResult> {
    const result = await signInWithPopup(auth, this.googleProvider);
    const firebaseUser = result.user;

    // Check if user exists in Directus
    let directusUser = await apiService.getUserByFirebaseUid(firebaseUser.uid);
    let isNewUser = false;

    if (!directusUser) {
      // Check if user exists by email
      directusUser = await apiService.getUserByEmail(firebaseUser.email!);

      if (directusUser) {
        // Update existing user with Firebase UID
        directusUser = await apiService.updateUser(directusUser.id, {
          firebase_uid: firebaseUser.uid,
          provider: "google",
          avatar_url: firebaseUser.photoURL || undefined,
          email_verified: firebaseUser.emailVerified,
        });
      } else {
        // Create new user
        isNewUser = true;
        directusUser = await apiService.createUser({
          name: firebaseUser.displayName || "Unknown User",
          email: firebaseUser.email!,
          firebase_uid: firebaseUser.uid,
          provider: "google",
          avatar_url: firebaseUser.photoURL || undefined,
          email_verified: firebaseUser.emailVerified,
          password: "google_auth_user", // Placeholder for Google auth users
          status: "published",
        });
      }
    }

    // Update last login
    await apiService.updateLastLogin(directusUser.id);

    return {
      user: apiService.transformToAuthUser(directusUser),
      isNewUser,
    };
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<FirebaseAuthResult> {
    // Use Firebase authentication directly
    const result = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    // Check if user exists in Directus and sync
    let directusUser = await apiService.getUserByFirebaseUid(firebaseUser.uid);

    if (!directusUser) {
      // If no Directus user found, create one
      directusUser = await apiService.createUser({
        name: firebaseUser.displayName || "User",
        email: firebaseUser.email!,
        firebase_uid: firebaseUser.uid,
        provider: "email",
        email_verified: firebaseUser.emailVerified,
        password: "firebase_managed", // Placeholder since Firebase manages the password
        status: "published",
      });
    } else {
      // Update last login
      await apiService.updateLastLogin(directusUser.id);
    }

    return {
      user: apiService.transformToAuthUser(directusUser),
      isNewUser: false,
    };
  }

  async signUpWithEmail(
    name: string,
    email: string,
    password: string
  ): Promise<FirebaseAuthResult> {
    // Check if user already exists
    const existingUser = await apiService.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Create Firebase user
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    // Update Firebase profile
    await updateProfile(firebaseUser, {
      displayName: name,
    });

    // Create Directus user
    const directusUser = await apiService.createUser({
      name,
      email,
      firebase_uid: firebaseUser.uid,
      provider: "email",
      email_verified: firebaseUser.emailVerified,
      password, // You might want to hash this or handle differently
      status: "published",
    });

    return {
      user: apiService.transformToAuthUser(directusUser),
      isNewUser: true,
    };
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async syncUserWithDirectus(firebaseUser: User): Promise<AuthUser | null> {
    let directusUser = await apiService.getUserByFirebaseUid(firebaseUser.uid);

    if (!directusUser) {
      directusUser = await apiService.getUserByEmail(firebaseUser.email!);
    }

    if (directusUser) {
      await apiService.updateLastLogin(directusUser.id);
      return apiService.transformToAuthUser(directusUser);
    }

    return null;
  }
}

export const firebaseAuthService = new FirebaseAuthService();
