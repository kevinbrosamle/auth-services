import { assert, should, expect } from 'chai';
import proxyquire from 'proxyquire';
import Promise from 'bluebird';

describe('Authentication HTTP endpoints:', function() {
  describe('registerUser', function() {
    it("should register user", function (done) {
      let awsCognitoController = proxyquire('../awsCognitoController.js', {
        "amazon-cognito-identity-js": {
          CognitoUserPool: function() {
            return {
              signUp: function(username, password, attributeList, opts, ...args) {
                args[args.length - 1](null, ['user1', 'user2'])
              }
            }
          },
          CognitoUserAttribute: function() {}
        }
      });

      awsCognitoController.registerUser({
        username: 'user',
        password: 'pass'
      }, function(error, result) {
          expect(error).to.be.null;
          expect(result).to.deep.equal(['user1', 'user2']);
          done();
      });

    });
  });
  describe('verifyUser', function() {
    let testJwt = 'eyJraWQiOiJGajNOcDZyZmpHNXdDMk0rZU9YeDF4bk45NEw4c2FYTFwvR2x5MzdtR1BGMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJjZDUzNzU1OS0xZjkzLTQxMDMtYjY5ZS1lNDYyNjJjOWUzNmIiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfcThKWGZwclozIiwiZXhwIjoxNDc1NjMwMzY4LCJpYXQiOjE0NzU2MjY3NjgsImp0aSI6ImRkYTNlZDA1LTRlZmItNDllZC05NGRkLWVlYTZmOTc2NGY2NyIsImNsaWVudF9pZCI6IjR2YTBoYTQ5M28ycjRiZTJrZW5kYm45Y2dhIiwidXNlcm5hbWUiOiJrZXZpbiJ9.rjQ3mDgf-VwND7gXqxLoMyjoxDefBkfA3FLOUXhYHgqt_-zr8nIlHTOY-MFZcbbCEU3P0qaKz8xqnDapgU2DS3mxrCp5eAWgWxrsxAd8oD7tgKJUgAgeMpAcuuuCRm-93xjJQ1cE1OvbqplWTjJvNxhj60SRWsDvpdVUvJXH4OnjcD_r1fjC5evl8Z05xaq1RY_a8DBCgluV-tpDqYcMpQ0bT8dWvMx7yijlOjQZEchbFQwMDO4-3vKbd-b6VGSctaEYr7YvWLWoCbxMSErMKkZWrFZZh4iZmbfaW8ce8aOYW5T-dtkxnxHfjoN4JGHFNIm_bXFzXC2bbuEDeSsGyg';
    let awsCognitoController = proxyquire('../awsCognitoController.js', {
      "request-promise": Promise.promisify(function(opts, cb) {
        if (opts.url === 'https://cognito-idp.us-west-2.amazonaws.com/us-west-2_q8JXfprZ3/.well-known/jwks.json') {
          cb(null,
            JSON.stringify({
              keys: [{
                "alg": "RS256",
                "e": "AQAB",
                "kid": "Fj3Np6rfjG5wC2M+eOXx1xnN94L8saXL/Gly37mGPF0=",
                "kty": "RSA",
                "n": "ud08GlowEnS43VPmoT5WdbYwBwJ8e7b3MfvTeXzCbK0UGqsq_HrprAwFeXEU_DAJgi1dHMWagK7u2meIXFsxJC9UXVGR5aOdM7F_QNkG2D7FBummAUiYU3HLHC5TVTMbnS0SbH-0QIRivbO-Ag3PANcoFBVoRtysZlpoPariZ8vrQkjO1E4e04pAqZm1nK039ai6sXVuAn2FP1BJ5XYvpmTy8l5Wlpr8O7tA9b4bD10j_sat6EX0iCR_-QRZ6uP37MP_2FyHo-t4JhJRziDQrPBFkjTjeS4rBDp1lgpZRQB96rf_sFmMZnOx8W52T3uTEsjLcV-wlf-RjEXVzHMDHw",
                "use": "sig"
              }]
            })
          );
        } else {
          cb(null,'kevin');
        }
      })
    });

    it('should verify user', function(done) {
      awsCognitoController.verifyUser(testJwt, function(error, result) {
        expect(error).to.be.null;
        expect(result).to.equal('kevin');
        done();
      })
    });
  });
});
