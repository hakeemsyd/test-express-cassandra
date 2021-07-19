const express = require('express');
const app = express();
const port = 8000;
var models = require('express-cassandra');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const url = require('url');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.post('/add_person', async (req, res) => {
  var person = new models.instance.Person({
    name: req.body.name,
    surname: req.body.surname,
    age: req.body.age,
    created: new Date(),
  });
  person
    .saveAsync()
    .then(function () {
      console.log('Person Added:: ');
      res.send(person);
    })
    .catch(function (err) {
      res.send(err);
    });
});

app.get('/person', async (req, res) => {
  let parsedUrl = url.parse(req.url);
  let nameVal = querystring.parse(parsedUrl.query).name;

  const person = await models.instance.Person.findOne(
    { name: nameVal },
    function (err, person) {
      if (person) {
        res.send(person);
        return;
      }
      res.send('No record found');
    }
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

var ExpressCassandra = require('express-cassandra');
var CassandraDriver = require('cassandra-driver');
CassandraDriver.types.consistencies.localQuorum;
var models = ExpressCassandra.createClient({
  clientOptions: {
    localDataCenter: 'us-east-1',
    protocolOptions: { port: 29080, cql_port: 29042 },
    keyspace: 'testing',
    cloud: {
      secureConnectBundle: __dirname + '/secure-connect-trimulabs.zip',
    },
    queryOptions: { consistency: ExpressCassandra.consistencies.one },
    socketOptions: { readTimeout: 0 },
    authProvider: new CassandraDriver.auth.DsePlainTextAuthProvider(
      'lzSmMtyanJDkJUwftmKnmyuM',
      'TAgSCMO0MZiUzuPmWoNEgMM7OqRCM68-rjbypcv0pjJ_Q1UgDDoHEK9dDEAXC72fyX67T2b4K6ZHbiCfq.chJDgsDZTWzs6iSGr7Nl9J_20jeKurR4ldg+Jn1eTnZcP4'
    ),
    queryOptions: { consistency: models.consistencies.localQuorum },
  },
  ormOptions: {
    defaultReplicationStrategy: {
      class: 'SimpleStrategy',
      replication_factor: 1,
    },
    migration: 'safe',
    createKeyspace: false,
  },
});

var MyModel = models.loadSchema('Person', {
  fields: {
    name: 'text',
    surname: 'text',
    age: 'int',
    created: 'timestamp',
  },
  key: ['name'],
});

console.log(models.instance.Person === MyModel);

MyModel.syncDB(function (err, result) {
  if (err) throw err;
});
