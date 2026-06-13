const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());


app.get('/', (req, res) => {
    let data = {
        "name": "Hayaahh",
        "email": "hayaa@gmail.com",
        "phone": "1234567890",
        "address": "123 Main Street, Anytown, USA",
        "items": [
            {
                "name": "T-shirt",
                "price": 10,
                "quantity": 1
            },
            {
                "name": "Hat",
                "price": 5,
                "quantity": 2
            }
        ]
    };
    res.send(data);
});
 

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});