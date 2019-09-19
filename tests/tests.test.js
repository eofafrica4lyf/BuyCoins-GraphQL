const axios =require("axios");

describe('GraphQL', () => {
	test('should (initially) return pre-filled conversion result', async () => {
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

describe('GraphQL, on supplying the right input formats', () => {
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

describe('GraphQL, on supplying wrong input format(s)', () => {
	test('should return an error', async () => {
		const response = await axios.post("http://localhost:4000/graphql", {
			query: `mutation{
				calculatePrice(type: "buyy", margin: 0.2, exchangeRate: 360){
					id
					result
				}
			}`
		})

		const {data} = response;
		console.log(JSON.stringify(data));
		expect(data.data).toHaveProperty("calculatePrice")
		expect(data.data.calculatePrice.id).toBe(0);
		expect(data.data.calculatePrice.result).toBe(null);
	})
});

