var BodyParser = require('body-parser');
var Express = require('express');
var ErrorHandler = require('errorhandler')
var Morgan = require('morgan');
var Version = require('./lib/version/version');
var Env = require('./config/environment');
var PORT = Env.PORT;

var app = Express();
app.use(BodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(Express.static('public'));
app.use(Morgan('combined'));

// curl http://localhost:3000/versions/fixtures:entrypoint/HEAD.json
app.get('/versions/:name/:tag.json', function(req, res) {
    var version = new Version();
    var name = req.params['name'];
    var tag = req.params['tag'];
    var url = version.getBundleURL(name, tag);
    if (url) {
        res.status(200).json({ status: 200, url: url });
    }
    else {
        res.status(404).json({ status: 404, error: 'No such version' });
    }
});

function validSaveRequest(config, body, req) {
    if (config.public === true) return true;
    if (config.apiKeys && config.apiKeys.length) {
        if (config.apiKeys.indexOf(req.params.apiKey) !== -1) {
            return true;
        }
    }
    return false;
}

// curl -X POST -H "Content-Type: application/json" --data @test/fixtures/entrypoint.json http://localhost:3000/versions.json
app.post('/versions.json', function(req, res) {
    var body = req.body;
    if (!body.name || !body.tag || !body.files) {
        res.status(422).json({ status: 422, error: 'Invalid params', request: body });
    }
    else {
        var version = new Version();
        version.getConfiguration(body.name, body.tag, function(configErr, config) {
            if (configErr || !validSaveRequest(config, body, req)) {
                res.status(401).json({ status: 401, error: 'Not permitted', request: body });
            }
            else {
                version.save(body.name, body.tag, body.files, function(saveErr, result) {
                    if (saveErr) return res.status(500).json({ status: 500, error: 'Server error', request: body });
                    res.status(201).json({ status: 201, url: version.getBundleURL(body.name, body.tag) });
                });
            }
        });
    }
});

app.listen(PORT);
console.log('Starting up best-ecosystem-' + Env.kind);
console.log('Listening on port ' + PORT + '...');
