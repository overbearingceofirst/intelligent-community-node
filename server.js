// Entry point for the Intelligent Community Node application

const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware and routes can be added here

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
