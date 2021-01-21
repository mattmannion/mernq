import express from 'express';
import bodyParser from 'body-parser';
import graphqlHttp from 'express-graphql';

const app = express();

app.use(bodyParser.json());

app.use('/graphql');

app.listen(3000);
