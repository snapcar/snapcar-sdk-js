/**
 * # Introduction
 *
 * This is the main module that allows communication between your web application and the SnapCar platform through the SnapCar Public API. This module is dependent on jQuery. The [source code](https://github.com/snapcar/snapcar-sdk-js) is available on Github.
 * 
 * Before using this module, you must initialize it with a user token by setting the `SnapCar.token` property. Please refer to [the general SnapCar API documentation](http://developer.snapcar.com/) for more information on how to obtain a user token.
 * 
 * The SnapCar SDK for JavaScript does not manage user authentication. The reason for this is that obtaining a user token is done through a request that requires your API secret value to be provided. The API secret value is sensitive information that should never be revealed to the user. However, setting it in the JavaScript SDK implies that your users can access it by digging into the source code. Which is why such work flow must be implemented on the server side. Once initialized with a token, the module allows you to perform actions such as making bookings or getting ETAs on behalf of the authenticated user.
 * 
 * In general, all methods that are in charge of performing an API request always return a jQuery promise. The promises are resolved with the desired resources which depend on the performed request. If an error occurs during the request, the promises are rejected with an instance of `SnapCar.APIError` (containing more info about the issue). Look at the examples below for a comprehensive vision of the work flow.
 *
 * <br/> 
 * <br/> 
 *
 * # Getting started and examples
 *
 * <br/> 
 *
 * ## Setting a user token
 *
 * As explained above, you need to provide a token before using the SDK.
 *
 * ```
 * SnapCar.token = "3xI121nd93N7rhOFT7yk76I4B80PJA23J2fpaspLuy7saVFQxApt97Fv161s1F7O";
 * ```
 * 
 * <br/> 
 * ## Getting current closest drivers availability at a specific location 
 * 
 * ```
 * SnapCar.eta(48.859041, 2.327889).done(function (result) {
 *      $.each(result, function (key, info) {
 *          
 *        // info is an instance of SnapCar.ETAResult
 *        // you get info about eta.serviceClass
 *        
 *        if (info.status === SnapCar.ETAResultStatuses.OK) {
 *            // an ETA is available and set in info.eta
 *        } else if (info.status === SnapCar.ETAResultStatuses.UNAVAILABLE) {
 *            // this service class is not available at the moment
 *        }
 *        
 *      });
 * });
 * ```
 * 
 * <br/> 
 * ## Getting meeting points
 *
 * You can easily find if there are meeting points at a specific location (such as a train station or an airport).
 * 
 * ```
 * SnapCar.meetingPoints(48.731010, 2.365823).done(function (specialArea) {
 *
 *     // There's a special area at this location. 
 *     // Check out the specialArea info (which is an instance of SnapCar.SpecialArea)
 *
 * }).fail(function (error) {
 *     if (error.code === 404) {
 *         // No special area/meeting points at this location
 *     } else {
 *         // An other error occurred
 *     }
 * });
 * ```
 *  
 * 
 * 
 * <br/> 
 * ## Let's get all user's active bookings and cancel them
 * 
 * ```
 * SnapCar.activeBookings().done(function (bookings) {
 * 
 *        $.each(bookings, function(key, booking) {
 *            
 *            // For each booking, we want to know the cancellation price.
 *            // If the booking cannot be cancelled (basically because the rider is already picked up), the done callbacks aren't called. The failure callbacks are called instead.
 *            // You may want to check if the cancellation is charged. Check out the SnapCar.CancellationFee reference for more information.
 *            
 *            booking.cancellationPrice().done(function (cancellationFee) {
 *                booking.cancel().done(function () {
 *                    // Booking properly cancelled
 *                });
 *            });
 *        });
 * }); 
 * ```
 * 
 * 
 * 
 * 
 * <br/> 
 * ## We want to get all user's past bookings
 * 
 * 
 * ```
 * SnapCar.bookingsHistory().done(function (history) {
 * 
 *        $.each(history.history, function(key, booking) {
 *            // booking is an instance of SnapCar.Booking
 *        });
 *        
 *        // Check out the history.moreBookingsAvailable() value to know if you can call history.nextBookings()
 * }); 
 * ```
 * 
 * 
 * 
 * <br/> 
 * ## Let's create a booking on demand (with no planned pick up date) and without flat price.
 * 
 * ```
 * // First, we get the info about the authenticated user
 * SnapCar.user().done(function (user) {
 *
 *       // You may check the user.status value in order to know if he is allowed to make bookings
 *       
 *       // We fetch the allowed service classes
 *       SnapCar.serviceClasses().done(function (servicesClasses) {
 *
 *           // We create a booking
 *           var booking = new SnapCar.Booking();
 *
 *           // We define the rider and its pick up location
 *           booking.rider = user;
 *           booking.startLocation = new SnapCar.Location(48.731010, 2.365823, new SnapCar.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *
 *           // We also need to define the service class. Here we take one service class randomly.
 *           // In real life, you may present the different service class names to the user for selection.
 *           booking.serviceClass = servicesClasses[0];
 *           
 *           // We confirm the booking, this sends a request to the SnapCar platform
 *           booking.confirm()
 *           
 *           // This handler is called when the booking is either accepted by a driver or cancelled
 *           .done(function () {
 *
 *               if (booking.status === SnapCar.BookingStatuses.GOING_TO_GET) {
 *                   // A driver has accepted the booking
 *               }
 *
 *               else if (booking.status === SnapCar.BookingStatuses.CANCELLED) {
 *                   // Booking is cancelled, check out the booking.reason property to know why. It is probably set as SnapCar.BookingCancellationReasons.NO_DRIVER which means that no driver could accept the booking.
 *               }
 *
 *               else {
 *                   // Other status, unlikely to happen unless the driver has switched to another status in the meantime.
 *               }
 *           
 *           // This handler is called when the SnapCar platform confirms the booking creation
 *           }).progress(function(error) {
 *
 *               // Booking creation confirmed by the platform. Dispatch in progress, waiting for driver acceptance.
 *
 *           // This handler is called upon error (ex: no driver available)
 *           }).fail(function(error) {
 *
 *               if (error.message === "no_driver") {
 *                   // No driver is available for the required service class. You may try with another service class.
 *               }
 *
 *               // Check out the documentation for a comprehensive list of error messages.
 *
 *           });
 *       });
 *   });
 * ```
 * 
 * 
 * 
 * 
 * 
 * <br/> 
 * ## Let's create a booking in the future (with a planned pick up date) and without flat price.
 * 
 * ```
 * // First, we get the info about the authenticated user
 * SnapCar.user().done(function (user) {
 *
 *       // You may check the user.status value in order to know if he is allowed to make bookings
 *       
 *       // We fetch the allowed service classes
 *       SnapCar.serviceClasses().done(function (servicesClasses) {
 *
 *           // We create a booking
 *           var booking = new SnapCar.Booking();
 *
 *           // We define the rider and its pick up location
 *           booking.rider = user;
 *           booking.startLocation = new SnapCar.Location(48.731010, 2.365823, new SnapCar.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *
 *           // We define the date. Warning: you must ensure that the timezone is correct!
 *           booking.plannedStartDate = new Date("2016-01-01 00:00:00");
 *           
 *           // We also need to define the service class. Here we take one service class randomly.
 *           // In real life, you may present the different service class names to the user for selection.
 *           booking.serviceClass = servicesClasses[0];
 *           
 *           // We confirm the booking, this sends a request to the SnapCar platform
 *           booking.confirm()
 *           
 *           // This handler is called when the booking is confirmed
 *           .done(function () {
 *
 *               if (booking.status === SnapCar.BookingStatuses.PENDING) {
 *                   // Your booking is waiting for dispatch in the future
 *               }
 *
 *           // This handler is called upon error (ex: no driver available)
 *           }).fail(function(error) {
 *
 *               // Check out the documentation for a comprehensive list of error messages.
 *
 *           });
 *       });
 *   });
 * ```
 *
 * 
 * 
 * 
 * 
 * <br/> 
 * ## Let's create a booking in the future (with a planned pick up date) and with a flat price.
 * 
 * ```
 * // First, we get the info about the authenticated user
 * SnapCar.user().done(function (user) {
 * 
 *     // You may check the user.status value in order to know if he is allowed to make bookings
 * 
 *     // We create a booking
 *     var booking = new SnapCar.Booking();
 * 
 *     // We define the rider and its pick up location
 *     booking.rider = user;
 *     booking.startLocation = new SnapCar.Location(48.731010, 2.365823, new SnapCar.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *     booking.endLocation = new SnapCar.Location(48.855272, 2.345865, new SnapCar.Address('3 Boulevard du Palais', 'Paris', '75001', 'France'));
 *     booking.driverInfo = "Some useful info for you.";
 *     booking.nameboard = true; // We want a nameboard, for the example
 *     
 *     // We define the date. Warning: you must ensure that the timezone is correct!
 *     booking.plannedStartDate = new Date("2016-01-01 00:00:00");
 *     
 *     booking.flatPrices().done(function(prices) {
 * 
 *         // We have several prices, we will confirm the first one.
 *         // In real life, you may present the different prices for each service class to the user for selection.
 * 
 *         // We confirm the booking, this sends a request to the SnapCar platform
 *         prices[0].confirm()
 * 
 *         // This handler is called when the booking is confirmed
 *         .done(function () {
 * 
 *             if (booking.status === SnapCar.BookingStatuses.PENDING) {
 *                 // Your booking is waiting for dispatch in the future
 *             }
 * 
 *         // This handler is called upon error (ex: no driver available)
 *         }).fail(function(error) {
 * 
 *             // Check out the documentation for a comprehensive list of error messages.
 * 
 *         });        
 *     });
 * });
 * ```
 * 
 * 
 * 
 * 
 * 
 * <br/> 
 * ## Let's create a booking on demand (without a planned pick up date) and with a flat price.
 * 
 * ```
 * // First, we get the info about the authenticated user
 * SnapCar.user().done(function (user) {
 * 
 *     // You may check the user.status value in order to know if he is allowed to make bookings
 * 
 *     // We create a booking
 *     var booking = new SnapCar.Booking();
 * 
 *     // We define the rider and its pick up location
 *     booking.rider = user;
 *     booking.startLocation = new SnapCar.Location(48.731010, 2.365823, new SnapCar.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *     booking.endLocation = new SnapCar.Location(48.855272, 2.345865, new SnapCar.Address('3 Boulevard du Palais', 'Paris', '75001', 'France'));
 *     
 *     booking.flatPrices().done(function(prices) {
 * 
 *         // We have several prices, we will confirm the first one.
 *         // In real life, you may present the different prices for each service class to the user for selection.
 * 
 *         // We confirm the booking, this sends a request to the SnapCar platform
 *         prices[0].confirm()
 * 
 *         // This handler is called when the booking is either accepted by a driver or cancelled
 *         .done(function () {
 * 
 *             if (booking.status === SnapCar.BookingStatuses.GOING_TO_GET) {
 *                 // A driver has accepted the booking
 *             }
 * 
 *             else if (booking.status === SnapCar.BookingStatuses.CANCELLED) {
 *                 // Booking is cancelled, check out the booking.reason property to know why. It is probably set as SnapCar.BookingCancellationReasons.NO_DRIVER which means that no driver could accept the booking.
 *             }
 * 
 *             else {
 *                 // Other status, unlikely to happen unless the driver has switched to another status in the meantime.
 *             }
 * 
 *         // This handler is called when the SnapCar platform confirms the booking creation
 *         }).progress(function(error) {
 * 
 *             // Booking creation confirmed by the platform. Dispatch in progress, waiting for driver acceptance.
 * 
 *         // This handler is called upon error (ex: no driver available)
 *         }).fail(function(error) {
 * 
 *             if (error.message === "no_driver") {
 *                 // No driver is available for the required service class. You may try with another service class.
 *             }
 * 
 *             // Check out the documentation for a comprehensive list of error messages.
 * 
 *         });       
 *     });
 * });
 * ```
 * 
 * 
 * 
 * 
 * <br/> 
 * ## Let's create a booking in advance (with a planned pick up date), without flat price and with a meeting point.
 * 
 * In the example below, we make this booking only if we find specific meeting points at this location. In real life, you would just check if there are meeting points and would propose the list to your user for selection but would make the booking anyway.
 *
 * ```
 * 
 * SnapCar.meetingPoints(48.731010, 2.365823).done(function (specialArea) {
 * 
 *   // There's a special area at this location. 
 * 
 * 	 // Let's create a booking on demand (with no planned pick up date) and without flat price.
 * 	 
 * 	 // First, we get the info about the authenticated user
 * 	 SnapCar.user().done(function (user) {
 * 
 * 	       // You may check the user.status value in order to know if he is allowed to make bookings
 * 	       
 * 	       // We fetch the allowed service classes
 * 	       SnapCar.serviceClasses().done(function (servicesClasses) {
 * 
 * 	           // We create a booking
 * 	           var booking = new SnapCar.Booking();
 * 
 * 	           // We define the rider and its pick up location
 * 	           booking.rider = user;
 * 	           booking.startLocation = new SnapCar.Location(48.731010, 2.365823, new SnapCar.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 * 
 * 	           // We define the date. Warning: you must ensure that the timezone is correct!
 * 	           booking.plannedStartDate = new Date("2016-01-01 00:00:00");
 * 
 * 	           // We also need to define the service class. Here we take one service class randomly.
 * 	           // In real life, you may present the different service class names to the user for selection.
 * 	           booking.serviceClass = servicesClasses[0];
 * 
 * 	           // We define the first meeting point
 * 	           // In real life, you may present the different meeting points to the user for selection.
 * 	           booking.meetingPoint = specialArea.meetingPoints[0];
 * 
 * 	           // We confirm the booking, this sends a request to the SnapCar platform
 * 	           booking.confirm()
 * 	                 
 * 	           // This handler is called when the booking is confirmed
 * 	           .done(function () {
 * 
 * 	               if (booking.status === SnapCar.BookingStatuses.PENDING) {
 * 	                   // Your booking is waiting for dispatch in the future
 * 	               }
 * 
 * 	           // This handler is called upon error (ex: no driver available)
 * 	           }).fail(function(error) {
 * 
 * 	               // Check out the documentation for a comprehensive list of error messages.
 * 
 * 	           });
 * 
 * 	       });
 * 	   });
 * 
 * }).fail(function (error) {
 *    if (error.code === 404) {
 *        // No special area/meeting points at this location
 *    } else {
 *        // An other error occurred
 *    }
 * });
 * ```
 * 
 * 
 * @class SnapCar
 * @param {SnapCar} SnapCar itself.
 * @param {jQuery} $ The jQuery plugin.
 * 
 * 
 * 
 * 
 */

var SnapCar = (function (SnapCar, $) {

    // Properties: browser compatibility

    SnapCar.canDefineProperty = (typeof Object.defineProperty === 'function');
    if (SnapCar.canDefineProperty) {
        try {
            Object.defineProperty({}, 'x', {});
        } catch (e) {
            SnapCar.canDefineProperty = false;
        }
    }

    if (SnapCar.canDefineProperty) {
        Object.defineProperties(SnapCar, {
            
            /**
             * The web service base domain on which API calls are made. You can change this value in order to perform requests on demo/sandbox web services rather than the production one.
             *
             * @property baseDomain
             * @type string
             * @default "https://api.snapcar.com/public"
             */
            
            baseDomain: {enumerable: true, writable: true, value: 'https://api.snapcar.com/public'},

            /**
             * The user token. You must provide this value in order to be able to make API calls.
             *
             * @property token
             * @type string
             */
            
            token: {enumerable: true, writable: true},

            /**
             * The user locale. As you may know, some information returned through the API are localized (ex. : the meeting point details). You need to set this value in order to receive data localized in the user language if supported. The fallbackLocale value is used otherwise.
             *
             * @property locale
             * @default "en"
             * @type string
             * @example
             *     SnapCar.locale = "fr";
             */
            
            locale: {enumerable: true, writable: true, value: 'en'},

            /**
             * Locale used as a default in case you would provide a non supported locale value. Its value is "en".
             *
             * @property fallbackLocale
             * @type string
             */
            
            fallbackLocale: {enumerable: true, writable: false, value: 'en'}
        });
    }

    else {
        SnapCar.baseDomain = 'https://api.snapcar.com/public';
        SnapCar.locale = 'fr';
        SnapCar.fallbackLocale = 'fr';
    }

    // Define property helper

    SnapCar.defineProperties = function(object, properties) {

        $.each(properties, function (interfaceProperty, propertyConfig) {
            properties[interfaceProperty].propertyDescriptors = $.extend({}, {enumerable: true, writable: false, configurable: false}, propertyConfig.propertyDescriptors || {});
        });

        object.mapping = $.extend({}, object.mapping || {}, properties);

        if (SnapCar.canDefineProperty) {
            var propConfig = {};

            $.each(properties, function (key, val) {
                propConfig[val.name] = val.propertyDescriptors;
            });

            Object.defineProperties(object.prototype, propConfig);
        }
    }


    // Helper

    SnapCar.getTextInLocale = function (payload) {
        return payload[SnapCar.locale] || payload[SnapCar.fallbackLocale];
    };

    SnapCar.processObjectPayload = function (instance, payload, specialValueCallback) {
        var propertyConfig = [];
        $.each(payload || {}, function (key, val) {
            if (typeof instance.constructor.mapping === 'object') {
                var mapping = instance.constructor.mapping[key];

                if (typeof mapping === 'object') {
                    value = typeof specialValueCallback !== 'undefined' ? (specialValueCallback(key, val) || val) : val;

                    // Property is writable, value can directly be set
                    if (!SnapCar.canDefineProperty || mapping.propertyDescriptors.writable) {
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

        if (SnapCar.canDefineProperty) {
            Object.defineProperties(instance, propertyConfig);
        }
    };

    SnapCar.bootstrapInstanceProperties = function (instance) {
        if (SnapCar.canDefineProperty) {
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
     * @class SnapCar.Error
     * @param type {string} The type of error.
     * @param message {string} A key which defines more precisely the type of error.
     * @param description {string} A human readable text describing the error. Not to be displayed to the user.
     * @constructor
     */
    
    SnapCar.Error = function (type, message, description) {
        SnapCar.processObjectPayload(this, {
            type: type,
            message: message,
            description: description
        });
    };

    SnapCar.defineProperties(SnapCar.Error, {
        
        /**
         * The type of error.
         *
         * @property type
         * @type string
         * @final
         */
        
        type: {name: 'type'},

        /**
         * A key which defines more precisely the type of error.
         *
         * @property message
         * @type string
         * @final
         */
        
        message: {name: 'message'},

        /**
         * A human readable text describing the error. Not to be displayed to the user.
         *
         * @property description
         * @type string
         * @final
         */
        
        description: {name: 'description'}
    });


    /**
     * Represents an error created upon configuration issues such as trying to perform an API call with no token defined.
     *
     * @class SnapCar.ConfigError
     * @extends SnapCar.Error
     * @param message {string} A key which defines more precisely the type of error.
     * @param description {string} A human readable text describing the error. Not to be displayed to the user.
     * @constructor
     */
    
    SnapCar.ConfigError = function (message, description) {
        SnapCar.processObjectPayload(this, {
            type: 'config',
            message: message,
            description: description
        });
    };

    SnapCar.ConfigError.prototype = new SnapCar.Error();

    /**
     * Represents an error created when trying to make API calls with invalid parameters.
     *
     * @class SnapCar.InvalidParametersError
     * @extends SnapCar.Error
     * @param message {string} A key which defines more precisely the type of error.
     * @param description {string} A human readable text describing the error. Not to be displayed to the user.
     * @constructor
     */

    SnapCar.InvalidParametersError = function (message, description) {
        SnapCar.processObjectPayload(this, {
            type: 'invalid_parameters',
            message: message,
            description: description
        });
    };

    SnapCar.InvalidParametersError.prototype = new SnapCar.Error();

    /**
     * Represents an error received from the API.
     *
     * @class SnapCar.APIError
     * @extends SnapCar.Error
     * @param data {Object} The jQuery object.
     * @constructor
     */

    SnapCar.APIError = function (data) {

        var payload;
        
        if (typeof data.responseJSON !== 'undefined') {
            payload = data.responseJSON;
        }

        if (typeof payload === 'object') {
            SnapCar.processObjectPayload(this, $.extend({}, payload, {
                description: 'An API error occurred. Check the message parameter for more details.',
                type: 'api'
            }));
        } else {
            SnapCar.processObjectPayload(this, $.extend({}, payload, {
                message: 'other',
                description: 'An error occurred while sending the request.',
                server_response: payload,
                type: 'api'
            }));
        }
    };

    SnapCar.APIError.prototype = new SnapCar.Error();

    SnapCar.defineProperties(SnapCar.APIError, {
        
        /**
         * The type of error.
         *
         * @property code
         * @type number
         * @final
         */
        
        code: {name: 'code'},

        /**
         * Additional details such as a list of invalid parameters. Refer to the API reference for more information.
         *
         * @property details
         * @type Object
         * @final
         */
        
        details: {name: 'details'},

        /**
         * The server response body.
         *
         * @property serverResponse
         * @type string
         * @final
         */
        
        server_response: {name: 'serverResponse'}
    });


    /**
     * Represents an error received from the API.
     *
     * @class SnapCar.ServiceClass
     * @constructor
     */

    SnapCar.ServiceClass = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.ServiceClass.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'name':
                    return SnapCar.getTextInLocale(val);
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.ServiceClass, {
        
        /**
         * The service class unique identifier.
         *
         * @property id
         * @type string
         * @final
         */
        
        id: {name: 'id'},
        
        /**
         * The localized service class name to display to the user.
         *
         * @property name
         * @type string
         * @final
         */
        
        name: {name: 'name'}
    });

    /**
     * Describes a meeting point that can optionnaly be attached to a booking for specific pick up location. It helps riders and drivers to find each other.
     *
     * @class SnapCar.MeetingPoint
     * @constructor
     */

    SnapCar.MeetingPoint = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.MeetingPoint.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'name':
                case 'rdv_point':
                    return SnapCar.getTextInLocale(val);
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.MeetingPoint, {
       
        /**
         * Unique meeting point identifier.
         *
         * @property id
         * @type string
         * @final
         */

        id: {name: 'id'},
        
        /*
         * Localized short name that briefly describes the meeting point. 
         *
         * @property name
         * @type string
         * @final
         */

        name: {name: 'name'},
        
        /**
         * Localized meeting point details that explain where the rider can meet his driver at the pick up location.
         *
         * @property rdvPoint
         * @type string
         * @final
         */

        rdv_point: {name: 'rdvPoint'}
    });


    /**
     * Describes an area with specific meeting points that the rider may select to help him finding his driver at specific pick up locations.
     *
     * @class SnapCar.SpecialArea
     * @constructor
     */

    SnapCar.SpecialArea = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.SpecialArea.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'name':
                case 'menu_name':
                    return SnapCar.getTextInLocale(val);
                    break;
                case 'meeting_points':
                case 'meeting_points_nameboard':
                    return $.map(val, function (payload) {
                        return SnapCar.MeetingPoint.populateProperties(new SnapCar.MeetingPoint(), payload);
                    });
                    break;
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.SpecialArea, {
       
        /**
         * Unique identifier.
         *
         * @property id
         * @type string
         * @final
         */

        id: {name: 'id'},
      
        /**
         * Localized short name that briefly describes the area.
         *
         * @property name
         * @type string
         * @final
         */

        name: {name: 'name'},
       
        /**
         * Localized short value that describes the kind of meeting points that can be selected.
         *
         * @property menuName
         * @type string
         * @example
         *      "Terminal"
         * @final
         */

        menu_name: {name: 'menuName'},
        
        /**
         * Indicates if the user is required to select a meeting point for this area.
         *
         * @property selectionRequired
         * @type boolean
         * @final
         */

        selection_required: {name: 'selectionRequired'},

        /**
         * The type of special area. Can either be a station, an airport or a regular area. Refer to the SnapCar.SpecialAreaTypes values.
         *
         * @property areaType
         * @type string
         * @example
         *      "airport"
         * @final
         */
        
        area_type: {name: 'areaType'},

        /**
         * An array of meeting points in which the user can select his preferred one if the user hasn't enabled the nameboard option.
         *
         * @property meetingPoints
         * @type Array<SnapCar.MeetingPoint>
         * @final
         */
        
        meeting_points: {name: 'meetingPoints'},
        
        /**
         * An array of meeting points in which the user can select his preferred one if the user has enabled the nameboard option.
         *
         * @property meetingPointsNameboard
         * @type Array<SnapCar.MeetingPoint>
         * @final
         */        
        
        meeting_points_nameboard: {name: 'meetingPointsNameboard'}
    });

    /**
     * Represents special area type constants.
     * 
     * @class SnapCar.SpecialAreaTypes
     * @static
     */
    SnapCar.SpecialAreaTypes = {
        /**
         * Station area type constant. Its value is "station".
         * 
         * @property STATION
         * @static
         * @final
         * @type string
         */
        STATION: 'station',

        /**
         * Airport area type constant. Its value is "airport".
         * 
         * @property AIRPORT
         * @static
         * @final
         * @type string
         */
        
        AIRPORT: 'airport',

        /**
         * Normal area type constant. Its value is "normal".
         * 
         * @property NORMAL
         * @static
         * @final
         * @type string
         */        
        
        NORMAL: 'normal'
    };

    /**
     * Status and ETA for a specific service class.
     * 
     * @class SnapCar.ETAResult
     * @constructor
     */
    
    SnapCar.ETAResult = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.ETAResult.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'service_class':
                    return SnapCar.ServiceClass.populateProperties(new SnapCar.ServiceClass(), val);
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.ETAResult, {
        
        /**
         * Availability of the service class. Can be one of the SnapCar.ETAResultStatuses object values.
         * 
         * @property status
         * @final
         * @type string
         */        
        
        status: {name: 'status'},

        /**
         * If the service is available, holds the ETA in seconds.
         * 
         * @property eta
         * @final
         * @type number
         */        
        
        eta: {name: 'eta'},
        
        /**
         * The service class for which we want to know the ETA.
         * 
         * @property serviceClass
         * @final
         * @type SnapCar.ServiceClass
         */        
        
        service_class: {name: 'serviceClass'}
    });

    /**
     * The ETA possible statuses.
     * 
     * @class SnapCar.ETAResultStatuses
     * @static
     */
    
    SnapCar.ETAResultStatuses = {
        
        /**
         * Means that the service class is available. Therefore, an ETA is provided.
         * 
         * @property OK
         * @static
         * @final
         * @type string
         */
        
        OK: 'ok',

        /**
         * Means that the service class is not available.
         * 
         * @property UNAVAILABLE
         * @static
         * @final
         * @type string
         */
        
        UNAVAILABLE: 'unavailable'

    };

    /**
     * A user payment method.
     * 
     * @class SnapCar.PaymentMethod
     * @constructor
     */

    SnapCar.PaymentMethod = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.PaymentMethod.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload);
        return context;
    };
    
    SnapCar.defineProperties(SnapCar.PaymentMethod, {
        
        /**
         * Payment method unique identifier.
         * 
         * @property id
         * @final
         * @type string
         */
        
        id: {name: 'id'},

        /**
         * The payment method's name, as set by the user.
         * 
         * @property name
         * @final
         * @type string
         */
        
        name: {name: 'name'},
        
        /**
         * The payment method's type. At that time, 'credit_card' is the only possible value.
         * 
         * @property type
         * @final
         * @type string
         */
        
        type: {name: 'type'},
        
        /**
         * Credit card's masked number.
         * 
         * @property number
         * @final
         * @example 
         "XXXXXXXXXXXX4987"
         * @type string
         */
        
        number: {name: 'number'},
        
        /**
         * Credit card brand.
         * 
         * @property brand
         * @final
         * @example 
         "VISA"
         * @type string
         */
        
        brand: {name: 'brand'}
    });

    /**
     * A user who has the capability to make bookings.
     * 
     * @class SnapCar.Rider
     * @constructor
     */

    SnapCar.Rider = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.Rider.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'payment_method':
                    return SnapCar.PaymentMethod.populateProperties(new SnapCar.PaymentMethod(), val);
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.Rider, {
        
        /**
         * The rider unique identifier.
         * 
         * @property id
         * @final
         * @type string
         */
        
        id: {name: 'id'},

        /**
         * The rider's firstname.
         * 
         * @property firstname
         * @final
         * @type string
         */
        
        firstname: {name: 'firstname'},

        /**
         * The rider's lastname.
         * 
         * @property lastname
         * @final
         * @type string
         */
        
        lastname: {name: 'lastname'},

        /**
         * The rider's email.
         * 
         * @property email
         * @final
         * @type string
         */
        
        email: {name: 'email'},

        /**
         * The rider account status. Its value is one of the SnapCar.RiderStatuses class properties. Check it out for more information.
         * 
         * @property status
         * @final
         * @type string
         */
        
        status: {name: 'status'},

        /**
         * The rider's payment method.
         * 
         * @property paymentMethod
         * @final
         * @type SnapCar.PaymentMethod
         */
        
        payment_method: {name: 'paymentMethod'}
    });

    /**
     * The rider account possible statuses.
     * 
     * @class SnapCar.RiderStatuses
     * @static
     */
    
    SnapCar.RiderStatuses = {
        
        /**
         * The user has the right to make bookings.
         * 
         * @property BOOKING_ALLOWED
         * @static
         * @final
         * @type string
         */
        
        BOOKING_ALLOWED: 'booking_allowed',

        /**
         * The user is not allowed to make bookings.
         * 
         * @property BOOKING_NOT_ALLOWED
         * @static
         * @final
         * @type string
         */
        
        BOOKING_NOT_ALLOWED: 'booking_not_allowed',

        /**
         * The user is suspended.
         * 
         * @property SUSPENDED
         * @static
         * @final
         * @type string
         */
        
        SUSPENDED: 'suspended'

    };

    /**
     * An order with a flat price which is created from booking information (ex. : start and end locations, service class, etc.) and that can be confirmed into a booking. 
     * 
     * @class SnapCar.BookingPrice
     * @constructor
     */

    SnapCar.BookingPrice = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.BookingPrice.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'expiry_date':
                    return new Date(parseInt(val) * 1000);
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.BookingPrice, {
        
        /**
         * The booking price unique identifier.
         * 
         * @property id
         * @final
         * @type string
         */
        
        id: {name: 'id'},
        
        /**
         * The price in the currency defined in the currency property.
         * 
         * @property price
         * @final
         * @type float
         */
        
        price: {name: 'price'},
        
        /**
         * The currency.
         * 
         * @property currency
         * @example
            "EUR"
         * @final
         * @type string
         */
        
        currency: {name: 'currency'},
        
        /**
         * A formatted string representing the price.
         * 
         * @property formatted_price
         * @final
         * @type string
         */
        
        formatted_price: {name: 'formattedPrice'},        
        
        /**
         * The date of the validity date for the given price.
         * 
         * @property expiry_date
         * @final
         * @type Date
         */
        
        expiry_date: {name: 'expiryDate'},
        
        /**
         * The ID of the service class for which the price is valid.
         * 
         * @property service_class_id
         * @final
         * @type string
         */
        
        service_class_id: {name: 'serviceClassId'},
        
        booking: {name: 'booking'}
    });

    /**
     * Creates a booking by confirming the booking price.
     * 
     * @method confirm
     * @return {jQuery.Promise} A Promise object. Success/progress handlers are called with a SnapCar.Booking as the single argument. If the booking has a specific planned start date, the success callbacks are called once the platform confirms the booking creation. However, if the booking has no planned start date, the progress callbacks are called once the platform confirms the booking creation and the success callbacks are called when the booking is no longer in the "pending" status (either accepted by the driver or cancelled). Failure handlers are called with a single SnapCar.APIError argument upon error.
     */
    
    SnapCar.BookingPrice.prototype.confirm = function() {

        var additionalParameters = {};

        if (typeof this.booking.driverInfo !== 'undefined') {
            additionalParameters.driver_info = this.booking.driverInfo;
        }

        if (typeof this.booking.meetingPoint !== 'undefined') {
            additionalParameters.meeting_point_id = this.booking.meetingPoint.id;
        }

        var booking = this.booking;
        
        var promise = SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings/prices/" + this.id + "/confirm",
            method: 'POST',
            data: additionalParameters
        }, function (data) {
            booking.constructor.populateProperties(booking, data);
            return booking;
        });
        
        return properBookingPromise(booking, promise);        
    };

    /**
     * Information about a booking cancellation fee.
     * 
     * @class SnapCar.CancellationFee
     * @constructor
     */
    
    SnapCar.CancellationFee = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.CancellationFee.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload);
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.CancellationFee, {
        
        /**
         * Whether a cancellation fee is charged. 
         * 
         * @property charged
         * @final
         * @type boolean
         */
        
        charged: {name: 'charged'},

        /**
         * If charged, the cancellation amount.
         * 
         * @property amount
         * @final
         * @type float
         */
                
        amount: {name: 'amount'},
        
        /**
         * If charged, the currency of the cancellation fee.
         * 
         * @property currency
         * @final
         * @type string
         */
                
        currency: {name: 'currency'},
        
        /**
         * If charged, the price formatted in the currency.
         * 
         * @property formattedAmount
         * @final
         * @type string
         */
                
        formatted_amount: {name: 'formattedAmount'}

    });

    /**
     * An address (typically for pick up or drop off).
     * 
     * @class SnapCar.Address
     * @constructor
     * @param {string} name The name of the address. Typically the number and street name.
     * @param {string} city The city.
     * @param {string} postalCode The postal code.
     * @param {string} country The country.
     */

    SnapCar.Address = function (name, city, postalCode, country) {
        SnapCar.bootstrapInstanceProperties(this);

        this.name = name;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
    };

    SnapCar.Address.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload);
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.Address, {
        
        /**
         * The name of the address. Typically the number and street name.
         * 
         * @property name
         * @final
         * @type string
         */
        
        name: {name: 'name'},
        
        /**
         * The postal code.
         * 
         * @property postalCode
         * @final
         * @type string
         */
        
        postal_code: {name: 'postalCode'},
        
        /**
         * The city.
         * 
         * @property city
         * @final
         * @type string
         */
        
        city: {name: 'city'},
        
        /**
         * The country.
         * 
         * @property country
         * @final
         * @type string
         */
        
        country: {name: 'country'}
    });

    /**
     * A location representing an address as well as its GPS coordinate.
     * 
     * @class SnapCar.Location
     * @constructor
     * @param {number} lat The location latitude.
     * @param {number} lng The location longitude.
     * @param {SnapCar.Address} address The location address.
     */
    
    SnapCar.Location = function (lat, lng, address) {
        SnapCar.bootstrapInstanceProperties(this);
        this.lat = lat;        
        this.lng = lng;
        this.address = address;
    };

    SnapCar.Location.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'address':
                    return SnapCar.Address.populateProperties(new SnapCar.Address(), val);
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.Location, {
        
        /**
         * The location latitude.
         * 
         * @property lat
         * @final
         * @type float
         */
                
        lat: {name: 'lat'},
        
        /**
         * The location longitude.
         * 
         * @property lng
         * @final
         * @type float
         */
                
        lng: {name: 'lng'},
        
        
        /**
         * The location address.
         * 
         * @property address
         * @final
         * @type string
         */        
        
        address: {name: 'address'}
    });

    /**
     * Represents GPS coordinate.
     * 
     * @class SnapCar.GeoPoint
     * @constructor
     */

    SnapCar.GeoPoint = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.GeoPoint.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload);
        return context;
    };

    SnapCar.defineProperties(SnapCar.GeoPoint, {
        
        /**
         * The point latitude.
         * 
         * @property lat
         * @final
         * @type float
         */
                
        lat: {name: 'lat'},
        
        /**
         * The point longitude.
         * 
         * @property lng
         * @final
         * @type float
         */
                
        lng: {name: 'lng'}
    });

    /**
     * A billing document such as a bill or a credit note.
     * 
     * @class SnapCar.BillingDocument
     * @constructor
     */

    SnapCar.BillingDocument = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.BillingDocument.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload);
        return context;
    };

    SnapCar.defineProperties(SnapCar.BillingDocument, {
        
        /**
         * Billing document unique identifier.
         * 
         * @property id
         * @final
         * @type string
         */
                
        id: {name: 'id'},

        /**
         * URL of to download the document.
         * 
         * @property url
         * @final
         * @type string
         */
        
        url: {name: 'url'},

        /**
         * The type of document, refer to the SnapCar.BillingDocumentTypes properties.
         * 
         * @property type
         * @final
         * @type string
         */
                
        type: {name: 'type'}
    });


    /**
     * All possible types of billing documents.
     * 
     * @class SnapCar.BillingDocumentTypes
     * @static
     */
    SnapCar.BillingDocumentTypes = {
        
        /**
         * Bill type. When the client is charged.
         * 
         * @property BILL
         * @static
         * @final
         * @type string
         */
        
        BILL: 'bill',
        
        /**
         * Credit note type. When the client is reimbursed.
         * 
         * @property CREDIT_NOTE
         * @static
         * @final
         * @type string
         */
                
        CREDIT_NOTE: 'credit_note'
    };

    /**
     * A vehicle in which a driver picks a rider up.
     * 
     * @class SnapCar.Vehicle
     * @constructor
     */
    
    SnapCar.Vehicle = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.Vehicle.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'model':
                case 'color':
                    return SnapCar.getTextInLocale(val);
                    break;
                case 'position':
                    return SnapCar.GeoPoint.populateProperties(new SnapCar.GeoPoint(), val);
                    break;
            }
        });
        return context;
    };

    SnapCar.defineProperties(SnapCar.Vehicle, {

        /**
         * The vehile model.
         * 
         * @property model
         * @final
         * @type string
         */
                
        model: {name: 'model'},

        /**
         * The localized vehile color.
         * 
         * @property color
         * @final
         * @type string
         */
                
        color: {name: 'color'},

        /**
         * The current vehile position.
         * 
         * @property position
         * @final
         * @type SnapCar.GeoPoint
         */
                
        position: {name: 'position'},

        /**
         * The vehile plate number.
         * 
         * @property plateNumber
         * @final
         * @type string
         */
                
        plate_number: {name: 'plateNumber'}
    });

    /**
     * Driver information.
     * 
     * @class SnapCar.Driver
     * @constructor
     */

    SnapCar.Driver = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.Driver.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload);
        return context;
    };

    SnapCar.defineProperties(SnapCar.Driver, {

        /**
         * The driver display name.
         * 
         * @property name
         * @final
         * @type string
         */
                
        name: {name: 'name'},

        /**
         * The driver's phone number.
         * 
         * @property phoneNumber
         * @final
         * @type string
         */
                
        phone_number: {name: 'phoneNumber'},

        /**
         * The driver unique identifier.
         * 
         * @property id
         * @final
         * @type string
         */
                
        id: {name: 'id'}
    });

    /**
     * Dated GPS coordinate.
     * 
     * @class SnapCar.TimestampedPoint
     * @constructor
     */

    SnapCar.TimestampedPoint = function () {
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.TimestampedPoint.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload);
        return context;
    };

    SnapCar.defineProperties(SnapCar.TimestampedPoint, {

        /**
         * The date at which the coordinate has been saved.
         * 
         * @property date
         * @final
         * @type Date
         */
                
        timestamp: {name: 'date'},

        /**
         * The coordinate latitude.
         * 
         * @property lat
         * @final
         * @type float
         */
                
        lat: {name: 'lat'},

        /**
         * The coordinate longitude.
         * 
         * @property lng
         * @final
         * @type float
         */
                
        lng: {name: 'lng'}
    });

    /**
     * A bookings list and its metadata.
     * 
     * @class SnapCar.BookingHistory
     * @constructor
     * @param {number} [limit=20] The maximum number of elements to return.
     */

    SnapCar.BookingHistory = function (limit) {
        this.limit = limit || 20;
        SnapCar.bootstrapInstanceProperties(this);
    };

    SnapCar.BookingHistory.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'history':
                    return $.map(val, function (payload) {
                        return SnapCar.Booking.populateProperties(new SnapCar.Booking(), payload);
                    });
            }
        });
        return context;
    };

    SnapCar.defineProperties(SnapCar.BookingHistory, {

        /**
         * The total number of bookings in the history.
         * 
         * @property total
         * @final
         * @type number
         */
                
        total: {name: 'total'},

        /**
         * The current position in the pagination.
         * 
         * @property offset
         * @final
         * @type number
         */
        
        offset: {name: 'offset'},

        /**
         * The number of bookings fetched.
         * 
         * @property count
         * @final
         * @type number
         */
        
        count: {name: 'count'},

        /**
         * The list of SnapCar.Booking fetched
         * 
         * @property history
         * @final
         * @type Array<SnapCar.Booking>
         */
        
        history: {name: 'history'}
    });

    /**
     * Loads the next bookings in the history regarding the current offset in the pagination.
     * 
     * @method nextBookings
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCar.BookingHistory as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error. 
     */
    
    SnapCar.BookingHistory.prototype.nextBookings = function () {
        if (this.moreBookingsAvailable()) {
            return SnapCar.bookingsHistory(this.offset + this.limit, this.limit);
        } else {
            throw new SnapCar.InvalidParametersError('no_more_bookings', 'There are no more bookings available in the history. Make sure that the moreBookingsAvailable method returns true before trying to load more bookings.');
        }
    };

    /**
     * Tells whether more bookings are available in the history regarding the current offset in the pagination and the total number of bookings. If yes, the SnapCar.BookingHistory.nextBookings method can be called.
     * 
     * @method moreBookingsAvailable
     * @return {boolean} Whether more bookings are available or not.
     */

    SnapCar.BookingHistory.prototype.moreBookingsAvailable = function () {
        return (parseInt(this.offset) + parseInt(this.count)) < parseInt(this.total);
    };

    /**
     * A booking that represents a request by the user to be picked up.
     * 
     * @class SnapCar.Booking
     * @constructor
     * @param {SnapCar.Rider} [rider] The passenger of the booking. Typically the currently identifier user.
     * @param {SnapCar.Location} [startLocation] The location at which the rider needs to be picked up.
     * @param {SnapCar.Location} [endLocation] The location at which the rider needs to be dropped off.
     * @param {Date} [plannedStartDate] The planned pick up date.
     * @param {boolean} [nameboard] Set to true if the nameboard option is required
     * @param {string} [driverInfo] Additional pick up information to provide the driver with.
     * @param {SnapCar.MeetingPoint} [meetingPoint] Meeting at which the rider will find his driver.
     */

    SnapCar.Booking = function (rider, startLocation, endLocation, plannedStartDate, nameboard, driverInfo, meetingPoint) {
        SnapCar.bootstrapInstanceProperties(this);

        this.rider = rider;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.plannedStartDate = plannedStartDate;
        this.nameboard = nameboard;
        this.driverInfo = driverInfo;
        this.meetingPoint = meetingPoint;
    };

    SnapCar.Booking.populateProperties = function (context, payload) {
        SnapCar.processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'planned_start_date':
                case 'creation_date':
                case 'driver_arrival_date':
                case 'start_date':
                case 'end_date':
                case 'cancellation_date':
                    return new Date(parseInt(val) * 1000);
                case 'service_class':
                    return SnapCar.ServiceClass.populateProperties(new SnapCar.ServiceClass(), val);
                case 'meeting_point':
                    return SnapCar.MeetingPoint.populateProperties(new SnapCar.MeetingPoint(), val);
                case 'start_location':
                case 'end_location':
                    return SnapCar.Location.populateProperties(new SnapCar.Location(), val);
                case 'driver':
                    return SnapCar.Driver.populateProperties(new SnapCar.Driver(), val);
                case 'rider':
                    return SnapCar.Rider.populateProperties(new SnapCar.Rider(), val);
                case 'vehicle':
                    return SnapCar.Vehicle.populateProperties(new SnapCar.Vehicle(), val);
                case 'route':
                    return $.map(val, function (payload) {
                        return SnapCar.TimestampedPoint.populateProperties(new SnapCar.TimestampedPoint(), payload);
                    });
                case 'documents':
                    return $.map(val, function (payload) {
                        return SnapCar.BillingDocument.populateProperties(new SnapCar.BillingDocument(), payload);
                    });
                case 'booking_price':
                    return SnapCar.BookingPrice.populateProperties(new SnapCar.BookingPrice(), val);
            }
        });
        
        return context;
    };

    SnapCar.defineProperties(SnapCar.Booking, {

        /**
         * The booking unique identifier.
         * 
         * @property id
         * @final
         * @type string
         */
        
        id: {name: 'id'},

        /**
         * The passenger of the booking.
         * 
         * @property rider
         * @final
         * @type SnapCar.Rider
         */
        
        rider: {name: 'rider'},

        /**
         * The ordered service class for this booking.
         * 
         * @property serviceClass
         * @final
         * @type SnapCar.ServiceClass
         */
        
        service_class: {name: 'serviceClass'},

        /**
         * The booking status, refer to the SnapCar.BookingStatuses properties to have a comprehensive list of all possible statuses.
         * 
         * @property status
         * @final
         * @type string
         */
        
        status: {name: 'status'},

        /**
         * The booking location's timezone.
         * 
         * @property timezone
         * @final
         * @type string
         */
        
        timezone: {name: 'timezone'},

        /**
         * The planned pick up date.
         * 
         * @property plannedStartDate
         * @final
         * @type Date
         */
        
        planned_start_date: {name: 'plannedStartDate'},

        /**
         * The booking creation date.
         * 
         * @property creationDate
         * @final
         * @type Date
         */
        
        creation_date: {name: 'creationDate'},

        /**
         * The driver arrival date at the pick up location.
         * 
         * @property driverArrivalDate
         * @final
         * @type Date
         */
        
        driver_arrival_date: {name: 'driverArrivalDate'},

        /**
         * The date at which the rider went on board.
         * 
         * @property startDate
         * @final
         * @type Date
         */
        
        start_date: {name: 'startDate'},

        /**
         * Meeting at which the rider will find its driver.
         * 
         * @property meetingPoint
         * @final
         * @type SnapCar.MeetingPoint
         */
        
        meeting_point: {name: 'meetingPoint'},

        /**
         * The date at which the rider has been dropped off.
         * 
         * @property history
         * @final
         * @type Date
         */
        
        end_date: {name: 'endDate'},

        /**
         * The date at which the booking was cancelled (if relevant).
         * 
         * @property cancellationDate
         * @final
         * @type Date
         */
        
        cancellation_date: {name: 'cancellationDate'},

        /**
         * This code indicates the reason why the booking was cancelled. Check out the SnapCar.BookingCancellationReasons static class properties.
         * 
         * @property cancellationReason
         * @final
         * @type string
         */
        
        cancellation_reason: {name: 'cancellationReason'},

        /**
         * The pick up location.
         * 
         * @property startLocation
         * @final
         * @type SnapCar.Location
         */
        
        start_location: {name: 'startLocation'},

        /**
         * The location at which the rider has been dropped off.
         * 
         * @property endLocation
         * @final
         * @type SnapCar.Location
         */
        
        end_location: {name: 'endLocation'},

        /**
         * Additional pick-up information for the driver. Provided by the rider.
         * 
         * @property driverInfo
         * @final
         * @type string
         */
        
        driver_info: {name: 'driverInfo'},

        /**
         * The initial order information.
         * 
         * @property bookingPrice
         * @final
         * @type SnapCar.BookingPrice
         */
        
        booking_price: {name: 'bookingPrice'},

        /**
         * The total billed amount
         * 
         * @property billedAmount
         * @final
         * @type float
         */
        
        billed_amount: {name: 'billedAmount'},

        /**
         * The total VAT amount.
         * 
         * @property vatAmount
         * @final
         * @type float
         */
        
        vat_amount: {name: 'vatAmount'},

        /**
         * The tip given by the rider to the driver through the SnapCar application.
         * 
         * @property tip
         * @final
         * @type float
         */
        
        tip: {name: 'tip'},

        /**
         * A list of timestamped points describing the driver route from the pick up location.
         * 
         * @property route
         * @final
         * @type Array<SnapCar.TimestampedPoint>
         */
        
        route: {name: 'route'},

        /**
         * The list of billing documents.
         * 
         * @property documents
         * @final
         * @type Array<SnapCar.BillingDocument>
         */
        
        documents: {name: 'documents'},

        /**
         * The vehicle used by the driver to pick the rider up.
         * 
         * @property vehicle
         * @final
         * @type SnapCar.Vehicle
         */
        
        vehicle: {name: 'vehicle'}
    });

    /**
     * Gets the booking cancellation price. Relevant only when the booking is either in the 'pending', 'going_to_get' or 'driver_waiting' state.
     * 
     * @method cancellationPrice
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCar.CancellationFee as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error.
     */

    SnapCar.Booking.prototype.cancellationPrice = function () {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings/" + this.id + "/cancellation_price"
        }, function (data) {
            var result = new SnapCar.CancellationFee();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Cancels the booking. You may want to check the cancellation price by using the SnapCar.Booking.cancellationPrice() method before doing so.
     * 
     * @method cancel
     * @return {jQuery.Promise} A Promise object. Success handlers are called with the updated instance of SnapCar.Booking as the single argument. Note that the initial instance itself is updated. Failure handlers are called with a single SnapCar.APIError argument upon error.
     */

    SnapCar.Booking.prototype.cancel = function () {
        var booking = this;
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings/" + this.id + "/cancel",
            method: 'POST'
        }, function (data) {
            booking.constructor.populateProperties(booking, data);
            return booking;
        });
    };

    /**
     * Refreshes the booking information.
     * 
     * @method refresh
     * @return {jQuery.Promise} A Promise object. Success handlers are called with the updated instance of SnapCar.Booking as the single argument. Note that the initial instance itself is updated. Failure handlers are called with a single SnapCar.APIError argument upon error.
     */

    SnapCar.Booking.prototype.refresh = function () {
        var booking = this;
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings/" + booking.id
        }, function (data) {
            booking.constructor.populateProperties(booking, data);
            return booking;
        });
    };    

    var orderParameters = function() {
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
            end_location: (typeof this.endLocation !== 'undefined') ? {
                lat: this.endLocation.lat,
                lng: this.endLocation.lng,
                address: {
                    name: this.endLocation.address.name,
                    city: this.endLocation.address.city,
                    postal_code: this.endLocation.address.postalCode,
                    country: this.endLocation.address.country
                }
            } : undefined,
            rider_id: this.rider.id,
            nameboard: (typeof this.nameboard !== 'undefined' ? (this.nameboard ? 1 : 0) : undefined),
            date: (typeof this.plannedStartDate !== 'undefined' ? parseInt(this.plannedStartDate.getTime() / 1000) : undefined)
        };
        
        return parameters;
    };
    
    var properBookingPromise = function(booking, promise) {
        if (typeof booking.plannedStartDate === 'undefined') {
            var deferred = $.Deferred();

            promise.done(function () {

                // Booking confirmed by the platform, we now wait for a driver acceptance
                deferred.notify(booking);

                var poll = function () {
                    booking.refresh().always(function() {
                        if (booking.status === SnapCar.BookingStatuses.PENDING) {
                            scheduleRefresh();
                        } else {
                            deferred.resolve(booking);
                        }
                     });
                };

                // We refresh the data every 3 seconds
                var scheduleRefresh = function() {
                    setTimeout(poll, 3000);
                };

                scheduleRefresh();

            }).fail(function(error) {
                deferred.reject(error);
            });

            return deferred.promise();                 
        }
        
        else {
            return promise;
        }        
    };

    /**
     * Confirms the booking (without flat price) to the SnapCar platform. Before calling this method, you have to provide at least a rider, a startLocation and the desired serviceClass. 
     * 
     * @method confirm
     * @return {jQuery.Promise} A Promise object. Success/progress handlers are called with a SnapCar.Booking as the single argument. If the booking has a specific planned start date, the success callbacks are called once the platform confirms the booking creation. However, if the booking has no planned start date, the progress callbacks are called once the platform confirms the booking creation and the success callbacks are called when the booking is no longer in the "pending" status (either accepted by the driver or cancelled). Failure handlers are called with a single SnapCar.APIError argument upon error.
     */
    
    SnapCar.Booking.prototype.confirm = function() {

        if ((typeof this.startLocation === 'undefined') || (typeof this.startLocation.address === 'undefined') || (typeof this.startLocation.lat === 'undefined') || (typeof this.startLocation.lng === 'undefined') || (typeof this.startLocation.address.name === 'undefined') || (typeof this.startLocation.address.city === 'undefined')) {
            throw new SnapCar.InvalidParametersError('start_location_missing', 'You must provide a start location including at least: lat, lng, name and city.');
        }

        if (typeof this.rider === 'undefined') {
            throw new SnapCar.InvalidParametersError('rider_missing', 'You must provide a valid rider.');
        }
        
        if (typeof this.serviceClass === 'undefined') {
            throw new SnapCar.InvalidParametersError('service_class_missing', 'You must provide the required service class for this booking.');
        }
        
        var parameters = orderParameters.call(this);
        
        if (typeof this.driverInfo !== 'undefined') {
            parameters.driver_info = this.driverInfo;
        }

        if (typeof this.meetingPoint !== 'undefined') {
            parameters.meeting_point_id = this.meetingPoint.id;
        }

        parameters.service_class_id = this.serviceClass.id;

        var booking = this;
        
        var promise = SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings",
            method: 'POST',
            data: parameters
        }, function (data) {
            booking.constructor.populateProperties(booking, data);
            return booking;
        });
    
        return properBookingPromise(booking, promise);
    };

    /**
     * Calculates flat prices for all allowed service classes. Then, you may confirm one of these prices according to the service class selected by the user. The flat prices are based on the booking information (rider, planned start date, start location, end location, if the nameboard option is enabled). Before calling this method, you have to provide at least a rider, a startLocation and an endLocation which are the basic elements for price calculation. Flat prices cannot be calculated otherwise.
     * 
     * @method flatPrices
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCar.BookingPrice as the single argument. Check the value of the SnapCar.BookingPrice.serviceClassId property in order to know to which service class a booking price is associated. Failure handlers are called with a single SnapCar.APIError argument upon error.
     */

    SnapCar.Booking.prototype.flatPrices = function () {

        if ((typeof this.startLocation === 'undefined') || (typeof this.startLocation.address === 'undefined') || (typeof this.startLocation.lat === 'undefined') || (typeof this.startLocation.lng === 'undefined') || (typeof this.startLocation.address.name === 'undefined') || (typeof this.startLocation.address.city === 'undefined')) {
            throw new SnapCar.InvalidParametersError('start_location_missing', 'You must provide a start location including at least: lat, lng, name and city.');
        }

        if ((typeof this.endLocation === 'undefined') || (typeof this.endLocation.address === 'undefined') || (typeof this.endLocation.lat === 'undefined') || (typeof this.endLocation.lng === 'undefined') || (typeof this.endLocation.address.name === 'undefined') || (typeof this.endLocation.address.city === 'undefined')) {
            throw new SnapCar.InvalidParametersError('end_location_missing', 'You must provide an end location including at least: lat, lng, name and city.');
        }

        if (typeof this.rider === 'undefined') {
            throw new SnapCar.InvalidParametersError('rider_missing', 'You must provide a valid rider.');
        }

        var parameters = orderParameters.call(this);

        var booking = this;

        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings/prices",
            method: 'POST',
            data: parameters
        }, function (data) {
            return $.map(data, function (pricePayload) {
                var result = new SnapCar.BookingPrice();
                result.constructor.populateProperties($.extend(result, {booking: booking}), pricePayload);
                return result;
            });
        });
    };

   /**
     * The possible booking statuses.
     * 
     * @class SnapCar.BookingStatuses
     * @static
     */
    
    SnapCar.BookingStatuses = {
        
        /**
         * When the booking is waiting for a driver to be attributed. Its value is "pending".
         * 
         * @property PENDING
         * @static
         * @final
         * @type string
         */
        
        PENDING: 'pending',
        
        /**
         * When a driver has accepted a booking and is on his way to pick up the rider. Its value is "going_to_get".
         * 
         * @property GOING_TO_GET
         * @static
         * @final
         * @type string
         */
        
        GOING_TO_GET: 'going_to_get',
        
        /**
         * When the driver has arrived at the pick up location and is waiting for the rider. Its value is "driver_waiting".
         * 
         * @property DRIVER_WAITING
         * @static
         * @final
         * @type string
         */
        
        DRIVER_WAITING: 'driver_waiting',
        
        /**
         * When the rider is in the car. Its value is "on_board".
         * 
         * @property ON_BOARD
         * @static
         * @final
         * @type string
         */
        
        ON_BOARD: 'on_board',
        
        /**
         * When the booking is ended, meaning that the rider has been dropped off. Its value is "complete".
         * 
         * @property COMPLETE
         * @static
         * @final
         * @type string
         */
        
        COMPLETE: 'complete',
        
        /**
         * When the booking is cancelled. Its value is "cancelled".
         * 
         * @property CANCELLED
         * @static
         * @final
         * @type string
         */
        
        CANCELLED: 'cancelled'
    };

   /**
     * The possible booking cancellation reasons.
     * 
     * @class SnapCar.BookingCancellationReasons
     * @static
     */
    
    SnapCar.BookingCancellationReasons = {
        
        /**
         * The booking has been cancelled by the rider, and not charged. Its value is "rider_cancellation".
         * 
         * @property RIDER_CANCELLATION
         * @static
         * @final
         * @type string
         */
        
        RIDER_CANCELLATION: 'rider_cancellation',
        
        /**
         * The booking has been cancelled by the rider, and has been charged a cancellation fee. Its value is "rider_cancellation_charged".
         * 
         * @property RIDER_CANCELLATION_CHARGED
         * @static
         * @final
         * @type string
         */
        
        RIDER_CANCELLATION_CHARGED: 'rider_cancellation_charged',
        
        /**
         * The booking has been cancelled by SnapCar. Its value is "system_cancellation".
         * 
         * @property SYSTEM_CANCELLATION
         * @static
         * @final
         * @type string
         */
        
        SYSTEM_CANCELLATION: 'system_cancellation',
        
        /**
         * The booking has been cancelled by SnapCar, and charged. Its value is "system_cancellation_charged".
         * 
         * @property SYSTEM_CANCELLATION_CHARGED
         * @static
         * @final
         * @type string
         */
        
        SYSTEM_CANCELLATION_CHARGED: 'system_cancellation_charged',
        
        /**
         * No driver was available for dispatch. Its value is "no_driver".
         * 
         * @property NO_DRIVER
         * @static
         * @final
         * @type string
         */
        
        NO_DRIVER: 'no_driver'
    };


    // Config test 

    if (typeof $ === 'undefined') {
        throw new SnapCar.Error('missing_jquery', 'jQuery is required to run the SnapCar SDK.');
    }

    // API Calls

    SnapCar.performAPICall = function (requestParams, resultProcessor, checkToken) {

        if ((typeof checkToken === 'undefined' || checkToken) && typeof SnapCar.token === 'undefined') {
            throw new SnapCar.Error('missing_token', 'You have to provide a SnapCar API token in order to perform API calls.');
        }

        var deferred = $.Deferred();
        requestParams.data = $.extend({}, requestParams.data || {}, {token: SnapCar.token});

        $.ajax(requestParams).done(function (data) {
            deferred.resolve(resultProcessor(data));
        }).fail(function (data) {
            deferred.reject(new SnapCar.APIError(data));
        });

        return deferred.promise();
    };
    
    /**
     * Retrieves current ETA and availability for each service class.
     * 
     * @method eta
     * @for SnapCar
     * @param {number} lat Latitude of the position at which you want to get the current eta and availability.
     * @param {number} lng Longitude of the position at which you want to get the current eta and availability.
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCar.ETAResult as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error.
     */

    SnapCar.eta = function (lat, lng) {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/info/eta",
            data: {lat: lat, lng: lng}
        }, function (data) {
            return $.map(data, function (statusPayload) {
                var result = new SnapCar.ETAResult();
                result.constructor.populateProperties(result, statusPayload);
                return result;
            });
        });
    };

    /**
     * Retrieves a list of all allowed service classes at a specific location.
     * 
     * @method serviceClasses
     * @for SnapCar
     * @param {number} lat Latitude of the position at which you want to get the allowed service classes.
     * @param {number} lng Longitude of the position at which you want to get the allowed service classes.
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCar.ServiceClass as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error.
     */

    SnapCar.serviceClasses = function (lat, lng) {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/info/service_classes",
            data: {lat: lat, lng: lng}
        }, function (data) {
            return $.map(data, function (payload) {
                var result = new SnapCar.ServiceClass();
                result.constructor.populateProperties(result, payload);
                return result;
            });
        });
    };

    /**
     * Retrieves meeting point information at a specific location.
     * 
     * @method meetingPoints
     * @param {number} lat Latitude of the position at which you want to get the information.
     * @param {number} lng Longitude of the position at which you want to get the information.
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCar.SpecialArea as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error. Be aware that if no specific meeting point information is found at a location, the failure callback will be called with a SnapCar.APIError having a 404 code value. 
     */

    SnapCar.meetingPoints = function (lat, lng) {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/info/meeting_points",
            data: {lat: lat, lng: lng}
        }, function (data) {
            var result = new SnapCar.SpecialArea();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Gets the currently authenticated user information.
     * 
     * @method user
     * @for SnapCar
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCar.Rider as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error. 
     */

    SnapCar.user = function () {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/users/me"
        }, function (data) {
            var result = new SnapCar.Rider(data);
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Gets the currently authentified rider's active bookings.
     * 
     * @method activeBookings
     * @for SnapCar
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCar.Booking as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error. 
     */

    SnapCar.activeBookings = function () {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings"
        }, function (data) {
            return $.map(data, function (payload) {
                var result = new SnapCar.Booking();
                result.constructor.populateProperties(result, payload);
                return result;
            });
        });
    };

    /**
     * Gets the currently authentified rider's bookings history.
     * 
     * @method bookingsHistory
     * @for SnapCar
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCar.BookingHistory as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error. 
     * @param {number} [offset=0] The position of the first booking in the pagination.
     * @param {number} [limit=20] The maximum number of bookings to return.
     */

    SnapCar.bookingsHistory = function (offset, limit) {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings/history",
            data: {
                offset: offset || 0,
                limit: limit || 20
            }
        }, function (data) {
            var result = new SnapCar.BookingHistory(limit);
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Gets information about a specific booking.
     * 
     * @method booking
     * @for SnapCar
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCar.Booking as the single argument. Failure handlers are called with a single SnapCar.APIError argument upon error. 
     * @param {number} id The booking unique identifier.
     */

    SnapCar.booking = function (id) {
        return SnapCar.performAPICall({
            url: SnapCar.baseDomain + "/bookings/" + id
        }, function (data) {
            var result = new SnapCar.Booking();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    return SnapCar;

} (SnapCar || {}, jQuery));

