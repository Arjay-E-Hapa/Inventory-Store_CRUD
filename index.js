const app = require('./app');

// Get the port from environment variables or use 3000 as default
const PORT = process.env.PORT || 3000; 

// Start the server listener
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});