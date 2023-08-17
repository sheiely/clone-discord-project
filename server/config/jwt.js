const parse = function parseJwt(token) {
    try{
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }catch{
        console.log("an error occurred while descodifing token");
    }
    
}

module.exports = {parse};