var express = require('express');
var ibmdb = require('ibm_db');
var dotenv = require('dotenv');

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

dotenv.config();

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

app.post('/country-list', function (req, res) {
    queryDatabase(`SELECT * FROM ${db2.schema}.COUNTRY`, req, res);
});

app.post('/platform-list', function(req, res) {
    const code = req.body.code;
    queryDatabase(`SELECT PLATFORM_ID, LOCALIZED_NAME FROM ${db2.schema}.PLATFORM_AVAILABILITY WHERE COUNTRY_CODE = '${code}' AND AVAILABILITY = 'Available';`, req, res);
});

app.post('/show-list', function(req, res) {
    const code = req.body.code;
    const platformId = req.body.platform_id;
    queryDatabase(`SELECT ID, NAME, DESCRIPTION, TRAILER FROM ${db2.schema}.SHOW WHERE ID IN (SELECT SHOW_ID FROM ${db2.schema}.EPISODE WHERE ID IN (SELECT EPISODE_ID FROM ${db2.schema}.EPISODE_AVAILABILITY WHERE PLATFORM_MAPPING_ID = (SELECT ID FROM ${db2.schema}.PLATFORM_AVAILABILITY WHERE PLATFORM_ID = ${platformId} AND COUNTRY_CODE = '${code}')));`, req, res);
});

app.post('/episode-list', function(req, res) {
    const code = req.body.code;
    const platformId = req.body.platform_id;
    const showId = req.body.show_id;
    queryDatabase(`SELECT * FROM ${db2.schema}.EPISODE WHERE SHOW_ID = ${showId} AND ID IN (SELECT EPISODE_ID FROM ${db2.schema}.EPISODE_AVAILABILITY WHERE PLATFORM_MAPPING_ID = (SELECT ID FROM ${db2.schema}.PLATFORM_AVAILABILITY WHERE PLATFORM_ID = ${platformId} AND COUNTRY_CODE = '${code}'));`, req, res);
});

app.post('/genre-list', function(req, res) {
    const showId = req.body.show_id;
    queryDatabase(`SELECT * FROM ${db2.schema}.GENRE WHERE ID IN (SELECT GENRE_ID FROM ${db2.schema}.GENRE_MAPPING WHERE SHOW_ID = ${showId})`, req, res);
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});