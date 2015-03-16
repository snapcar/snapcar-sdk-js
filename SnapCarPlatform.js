/**
 * The base SnapCarPlatform module.
 *
 * @module SnapCarPlatform
 */

var SnapCarPlatform = (function (SnapCarPlatform, $) {

    // Properties: browser compatibility

    var canDefineProperty = (typeof Object.defineProperty === 'function');
    if (canDefineProperty) {
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            canDefineProperty = false;
        }
    }

    /**
     * Defines some basic API configuration.
     *
     * @class Config
     * @constructor
     */

    SnapCarPlatform.Config = function () {};      

    if (canDefineProperty) {
        Object.defineProperties(SnapCarPlatform.Config, {
            
            /**
             * The web service base domain on which API calls are made. You can change this value in order to perform requests on demo/sandbox web services rather than the production one.
             *
             * @property baseDomain
             * @type String
             * @default "https://api.snapcar.com/public"
             */
            
            baseDomain: {enumerable: true, writable: true, value: 'https://api.snapcar.com/public'},

            /**
             * The user token. You must provide this value in order to be able to make API calls.
             *
             * @property token
             * @type String
             */
            
            token: {enumerable: true, writable: true},

            /**
             * The user locale. As you may know, some information returned through the API are localized (ex. : the meeting point details). You need to set this value in order to receive data localized in the user language if supported. The fallbackLocale value is used otherwise.
             *
             * @property locale
             * @default "en"
             * @type String
             */
            
            locale: {enumerable: true, writable: true, value: 'en'},

            /**
             * Locale used as a default in case you would provide a non supported locale value. Its value is "en".
             *
             * @property fallbackLocale
             * @type String
             */
            
            fallbackLocale: {enumerable: true, writable: false, value: 'en'}
        });
    }

    else {
        SnapCarPlatform.Config.baseDomain = 'https://api.snapcar.com/public';
        SnapCarPlatform.Config.locale = 'fr';
        SnapCarPlatform.Config.fallbackLocale = 'fr';
    }

    // Define property helper

    function defineProperties(object, properties) {

        $.each(properties, function (interfaceProperty, propertyConfig) {
            properties[interfaceProperty].propertyDescriptors = $.extend({}, {enumerable: true, writable: false, configurable: false}, propertyConfig.propertyDescriptors || {});
        });

        object.mapping = $.extend({}, object.mapping || {}, properties);

        if (canDefineProperty) {
            var propConfig = {};

            $.each(properties, function (key, val) {
                propConfig[val.name] = val.propertyDescriptors;
            });

            Object.defineProperties(object.prototype, propConfig);
        }
    }


    // Helper

    var getTextInLocale = function (payload) {
        return payload[SnapCarPlatform.Config.locale] || payload[SnapCarPlatform.Config.fallbackLocale];
    };

    var processObjectPayload = function (instance, payload, specialValueCallback) {
        var propertyConfig = [];
        $.each(payload || {}, function (key, val) {
            if (typeof instance.constructor.mapping === 'object') {
                var mapping = instance.constructor.mapping[key];

                if (typeof mapping === 'object') {
                    value = typeof specialValueCallback !== 'undefined' ? (specialValueCallback(key, val) || val) : val;

                    // Property is writable, value can directly be set
                    if (!canDefineProperty || mapping.propertyDescriptors.writable) {
                        instance[mapping.name] = value;
                    }

                    // Property not writable, should be redefined
                    else {

                        propertyConfig[mapping.name] = $.extend({}, mapping.propertyDescriptors, {
                            value: value,
                            configurable: true // Values might be refreshed later
                        });

                    }
                }
            }
        });

        if (canDefineProperty) {
            Object.defineProperties(instance, propertyConfig);
        }
    };

    var bootstrapInstanceProperties = function (instance) {
        if (canDefineProperty) {
            var propertyConfig = [];
            $.each(instance.constructor.mapping, function (key, val) {
                propertyConfig[val.name] = $.extend({}, true, val.propertyDescriptors.clone, {
                    writable: true,
                    configurable: true
                });
            });
            Object.defineProperties(instance, propertyConfig);
        }
    };

    /**
     * Error object that is created upon errors such as a wrong API call.
     *
     * @class Error
     * @param type {string} The type of error.
     * @param message {string} A key which defines more precisely the type of error.
     * @param description {string} A human readable text describing the error. Not to be displayed to the user.
     * @constructor
     */
    
    SnapCarPlatform.Error = function (type, message, description) {
        processObjectPayload(this, {
            type: type,
            message: message,
            description: description
        });
    };

    defineProperties(SnapCarPlatform.Error, {
        
        /**
         * The type of error.
         *
         * @property type
         * @type String
         */
        
        type: {name: 'type'},

        /**
         * A key which defines more precisely the type of error.
         *
         * @property message
         * @type String
         */
        
        message: {name: 'message'},

        /**
         * A human readable text describing the error. Not to be displayed to the user.
         *
         * @property description
         * @type String
         */
        
        description: {name: 'description'}
    });


    /**
     * Represents an error created upon configuration issues such as trying to perform an API call with no token defined.
     *
     * @class ConfigError
     * @extends SnapCarPlatform.Error
     * @param message {string} A key which defines more precisely the type of error.
     * @param description {string} A human readable text describing the error. Not to be displayed to the user.
     * @constructor
     */
    
    SnapCarPlatform.ConfigError = function (message, description) {
        processObjectPayload(this, {
            type: 'config',
            message: message,
            description: description
        });
    };

    SnapCarPlatform.ConfigError.prototype = new SnapCarPlatform.Error();

    /**
     * Represents an error created when trying to make API calls with invalid parameters.
     *
     * @class InvalidParametersError
     * @extends SnapCarPlatform.Error
     * @param message {string} A key which defines more precisely the type of error.
     * @param description {string} A human readable text describing the error. Not to be displayed to the user.
     * @constructor
     */

    SnapCarPlatform.InvalidParametersError = function (message, description) {
        processObjectPayload(this, {
            type: 'invalid_parameters',
            message: message,
            description: description
        });
    };

    SnapCarPlatform.InvalidParametersError.prototype = new SnapCarPlatform.Error();

    /**
     * Represents an error received from the API.
     *
     * @class APIError
     * @extends SnapCarPlatform.Error
     * @param payload {Object} The API response body.
     * @constructor
     */

    SnapCarPlatform.APIError = function (payload) {
        var instance = this;

        if (typeof payload === 'object') {
            processObjectPayload(this, $.extend({}, payload, {
                description: 'An API error occurred. Check the message parameter for more details.',
                type: 'api'
            }));
        } else {
            processObjectPayload(this, $.extend({}, payload, {
                message: 'other',
                description: 'An error occurred while sending the request.',
                server_response: 'An API error occurred. Check the message parameter for more details.',
                type: 'api'
            }));
        }
    };

    SnapCarPlatform.APIError.prototype = new SnapCarPlatform.Error();

    defineProperties(SnapCarPlatform.Error, {
        
        /**
         * The type of error.
         *
         * @property code
         * @type int
         */
        
        code: {name: 'code'},

        /**
         * Additional details such as a list of invalid parameters. Refer to the API reference for more information.
         *
         * @property details
         * @type Object
         */
        
        details: {name: 'details'},

        /**
         * The server response body.
         *
         * @property serverResponse
         * @type String
         */
        
        server_response: {name: 'serverResponse'}
    });


    // Model

    SnapCarPlatform.ServiceClass = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.ServiceClass.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'name':
                    return getTextInLocale(val);
            }
        });
    };

    defineProperties(SnapCarPlatform.ServiceClass, {
        id: {name: 'id'},
        name: {name: 'name'}
    });

    /**
     * Describes a meeting point that can optionnaly be attached to a booking for specific pick up location. It helps riders and drivers to find each other.
     *
     * @class MeetingPoint
     * @constructor
     */

    SnapCarPlatform.MeetingPoint = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.MeetingPoint.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'name':
                case 'rdv_point':
                    return getTextInLocale(val);
            }
        });
    };

    defineProperties(SnapCarPlatform.MeetingPoint, {
       
        /**
         * Unique meeting point identifier.
         *
         * @property id
         * @type String
         * @final
         */

        id: {name: 'id'},
        
        /*
         * Localized short name that briefly describes the meeting point. 
         *
         * @property name
         * @type String
         * @final
         */

        name: {name: 'name'},
        
        /**
         * Localized meeting point details that explain where the rider can meet his driver at the pick up location.
         *
         * @property rdvPoint
         * @type String
         * @final
         */

        rdv_point: {name: 'rdvPoint'}
    });


    /**
     * Describes an area with specific meeting points that the rider may select to help him finding his driver at specific pick up locations.
     *
     * @class SpecialArea
     * @constructor
     */

    SnapCarPlatform.SpecialArea = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.SpecialArea.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'name':
                case 'menu_name':
                    return getTextInLocale(val);
                    break;
                case 'meeting_points':
                case 'meeting_points_nameboard':
                    return $.map(val, function (payload) {
                        return new SnapCarPlatform.MeetingPoint(payload);
                    });
                    break;
            }
        });
    };

    defineProperties(SnapCarPlatform.SpecialArea, {
       
        /**
         * Unique identifier.
         *
         * @property id
         * @type String
         * @final
         */

        id: {name: 'id'},
      
        /**
         * Localized short name that briefly describes the area.
         *
         * @property name
         * @type String
         * @final
         */

        name: {name: 'name'},
       
        /**
         * Localized short value that describes the kind of meeting points that can be selected.
         *
         * @property menuName
         * @type String
         * @example
         *      "Terminal"
         * @final
         */

        menu_name: {name: 'menuName'},
        
        /**
         * Indicates if the user is required to select a meeting point for this area.
         *
         * @property selectionRequired
         * @type Boolean
         * @final
         */

        selection_required: {name: 'selectionRequired'},

        /**
         * The type of special area. Can either be a station, an airport or a regular area. Refer to the SnapCarPlatform.SpecialAreaTypes values.
         *
         * @property areaType
         * @type String
         * @example
         *      "airport"
         * @final
         */
        
        area_type: {name: 'areaType'},

        /**
         * An array of meeting points in which the user can select his preferred one if the user hasn't enabled the nameboard option.
         *
         * @property meetingPoints
         * @type Array
         * @final
         */
        
        meeting_points: {name: 'meetingPoints'},
        
        /**
         * An array of meeting points in which the user can select his preferred one if the user has enabled the nameboard option.
         *
         * @property meetingPointsNameboard
         * @type Array
         * @final
         */        
        
        meeting_points_nameboard: {name: 'meetingPointsNameboard'}
    });

    /**
     * Represents special area type constants.
     * 
     * @class SpecialAreaTypes
     * @static
     */
    SnapCarPlatform.SpecialAreaTypes = {
        /**
         * Station area type constant. Its value is "station".
         * 
         * @property STATION
         * @static
         * @final
         * @type String
         */
        STATION: 'station',

        /**
         * Airport area type constant. Its value is "airport".
         * 
         * @property AIRPORT
         * @static
         * @final
         * @type String
         */
        
        AIRPORT: 'airport',

        /**
         * Normal area type constant. Its value is "normal".
         * 
         * @property NORMAL
         * @static
         * @final
         * @type String
         */        
        
        NORMAL: 'normal'
    };

    SnapCarPlatform.ETAResult = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.ETAResult.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'service_class':
                    return new SnapCarPlatform.ServiceClass(val);
            }
        });
    };

    defineProperties(SnapCarPlatform.ETAResult, {
        status: {name: 'status'},
        eta: {name: 'eta'},
        service_class: {name: 'serviceClass'}
    });

    SnapCarPlatform.PaymentCard = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.PaymentCard.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
    };

    defineProperties(SnapCarPlatform.PaymentCard, {
        id: {name: 'id'},
        name: {name: 'name'},
        brand: {name: 'brand'}
    });

    SnapCarPlatform.Rider = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.Rider.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'card':
                    return new SnapCarPlatform.PaymentCard(val);
            }
        });
    };

    defineProperties(SnapCarPlatform.Rider, {
        id: {name: 'id'},
        firstname: {name: 'firstname'},
        lastname: {name: 'lastname'},
        email: {name: 'email'},
        status: {name: 'status'},
        card: {name: 'card'}
    });

    SnapCarPlatform.BookingPrice = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.BookingPrice.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'expiry_date':
                    return new Date(parseInt(val) * 1000);
            }
        });
    };

    defineProperties(SnapCarPlatform.BookingPrice, {
        id: {name: 'id'},
        price: {name: 'price'},
        currency: {name: 'currency'},
        expiry_date: {name: 'expiryDate'},
        service_class_id: {name: 'serviceClassId'},
        booking: {name: 'booking'}
    });

    SnapCarPlatform.BookingPrice.prototype.confirm = function bookingPriceConfirm() {

        var additionalParameters = {};

        if (typeof this.booking.driverInfo !== 'undefined') {
            additionalParameters.driver_info = this.booking.driverInfo;
        }

        if (typeof this.booking.meetingPoint !== 'undefined') {
            additionalParameters.meeting_point = this.booking.meetingPoint.id;
        }

        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/prices/" + this.id + "/confirm",
            method: 'POST',
            data: additionalParameters
        }, function (data) {
            this.booking.constructor.populateProperties(this.booking, data);
            return this.booking;
        });
    };

    SnapCarPlatform.CancellationFee = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.CancellationFee.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
    };

    defineProperties(SnapCarPlatform.CancellationFee, {
        charged: {name: 'charged'},
        amount: {name: 'amount'},
        vat: {name: 'vat'}
    });

    SnapCarPlatform.Address = function (name, city, postalCode, country) {
        bootstrapInstanceProperties(this);

        this.name = name;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
    };

    SnapCarPlatform.Address.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
    };

    defineProperties(SnapCarPlatform.Address, {
        name: {name: 'name'},
        postal_code: {name: 'postalCode'},
        city: {name: 'city'},
        country: {name: 'country'}
    });

    SnapCarPlatform.Location = function (lat, lng, address) {
        bootstrapInstanceProperties(this);

        this.lat = lat;
        this.lng = lng;
        this.address = address;
    };

    SnapCarPlatform.Location.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'address':
                    return new SnapCarPlatform.Address(val);
            }
        });
    };

    defineProperties(SnapCarPlatform.Location, {
        lat: {name: 'lat'},
        lng: {name: 'lng'},
        address: {name: 'address'}
    });

    SnapCarPlatform.GeoPoint = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.GeoPoint.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
    };

    defineProperties(SnapCarPlatform.GeoPoint, {
        lat: {name: 'lat'},
        lng: {name: 'lng'}
    });

    SnapCarPlatform.BillingDocument = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.BillingDocument.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
    };

    defineProperties(SnapCarPlatform.BillingDocument, {
        id: {name: 'id'},
        url: {name: 'url'},
        type: {name: 'type'}
    });

    SnapCarPlatform.BillingDocument.prototype.types = {
        BILL: 'bill',
        CREDIT_NOTE: 'credit_note'
    };

    SnapCarPlatform.Vehicle = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.Vehicle.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'model':
                case 'color':
                    return getTextInLocale(val);
                    break;
                case 'position':
                    return new SnapCarPlatform.GeoPoint(val);
                    break;
            }
        });
    };

    defineProperties(SnapCarPlatform.Vehicle, {
        model: {name: 'model'},
        color: {name: 'color'},
        position: {name: 'position'},
        plate_number: {name: 'plateNumber'}
    });

    SnapCarPlatform.Driver = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.Driver.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
    };

    defineProperties(SnapCarPlatform.Driver, {
        name: {name: 'name'},
        phone: {name: 'phone'},
        id: {name: 'id'}
    });

    SnapCarPlatform.TimestampedPoint = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.TimestampedPoint.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
    };

    defineProperties(SnapCarPlatform.TimestampedPoint, {
        timestamp: {name: 'timestamp'},
        lat: {name: 'lat'},
        lng: {name: 'lng'}
    });

    SnapCarPlatform.BookingHistory = function (limit) {
        this.limit = limit;
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.BookingHistory.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'history':
                    return $.map(val, function (payload) {
                        return new SnapCarPlatform.Booking(payload);
                    });
            }
        });
    };

    defineProperties(SnapCarPlatform.BookingHistory, {
        total: {name: 'total'},
        offset: {name: 'offset'},
        count: {name: 'count'},
        history: {name: 'history'}
    });

    SnapCarPlatform.BookingHistory.prototype.nextBookings = function () {
        if (this.moreBookingsAvailable()) {
            return SnapCarPlatform.bookingsHistory(this.offset + this.limit, this.limit);
        } else {
            throw new SnapCarPlatform.InvalidParametersError('no_more_bookings', 'There are no more bookings available in the history. Make sure that the moreBookingsAvailable method return true before trying to load more bookings.');
        }
    };

    SnapCarPlatform.BookingHistory.prototype.moreBookingsAvailable = function () {
        return (parseInt(this.offset) + parseInt(this.count)) < parseInt(this.total);
    };

    SnapCarPlatform.Booking = function (rider, startLocation, endLocation, plannedStartDate, nameboard, driverInfo, meetingPoint) {
        bootstrapInstanceProperties(this);

        this.rider = rider;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.plannedStartDate = plannedStartDate;
        this.nameboard = nameboard;
        this.driverInfo = driverInfo;
        this.driverInfo = meetingPoint;
    };

    SnapCarPlatform.Booking.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'planned_start_date':
                case 'creation_date':
                case 'driver_arrival_date':
                case 'start_date':
                case 'end_date':
                case 'cancellation_date':
                    return new Date(parseInt(val) * 1000);
                case 'service_class':
                    return new SnapCarPlatform.ServiceClass(val);
                case 'meeting_point':
                    return new SnapCarPlatform.MeetingPoint(val);
                case 'start_location':
                case 'end_location':
                    return new SnapCarPlatform.Location(val);
                case 'driver':
                    return new SnapCarPlatform.Driver(val);
                case 'rider':
                    return new SnapCarPlatform.Rider(val);
                case 'vehicle':
                    return new SnapCarPlatform.Vehicle(val);
                case 'route':
                    return $.map(val, function (payload) {
                        return new SnapCarPlatform.TimestampedPoint(payload);
                    });
                case 'documents':
                    return $.map(val, function (payload) {
                        return new SnapCarPlatform.BillingDocument(payload);
                    });
                case 'booking_price':
                    return new SnapCarPlatform.BookingPrice(val);
            }
        });
    };

    defineProperties(SnapCarPlatform.Booking, {
        id: {name: 'id'},
        rider: {name: 'rider'},
        service_class: {name: 'serviceClass'},
        status: {name: 'status'},
        timezone: {name: 'timezone'},
        planned_start_date: {name: 'plannedStartDate'},
        creation_date: {name: 'creationDate'},
        driver_arrival_date: {name: 'driverArrivalDate'},
        start_date: {name: 'startDate'},
        meeting_point: {name: 'meetingPoint'},
        end_date: {name: 'endDate'},
        cancellation_date: {name: 'cancellationDate'},
        cancellation_reason: {name: 'cancellationReason'},
        start_location: {name: 'startLocation'},
        end_location: {name: 'endLocation'},
        additional_info: {name: 'additionalInfo'},
        booking_price: {name: 'bookingPrice'},
        billed_amount: {name: 'billedAmount'},
        vat_amount: {name: 'vatAmount'},
        tip: {name: 'tip'},
        route: {name: 'route'},
        documents: {name: 'documents'},
        vehicle: {name: 'vehicle'}
    });

    SnapCarPlatform.Booking.prototype.statuses = {
        PENDING: 'pending',
        GOING_TO_GET: 'going_to_get',
        DRIVER_WAITING: 'driver_waiting',
        ON_BOARD: 'on_board',
        COMPLETE: 'complete',
        CANCELLED: 'cancelled'
    };

    SnapCarPlatform.Booking.prototype.cancellationPrice = function bookingCancellationPrice() {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + this.id + "/cancellation_price"
        }, function (data) {
            var result = new SnapCarPlatform.CancellationFee();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    SnapCarPlatform.Booking.prototype.cancel = function bookingCancel() {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + this.id + "/cancel",
            method: 'POST'
        }, function (data) {
            var result = new SnapCarPlatform.Booking();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    SnapCarPlatform.Booking.prototype.refresh = function bookingRefresh() {
        var booking = this;
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + booking.id
        }, function (data) {
            booking.constructor.populateProperties(booking, data);
            return booking;
        });
    };

    SnapCarPlatform.Booking.prototype.flatPrices = function bookingFlatPrices() {

        if ((typeof this.startLocation === 'undefined') || (typeof this.startLocation.address === 'undefined') || (typeof this.startLocation.lat === 'undefined') || (typeof this.startLocation.lng === 'undefined') || (typeof this.startLocation.address.name === 'undefined') || (typeof this.startLocation.address.city === 'undefined')) {
            throw new SnapCarPlatform.InvalidParametersError('start_location_missing', 'You must provide a start location including at least: lat, lng, name and city.');
        }

        if ((typeof this.endLocation === 'undefined') || (typeof this.endLocation.address === 'undefined') || (typeof this.endLocation.lat === 'undefined') || (typeof this.endLocation.lng === 'undefined') || (typeof this.endLocation.address.name === 'undefined') || (typeof this.endLocation.address.city === 'undefined')) {
            throw new SnapCarPlatform.InvalidParametersError('end_location_missing', 'You must provide an end location including at least: lat, lng, name and city.');
        }

        if (typeof this.rider === 'undefined') {
            throw new SnapCarPlatform.InvalidParametersError('rider_missing', 'You must provide a valid rider.');
        }

        var parameters = {
            start_location: {
                lat: this.startLocation.lat,
                lng: this.startLocation.lng,
                address: {
                    name: this.startLocation.address.name,
                    city: this.startLocation.address.city,
                    postal_code: this.startLocation.address.postalCode,
                    country: this.startLocation.address.country
                }
            },
            end_location: {
                lat: this.endLocation.lat,
                lng: this.endLocation.lng,
                address: {
                    name: this.endLocation.address.name,
                    city: this.endLocation.address.city,
                    postal_code: this.endLocation.address.postalCode,
                    country: this.endLocation.address.country
                }
            },
            rider_id: this.rider.id,
            nameboard: (typeof this.nameboard !== 'undefined' ? (this.nameboard ? 1 : 0) : undefined),
            date: (typeof this.plannedStartDate !== 'undefined' ? parseInt(this.plannedStartDate.getTime() / 1000) : undefined)
        };

        var booking = this;

        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/prices",
            method: 'POST',
            data: parameters
        }, function (data) {
            return $.map(data, function (pricePayload) {
                var result = new SnapCarPlatform.BookingPrice();
                result.constructor.populateProperties($.extend(result, {booking: booking}), pricePayload);
                return result;
            });
        });
    };

    // Config test 

    if (typeof $ === 'undefined') {
        throw new SnapCarPlatform.ConfigError('missing_jquery', 'jQuery is required to run the SnapCarPlatform SDK.');
    }

    // API Calls

    var performAPICall = function performAPICall(requestParams, resultProcessor) {

        if (typeof SnapCarPlatform.Config.token === 'undefined') {
            throw new SnapCarPlatform.ConfigError('missing_token', 'You have to provide a SnapCar API token in order to perform API calls.');
        }

        var deferred = $.Deferred();
        requestParams.data = $.extend({}, requestParams.data || {}, {token: SnapCarPlatform.Config.token});

        $.ajax(requestParams).done(function (data) {
            deferred.resolveWith(this, [resultProcessor(data)]);
        }).fail(function (data) {
            deferred.rejectWith(this, [new SnapCarPlatform.APIError(data.responseJSON)]);
        });

        return deferred;
    };

    SnapCarPlatform.eta = function eta(lat, lng) {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/info/eta",
            data: {lat: lat, lng: lng}
        }, function (data) {
            return $.map(data, function (statusPayload) {
                var result = new SnapCarPlatform.ETAResult();
                result.constructor.populateProperties(result, statusPayload);
                return result;
            });
        });
    };

    SnapCarPlatform.serviceClasses = function serviceClasses(lat, lng) {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/info/service_classes",
            data: {lat: lat, lng: lng}
        }, function (data) {
            return $.map(data, function (payload) {
                var result = new SnapCarPlatform.ServiceClass();
                result.constructor.populateProperties(result, payload);
                return result;
            });
        });
    };

    SnapCarPlatform.meetingPoints = function meetingPoints(lat, lng) {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/info/meeting_points",
            data: {lat: lat, lng: lng}
        }, function (data) {
            var result = new SnapCarPlatform.SpecialArea();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    SnapCarPlatform.user = function user() {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/users/me"
        }, function (data) {
            var result = new SnapCarPlatform.Rider(data);
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    SnapCarPlatform.activeBookings = function activeBookings() {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings"
        }, function (data) {
            return $.map(data, function (payload) {
                var result = new SnapCarPlatform.Booking();
                result.constructor.populateProperties(result, payload);
                return result;
            });
        });
    };

    SnapCarPlatform.bookingsHistory = function bookingsHistory(offset, limit) {
        limit = limit || 20;
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/history",
            data: {
                offset: offset || 0,
                limit: limit
            }
        }, function (data) {
            var result = new SnapCarPlatform.BookingHistory(limit);
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    SnapCarPlatform.booking = function booking(id) {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + id
        }, function (data) {
            var result = new SnapCarPlatform.Booking();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    return SnapCarPlatform;


    var booking;
    SnapCarPlatform.user().done(function (user) {
        booking = new SnapCarPlatform.Booking(user, new SnapCarPlatform.Location(37.43077117, -122.23745867, new SnapCarPlatform.Address('I-280 N', 'Woodside', '94062', 'Etats-Unis')), new SnapCarPlatform.Location(37.43077117, -122.23745867, new SnapCarPlatform.Address('I-280 N', 'Woodside', '94062', 'Etats-Unis')));
        console.log(booking);
        booking.nameboard = true;
        booking.driverInfo = "hello"
        booking.plannedStartDate = new Date();
        booking.plannedStartDate.setFullYear(2016);
        booking.flatPrices().done(function (d) {
            console.log(d)

            d[0].confirm().done(function (d) {
                console.log(d)
            })

        })

    });

    /*
     * - new Booking().confirm() bonne méthode ?
     */



}(SnapCarPlatform || {}, jQuery));

