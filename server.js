const express = require('express');
const expressGraphQL = require('express-graphql');
const axios = require('axios');
const app = express();
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLInt,
	GraphQLString,
	GraphQLNonNull,
  GraphQLList,
  GraphQLFloat
} = require('graphql');

const conversions = [{ id: 1, result: 3400 }];

const ConvertType = new GraphQLObjectType({
	name: 'Conversion',
	description: 'Returns a Buying or Selling Rate',
	fields: () => ({
		id: { type: GraphQLNonNull(GraphQLInt) },
		result: { type: GraphQLNonNull(GraphQLFloat) }
	})
});

const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
		allConversions: {
			type: GraphQLList(ConvertType),
			description: 'History of conversions made',
			resolve: () => conversions
		}
	})
});

const RootMutationType = new GraphQLObjectType({
	name: 'Mutation',
	description: 'Root Mutation',
	fields: () => ({
		calculatePrice: {
			type: ConvertType,
			description:
				'Calculates a rate in Naira for a buyer or seller in real time',
			args: {
				type: { type: GraphQLNonNull(GraphQLString) },
				margin: { type: GraphQLNonNull(GraphQLFloat) },
				exchangeRate: { type: GraphQLNonNull(GraphQLInt) }
			},
			resolve: (parent, args) => {
				const margin = args.margin / 100;
				// const dollarRate = 10000;
				return axios('https://api.coindesk.com/v1/bpi/currentprice.json')
					.then(res => {
						const dollarRate = res.data.bpi.USD.rate_float;

						const updatedRate =
							args.type === 'buy' ? dollarRate + margin : dollarRate - margin;
						const nairaExchangeRate = args.exchangeRate;
						const result = {
							id: conversions.length + 1,
							result: updatedRate * nairaExchangeRate
            };
						conversions.push(result);
						return result;
					})
					.catch(error => {
            console.log(error);
          });
			}
		}
	})
});

const schema = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType
});

app.use(
	'/graphql',
	expressGraphQL({
		schema,
		graphiql: true
	})
);

app.listen(4000, () => {
	console.log('Server is running');
});
