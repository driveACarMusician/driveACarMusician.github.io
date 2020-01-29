const handleData = function(url, callback, otherParameters = [], method = 'GET', body = null, headers = { 'Content-Type': 'application/json', Accept: 'application/json' }) {
	if (!url) return console.error('The "url" parameter is required.');
	if (!callback) return console.error('The "callback" parameter is required.');
	fetch(url, {
		method: method,
		body: body,
		headers: headers
	})
		.then(function(response) {
			if (!response.ok) throw Error(`Fetch response error: ${response.status}`);
			else return response.json();
		})
		.then(function(data) {
			if (otherParameters) callback(data, otherParameters);
			else callback(data);
		})
		.catch(function(error) {
			console.error(`Error from fetch: ${error}`);
		});
};
