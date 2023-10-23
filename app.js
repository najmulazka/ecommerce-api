require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const router = require('./routes/index');
const { PORT = 3000 } = process.env;

app.use(morgan('dev'));
app.use(express.json);
app.use('/api/v1', router);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
