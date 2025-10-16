# Inventory-Store_CRUD

This project provides a robust RESTful API for managing product inventory, supplier relationships, and sales/purchase orders. It is built with a strong focus on data integrity, utilizing Mongoose Transactions to ensure consistency between Order creation/deletion and Product stock levels.

🚀 Key Features
Transactional Integrity (ACID): All Order operations (POST, PUT to Cancel, DELETE) are wrapped in Mongoose transactions to guarantee that stock changes and order status updates are atomically applied or completely rolled back.
Real-time Stock Management: Product stock is automatically deducted when a new order is created and restocked when an order is cancelled or deleted.
Filtering and Pagination: All primary read endpoints (/api/products, /api/suppliers, /api/orders) support filtering and pagination to handle large datasets efficiently.
Resource Management: Dedicated CRUD endpoints for Products, Suppliers, and Orders.

🛠️ Installation and Setup
Prerequisites
Node.js (LTS version)
MongoDB Instance (Local or Atlas)
Steps
Clone the Repository
Install Dependencies
npm install



Environment Variables
Create a .env file in your root directory and configure the database connection:
PORT=3000
MONGO_URI=mongodb+srv://toast_db_user:Toast1234@toast.5eozucr.mongodb.net/toastdb?retryWrites=true&w=majority




Run the Server
npm start 
# or using nodemon: npm run dev



🔗 API Endpoints
The API is structured around three main resources: Products, Suppliers, and Orders. All endpoints are prefixed with /api.
1. Products (/api/products)
Method
Route
Description
Query Parameters
GET
/api/products
Get all products with pagination.
page, limit, sku, name
GET
/api/products/:id
Get a product by ID.


POST
/api/products
Create a new product. (Requires { name, sku, price, stock })


PUT
/api/products/:id
Update an existing product.


DELETE
/api/products/:id
Delete a product. (Returns 204 No Content)



2. Suppliers (/api/suppliers)
Method
Route
Description
Query Parameters
GET
/api/suppliers
Get all suppliers with pagination.
page, limit, name
GET
/api/suppliers/:id
Get a supplier by ID.


POST
/api/suppliers
Create a new supplier. (Requires { name, contact, phone })


PUT
/api/suppliers/:id
Update an existing supplier.


DELETE
/api/suppliers/:id
Delete a supplier. (Returns 204 No Content)



3. Orders (/api/orders) - Transactional Endpoints
These endpoints are governed by Mongoose transactions and stock management logic.
Method
Route
Description
Stock Impact
Status Code
GET
/api/orders
Get all orders with pagination.
None
200 OK
GET
/api/orders/:id
Get an order by ID (Populated).
None
200 OK
POST
/api/orders
Create new order.
Deducts stock.
201 Created
PUT
/api/orders/:id
Update order status.
Restocks if status changes to 'Cancelled'.
200 OK
DELETE
/api/orders/:id
Delete the order.
Restocks if not already 'Cancelled'.
200 OK (Custom response)

🧪 Order Endpoint Examples
1. Create Order (POST /api/orders)
This operation verifies stock, deducts it, and creates the order, all within a transaction.
# Example IDs for product and supplier
export PRODUCT_ID="68f0d16c10fcaafa9ce40166" 
export SUPPLIER_ID="68f0eda48ff33498ef2cef76"

curl -X POST http://localhost:3000/api/orders -H "Content-Type: application/json" -d '{
    "supplierId": "'"$SUPPLIER_ID"'", 
    "items": [
        {
            "productId": "'"$PRODUCT_ID"'", 
            "qty": 5,
            "price": 25.99
        }
    ]
}'

# Success Response (201 Created) includes the new Order ID.



2. Cancel Order (PUT /api/orders/:id)
Changing the status to Cancelled will automatically trigger the stock to be returned (restocked) in a safe transaction.
export ORDER_ID="PASTE_YOUR_ORDER_ID_HERE"

curl -X PUT http://localhost:3000/api/orders/$ORDER_ID -H "Content-Type: application/json" -d '{
    "status": "Cancelled" 
}'

# Success Response (200 OK) returns the updated order.



3. Delete Order (DELETE /api/orders/:id)
Deletion also triggers a transaction to restock the items, unless the order was already cancelled. The custom response returns 200 OK and the deleted document for confirmation.
export ORDER_ID="PASTE_YOUR_ORDER_ID_HERE"

curl -i -X DELETE http://localhost:3000/api/orders/$ORDER_ID

# Success Response (200 OK) - Confirms deletion and returns the deleted object.



