const axios =require("axios");

describe('GraphQL', () => {
	test('should return pre-filled conversion result', async () => {
		const response = await axios.post("http://localhost:4000/graphql", {
			query: `{
				allConversions{
					id
					result
				}
			}`
		})

		const {data} = response;
		expect(data.data).toHaveProperty("allConversions")
		expect(data.data.allConversions.length).toBe(1);
		expect(data.data.allConversions[0].id).toBe(1);
		expect(data.data.allConversions[0].result).toBe(340000);		
	})
	
});

describe('GraphQL', () => {
	test('should return one conversion result and to the previous result', async () => {
		const response = await axios.post("http://localhost:4000/graphql", {
			query: `mutation{
				calculatePrice(type: "buy", margin: 0.2, exchangeRate: 360){
					id
					result
				}
			}`
		})

		const {data} = response;
		console.log(JSON.stringify(data));
		expect(data.data).toHaveProperty("calculatePrice")
		expect(data.data.calculatePrice.id).toBe(2);
		expect(data.data.calculatePrice.result).toBeDefined();
		
	})
	
});

