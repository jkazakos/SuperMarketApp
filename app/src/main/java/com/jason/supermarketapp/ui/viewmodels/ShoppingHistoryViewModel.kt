package com.jason.supermarketapp.ui.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.data.entities.ShoppingHistory
import com.jason.supermarketapp.data.repositories.ShoppingHistoryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ShoppingHistoryViewModel : ViewModel() {

    private val repository = ShoppingHistoryRepository()
    private val userId: String
        get() = FirebaseAuth.getInstance().currentUser?.uid ?: "default_user"

    private val _purchaseHistory = MutableStateFlow<List<ShoppingHistory>>(emptyList())
    val purchaseHistory: StateFlow<List<ShoppingHistory>> = _purchaseHistory

    init {
        loadPurchaseHistory()
    }

    /** Load purchase history from repository */
    fun loadPurchaseHistory() {
        viewModelScope.launch {
            try{
            val history = repository.getPurchaseHistory(userId)
            _purchaseHistory.value = history
            } catch (e: Exception) {
                Log.e("ShoppingHistoryVM", "Error loading purchase history", e)
            }
        }
    }

    /** Clear all purchase history for a user */
    fun clearPurchaseHistory() {
        viewModelScope.launch {
            val success = repository.clearPurchaseHistory(userId)
            if (success) {
                _purchaseHistory.value = emptyList()
            }
        }
    }
}
