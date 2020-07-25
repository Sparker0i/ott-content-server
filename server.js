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
    password: process.env.OTT_CONTENT_PASSWORD,
    schema: process.env.OTT_CONTENT_SCHEMA
};

var dbConnection;
var connString = `DRIVER={DB2};DATABASE=${db2.db};UID=${db2.username};PWD=${db2.password};HOSTNAME=${db2.hostname};port=${db2.port}`;

ibmdb.open(connString, function (err, connection) {
    if (err) {
        console.log(err.message);
    }
    else {
        dbConnection = connection;
    }
});

function queryDatabase(query, req, res) {
    dbConnection.query(query, function(err, result, moreResultSets) {
        console.log(moreResultSets);
        
        if (err) res.send(err.message);
        else {
            res.setHeader('content-type', 'application/json');
            res.send(result);
        }
    })
}

app.post('/country-select', function (req, res) {
    queryDatabase(`SELECT * FROM ${db2.schema}.COUNTRY`, req, res);
});

app.post('/platform-select', function(req, res) {
    const code = req.body.code;
    queryDatabase(`SELECT * FROM ${db2.schema}.PLATFORM_AVAILABILITY WHERE COUNTRY_CODE = '${code}'`, req, res);
})

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});