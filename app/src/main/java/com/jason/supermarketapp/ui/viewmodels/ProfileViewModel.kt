package com.jason.supermarketapp.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.jason.supermarketapp.data.repositories.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ProfileViewModel: ViewModel() {

    private val repository = UserRepository()
    private val _weeklySpending = MutableStateFlow(0.0)
    val weeklySpending: StateFlow<Double> = _weeklySpending

    private val _monthlySpending = MutableStateFlow(0.0)
    val monthlySpending: StateFlow<Double> = _monthlySpending

    /** Load the user's spending totals for the week and month.
     *
     * @param userId ID of the user
     */
    fun loadSpending(userId: String) {
        viewModelScope.launch {
            try {
                val totals = repository.getSpendingTotals(userId)
                _weeklySpending.value = totals.weekly
                _monthlySpending.value = totals.monthly
            } catch (e: Exception) {
                _weeklySpending.value = 0.0
                _monthlySpending.value = 0.0
            }
        }
    }

    /** Sign out the currently signed-in user. */
    fun signOut() {
        repository.signOut()
    }
}
