const axios = require('axios');
const {
	GraphQLSchema,
	GraphQLObjectType,
	GraphQLInt,
	GraphQLString,
	GraphQLNonNull,
	GraphQLList,
	GraphQLFloat
} = require('graphql');

const conversions = [{ id: 1, result: 340000 }];

//type of output that is returned from every conversion
const ConvertType = new GraphQLObjectType({
	name: 'Conversion',
	description: 'Returns a Buying or Selling Rate',
	fields: () => ({
		id: { type: GraphQLInt },
		result: { type: GraphQLFloat }
	})
});

//mandatory root query; gets all conversions
const RootQueryType = new GraphQLObjectType({
	name: 'Query',
	description: 'Root Query',
	fields: () => ({
		allConversions: {
			type: GraphQLList(ConvertType),
			description: 'History of conversions made',
			// resolve: () => conversions
			resolve: () => [{ id: 1, result: 340000 }]
		}
	})
});

//mutation contains 'calculatePrice' to carry out a conversion
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
				//Get the percentage
				const margin = args.margin / 100;
				//Get bitcoin-dollar rate and make computations with supplied values
				return axios('https://api.coindesk.com/v1/bpi/currentprice.json')
					.then(res => {
						const dollarRate = res.data.bpi.USD.rate_float;

						let updatedRate = 0;
						if (args.type === 'buy') {
							updatedRate = dollarRate + (dollarRate * margin);
						} else if (args.type === 'sell') {
							updatedRate = dollarRate - (dollarRate * margin);
						} else {
							conversions.push({
								id: 0,
								result: null
							});
							return {
								id: 0,
								result: null
							};
						}

						/**
						 * Final conversion result is the product of the computed rate
						 * and the supplied exchange naira-dollar rate
						 */
						const result = {
							id: conversions.length + 1,
							result: (updatedRate * args.exchangeRate).toFixed(2)
						};

						//Add the records of the conversion to our 'makeshift' database
						conversions.push(result);
						//Return output of conversion
						return result;
					})
					.catch(error => {
						console.log(error);
					});
			}
		}
	})
});

module.exports = new GraphQLSchema({
	query: RootQueryType,
	mutation: RootMutationType
});
