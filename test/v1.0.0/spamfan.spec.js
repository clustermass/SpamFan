const expect = require('chai').expect
const {matchStrings} = require("../../v1.0.0/spamfan" );

const assert = require('assert');

describe("SpamFan sript", function() {
  
  describe("matchStrings function", function() {
    it("should return true if two passed strings are equal", function(){
      expect(matchStrings("abc", "abc")).to.eql(true);
    });
  });
});