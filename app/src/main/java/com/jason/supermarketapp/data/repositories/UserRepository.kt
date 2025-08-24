package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.firestore.UserManager
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

class UserRepository {

    private val userManager = UserManager()

    /** Create a new user profile in Firestore.
     *
     * @param userId ID of the user
     * @param firstName First name of the user
     * @param lastName Last name of the user
     * @param email Email of the user
     * @return true if the operation was successful, false otherwise
     */
    suspend fun createUserProfile(
        userId: String,
        firstName: String,
        lastName: String,
        email: String,
    ): Boolean {
        return userManager.createUserProfile(userId, firstName, lastName, email)
    }

    /** Sign in an existing user with email and password.
     *
     * @param email Email of the user
     * @param password Password of the user
     * @throws Exception if sign-in fails
     */
    suspend fun signIn(email: String, password: String) {
        return suspendCoroutine { continuation ->
            userManager.signIn(email, password) { success, errorMessage ->
                if (success) {
                    continuation.resume(Unit) // sign-in succeeded
                } else {
                    continuation.resumeWithException(Exception(errorMessage))
                }
            }
        }
    }

    /** Get the profile information of a user.
     *
     * @param userId ID of the user
     * @return Map containing user profile fields, or null if not found
     */
    suspend fun getUserProfile(userId: String): Map<String, Any?>? {
        return userManager.getUserProfile(userId)
    }

    /** Sign out the currently signed-in user. */
    fun signOut() {
        userManager.signOut()
    }
}