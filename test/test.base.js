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

  describe('#meetingPoints()', function() {
    it('Should not find a special area at a specific location', function(done){
      SnapCar.meetingPoints(148.859041, -2.327889).fail(
        function(error) {
          expect(error).to.have.property("code");
          expect(error.code).to.equal(404);
          done();
        }).done(function(result) {
          done(new Error('We are not supposed to get a special area at this location.'));
        });
    });

    it('Should find a special area at a specific location', function(done){
      SnapCar.meetingPoints(48.729983, 2.366095).done(function(specialArea) {
        expect(specialArea).to.be.an.instanceof(SnapCar.SpecialArea);
        expect(specialArea.areaType).to.equal(SnapCar.SpecialAreaTypes.AIRPORT);
        expect(specialArea.meetingPoints).to.be.an.instanceof(Array);
        expect(specialArea.meetingPointsNameboard).to.be.an.instanceof(Array);
        expect(specialArea.menuName).to.be.a('string');
        expect(specialArea.name).to.be.a('string');
        expect(specialArea.menuName).to.not.be.empty;
        expect(specialArea.name).to.not.be.empty;
        expect(specialArea.selectionRequired).to.be.a('boolean');

        done();
      }).fail(function(error) {
        done(error);
      });

    });    
  });  

SnapCar.meetingPoints(48.731010, 2.365823).done(function (specialArea) {

    // There's a special area at this location. 
    // Check out the specialArea info (which is an instance of SnapCar.SpecialArea)

}).fail(function (error) {
    if (error.code === 404) {
        // No special area/meeting points at this location
    } else {
        // An other error occurred
    }
});  


  describe("Set locale", function() {
    it("Locale should be set", function() {
      SnapCar.locale = "fr";
      expect(SnapCar.locale).to.equal("fr");
    });

  });

});