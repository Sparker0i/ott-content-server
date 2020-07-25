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

var dbConnection;
var connString = `DRIVER={DB2};DATABASE=${db2.db};UID=${db2.username};PWD=${db2.password};HOSTNAME=${db2.hostname};port=${db2.port}`;

ibmdb.open(connString, function (err, connection) {
    if (err) {
        console.log(err.message)
    }
    else {
        dbConnection = connection
    }
});

app.get('/country-select', function (req, res) {
    dbConnection.query("SELECT * FROM OTT_TEST.COUNTRY", function(err, result, moreResultSets) {
        console.log(moreResultSets)
        
        if (!err) res.send(result)
        else res.send(err.message)
    })
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});