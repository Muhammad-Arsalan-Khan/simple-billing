# 🧾 Billing Management System

## 📌 Overview  
This is a **web-based billing and product management system** built using **HTML, CSS, and JavaScript**.  
It allows users to manage products, generate bills, maintain billing history, and download reports in PDF format — all in a clean and responsive UI.

---

🌍Live : https://billing-softwar.netlify.app/

## 🚀 Features

✅ **Product Management**  
- Add, edit, and delete products easily.  
- Live search and filter support.  
- Auto-calculated total price per product and in cart.  

✅ **Billing System**  
- Create detailed bills with date, time, and product list.  
- Print bills directly from the browser.  
- Bill shows store information (shop name, contact, address).  
- Auto-generated unique bill IDs.  

✅ **Cart Summary Before Print**  
- View all selected items and totals before finalizing the bill.  
- Supports discount or offer integration.  

✅ **Download & History**  
- Each bill is automatically saved in history (localStorage).  
- Download full billing history as a **PDF table** (with ID, Date/Time, Total).  
- Persistent history even after reload.  

✅ **Dark/Light Mode Toggle**  
- One-click toggle between light and dark theme.  
- Preferences saved locally for future visits.

**Add by Price**

Some products in this billing system include a weight-based price structure (for example: Chicken – PKR 1200 per 1000g).
The Add by Price button allows the shopkeeper to add items based on the amount the customer wants to spend, instead of quantity or grams.

How it works

1.The user clicks Add by Price on a product that has a gram value defined.

2.A prompt asks for the amount (PKR) the customer wants to purchase.

3.The system automatically calculates how many grams can be purchased for that amount.

4.The item is added to the cart with:
  >Price = entered amount
  >Quantity = calculated grams (e.g., “480g”)

**Purpose**

This feature is designed for shops that sell products by weight, where customers commonly order by price instead of fixed grams.
It makes the billing faster, more accurate, and avoids manual calculations.

---

## 🧠 Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Storage | Browser LocalStorage |
| Styling | Custom CSS + Flexbox/Grid |
| PDF & Print | Native Browser Print API |

---

## ⚙️ Installation & Usage

1. **Clone or Download** this repository.  
   ```bash
      https://github.com/Muhammad-Arsalan-Khan/billing-system.git

