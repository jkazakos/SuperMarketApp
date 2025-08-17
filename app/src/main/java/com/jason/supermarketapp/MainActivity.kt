package com.jason.supermarketapp

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import com.jason.supermarketapp.ui.activities.ProductsActivity
import com.jason.supermarketapp.ui.activities.WishlistActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val btnProducts = findViewById<Button>(R.id.btnProducts)
        val btnWishlist = findViewById<Button>(R.id.btnWishlist)
        val btnShoppingList = findViewById<Button>(R.id.btnShoppingList)
        val btnHistory = findViewById<Button>(R.id.btnHistory)

        btnProducts.setOnClickListener {
            startActivity(Intent(this, ProductsActivity::class.java))
        }

        btnWishlist.setOnClickListener {
            startActivity(Intent(this, WishlistActivity::class.java))
        }
//
//        btnShoppingList.setOnClickListener {
//            startActivity(Intent(this, ShoppingListActivity::class.java))
//        }
//
//        btnHistory.setOnClickListener {
//            startActivity(Intent(this, ShoppingHistoryActivity::class.java))
//        }
    }
}






