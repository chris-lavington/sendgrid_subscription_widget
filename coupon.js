const fetch = require('node-fetch');
const url = 'https://lovelycards.co.uk/rest/V1/bangerkuwranger/couponcode/getCouponCode/';

var headers = {
  'Content-type': 'application/json',
  'Authorization': 'Bearer wijraa4ky8l23f4vss8oj3swdumcxm66'
  };

var dataString = '{"ruleId":"2","custId":"0"}';

var options = {
  method: 'POST',
  headers: headers,
  body: dataString
 };

return fetch(url,options)
  .then(function(res) {
      return res.json();
  }).then(function(json) {
      console.log('json: ' +json);
      var offerCode = json;
      module.exports = {
        offerCode: offerCode
      };
  }).catch(function(err) {
      console.log(err);
  });
