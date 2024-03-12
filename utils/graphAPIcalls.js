const callGraphAPI = ({ accessToken, pathUri, method }) => {
    console.log("callGraphAPI")
    return new Promise((resolve, reject) => {
        const https = require('https');
        const options = {
            hostname: 'graph.facebook.com',
            path: `/v19.0/${pathUri}access_token=${accessToken}`,
            method: method || 'GET'
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            })

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log({ jsonData })
                    // if (jsonData.data && jsonData.data.length > 0) {
                    resolve(jsonData);

                    // } else {
                    //     reject(new Error('insuffient permissions'))
                    // }
                } catch (error) {
                    reject(new Error('failed to parse the response' + error.messages));
                }
            });

            res.on('error', (error) => {
                reject(new Error('Error during API request' + error.message))
            })
        });
        req.end();

    });
}

module.exports = {
    callGraphAPI
}