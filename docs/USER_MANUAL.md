# Click Silog Application User Manual

The following step-by-step guide is made to help users navigate through the application for easier operation throughout the system. This user manual covers all four user sections: **Admin**, **Cashier**, **Kitchen**, and **Customer** to ensure that all users can be guided on how the application works.

---

## Admin Interface

### 1. User Login

1. Open the Click Silog application
2. Click the **"Admin"** button on the login screen
3. Enter your **Username** (e.g., "admin")
4. Enter your **Password**
5. Click the **"Login"** button to proceed
6. You will be redirected to the Admin Dashboard

### 2. Sales Report

1. From the Admin Dashboard, click **"Sales Report"**
2. Select a date filter at the top:
   - **Today** - View today's sales
   - **Last 7 Days** - View sales from the past week
   - **Last 30 Days** - View sales from the past month
   - **All Time** - View all sales records
3. View the sales statistics:
   - **Total Sales** - Overall revenue
   - **Total Orders** - Number of completed orders
   - **Payment Method Breakdown** - Cash vs GCash payments
   - **Order Status Breakdown** - Completed vs Cancelled orders
4. To export data to CSV:
   - Scroll to the bottom of the screen
   - Click the **"Export CSV"** button
   - The CSV file will be saved to your device's download folder
   - Open the file with Excel or any spreadsheet application

### 3. Menu Management

1. From the Admin Dashboard, click **"Menu Management"**
2. View all menu items organized by category:
   - **Silog Meals**
   - **Snacks**
   - **Drinks**
3. To **add a new item**:
   - Click the **"Add Item"** button (usually at the top)
   - Enter the following:
     - Item Name
     - Category (select from dropdown)
     - Price
     - Upload Image (optional)
     - Enable/Disable "Customizable" option
   - Click **"Save"** to confirm
4. To **edit an existing item**:
   - Click the **"Edit"** button on the item card
   - Modify the details as needed
   - Click **"Save"** to confirm changes
   - A confirmation dialog will appear - click **"Yes"** to confirm
5. To **delete an item**:
   - Click the **"Delete"** button on the item card
   - A confirmation dialog will appear
   - Click **"Yes"** to confirm deletion, or **"No"** to cancel
6. To **toggle item availability**:
   - Click the availability toggle switch on an item
   - The item will be marked as available/unavailable immediately

### 4. Add-Ons Management

1. From the Admin Dashboard, click **"Add-on Management"**
2. View add-ons organized by category:
   - **Rice**
   - **Drinks**
   - **Extras**
3. To **add a new add-on**:
   - Click the **"Add Add-on"** button
   - Enter:
     - Add-on Name
     - Category (Rice, Drink, or Extra)
     - Price
   - Click **"Save"**
4. To **edit an add-on**:
   - Click the **"Edit"** button on the add-on
   - Modify details
   - Click **"Save"** to confirm
5. To **delete an add-on**:
   - Click the **"Delete"** button
   - Confirm deletion in the dialog

### 5. Discount Management

1. From the Admin Dashboard, click **"Discount Management"**
2. View all active and inactive discount codes
3. To **create a new discount**:
   - Click **"Add Discount"**
   - Enter:
     - Discount Name
     - Discount Code (unique code customers will use)
     - Discount Type:
       - **Percentage** - Discount as percentage (e.g., 10%)
       - **Fixed Amount** - Discount as fixed amount (e.g., ₱50)
     - Discount Value (percentage or amount)
     - Valid From Date
     - Valid Until Date
   - Click **"Save"** to create the discount
4. To **edit a discount**:
   - Click **"Edit"** on a discount
   - Modify details
   - Click **"Save"**
5. To **delete a discount**:
   - Click **"Delete"** on a discount
   - Confirm deletion

### 6. User Management

1. From the Admin Dashboard, click **"User Management"**
2. View all users (Admin, Cashier, Kitchen) with their roles and status
3. To **add a new user**:
   - Click the **"Add User"** button
   - Enter:
     - Username
     - Password
     - Role (select from: Admin, Cashier, Kitchen)
     - Status (Active or Inactive)
     - Display Name (optional)
   - Click **"Save"** to create the user
   - A confirmation dialog will appear - click **"Yes"** to confirm
4. To **edit a user**:
   - Click the **"Edit"** button on a user card
   - Modify the user details
   - Click **"Save"** to confirm changes
   - A confirmation dialog will appear - click **"Yes"** to confirm
5. To **delete a user**:
   - Click the **"Delete"** button on a user card
   - A confirmation dialog will appear
   - Click **"Yes"** to confirm deletion, or **"No"** to cancel
   - **Note:** Deletion is permanent and will remove the user from the database

### 7. Data Samples Management

1. From the Admin Dashboard, click **"Data Samples"**
2. To **generate sample orders** (for testing):
   - Click **"Generate Sample Orders"**
   - Wait for the confirmation message
   - Sample orders will be created with the `isSample: true` flag
3. To **delete sample data only**:
   - Click **"Delete Sample Data"**
   - Confirm the action
   - **Note:** This will only delete sample data, preserving all real orders
4. To **reset all orders** (WARNING: This deletes ALL data):
   - Click **"Reset All Orders"**
   - Confirm the action in the dialog
   - **WARNING:** This will permanently delete ALL orders (both sample and real data)
   - Use this only when you want to completely start fresh

### 8. Admin Settings

1. Click the **settings icon** (usually at the top right corner)
2. You can select:
   - **"Log Out"** - Logs out the Admin account
   - **"Payment Settings"** - Configure payment confirmation password
   - **"PIN Lock Settings"** - Configure app security lock settings

### 9. Logout

1. Click the **logout icon** at the top right of any Admin screen
2. A confirmation dialog will appear
3. Click **"Logout"** to confirm, or **"Cancel"** to stay logged in
4. You will be returned to the login screen

---

## Cashier Interface

### 1. User Login

1. Open the Click Silog application
2. Click the **"Cashier"** button on the login screen
3. Enter your **Username**
4. Enter your **Password**
5. Click the **"Login"** button to proceed
6. You will be redirected to the Cashier Dashboard

### 2. Viewing Orders

1. From the Cashier Dashboard, you can view all orders
2. Filter orders by status using tabs:
   - **Pending** - Orders awaiting payment
   - **Preparing** - Orders being prepared in kitchen
   - **Ready** - Orders ready for pickup
   - **Completed** - Completed orders
   - **All** - View all orders
3. Tap on an order to view details:
   - Order ID
   - Order type (Dine-in or Take-out)
   - Items with quantities
   - Total amount
   - Payment status

### 3. Processing Payments

1. From the order list, tap on an order that needs payment
2. Review the order details
3. Click **"Process Payment"**
4. Select payment method:
   - **Cash** - For cash payments
   - **GCash** - For GCash payments via PayMongo
5. For **Cash Payment**:
   - Enter the cash amount received
   - Enter the payment confirmation password
   - Click **"Confirm Payment"**
   - A receipt will be generated
6. For **GCash Payment**:
   - Click **"Pay with GCash"**
   - You will be redirected to PayMongo payment page
   - Complete the payment process
   - A receipt will be generated after successful payment

### 4. Creating New Orders

1. From the Cashier Dashboard, click **"New Order"** or navigate to the menu
2. Select order type:
   - **Dine-In**: Enter table number (1-8)
   - **Take-Out**: Enter customer name
3. Browse the menu by category:
   - **Silog Meals**
   - **Snacks**
   - **Drinks**
4. To add items to cart:
   - Tap on a menu item
   - Click **"Customize"** (if available)
   - Select add-ons (rice, drinks, extras)
   - Add special instructions (optional)
   - Click **"Add to Cart"**
5. View your cart:
   - Tap the cart icon
   - Review items and quantities
   - Apply discount code (optional):
     - Enter discount code
     - Click **"Apply"**
6. To place the order:
   - Click **"Place Order"**
   - Add order notes (optional)
   - Select payment method (Cash or GCash)
   - Process payment
   - Receipt will be generated automatically

### 5. Logout

1. Click the **logout icon** at the top right
2. A confirmation dialog will appear
3. Click **"Logout"** to confirm
4. You will be returned to the login screen

---

## Kitchen Interface

### 1. User Login

1. Open the Click Silog application
2. Click the **"Kitchen"** button on the login screen
3. Enter your **Username**
4. Enter your **Password**
5. Click the **"Login"** button to proceed
6. You will be redirected to the Kitchen Display System (KDS)

### 2. Viewing Orders

1. The Kitchen Display System shows orders in three tabs:
   - **Pending** - New orders that need to be prepared
   - **Preparing** - Orders currently being prepared
   - **All** - All orders with status filter
2. Each order card displays:
   - **Order ID** (e.g., "1125015")
   - **Order Type**:
     - Dine-in: "Table: [number]"
     - Take-out: "Customer: [name]"
   - **Items** with quantities
   - **Special Instructions** (if any)
   - **Timestamp** - When the order was placed
   - **Status Badge** - Current order status

### 3. Managing Order Status

1. To **start preparing an order**:
   - Find the order in the **"Pending"** tab
   - Click the **"Start"** button
   - The order will automatically move to the **"Preparing"** tab
   - The status will update to "Preparing" in real-time

2. To **mark order as ready**:
   - Find the order in the **"Preparing"** tab
   - Click the **"Ready"** button
   - The order will move to the **"All"** tab with "Ready" status
   - Cashier and customer will be notified

3. To **complete an order**:
   - Find a "Ready" order in the **"All"** tab
   - Click the **"Complete"** button
   - The order will be marked as "Completed"
   - The order will remain in the "All" tab

4. To **cancel an order**:
   - Click the **"Cancel"** button on any order
   - Enter a cancellation reason in the dialog
   - Click **"Confirm Cancel"** to cancel the order
   - The order will be marked as "Cancelled"

### 4. Order Details

1. Tap on any order card to view full details:
   - Complete item list with quantities
   - All special instructions
   - Order timestamp
   - Customer/Table information
   - Order status history

### 5. Logout

1. Click the **logout icon** at the top right
2. A confirmation dialog will appear
3. Click **"Logout"** to confirm
4. You will be returned to the login screen

---

## Customer Interface

### 1. Accessing the Customer Station

1. Open the Click Silog application
2. Click the **"Customer"** button on the login screen
3. Choose your order type:
   - **Dine-In**: 
     - Enter your **Table Number** (1-8)
     - Click **"Continue"**
   - **Take-Out**:
     - Enter your **Customer Name**
     - Click **"Continue"**
4. You will be redirected to the menu screen

### 2. Browsing the Menu

1. The menu is organized by categories:
   - **Silog Meals** - Main dishes
   - **Snacks** - Appetizers and snacks
   - **Drinks** - Beverages
2. Browse items by scrolling or using category filters
3. Tap on any item to view:
   - Item name and description
   - Price
   - Available customizations

### 3. Customizing Items

1. Tap on a menu item
2. If the item is customizable, click **"Customize"**
3. Select add-ons:
   - **Rice** options (if available)
   - **Drinks** options (if available)
   - **Extras** (if available)
4. Add **Special Instructions** (optional):
   - Type any special requests
   - Example: "No onions", "Extra spicy"
5. Review the total price (base price + add-ons)
6. Click **"Add to Cart"** to add the item

### 4. Managing Your Cart

1. Tap the **cart icon** (usually at the top right) to view your cart
2. Review all items in your cart:
   - Item names
   - Quantities
   - Individual prices
   - Total price per item
3. To modify quantities:
   - Use the **+** and **-** buttons
   - Or remove items using the delete button
4. To apply a discount:
   - Enter your **Discount Code** (if you have one)
   - Click **"Apply"**
   - The discount will be applied to your total
5. Review your order summary:
   - Subtotal
   - Discount (if applied)
   - Total amount

### 5. Placing an Order

1. From your cart, click **"Checkout"**
2. Review your order summary:
   - All items with quantities
   - Total amount
3. Add **Order Notes** (optional):
   - Enter any special instructions for the kitchen
   - Example: "Please make it fast", "Separate packaging"
4. Click **"Place Order"** to proceed to payment

### 6. Payment Processing

1. After placing your order, you'll see the payment screen
2. Select your payment method:
   - **Cash** - Pay with cash
   - **GCash** - Pay via GCash (PayMongo)

#### Cash Payment:
1. Select **"Cash"**
2. Enter the **Cash Amount** you're paying
3. The system will automatically calculate:
   - Total amount
   - Change to be returned
4. Review the amounts
5. Click **"Confirm Payment"**
6. Your receipt will be displayed

#### GCash Payment:
1. Select **"GCash"**
2. Click **"Pay with GCash"**
3. You will be redirected to the PayMongo payment page
4. Complete the payment using your GCash account:
   - Scan QR code, or
   - Enter payment details
5. Wait for payment confirmation
6. Once confirmed, you will be redirected back to the app
7. Your receipt will be displayed

### 7. Viewing Receipt

1. After successful payment, a receipt will be displayed
2. The receipt shows:
   - Order ID
   - Date and Time
   - Order Type (Dine-in/Take-out)
   - Table Number or Customer Name
   - Itemized list with prices
   - Subtotal
   - Discount (if applied)
   - Total Amount
   - Payment Method
   - Amount Paid
   - Change (for cash payments)
3. You can:
   - View the receipt on screen
   - The receipt is automatically saved

### 8. Starting a New Order

1. After completing an order, you can:
   - Start a new order from the menu
   - Your cart will be cleared automatically
   - You can browse and add new items

---

## General Tips

### For All Users:

1. **Internet Connection**: Ensure you have a stable internet connection for real-time synchronization
2. **Logout**: Always log out when finished to protect your account
3. **Error Messages**: Read error messages carefully - they will guide you on what went wrong
4. **Confirmation Dialogs**: Always read confirmation dialogs before confirming actions
5. **Data Sync**: Changes made by Admin (menu, prices) sync automatically to all stations

### For Admin:

1. **Backup Data**: Before using "Reset All Orders", ensure you have exported important data
2. **User Management**: Keep user accounts updated and remove inactive users
3. **Menu Updates**: Menu changes sync automatically - no need to notify staff manually
4. **Sales Reports**: Export CSV reports regularly for record-keeping

### For Cashier:

1. **Order Type**: Always select the correct order type (Dine-in or Take-out)
2. **Payment Confirmation**: Double-check payment amounts before confirming
3. **Receipts**: Ensure customers receive their receipts after payment

### For Kitchen:

1. **Order Priority**: Process orders in the order they arrive (FIFO)
2. **Status Updates**: Update order status promptly to keep customers informed
3. **Special Instructions**: Always check for special instructions on orders

### For Customers:

1. **Table Number**: Ensure you enter the correct table number for dine-in orders
2. **Customer Name**: Use a consistent name for take-out orders for easier tracking
3. **Special Instructions**: Use the notes field for any special requests
4. **Payment**: Have your payment method ready before checkout

---

## Troubleshooting

### Login Issues:
- **Forgot Password**: Contact Admin to reset your password
- **Account Locked**: Contact Admin if your account is inactive
- **Wrong Credentials**: Double-check your username and password

### Order Issues:
- **Order Not Appearing**: Check internet connection and refresh
- **Payment Failed**: Try again or use alternative payment method
- **Receipt Not Showing**: Contact staff for assistance

### Technical Issues:
- **App Crashes**: Restart the application
- **Slow Loading**: Check internet connection
- **Sync Issues**: Wait a few seconds for data to sync

---

## Support

For technical support or questions:
- Contact your system administrator
- Refer to the Admin for account-related issues
- Check the Project Summary documentation for technical details

---

**Last Updated:** 2025-01-XX


