const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
        events: [Event!]!
      }
      
      type RootMutation {
        createEvent(eventInput: EventInput): Event
      }

      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),

    rootValue: {
      events: () => {
        return Event.find()
          .then(events =>
            events.map(event => {
              return { ...event._doc };
            })
          )
          .catch(err => {
            throw err;
          });
      },
      createEvent: args => {
        const event = new Event({
          title: args.eventInput.title,
          description: args.eventInput.description,
          price: +args.eventInput.price,
          date: new Date(args.eventInput.date),
        });
        return event
          .save()
          .then(res => {
            console.log(res);
            return {
              ...res._doc,
            };
          })
          .catch(err => {
            console.log(err);
            throw err;
          });
      },
    },
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.M_USER}:${process.env.M_PASSWORD}@cluster0.dyy8g.mongodb.net/${process.env.db_NAME}?retryWrites=true&w=majority`,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: true,
    }
  )
  .then(() => console.log('db connected'))
  .then(() => app.listen(3000))
  .then(() => console.log('live on port 3000'))
  .catch(err => console.log(err));
