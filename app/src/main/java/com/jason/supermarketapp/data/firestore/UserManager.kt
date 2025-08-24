package com.jason.supermarketapp.data.firestore

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.tasks.await
import android.util.Log
import com.google.firebase.auth.FirebaseAuth

class UserManager {

    // Initialize Firestore instance
    private val firestore = FirebaseFirestore.getInstance()
    // Reference to the "users" collection
    private val usersCollection = firestore.collection("users")

    // Tag for logging
    companion object {
        private const val TAG = "UserManager"
    }

    /**
     * Creates or updates a user's document in Firestore.
     * This method is called after a successful Firebase Authentication sign-up.
     * It stores basic user profile information.
     *
     * @param userId The unique ID of the user (Firebase Authentication UID).
     * @param firstName The user's first name.
     * @param lastName The user's last name.
     * @param email The user's email address.
     * @return True if the operation was successful, false otherwise.
     */
    suspend fun createUserProfile(
        userId: String,
        firstName: String,
        lastName: String,
        email: String,
    ): Boolean {
        return try {
            val userMap = hashMapOf(
                "firstName" to firstName,
                "lastName" to lastName,
                "email" to email,
                "createdAt" to System.currentTimeMillis()
            )
            usersCollection.document(userId).set(userMap, SetOptions.merge()).await()
            Log.d(TAG, "User profile created/updated for $userId")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error creating user profile for $userId: ${e.message}", e)
            false
        }
    }

    /**
     * Retrieves a user's profile data from Firestore.
     *
     * @param userId The unique ID of the user.
     * @return A Map<String, Any?> containing the user's data, or null if not found/error.
     */
    suspend fun getUserProfile(userId: String): Map<String, Any?>? {
        return try {
            val documentSnapshot = usersCollection.document(userId).get().await()
            if (documentSnapshot.exists()) {
                Log.d(TAG, "User profile retrieved for $userId")
                documentSnapshot.data
            } else {
                Log.d(TAG, "User profile not found for $userId")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting user profile for $userId: ${e.message}", e)
            null
        }
    }

    /**
     * Updates specific fields in a user's profile document.
     *
     * @param userId The unique ID of the user.
     * @param updates A Map<String, Any?> containing the fields to update (e.g., "firstName" to "NewFirstName").
     * @return True if the update was successful, false otherwise.
     */
    suspend fun updateUserProfile(userId: String, updates: Map<String, Any?>): Boolean {
        return try {
            // update() method updates specific fields without overwriting the entire document
            usersCollection.document(userId).update(updates).await()
            Log.d(TAG, "User profile updated for $userId with: $updates")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error updating user profile for $userId: ${e.message}", e)
            false
        }
    }

    /**
     * Deletes a user's profile document from Firestore.
     * NOTE: This does NOT delete the user from Firebase Authentication.
     * That must be handled separately using FirebaseAuth.
     *
     * @param userId The unique ID of the user.
     * @return True if the deletion was successful, false otherwise.
     */
    suspend fun deleteUserProfile(userId: String): Boolean {
        return try {
            usersCollection.document(userId).delete().await()
            Log.d(TAG, "User profile deleted for $userId")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error deleting user profile for $userId: ${e.message}", e)
            false
        }
    }

    /**
     * Signs in the user with Firebase Authentication.
     *
     * @param email The user's email.
     * @param password The user's password.
     * @param onResult Callback with success status and optional error message.
     */
    fun signIn(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        val auth = FirebaseAuth.getInstance()
        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "User signed in: ${auth.currentUser?.uid}")
                    onResult(true, null)
                } else {
                    Log.e(TAG, "Sign-in failed: ${task.exception?.message}", task.exception)
                    onResult(false, task.exception?.message)
                }
            }
    }

    /**
     * Signs out the current user.
     *
     */
    fun signOut() {
        try {
            val auth = FirebaseAuth.getInstance()
            val currentUser = auth.currentUser
            if (currentUser != null) {
                auth.signOut()
                Log.d(TAG, "User signed out: ${currentUser.uid}")
            } else {
                Log.d(TAG, "No user is currently signed in")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error signing out", e)
        }
    }

    //TODO: Implement exception handling and messaging for all methods e.g. "Email or password is incorrect"

}