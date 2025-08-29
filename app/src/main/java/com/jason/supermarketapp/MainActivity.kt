package com.jason.supermarketapp

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.data.repositories.ProductRepository
import com.jason.supermarketapp.data.repositories.UserRepository
import com.jason.supermarketapp.ui.activities.ProductsActivity
import com.jason.supermarketapp.ui.activities.WishlistActivity
import com.jason.supermarketapp.data.seeds.TestDataSeeder
import com.jason.supermarketapp.ui.activities.ProfileActivity
import com.jason.supermarketapp.ui.activities.ShoppingHistoryActivity
import com.jason.supermarketapp.ui.activities.ShoppingListActivity
import com.jason.supermarketapp.ui.activities.SignInActivity
import com.jason.supermarketapp.ui.activities.SignUpActivity
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private var signOutMenuItem: MenuItem? = null
    private lateinit var authListener: FirebaseAuth.AuthStateListener
    private lateinit var tvGreetingLoggedIn: TextView
    private lateinit var tvGreetingGuest: TextView
    private lateinit var tvSignInLink: TextView
    private lateinit var tvSignUpLink: TextView
    private lateinit var guestBottomContainer: LinearLayout
    val userRepository = UserRepository()

    override fun onCreateOptionsMenu(menu: Menu?): Boolean {
        menuInflater.inflate(R.menu.activity_main_menu, menu)
        return true
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Set up the AuthStateListener to listen for sign-in and sign-out events
        authListener = FirebaseAuth.AuthStateListener {
            invalidateOptionsMenu() // refresh menu when auth state changes
        }

        // Initialize the Firestore database and seed it with test data
        val repository = ProductRepository()
        lifecycleScope.launch {
            TestDataSeeder.insertTestProducts(repository, this)
        }

        val btnProducts = findViewById<Button>(R.id.btnProducts)
        val btnWishlist = findViewById<Button>(R.id.btnWishlist)
        val btnShoppingList = findViewById<Button>(R.id.btnShoppingList)
        val btnHistory = findViewById<Button>(R.id.btnHistory)
        val btnProfile = findViewById<Button>(R.id.btnProfile)
        tvGreetingLoggedIn = findViewById(R.id.tvGreetingLoggedIn)
        tvGreetingGuest = findViewById(R.id.tvGreetingGuest)
        guestBottomContainer = findViewById(R.id.guestBottomContainer)
        tvSignInLink = findViewById(R.id.tvSignInLink)
        tvSignUpLink = findViewById(R.id.tvSignUpLink)

        btnProducts.setOnClickListener {
            startActivity(Intent(this, ProductsActivity::class.java))
        }

        btnWishlist.setOnClickListener {
            startActivity(Intent(this, WishlistActivity::class.java))
        }

        btnShoppingList.setOnClickListener {
            startActivity(Intent(this, ShoppingListActivity::class.java))
        }

        btnHistory.setOnClickListener {
            startActivity(Intent(this, ShoppingHistoryActivity::class.java))
        }
        btnProfile.setOnClickListener {
            startActivity(Intent(this, ProfileActivity::class.java))
        }

        updateGreeting()
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        return when (item.itemId) {
            R.id.action_sign_out -> {
                showSignOutDialog()
                true
            }
            else -> super.onOptionsItemSelected(item)
        }
    }

    /** Show a confirmation dialog before signing out */
    private fun showSignOutDialog() {
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.sign_out))
            .setMessage(getString(R.string.sign_out_confirmation))
            .setPositiveButton(getString(R.string.yes)) { _, _ ->
                userRepository.signOut()
                Toast.makeText(this, getString(R.string.sign_out_successful), Toast.LENGTH_SHORT).show()
                Log.d("Auth", "User signed out")
                invalidateOptionsMenu() // 👈 refresh menu visibility
                updateGreeting()
            }
            .setNegativeButton(getString(R.string.cancel_text), null)
            .show()
    }


    // If the user is signed in, show the "Sign Out" menu item, otherwise hide it
    override fun onPrepareOptionsMenu(menu: Menu?): Boolean {
        signOutMenuItem = menu?.findItem(R.id.action_sign_out)
        val auth = FirebaseAuth.getInstance()
        signOutMenuItem?.isVisible = auth.currentUser != null
        return super.onPrepareOptionsMenu(menu)
    }

    override fun onStart() {
        super.onStart()
        FirebaseAuth.getInstance().addAuthStateListener(authListener)
    }

    override fun onStop() {
        super.onStop()
        FirebaseAuth.getInstance().removeAuthStateListener(authListener)
    }

    override fun onResume() {
        super.onResume()
        updateGreeting()
    }

    /** Update the greeting message based on whether the user is signed in or a guest */
    private fun updateGreeting() {
        val user = FirebaseAuth.getInstance().currentUser
        if (user != null) {
            // Logged-in user
            tvGreetingLoggedIn.visibility = View.VISIBLE
            tvGreetingGuest.visibility = View.INVISIBLE
            tvGreetingLoggedIn.text = getString(R.string.signed_in_message, user.displayName)

            guestBottomContainer.visibility = View.INVISIBLE
        } else {
            // Guest user
            tvGreetingLoggedIn.visibility = View.INVISIBLE
            tvGreetingGuest.visibility = View.VISIBLE
            guestBottomContainer.visibility = View.VISIBLE

            makeSignInLink()
            makeSignUpLink()
        }
    }

    /** Create a clickable "Sign In" link within the TextView */
    private fun makeSignInLink() {
        val text = getString(R.string.sign_in_prompt)
        val linkText = getString(R.string.sign_in_prompt_link)

        val start = text.indexOf(linkText)
        if (start >= 0) {
            val end = start + linkText.length

            val spannable = android.text.SpannableString(text)
            val clickable = object : android.text.style.ClickableSpan() {
                override fun onClick(widget: View) {
                    startActivity(Intent(this@MainActivity, SignInActivity::class.java))
                }
            }

            spannable.setSpan(clickable, start, end, android.text.SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE)
            tvSignInLink.text = spannable
            tvSignInLink.movementMethod = android.text.method.LinkMovementMethod.getInstance()
        } else {
            // fallback if something goes wrong
            tvSignInLink.text = text
        }
    }

    /** Create a clickable "Sign Up" link within the TextView */
    private fun makeSignUpLink() {
        val text = getString(R.string.sign_up_prompt)
        val linkText = getString(R.string.sign_up_prompt_link)

        val start = text.indexOf(linkText)
        if (start >= 0) {
            val end = start + linkText.length

            val spannable = android.text.SpannableString(text)
            val clickable = object : android.text.style.ClickableSpan() {
                override fun onClick(widget: View) {
                    startActivity(Intent(this@MainActivity, SignUpActivity::class.java))
                }
            }

            spannable.setSpan(clickable, start, end, android.text.SpannableString.SPAN_EXCLUSIVE_EXCLUSIVE)
            tvSignUpLink.text = spannable
            tvSignUpLink.movementMethod = android.text.method.LinkMovementMethod.getInstance()
        } else {
            // fallback if something goes wrong
            tvSignUpLink.text = text
        }
    }
}






