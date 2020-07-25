var express = require('express');
var ibmdb = require('ibm_db');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

var db2 = {
    db: process.env.OTT_CONTENT_DATABASE,
    hostname: process.env.OTT_CONTENT_SERVER,
    port: process.env.OTT_CONTENT_PORT,
    username: process.env.OTT_CONTENT_USERNAME,
    password: process.env.OTT_CONTENT_PASSWORD
};