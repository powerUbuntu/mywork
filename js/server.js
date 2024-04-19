const express = require('express');
const app = express();
const PORT = 3000;


app.use(express.static('public'));
// Define a route
app.get('/', (req, res) => {
    res.sendFile(__dirname+"/views/index.html")
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
