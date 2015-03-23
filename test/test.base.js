describe("SnapCar", function() {

  describe('#eta()', function(){
    it('Should return ETA', function(done){
      
      SnapCar.eta(48.859041, 2.327889).done(function(etas) {
        expect(etas).to.be.an.instanceof(Array);
        expect(etas).to.have.length.above(2);

        $.each(etas, function (key, eta) {
          expect(eta).to.be.an.instanceof(SnapCar.ETAResult);
          expect(eta).to.have.property("serviceClass");
          expect(eta).to.have.property("status");
        });

        done();
      }).fail(function(error) {
        done(error);
      });

    });
  });


  describe("Set locale", function() {
    it("Locale should be set", function() {
      SnapCar.locale = "fr";
      expect(SnapCar.locale).to.equal("fr");
    });

  });

});