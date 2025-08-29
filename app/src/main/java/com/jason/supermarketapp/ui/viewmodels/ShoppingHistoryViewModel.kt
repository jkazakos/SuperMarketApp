package com.jason.supermarketapp.ui.viewmodels

import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.asLiveData
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.jason.supermarketapp.data.entities.ShoppingHistory
import com.jason.supermarketapp.data.repositories.ShoppingHistoryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

class ShoppingHistoryViewModel : ViewModel() {

    private val repository = ShoppingHistoryRepository()
    private val userId: String
        get() = FirebaseAuth.getInstance().currentUser?.uid ?: "default_user"

    private val _purchaseHistory = MutableStateFlow<List<ShoppingHistory>>(emptyList())
    val purchaseHistory: LiveData<List<ShoppingHistory>> = _purchaseHistory.asLiveData()
    private val _isLoading = MutableLiveData(true)
    val isLoading: LiveData<Boolean> get() = _isLoading

    init {
        loadPurchaseHistory()
    }

    /** Load purchase history from repository */
    fun loadPurchaseHistory() {
        viewModelScope.launch {
            _isLoading.value = true  // start loading
            try {
                val history = repository.getPurchaseHistory(userId)
                _purchaseHistory.value = history
            } catch (e: Exception) {
                Log.e("ShoppingHistory", "Error loading purchase history", e)
                _purchaseHistory.value = emptyList()
            } finally {
                _isLoading.value = false  // finished loading
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
