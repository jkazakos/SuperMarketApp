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
import com.jason.supermarketapp.MainActivity
import com.jason.supermarketapp.R
import com.jason.supermarketapp.data.repositories.UserRepository
import kotlinx.coroutines.launch

class SignInActivity : AppCompatActivity() {

    private lateinit var userRepository: UserRepository
    private lateinit var tvSignUpLink: TextView

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.home_button_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_sign_in)

        // Initializing UserRepository
        userRepository = UserRepository()

        val emailEditText = findViewById<EditText>(R.id.editTextEmail)
        val passwordEditText = findViewById<EditText>(R.id.editTextPassword)
        val signInButton = findViewById<Button>(R.id.buttonSignIn)

        tvSignUpLink = findViewById(R.id.tvSignUpLink)
        makeSignUpLink()

        signInButton.setOnClickListener {
            val email = emailEditText.text.toString().trim()
            val password = passwordEditText.text.toString().trim()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Email and password required", Toast.LENGTH_SHORT).show()
            } else {
                lifecycleScope.launch {
                    try {
                        userRepository.signIn(email, password)
                        Toast.makeText(this@SignInActivity, "Signed in successfully", Toast.LENGTH_SHORT).show()
                        // Navigate to MainActivity after successful sign-in
                        val intent = Intent(this@SignInActivity, MainActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()

                    } catch (e: Exception) {
                        Toast.makeText(this@SignInActivity, "Sign in failed: ${e.message}", Toast.LENGTH_LONG).show()
                    }
                }
            }
        }

    }

    /** Creates a clickable "Sign Up" link in the TextView */
    private fun makeSignUpLink() {
        val text = getString(R.string.sign_up_prompt)
        val linkText = getString(R.string.sign_up_prompt_link)

        val start = text.indexOf(linkText)
        if (start >= 0) {
            val end = start + linkText.length

            val spannable = SpannableString(text)
            val clickable = object : ClickableSpan() {
                override fun onClick(widget: View) {
                    startActivity(Intent(this@SignInActivity, SignUpActivity::class.java))
                }
            }

            spannable.setSpan(clickable, start, end, SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE)
            tvSignUpLink.text = spannable
            tvSignUpLink.movementMethod = android.text.method.LinkMovementMethod.getInstance()
        } else {
            // fallback if something goes wrong
            tvSignUpLink.text = text
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