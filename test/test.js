var should = require('should');

describe('Poolboy', function(){
  describe('test', function(){
    it('should run tests', function(){
      [1,2,3].indexOf(5).should.equal(-1);
      [1,2,3].indexOf(0).should.equal(-1);
    })
  })
})