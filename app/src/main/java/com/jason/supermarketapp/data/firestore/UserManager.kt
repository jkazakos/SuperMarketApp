package com.jason.supermarketapp.data.firestore

import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.tasks.await
import android.util.Log
import androidx.annotation.StringRes
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException
import com.google.firebase.auth.FirebaseAuthInvalidUserException
import com.jason.supermarketapp.R

/** UserManager handles user profile operations in Firestore. */
class UserManager {

    // Initialize Firestore instance
    private val firestore = FirebaseFirestore.getInstance()
    // Reference to the "users" collection
    private val usersCollection = firestore.collection("users")
    // Instance of FirestoreManager for additional Firestore operations
    private val firestoreManager = FirestoreManager()

    // Tag for logging
    companion object {
        private const val TAG = "UserManager"
    }

    /**
     * Creates a user's document in Firestore.
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
     * Custom exceptions for sign-in errors.
     *
     * InvalidEmail: Thrown when the email is not found.
     * InvalidPassword: Thrown when the password is incorrect.
     * GenericError: For other errors with a message.
     */
    sealed class SignInError(@StringRes val messageResId: Int) : Exception() {
        object InvalidCredentials : SignInError(R.string.wrong_email_or_password)
        class GenericError(@StringRes resId: Int) : SignInError(resId)
    }

    /**
     * Signs in the user with Firebase Authentication.
     *
     * @param email The user's email.
     * @param password The user's password.
     * @param onResult Callback with success status and error message.
     */
    fun signIn(email: String, password: String, onResult: (Boolean, SignInError?) -> Unit) {
        val auth = FirebaseAuth.getInstance()
        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d(TAG, "User signed in: ${auth.currentUser?.uid}")
                    onResult(true, null)
                } else {
                    val exception = task.exception
                    val error = when (exception) {
                        is FirebaseAuthInvalidUserException,
                        is FirebaseAuthInvalidCredentialsException -> SignInError.InvalidCredentials
                        else -> SignInError.GenericError(R.string.generic_error)
                    }
                    Log.e(TAG, "Sign-in failed", exception)
                    onResult(false, error)
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

    /**
     * Data class to hold spending totals.
     * @property weekly Total spending in the past week.
     * @property monthly Total spending in the past month.
     */
    data class SpendingTotals(
        val weekly: Double,
        val monthly: Double
    )

    /**
     * Calculates the total spending for the past week and month from the user's purchase history.
     *
     * @param userId The unique ID of the user.
     * @return A SpendingTotals data class containing weekly and monthly totals.
     */
    suspend fun getSpendingTotals(userId: String): SpendingTotals {
        val history = firestoreManager.getPurchaseHistory(userId)
        val now = System.currentTimeMillis()

        val oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000L

        val monthStart = java.util.Calendar.getInstance().apply {
            set(java.util.Calendar.DAY_OF_MONTH, 1)
            set(java.util.Calendar.HOUR_OF_DAY, 0)
            set(java.util.Calendar.MINUTE, 0)
            set(java.util.Calendar.SECOND, 0)
            set(java.util.Calendar.MILLISECOND, 0)
        }.timeInMillis

        var weeklyTotal = 0.0
        var monthlyTotal = 0.0

        for (purchase in history) {
            val time = purchase.datePurchased?.toDate()?.time ?: continue
            val purchaseTotal = purchase.totalAmount

            if (time >= oneWeekAgo) weeklyTotal += purchaseTotal
            if (time >= monthStart) monthlyTotal += purchaseTotal
        }

        return SpendingTotals(weeklyTotal, monthlyTotal)
    }

}