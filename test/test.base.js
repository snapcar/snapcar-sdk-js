var checkBooking = function (booking) {
  expect(booking).to.be.an.instanceof(SnapCar.Booking);
  expect(booking).to.have.property("id").and.to.be.not.empty;
  expect(booking).to.have.property("driverInfo");
  expect(booking).to.have.property("nameboard").and.to.be.a('boolean');
  expect(booking).to.have.property("creationDate").and.to.be.an.instanceof(Date);
}

describe("SnapCar", function() {

  describe('#activeBookings()', function(){
    it('Should return active bookings', function(done){
      
      SnapCar.activeBookings().done(function(results) {
        expect(results).to.be.an.instanceof(Array);

        $.each(results, function (key, result) {
          checkBooking(result);
        });

        done();
      }).fail(function(error) {
        done(error);
      });

    });
  });

  describe('#bookingsHistory()', function(){
    it('Should return bookings history', function(done){
      
      SnapCar.bookingsHistory().done(function(results) {
        expect(results).to.be.an.instanceof(SnapCar.BookingHistory);
        expect(results).to.have.property("count");
        expect(results).to.have.property("offset");
        expect(results).to.have.property("total");
        expect(results.history).to.be.an.instanceof(Array);

        $.each(results.history, function (key, result) {
          checkBooking(result);
        });

        done();
      }).fail(function(error) {
        done(error);
      });

    });
  });

  describe('#user()', function(){
    it('Should return the user', function(done){
      
      SnapCar.user().done(function(result) {
        expect(result).to.be.an.instanceof(SnapCar.Rider);
        expect(result).to.have.property("email").and.to.be.not.empty;
        expect(result).to.have.property("firstname").and.to.be.not.empty;
        expect(result).to.have.property("lastname").and.to.be.not.empty;
        expect(result).to.have.property("id").and.to.be.not.empty;
        expect(result).to.have.property("status").and.to.be.not.empty;
        expect(hashValues(SnapCar.RiderStatuses)).to.include.members([result.status]);

        done();
      }).fail(function(error) {
        done(error);
      });

    });
  });

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
        expect(specialArea.menuName).to.be.a('string').and.to.not.be.empty;
        expect(specialArea.name).to.be.a('string').and.to.not.be.empty;
        expect(specialArea.selectionRequired).to.be.a('boolean');

        expect(specialArea.meetingPoints).to.have.length.above(0);
        expect(specialArea.meetingPointsNameboard).to.have.length.above(0);

        $.each(specialArea.meetingPoints, function (key, meetingPoint) {
          expect(meetingPoint).to.be.an.instanceof(SnapCar.MeetingPoint);
          expect(meetingPoint.id).to.be.a('string');
          expect(meetingPoint.id).to.not.be.empty;
          expect(meetingPoint).to.be.an.instanceof(SnapCar.MeetingPoint);
          expect(meetingPoint.rdvPoint).to.be.a('string');
          expect(meetingPoint.rdvPoint).to.not.be.empty;
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