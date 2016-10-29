// NOTE: Best practice to not include my authentication codes.  Feel free to use yours or email me directly.   

var twitterObj = require('twitter'), 
    twitter = new twitterObj({
    consumer_key: 'XXX',
    consumer_secret: 'XXX',
    access_token_key: 'XXX',
    access_token_secret: 'XXX'
  }); 

    module.exports = twitter; 