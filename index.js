const express = require('express')
const app = express()
const cors = require('cors')

require('dotenv').config();
const PORT = 5000;

app.use(express.json());
app.use(cors());

const router = require('./routes/router');
app.use('/api', router);

app.listen(PORT, () => {
    console.log(`servidor corriendo en el puerto ${PORT}`)
})