package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.text.SpannableString
import android.text.style.ClickableSpan
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.firebase.Firebase
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.repositories.UserRepository
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth
import com.google.firebase.auth.userProfileChangeRequest
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.firestore
import com.jason.supermarketapp.MainActivity
import kotlinx.coroutines.launch

class SignUpActivity : AppCompatActivity() {

    private lateinit var auth: FirebaseAuth
    private val repository = UserRepository()
    private lateinit var firestore: FirebaseFirestore

    private lateinit var editTextFirstName: EditText
    private lateinit var editTextLastName: EditText
    private lateinit var editTextEmail: EditText
    private lateinit var editTextPassword: EditText
    private lateinit var buttonSignUp: Button
    private lateinit var textViewMessage: TextView
    private lateinit var tvSignInLink: TextView

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.home_button_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sign_up)

        // Initialize Firebase Auth and Firestore
        auth = Firebase.auth
        firestore = Firebase.firestore

        // Get references to UI elements
        editTextFirstName = findViewById(R.id.firstNameText)
        editTextLastName = findViewById(R.id.lastNameText)
        editTextEmail = findViewById(R.id.editTextEmail)
        editTextPassword = findViewById(R.id.editTextPassword)
        buttonSignUp = findViewById(R.id.buttonSignUp)
        textViewMessage = findViewById(R.id.textViewMessage)

        tvSignInLink = findViewById(R.id.tvSignInLink)
        makeSignInLink()

        buttonSignUp.setOnClickListener {
            signUpUser()
        }
    }

    /** Handles the user sign-up process including input validation, Firebase Authentication,
     * profile update, and Firestore user profile creation.
     */
    private fun signUpUser() {
        val firstName = editTextFirstName.text.toString().trim()
        val lastName = editTextLastName.text.toString().trim()
        val email = editTextEmail.text.toString().trim()
        val password = editTextPassword.text.toString().trim()

        // Input validation
        if (firstName.isEmpty()) {
            editTextFirstName.error = "First Name is required"
            editTextFirstName.requestFocus()
            return
        }
        if (lastName.isEmpty()) {
            editTextLastName.error = "Last Name is required"
            editTextLastName.requestFocus()
            return
        }
        if (email.isEmpty()) {
            editTextEmail.error = "Email is required"
            editTextEmail.requestFocus()
            return
        }
        if (password.isEmpty() || password.length < 6) {
            editTextPassword.error = "Password must be at least 6 characters"
            editTextPassword.requestFocus()
            return
        }

        textViewMessage.text = getString(R.string.signing_up)
        textViewMessage.setTextColor(getColor(R.color.discount_orange))

        // Create user with email and password
        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener(this) { task ->
                if (task.isSuccessful) {
                    val user = auth.currentUser
                    user?.let { firebaseUser ->
                        val fullName = "$firstName $lastName"

                        val profileUpdates = userProfileChangeRequest {
                            displayName = fullName
                        }

                        firebaseUser.updateProfile(profileUpdates)
                            .addOnCompleteListener { profileTask ->
                                if (profileTask.isSuccessful) {
                                    // Save user data to Firestore inside coroutine
                                    lifecycleScope.launch {
                                        val success = repository.createUserProfile(
                                            firebaseUser.uid,
                                            firstName,
                                            lastName,
                                            email
                                        )
                                        if (success) {
                                            Toast.makeText(this@SignUpActivity, "Sign up successful!", Toast.LENGTH_LONG).show()
                                            val intent = Intent(this@SignUpActivity, MainActivity::class.java)
                                            intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                                            startActivity(intent)
                                            finish()
                                        } else {
                                            displayMessage("Sign up successful, but failed to save user profile.")
                                        }
                                    }
                                } else {
                                    val errorMessage = profileTask.exception?.message ?: "Failed to update profile."
                                    displayMessage("Sign up successful, but failed to update profile: $errorMessage")
                                    Toast.makeText(
                                        this,
                                        "Sign up successful, but failed to update profile.",
                                        Toast.LENGTH_LONG
                                    ).show()
                                }
                            }
                    }
                } else {
                    val errorMessage = task.exception?.message ?: "Sign up failed."
                    displayMessage("Error: $errorMessage")
                    Toast.makeText(this, "Authentication failed: $errorMessage", Toast.LENGTH_LONG).show()
                }
            }
    }

    /** Displays a message in the textViewMessage TextView with red color for errors.
     *
     * @param message The message to display.
     */
    private fun displayMessage(message: String) {
        textViewMessage.text = message
        textViewMessage.setTextColor(getColor(android.R.color.holo_red_dark))
    }

    /** Creates a clickable "Sign In" link in the tvSignInLink TextView. */
    private fun makeSignInLink() {
        val text = getString(R.string.sign_in_prompt)
        val linkText = getString(R.string.sign_in_prompt_link)

        val start = text.indexOf(linkText)
        if (start >= 0) {
            val end = start + linkText.length

            val spannable = SpannableString(text)
            val clickable = object : ClickableSpan() {
                override fun onClick(widget: View) {
                    startActivity(Intent(this@SignUpActivity, SignInActivity::class.java))
                }
            }

            spannable.setSpan(clickable, start, end, SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE)
            tvSignInLink.text = spannable
            tvSignInLink.movementMethod = android.text.method.LinkMovementMethod.getInstance()
        } else {
            // fallback if something goes wrong
            tvSignInLink.text = text
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            android.R.id.home -> {
                // Handles the back/home button in the action bar
                finish()
                true
            }
            R.id.action_go_to_main_menu -> {
                // Go to your MainActivity (or whatever your home is)
                startActivity(Intent(this, MainActivity::class.java))
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }
}
