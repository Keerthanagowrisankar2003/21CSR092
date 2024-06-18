const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const TEST_SERVER_URL = "https://20.244.56.144/test/auth"; 
const TIMEOUT = 500; 

let window = [];

app.use(express.json());

app.get('/numbers/:numberid', async (req, res) => {
    const numberid = req.params.numberid;
    const authToken = req.headers['authorization'];

    if (!['p', 'f', 'e', 'r'].includes(numberid)) {
        return res.status(400).json({ error: "Invalid number ID" });
    }

    if (!authToken) {
        return res.status(401).json({ error: "Authorization token is required" });
    }

    let numbers = [];
    let prevWindowState = [...window];

    try {
        const response = await axios.get(`${TEST_SERVER_URL}/${numberid}`, {
            timeout: TIMEOUT,
            headers: {
                'Authorization': authToken
            }
        });
        numbers = response.data.numbers;
    } catch (error) {
        return res.status(500).json({ error: "Failed to fetch numbers from the test server" });
    }

    const uniqueNumbers = [...new Set(numbers)];

    uniqueNumbers.forEach(num => {
        if (!window.includes(num)) {
            if (window.length >= WINDOW_SIZE) {
                window.shift();
            }
            window.push(num);
        }
    });

    const currWindowState = [...window];
    const avg = window.length ? (window.reduce((acc, val) => acc + val, 0) / window.length) : 0;

    res.json({
        numbers: numbers,
        windowPrevState: prevWindowState,
        windowCurrState: currWindowState,
        avg: parseFloat(avg.toFixed(2))
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
