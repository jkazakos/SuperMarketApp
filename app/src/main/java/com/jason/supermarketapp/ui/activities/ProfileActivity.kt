package com.jason.supermarketapp.ui.activities

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.MainActivity
import com.jason.supermarketapp.ui.viewmodels.ProfileViewModel
import kotlinx.coroutines.launch
import com.jason.supermarketapp.R
import kotlinx.coroutines.flow.collectLatest


class ProfileActivity : AppCompatActivity() {

    private val viewModel: ProfileViewModel by viewModels()
    private lateinit var tvUserName: TextView
    private lateinit var signInMessage: TextView
    private lateinit var tvWeeklySpending: TextView
    private lateinit var tvMonthlySpending: TextView
    private lateinit var btnViewHistory: Button
    private lateinit var btnSignOut: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profile)

        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = getString(R.string.user_profile)

        signInMessage = findViewById(R.id.tvNotSignedIn)
        tvUserName = findViewById(R.id.tvUserName)
        tvWeeklySpending = findViewById(R.id.tvWeeklySpending)
        tvMonthlySpending = findViewById(R.id.tvMonthlySpending)
        btnViewHistory = findViewById(R.id.btnViewHistory)
        btnSignOut = findViewById(R.id.btnSignOut)

        val user = FirebaseAuth.getInstance().currentUser

        if (user == null) {
            // No user signed in → show message, hide RecyclerView
            tvUserName.visibility = View.GONE
            tvWeeklySpending.visibility = View.GONE
            tvMonthlySpending.visibility = View.GONE
            btnViewHistory.visibility = View.GONE
            btnSignOut.visibility = View.GONE
            signInMessage.visibility = View.VISIBLE
            return
        }

        tvUserName.text = getString(R.string.signed_in_message, user.displayName)

        viewModel.loadSpending(user.uid)

        // Observe spending values
        lifecycleScope.launch {
            viewModel.weeklySpending.collectLatest { weekly ->
                tvWeeklySpending.text = getString(R.string.weekly_spending, weekly)
            }
        }

        lifecycleScope.launch {
            viewModel.monthlySpending.collectLatest { monthly ->
                tvMonthlySpending.text = getString(R.string.monthly_spending, monthly)
            }
        }

        btnViewHistory.setOnClickListener {
            startActivity(Intent(this, ShoppingHistoryActivity::class.java))
        }

        btnSignOut.setOnClickListener {
            viewModel.signOut()
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }

    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressedDispatcher.onBackPressed()
        return true
    }
}
