package com.jason.supermarketapp.data.repositories

import com.jason.supermarketapp.data.firestore.UserManager
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.coroutines.suspendCoroutine

class UserRepository {

    // UserManager instance to handle user-related operations
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
            userManager.signIn(email, password) { success, error ->
                if (success) {
                    continuation.resume(Unit) // sign-in succeeded
                } else {
                    continuation.resumeWithException(error!!)
                }
            }
        }
    }

    /** Sign out the currently signed-in user. */
    fun signOut() {
        userManager.signOut()
    }

    /** Get the total spending of a user over the past week and month.
     *
     * @param userId ID of the user
     * @return SpendingTotals object containing weekly and monthly totals
     */
    suspend fun getSpendingTotals(userId: String): UserManager.SpendingTotals {
        return userManager.getSpendingTotals(userId)
    }
}