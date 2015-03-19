/**
 * This is the base SnapCarPlatform module that allows communication between your web application and the SnapCar platform through the SnapCar Public API. This module is dependent on jQuery.
 * 
 * The module parameters can be managed through the SnapCarPlatform.Config static class. Before using this module, you must initialize it with a user token by setting the SnapCarPlatform.Config.token property. Please refer to the general SnapCar API documentation for more information on how to obtain a user token : http://developer.snapcar.com/.
 * 
 * The SnapCarPlatform SDK for JavaScript does not manage user authentication. The reason for this is that obtaining a user token is done through a request that requires your API secret value to be provided. The API secret value is sensitive information that should never be revealed to the user. However, setting it in the JavaScript SDK implies that your users can access it by digging into the source code. Which is why such work flow must be implemented on the server side. Once initialized with a token, the module allows you to perform actions such as making bookings or getting ETAs on behalf of the authenticated user.
 * 
 * Basic API calls such as getting ETAs or allowed service classes can be performed through the SnapCarPlatform.Utils static class. In general, all methods that are in charge of performing an API request always return a jQuery promise. The promises are resolved with the desired resources which depend on the performed request. If an error occurs during the request, the promises are rejected with an instance of SnapCarPlatform.APIError (containing more info about the issue). Look at the examples below for a comprehensive vision of the work flow.
 * 
 * @module SnapCarPlatform
 * @param {SnapCarPlatform} SnapCarPlatform itself.
 * @param {jQuery} $ The jQuery plugin.
 * 
 * @example
 *      // Setting the token before using the SDK
 *      SnapCarPlatform.Config.token = "3xI121nd93N7rhOFT7yk76I4B80PJA23J2fpaspLuy7saVFQxApt97Fv161s1F7O";
 *      
 * @example
 *      // Getting current closest drivers availability at a specific location
 *      
 *      SnapCarPlatform.Utils.eta(48.859041, 2.327889).done(function (result) {
 *           $.each(result, function (key, info) {
 *               
 *             // info is an instance of SnapCarPlatform.ETAResult
 *             // you get info about eta.serviceClass
 *             
 *             if (info.status === SnapCarPlatform.ETAResultStatuses.OK) {
 *                 // an ETA is available and set in info.eta
 *             } else if (info.status === SnapCarPlatform.ETAResultStatuses.UNAVAILABLE) {
 *                 // this service class is not available at the moment
 *             }
 *             
 *           });
 *      });
 *      
 * @example
 *      // Before making a booking, I want to know if there are meeting points at a specific area
 *      
 *      SnapCarPlatform.Utils.meetingPoints(48.731010, 2.365823).done(function (specialArea) {
 *
 *          // There's a special area at this location. 
 *          // Check out the specialArea info (which is an instance of SnapCarPlatform.SpecialArea)
 *
 *      }).fail(function (error) {
 *          if (error.code === 404) {
 *              // No special area/meeting points at this location
 *          } else {
 *              // An other error occurred
 *          }
 *      });
 *      
 * @example
 *   
 *      // We want to get all user's active bookings and cancel them
 *       
 *      SnapCarPlatform.Utils.activeBookings().done(function (bookings) {
 *      
 *             $.each(bookings, function(key, booking) {
 *                 
 *                 // For each booking, we want to know the cancellation price.
 *                 // If the booking cannot be cancelled (basically because the rider is already picked up), the done callbacks aren't called. The failure callbacks are called instead.
 *                 // You may want to check if the cancellation is charged. Check out the SnapCarPlatform.CancellationFee reference for more information.
 *                 
 *                 booking.cancellationPrice().done(function (cancellationFee) {
 *                     booking.cancel().done(function () {
 *                         // Booking properly cancelled
 *                     });
 *                 });
 *             });
 *      }); 
 *      
 *      
 * @example
 *   
 *      // We want to get all user's past bookings
 *       
 *      SnapCarPlatform.Utils.bookingsHistory().done(function (history) {
 *      
 *             $.each(history.history, function(key, booking) {
 *                 // booking is an instance of SnapCarPlatform.Booking
 *             });
 *             
 *             // Check out the history.moreBookingsAvailable() value to know if you can call history.nextBookings()
 *      }); 
 *      
 *                  
 * @example     
 *      
 *      // Let's create a booking on demand (with no planned pick up date) and without flat price.
 *      
 *      // First, we get the info about the authenticated user
 *      SnapCarPlatform.Utils.user().done(function (user) {
 *
 *            // You may check the user.status value in order to know if he is allowed to make bookings
 *            
 *            // We fetch the allowed service classes
 *            SnapCarPlatform.Utils.serviceClasses().done(function (servicesClasses) {
 *
 *                // We create a booking
 *                var booking = new SnapCarPlatform.Booking();
 *
 *                // We define the rider and its pick up location
 *                booking.rider = user;
 *                booking.startLocation = new SnapCarPlatform.Location(48.731010, 2.365823, new SnapCarPlatform.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *
 *                // We also need to define the service class. Here we take one service class randomly.
 *                // In real life, you may present the different service class names to the user for selection.
 *                booking.serviceClass = servicesClasses[0];
 *                
 *                // We confirm the booking, this sends a request to the SnapCar platform
 *                booking.confirm()
 *                
 *                // This handler is called when the booking is either accepted by a driver or cancelled
 *                .done(function () {
 *
 *                    if (booking.status === SnapCarPlatform.BookingStatuses.GOING_TO_GET) {
 *                        // A driver has accepted the booking
 *                    }
 *
 *                    else if (booking.status === SnapCarPlatform.BookingStatuses.CANCELLED) {
 *                        // Booking is cancelled, check out the booking.reason property to know why. It is probably set as SnapCarPlatform.BookingCancellationReasons.NO_DRIVER which means that no driver could accept the booking.
 *                    }
 *
 *                    else {
 *                        // Other status, unlikely to happen unless the driver has switched to another status in the meantime.
 *                    }
 *                
 *                // This handler is called when the SnapCar platform confirms the booking creation
 *                }).progress(function(error) {
 *
 *                    // Booking creation confirmed by the platform. Dispatch in progress, waiting for driver acceptance.
 *
 *                // This handler is called upon error (ex: no driver available)
 *                }).fail(function(error) {
 *
 *                    if (error.message === "no_driver") {
 *                        // No driver is available for the required service class. You may try with another service class.
 *                    }
 *
 *                    // Check out the documentation for a comprehensive list of error messages.
 *
 *                });
 *            });
 *        });
 *        
 * @example     
 *      
 *      // Let's create a booking in the future (with a planned pick up date) and without flat price.
 *      
 *      // First, we get the info about the authenticated user
 *      SnapCarPlatform.Utils.user().done(function (user) {
 *
 *            // You may check the user.status value in order to know if he is allowed to make bookings
 *            
 *            // We fetch the allowed service classes
 *            SnapCarPlatform.Utils.serviceClasses().done(function (servicesClasses) {
 *
 *                // We create a booking
 *                var booking = new SnapCarPlatform.Booking();
 *
 *                // We define the rider and its pick up location
 *                booking.rider = user;
 *                booking.startLocation = new SnapCarPlatform.Location(48.731010, 2.365823, new SnapCarPlatform.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *
 *                // We define the date. Warning: you must ensure that the timezone is correct!
 *                booking.plannedStartDate = new Date("2016-01-01 00:00:00");
 *                
 *                // We also need to define the service class. Here we take one service class randomly.
 *                // In real life, you may present the different service class names to the user for selection.
 *                booking.serviceClass = servicesClasses[0];
 *                
 *                // We confirm the booking, this sends a request to the SnapCar platform
 *                booking.confirm()
 *                
 *                // This handler is called when the booking is confirmed
 *                .done(function () {
 *
 *                    if (booking.status === SnapCarPlatform.BookingStatuses.PENDING) {
 *                        // Your booking is waiting for dispatch in the future
 *                    }
 *
 *                // This handler is called upon error (ex: no driver available)
 *                }).fail(function(error) {
 *
 *                    // Check out the documentation for a comprehensive list of error messages.
 *
 *                });
 *            });
 *        });
 *
 *
 * @example     
 *      
 *      // Let's create a booking in the future (with a planned pick up date) and with a flat price.
 *      
 *      // First, we get the info about the authenticated user
 *      SnapCarPlatform.Utils.user().done(function (user) {
 *      
 *          // You may check the user.status value in order to know if he is allowed to make bookings
 *      
 *          // We create a booking
 *          var booking = new SnapCarPlatform.Booking();
 *      
 *          // We define the rider and its pick up location
 *          booking.rider = user;
 *          booking.startLocation = new SnapCarPlatform.Location(48.731010, 2.365823, new SnapCarPlatform.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *          booking.endLocation = new SnapCarPlatform.Location(48.855272, 2.345865, new SnapCarPlatform.Address('3 Boulevard du Palais', 'Paris', '75001', 'France'));
 *          booking.driverInfo = "Some useful info for you.";
 *          booking.nameboard = true; // We want a nameboard, for the example
 *          
 *          // We define the date. Warning: you must ensure that the timezone is correct!
 *          booking.plannedStartDate = new Date("2016-01-01 00:00:00");
 *          
 *          booking.flatPrices().done(function(prices) {
 *      
 *              // We have several prices, we will confirm the first one.
 *              // In real life, you may present the different prices for each service class to the user for selection.
 *      
 *              // We confirm the booking, this sends a request to the SnapCar platform
 *              prices[0].confirm()
 *      
 *              // This handler is called when the booking is confirmed
 *              .done(function () {
 *      
 *                  if (booking.status === SnapCarPlatform.BookingStatuses.PENDING) {
 *                      // Your booking is waiting for dispatch in the future
 *                  }
 *      
 *              // This handler is called upon error (ex: no driver available)
 *              }).fail(function(error) {
 *      
 *                  // Check out the documentation for a comprehensive list of error messages.
 *      
 *              });        
 *          });
 *      });
 *   
 * @example
 *   
 *      // Let's create a booking on demand (without a planned pick up date) and with a flat price.
 *      
 *      // First, we get the info about the authenticated user
 *      SnapCarPlatform.Utils.user().done(function (user) {
 *      
 *          // You may check the user.status value in order to know if he is allowed to make bookings
 *      
 *          // We create a booking
 *          var booking = new SnapCarPlatform.Booking();
 *      
 *          // We define the rider and its pick up location
 *          booking.rider = user;
 *          booking.startLocation = new SnapCarPlatform.Location(48.731010, 2.365823, new SnapCarPlatform.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *          booking.endLocation = new SnapCarPlatform.Location(48.855272, 2.345865, new SnapCarPlatform.Address('3 Boulevard du Palais', 'Paris', '75001', 'France'));
 *          
 *          booking.flatPrices().done(function(prices) {
 *      
 *              // We have several prices, we will confirm the first one.
 *              // In real life, you may present the different prices for each service class to the user for selection.
 *      
 *              // We confirm the booking, this sends a request to the SnapCar platform
 *              prices[0].confirm()
 *      
 *              // This handler is called when the booking is either accepted by a driver or cancelled
 *              .done(function () {
 *      
 *                  if (booking.status === SnapCarPlatform.BookingStatuses.GOING_TO_GET) {
 *                      // A driver has accepted the booking
 *                  }
 *      
 *                  else if (booking.status === SnapCarPlatform.BookingStatuses.CANCELLED) {
 *                      // Booking is cancelled, check out the booking.reason property to know why. It is probably set as SnapCarPlatform.BookingCancellationReasons.NO_DRIVER which means that no driver could accept the booking.
 *                  }
 *      
 *                  else {
 *                      // Other status, unlikely to happen unless the driver has switched to another status in the meantime.
 *                  }
 *      
 *              // This handler is called when the SnapCar platform confirms the booking creation
 *              }).progress(function(error) {
 *      
 *                  // Booking creation confirmed by the platform. Dispatch in progress, waiting for driver acceptance.
 *      
 *              // This handler is called upon error (ex: no driver available)
 *              }).fail(function(error) {
 *      
 *                  if (error.message === "no_driver") {
 *                      // No driver is available for the required service class. You may try with another service class.
 *                  }
 *      
 *                  // Check out the documentation for a comprehensive list of error messages.
 *      
 *              });       
 *          });
 *      });
 *   
 * @example
 * 
 *      // Let's create a booking in advance (with a planned pick up date) and without flat price. We make this booking only if we find specific meeting points at this location. 
 *      // In real life, you would just check if there are meeting points and would propose the list to your user for selection but would make the booking anyway.
 *      
 *      SnapCarPlatform.Utils.meetingPoints(48.731010, 2.365823).done(function (specialArea) {
 *      
 *         // There's a special area at this location. 
 *      
 *      	 // Let's create a booking on demand (with no planned pick up date) and without flat price.
 *      	 
 *      	 // First, we get the info about the authenticated user
 *      	 SnapCarPlatform.Utils.user().done(function (user) {
 *      
 *      	       // You may check the user.status value in order to know if he is allowed to make bookings
 *      	       
 *      	       // We fetch the allowed service classes
 *      	       SnapCarPlatform.Utils.serviceClasses().done(function (servicesClasses) {
 *      
 *      	           // We create a booking
 *      	           var booking = new SnapCarPlatform.Booking();
 *      
 *      	           // We define the rider and its pick up location
 *      	           booking.rider = user;
 *      	           booking.startLocation = new SnapCarPlatform.Location(48.731010, 2.365823, new SnapCarPlatform.Address('Aéroport de Paris-Orly', 'Orly', '94390', 'France'));
 *      
 *      	           // We define the date. Warning: you must ensure that the timezone is correct!
 *      	           booking.plannedStartDate = new Date("2016-01-01 00:00:00");
 *      
 *      	           // We also need to define the service class. Here we take one service class randomly.
 *      	           // In real life, you may present the different service class names to the user for selection.
 *      	           booking.serviceClass = servicesClasses[0];
 *      
 *      	           // We define the first meeting point
 *      	           // In real life, you may present the different meeting points to the user for selection.
 *      	           booking.meetingPoint = specialArea.meetingPoints[0];
 *      
 *      	           // We confirm the booking, this sends a request to the SnapCar platform
 *      	           booking.confirm()
 *      	                 
 *      	           // This handler is called when the booking is confirmed
 *      	           .done(function () {
 *      
 *      	               if (booking.status === SnapCarPlatform.BookingStatuses.PENDING) {
 *      	                   // Your booking is waiting for dispatch in the future
 *      	               }
 *      
 *      	           // This handler is called upon error (ex: no driver available)
 *      	           }).fail(function(error) {
 *      
 *      	               // Check out the documentation for a comprehensive list of error messages.
 *      
 *      	           });
 *      
 *      	       });
 *      	   });
 *      
 *      }).fail(function (error) {
 *         if (error.code === 404) {
 *             // No special area/meeting points at this location
 *         } else {
 *             // An other error occurred
 *         }
 *      });
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
     * @static
     */

    SnapCarPlatform.Config = {};      

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
     * @param type {String} The type of error.
     * @param message {String} A key which defines more precisely the type of error.
     * @param description {String} A human readable text describing the error. Not to be displayed to the user.
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
         * @final
         */
        
        type: {name: 'type'},

        /**
         * A key which defines more precisely the type of error.
         *
         * @property message
         * @type String
         * @final
         */
        
        message: {name: 'message'},

        /**
         * A human readable text describing the error. Not to be displayed to the user.
         *
         * @property description
         * @type String
         * @final
         */
        
        description: {name: 'description'}
    });


    /**
     * Represents an error created upon configuration issues such as trying to perform an API call with no token defined.
     *
     * @class ConfigError
     * @extends SnapCarPlatform.Error
     * @param message {String} A key which defines more precisely the type of error.
     * @param description {String} A human readable text describing the error. Not to be displayed to the user.
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
     * @param message {String} A key which defines more precisely the type of error.
     * @param description {String} A human readable text describing the error. Not to be displayed to the user.
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
     * @param data {Object} The jQuery object.
     * @constructor
     */

    SnapCarPlatform.APIError = function (data) {

        var payload;
        
        if (typeof data.responseJSON !== 'undefined') {
            payload = data.responseJSON;
        }

        if (typeof payload === 'object') {
            processObjectPayload(this, $.extend({}, payload, {
                description: 'An API error occurred. Check the message parameter for more details.',
                type: 'api'
            }));
        } else {
            processObjectPayload(this, $.extend({}, payload, {
                message: 'other',
                description: 'An error occurred while sending the request.',
                server_response: payload,
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
         * @type String
         * @final
         */
        
        server_response: {name: 'serverResponse'}
    });


    /**
     * Represents an error received from the API.
     *
     * @class ServiceClass
     * @constructor
     */

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
        
        return context;
    };

    defineProperties(SnapCarPlatform.ServiceClass, {
        
        /**
         * The service class unique identifier.
         *
         * @property id
         * @type String
         * @final
         */
        
        id: {name: 'id'},
        
        /**
         * The localized service class name to display to the user.
         *
         * @property name
         * @type String
         * @final
         */
        
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
        
        return context;
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
                        return SnapCarPlatform.MeetingPoint.populateProperties(new SnapCarPlatform.MeetingPoint(), payload);
                    });
                    break;
            }
        });
        
        return context;
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

    /**
     * Status and ETA for a specific service class.
     * 
     * @class ETAResult
     * @constructor
     */
    
    SnapCarPlatform.ETAResult = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.ETAResult.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'service_class':
                    return SnapCarPlatform.ServiceClass.populateProperties(new SnapCarPlatform.ServiceClass(), val);
            }
        });
        
        return context;
    };

    defineProperties(SnapCarPlatform.ETAResult, {
        
        /**
         * Availability of the service class. Can be one of the SnapCarPlatform.ETAResultStatuses object values.
         * 
         * @property status
         * @final
         * @type String
         */        
        
        status: {name: 'status'},

        /**
         * If the service is available, holds the ETA in seconds.
         * 
         * @property eta
         * @final
         * @type int
         */        
        
        eta: {name: 'eta'},
        
        /**
         * The service class for which we want to know the ETA.
         * 
         * @property serviceClass
         * @final
         * @type SnapCarPlatform.ServiceClass
         */        
        
        service_class: {name: 'serviceClass'}
    });

    /**
     * The ETA possible statuses.
     * 
     * @class ETAResultStatuses
     * @static
     */
    
    SnapCarPlatform.ETAResultStatuses = {
        
        /**
         * Means that the service class is available. Therefore, an ETA is provided.
         * 
         * @property OK
         * @static
         * @final
         * @type String
         */
        
        OK: 'ok',

        /**
         * Means that the service class is not available.
         * 
         * @property UNAVAILABLE
         * @static
         * @final
         * @type String
         */
        
        UNAVAILABLE: 'unavailable'

    };

    /**
     * A user payment method.
     * 
     * @class PaymentMethod
     * @constructor
     */

    SnapCarPlatform.PaymentMethod = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.PaymentMethod.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
        return context;
    };
    
    defineProperties(SnapCarPlatform.PaymentMethod, {
        
        /**
         * Payment method unique identifier.
         * 
         * @property id
         * @final
         * @type String
         */
        
        id: {name: 'id'},

        /**
         * The payment method's name, as set by the user.
         * 
         * @property name
         * @final
         * @type String
         */
        
        name: {name: 'name'},
        
        /**
         * The payment method's type. At that time, 'credit_card' is the only possible value.
         * 
         * @property type
         * @final
         * @type String
         */
        
        type: {name: 'type'},
        
        /**
         * Credit card's masked number.
         * 
         * @property number
         * @final
         * @example 
         "XXXXXXXXXXXX4987"
         * @type String
         */
        
        number: {name: 'number'},
        
        /**
         * Credit card brand.
         * 
         * @property brand
         * @final
         * @example 
         "VISA"
         * @type String
         */
        
        brand: {name: 'brand'}
    });

    /**
     * A user who has the capability to make bookings.
     * 
     * @class Rider
     * @constructor
     */

    SnapCarPlatform.Rider = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.Rider.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'payment_method':
                    return SnapCarPlatform.PaymentMethod.populateProperties(new SnapCarPlatform.PaymentMethod(), val);
            }
        });
        
        return context;
    };

    defineProperties(SnapCarPlatform.Rider, {
        
        /**
         * The rider unique identifier.
         * 
         * @property id
         * @final
         * @type String
         */
        
        id: {name: 'id'},

        /**
         * The rider's firstname.
         * 
         * @property firstname
         * @final
         * @type String
         */
        
        firstname: {name: 'firstname'},

        /**
         * The rider's lastname.
         * 
         * @property lastname
         * @final
         * @type String
         */
        
        lastname: {name: 'lastname'},

        /**
         * The rider's email.
         * 
         * @property email
         * @final
         * @type String
         */
        
        email: {name: 'email'},

        /**
         * The rider account status. Its value is one of the SnapCarPlatform.RiderStatuses class properties. Check it out for more information.
         * 
         * @property status
         * @final
         * @type String
         */
        
        status: {name: 'status'},

        /**
         * The rider's payment method.
         * 
         * @property payment_method
         * @final
         * @type SnapCarPlatform.PaymentMethod
         */
        
        payment_method: {name: 'payment_method'}
    });

    /**
     * The rider account possible statuses.
     * 
     * @class RiderStatuses
     * @static
     */
    
    SnapCarPlatform.RiderStatuses = {
        
        /**
         * The user has the right to make bookings.
         * 
         * @property BOOKING_ALLOWED
         * @static
         * @final
         * @type String
         */
        
        BOOKING_ALLOWED: 'booking_allowed',

        /**
         * The user is not allowed to make bookings.
         * 
         * @property BOOKING_NOT_ALLOWED
         * @static
         * @final
         * @type String
         */
        
        BOOKING_NOT_ALLOWED: 'booking_not_allowed',

        /**
         * The user is suspended.
         * 
         * @property SUSPENDED
         * @static
         * @final
         * @type String
         */
        
        SUSPENDED: 'suspended'

    };

    /**
     * An order with a flat price which is created from booking information (ex. : start and end locations, service class, etc.) and that can be confirmed into a booking. 
     * 
     * @class BookingPrice
     * @constructor
     */

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
        
        return context;
    };

    defineProperties(SnapCarPlatform.BookingPrice, {
        
        /**
         * The booking price unique identifier.
         * 
         * @property id
         * @final
         * @type String
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
         * @type String
         */
        
        currency: {name: 'currency'},
        
        /**
         * A formatted string representing the price.
         * 
         * @property formatted_price
         * @final
         * @type String
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
         * @type String
         */
        
        service_class_id: {name: 'serviceClassId'},
        
        booking: {name: 'booking'}
    });

    /**
     * Creates a booking by confirming the booking price.
     * 
     * @method confirm
     * @return {jQuery.Promise} A Promise object. Success/progress handlers are called with a SnapCarPlatform.Booking as the single argument. If the booking has a specific planned start date, the success callbacks are called once the platform confirms the booking creation. However, if the booking has no planned start date, the progress callbacks are called once the platform confirms the booking creation and the success callbacks are called when the booking is no longer in the "pending" status (either accepted by the driver or cancelled). Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */
    
    SnapCarPlatform.BookingPrice.prototype.confirm = function() {

        var additionalParameters = {};

        if (typeof this.booking.driverInfo !== 'undefined') {
            additionalParameters.driver_info = this.booking.driverInfo;
        }

        if (typeof this.booking.meetingPoint !== 'undefined') {
            additionalParameters.meeting_point_id = this.booking.meetingPoint.id;
        }

        var booking = this.booking;
        
        var promise = performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/prices/" + this.id + "/confirm",
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
     * @class CancellationFee
     * @constructor
     */
    
    SnapCarPlatform.CancellationFee = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.CancellationFee.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
        
        return context;
    };

    defineProperties(SnapCarPlatform.CancellationFee, {
        
        /**
         * Whether a cancellation fee is charged. 
         * 
         * @property charged
         * @final
         * @type Boolean
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
         * @type String
         */
                
        currency: {name: 'currency'},
        
        /**
         * If charged, the price formatted in the currency.
         * 
         * @property formattedAmount
         * @final
         * @type String
         */
                
        formatted_amount: {name: 'formattedAmount'}

    });

    /**
     * An address (typically for for pick up or drop off).
     * 
     * @class Address
     * @constructor
     * @param {String} name The name of the address. Typically the number and street name.
     * @param {String} city The city.
     * @param {String} postalCode The postal code.
     * @param {String} country The country.
     */

    SnapCarPlatform.Address = function (name, city, postalCode, country) {
        bootstrapInstanceProperties(this);

        this.name = name;
        this.city = city;
        this.postalCode = postalCode;
        this.country = country;
    };

    SnapCarPlatform.Address.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
        
        return context;
    };

    defineProperties(SnapCarPlatform.Address, {
        
        /**
         * The name of the address. Typically the number and street name.
         * 
         * @property name
         * @final
         * @type String
         */
        
        name: {name: 'name'},
        
        /**
         * The postal code.
         * 
         * @property postalCode
         * @final
         * @type String
         */
        
        postal_code: {name: 'postalCode'},
        
        /**
         * The city.
         * 
         * @property city
         * @final
         * @type String
         */
        
        city: {name: 'city'},
        
        /**
         * The country.
         * 
         * @property country
         * @final
         * @type String
         */
        
        country: {name: 'country'}
    });

    /**
     * A location representing an address as well as its GPS coordinate.
     * 
     * @class Location
     * @constructor
     * @param {float} lat The location latitude.
     * @param {float} lng The location longitude.
     * @param {SnapCarPlatform.Address} address The location address.
     */
    
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
                    return SnapCarPlatform.Address.populateProperties(new SnapCarPlatform.Address(), val);
            }
        });
        
        return context;
    };

    defineProperties(SnapCarPlatform.Location, {
        
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
         * @type String
         */        
        
        address: {name: 'address'}
    });

    /**
     * Represents GPS coordinate.
     * 
     * @class GeoPoint
     * @constructor
     */

    SnapCarPlatform.GeoPoint = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.GeoPoint.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
        return context;
    };

    defineProperties(SnapCarPlatform.GeoPoint, {
        
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
     * @class BillingDocument
     * @constructor
     */

    SnapCarPlatform.BillingDocument = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.BillingDocument.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
        return context;
    };

    defineProperties(SnapCarPlatform.BillingDocument, {
        
        /**
         * Billing document unique identifier.
         * 
         * @property id
         * @final
         * @type String
         */
                
        id: {name: 'id'},

        /**
         * URL of to download the document.
         * 
         * @property url
         * @final
         * @type String
         */
        
        url: {name: 'url'},

        /**
         * The type of document, refer to the SnapCarPlatform.BillingDocumentTypes properties.
         * 
         * @property type
         * @final
         * @type String
         */
                
        type: {name: 'type'}
    });


    /**
     * All possible types of billing documents.
     * 
     * @class BillingDocumentTypes
     * @static
     */
    SnapCarPlatform.BillingDocumentTypes = {
        
        /**
         * Bill type. When the client is charged.
         * 
         * @property BILL
         * @static
         * @final
         * @type String
         */
        
        BILL: 'bill',
        
        /**
         * Credit note type. When the client is reimbursed.
         * 
         * @property CREDIT_NOTE
         * @static
         * @final
         * @type String
         */
                
        CREDIT_NOTE: 'credit_note'
    };

    /**
     * A vehicle in which a driver picks a rider up.
     * 
     * @class Vehicle
     * @constructor
     */
    
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
                    return SnapCarPlatform.GeoPoint.populateProperties(new SnapCarPlatform.GeoPoint(), val);
                    break;
            }
        });
        return context;
    };

    defineProperties(SnapCarPlatform.Vehicle, {

        /**
         * The vehile model.
         * 
         * @property model
         * @final
         * @type String
         */
                
        model: {name: 'model'},

        /**
         * The localized vehile color.
         * 
         * @property color
         * @final
         * @type String
         */
                
        color: {name: 'color'},

        /**
         * The current vehile position.
         * 
         * @property position
         * @final
         * @type SnapCarPlatform.GeoPoint
         */
                
        position: {name: 'position'},

        /**
         * The vehile plate number.
         * 
         * @property plateNumber
         * @final
         * @type String
         */
                
        plate_number: {name: 'plateNumber'}
    });

    /**
     * Driver information.
     * 
     * @class Driver
     * @constructor
     */

    SnapCarPlatform.Driver = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.Driver.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
        return context;
    };

    defineProperties(SnapCarPlatform.Driver, {

        /**
         * The driver display name.
         * 
         * @property name
         * @final
         * @type String
         */
                
        name: {name: 'name'},

        /**
         * The driver's phone number.
         * 
         * @property phone
         * @final
         * @type String
         */
                
        phone: {name: 'phone'},

        /**
         * The driver unique identifier.
         * 
         * @property id
         * @final
         * @type String
         */
                
        id: {name: 'id'}
    });

    /**
     * Dated GPS coordinate.
     * 
     * @class TimestampedPoint
     * @constructor
     */

    SnapCarPlatform.TimestampedPoint = function () {
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.TimestampedPoint.populateProperties = function (context, payload) {
        processObjectPayload(context, payload);
        return context;
    };

    defineProperties(SnapCarPlatform.TimestampedPoint, {

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
     * @class BookingHistory
     * @constructor
     * @param {int} [limit=20] The maximum number of elements to return.
     */

    SnapCarPlatform.BookingHistory = function (limit) {
        this.limit = limit || 20;
        bootstrapInstanceProperties(this);
    };

    SnapCarPlatform.BookingHistory.populateProperties = function (context, payload) {
        processObjectPayload(context, payload, function (key, val) {
            switch (key) {
                case 'history':
                    return $.map(val, function (payload) {
                        return SnapCarPlatform.Booking.populateProperties(new SnapCarPlatform.Booking(), payload);
                    });
            }
        });
        return context;
    };

    defineProperties(SnapCarPlatform.BookingHistory, {

        /**
         * The total number of bookings in the history.
         * 
         * @property total
         * @final
         * @type int
         */
                
        total: {name: 'total'},

        /**
         * The current position in the pagination.
         * 
         * @property offset
         * @final
         * @type int
         */
        
        offset: {name: 'offset'},

        /**
         * The number of bookings fetched.
         * 
         * @property count
         * @final
         * @type int
         */
        
        count: {name: 'count'},

        /**
         * The list of SnapCarPlatform.Booking fetched
         * 
         * @property history
         * @final
         * @type Array
         */
        
        history: {name: 'history'}
    });

    /**
     * Loads the next bookings in the history regarding the current offset in the pagination.
     * 
     * @method nextBookings
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCarPlatform.BookingHistory as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error. 
     */
    
    SnapCarPlatform.BookingHistory.prototype.nextBookings = function () {
        if (this.moreBookingsAvailable()) {
            return SnapCarPlatform.bookingsHistory(this.offset + this.limit, this.limit);
        } else {
            throw new SnapCarPlatform.InvalidParametersError('no_more_bookings', 'There are no more bookings available in the history. Make sure that the moreBookingsAvailable method returns true before trying to load more bookings.');
        }
    };

    /**
     * Tells whether more bookings are available in the history regarding the current offset in the pagination and the total number of bookings. If yes, the SnapCarPlatform.BookingHistory.nextBookings method can be called.
     * 
     * @method moreBookingsAvailable
     * @return {Boolean} Whether more bookings are available or not.
     */

    SnapCarPlatform.BookingHistory.prototype.moreBookingsAvailable = function () {
        return (parseInt(this.offset) + parseInt(this.count)) < parseInt(this.total);
    };

    /**
     * A booking that represents a request by the user to be picked up.
     * 
     * @class Booking
     * @constructor
     * @param {SnapCarPlatform.Rider} [rider] The passenger of the booking. Typically the currently identifier user.
     * @param {SnapCarPlatform.Location} [startLocation] The location at which the rider needs to be picked up.
     * @param {SnapCarPlatform.Location} [endLocation] The location at which the rider needs to be dropped off.
     * @param {Date} [plannedStartDate] The planned pick up date.
     * @param {Boolean} [nameboard] Set to true if the nameboard option is required
     * @param {String} [driverInfo] Additional pick up information to provide the driver with.
     * @param {SnapCarPlatform.MeetingPoint} [meetingPoint] Meeting at which the rider will find his driver.
     */

    SnapCarPlatform.Booking = function (rider, startLocation, endLocation, plannedStartDate, nameboard, driverInfo, meetingPoint) {
        bootstrapInstanceProperties(this);

        this.rider = rider;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.plannedStartDate = plannedStartDate;
        this.nameboard = nameboard;
        this.driverInfo = driverInfo;
        this.meetingPoint = meetingPoint;
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
                    return SnapCarPlatform.ServiceClass.populateProperties(new SnapCarPlatform.ServiceClass(), val);
                case 'meeting_point':
                    return SnapCarPlatform.MeetingPoint.populateProperties(new SnapCarPlatform.MeetingPoint(), val);
                case 'start_location':
                case 'end_location':
                    return SnapCarPlatform.Location.populateProperties(new SnapCarPlatform.Location(), val);
                case 'driver':
                    return SnapCarPlatform.Driver.populateProperties(new SnapCarPlatform.Driver(), val);
                case 'rider':
                    return SnapCarPlatform.Rider.populateProperties(new SnapCarPlatform.Rider(), val);
                case 'vehicle':
                    return SnapCarPlatform.Vehicle.populateProperties(new SnapCarPlatform.Vehicle(), val);
                case 'route':
                    return $.map(val, function (payload) {
                        return SnapCarPlatform.TimestampedPoint.populateProperties(new SnapCarPlatform.TimestampedPoint(), payload);
                    });
                case 'documents':
                    return $.map(val, function (payload) {
                        return SnapCarPlatform.BillingDocument.populateProperties(new SnapCarPlatform.BillingDocument(), payload);
                    });
                case 'booking_price':
                    return SnapCarPlatform.BookingPrice.populateProperties(new SnapCarPlatform.BookingPrice(), val);
            }
        });
        
        return context;
    };

    defineProperties(SnapCarPlatform.Booking, {

        /**
         * The booking unique identifier.
         * 
         * @property id
         * @final
         * @type String
         */
        
        id: {name: 'id'},

        /**
         * The passenger of the booking.
         * 
         * @property rider
         * @final
         * @type SnapCarPlatform.Rider
         */
        
        rider: {name: 'rider'},

        /**
         * The ordered service class for this booking.
         * 
         * @property serviceClass
         * @final
         * @type SnapCarPlatform.ServiceClass
         */
        
        service_class: {name: 'serviceClass'},

        /**
         * The booking status, refer to the SnapCarPlatform.BookingStatuses properties to have a comprehensive list of all possible statuses.
         * 
         * @property status
         * @final
         * @type String
         */
        
        status: {name: 'status'},

        /**
         * The booking location's timezone.
         * 
         * @property timezone
         * @final
         * @type String
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
         * @type SnapCarPlatform.MeetingPoint
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
         * This code indicates the reason why the booking was cancelled. Check out the SnapCarPlatform.BookingCancellationReasons static class properties.
         * 
         * @property cancellationReason
         * @final
         * @type String
         */
        
        cancellation_reason: {name: 'cancellationReason'},

        /**
         * The pick up location.
         * 
         * @property startLocation
         * @final
         * @type SnapCarPlatform.Location
         */
        
        start_location: {name: 'startLocation'},

        /**
         * The location at which the rider has been dropped off.
         * 
         * @property endLocation
         * @final
         * @type SnapCarPlatform.Location
         */
        
        end_location: {name: 'endLocation'},

        /**
         * Additional pick-up information for the driver. Provided by the rider.
         * 
         * @property driverInfo
         * @final
         * @type String
         */
        
        driver_info: {name: 'driverInfo'},

        /**
         * The initial order information.
         * 
         * @property bookingPrice
         * @final
         * @type SnapCarPlatform.BookingPrice
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
         * A list of SnapCarPlatform.TimestampedPoint describing the driver route from the pick up location.
         * 
         * @property route
         * @final
         * @type Array
         */
        
        route: {name: 'route'},

        /**
         * The list of SnapCarPlatform.BillingDocument
         * 
         * @property documents
         * @final
         * @type Array
         */
        
        documents: {name: 'documents'},

        /**
         * The vehicle used by the driver to pick the rider up.
         * 
         * @property vehicle
         * @final
         * @type Array
         */
        
        vehicle: {name: 'vehicle'}
    });

    /**
     * Gets the booking cancellation price. Relevant only when the booking is either in the 'pending', 'going_to_get' or 'driver_waiting' state.
     * 
     * @method cancellationPrice
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCarPlatform.CancellationFee as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */

    SnapCarPlatform.Booking.prototype.cancellationPrice = function () {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + this.id + "/cancellation_price"
        }, function (data) {
            var result = new SnapCarPlatform.CancellationFee();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Cancels the booking. You may want to check the cancellation price by using the SnapCarPlatform.Booking.cancellationPrice() method before doing so.
     * 
     * @method cancel
     * @return {jQuery.Promise} A Promise object. Success handlers are called with the updated instance of SnapCarPlatform.Booking as the single argument. Note that the initial instance itself is updated. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */

    SnapCarPlatform.Booking.prototype.cancel = function () {
        var booking = this;
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + this.id + "/cancel",
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
     * @return {jQuery.Promise} A Promise object. Success handlers are called with the updated instance of SnapCarPlatform.Booking as the single argument. Note that the initial instance itself is updated. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */

    SnapCarPlatform.Booking.prototype.refresh = function () {
        var booking = this;
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + booking.id
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
                        if (booking.status === SnapCarPlatform.BookingStatuses.PENDING) {
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
     * @return {jQuery.Promise} A Promise object. Success/progress handlers are called with a SnapCarPlatform.Booking as the single argument. If the booking has a specific planned start date, the success callbacks are called once the platform confirms the booking creation. However, if the booking has no planned start date, the progress callbacks are called once the platform confirms the booking creation and the success callbacks are called when the booking is no longer in the "pending" status (either accepted by the driver or cancelled). Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */
    
    SnapCarPlatform.Booking.prototype.confirm = function() {

        if ((typeof this.startLocation === 'undefined') || (typeof this.startLocation.address === 'undefined') || (typeof this.startLocation.lat === 'undefined') || (typeof this.startLocation.lng === 'undefined') || (typeof this.startLocation.address.name === 'undefined') || (typeof this.startLocation.address.city === 'undefined')) {
            throw new SnapCarPlatform.InvalidParametersError('start_location_missing', 'You must provide a start location including at least: lat, lng, name and city.');
        }

        if (typeof this.rider === 'undefined') {
            throw new SnapCarPlatform.InvalidParametersError('rider_missing', 'You must provide a valid rider.');
        }
        
        if (typeof this.serviceClass === 'undefined') {
            throw new SnapCarPlatform.InvalidParametersError('service_class_missing', 'You must provide the required service class for this booking.');
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
        
        var promise = performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings",
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
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCarPlatform.BookingPrice as the single argument. Check the value of the SnapCarPlatform.BookingPrice.serviceClassId property in order to know to which service class a booking price is associated. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */

    SnapCarPlatform.Booking.prototype.flatPrices = function () {

        if ((typeof this.startLocation === 'undefined') || (typeof this.startLocation.address === 'undefined') || (typeof this.startLocation.lat === 'undefined') || (typeof this.startLocation.lng === 'undefined') || (typeof this.startLocation.address.name === 'undefined') || (typeof this.startLocation.address.city === 'undefined')) {
            throw new SnapCarPlatform.InvalidParametersError('start_location_missing', 'You must provide a start location including at least: lat, lng, name and city.');
        }

        if ((typeof this.endLocation === 'undefined') || (typeof this.endLocation.address === 'undefined') || (typeof this.endLocation.lat === 'undefined') || (typeof this.endLocation.lng === 'undefined') || (typeof this.endLocation.address.name === 'undefined') || (typeof this.endLocation.address.city === 'undefined')) {
            throw new SnapCarPlatform.InvalidParametersError('end_location_missing', 'You must provide an end location including at least: lat, lng, name and city.');
        }

        if (typeof this.rider === 'undefined') {
            throw new SnapCarPlatform.InvalidParametersError('rider_missing', 'You must provide a valid rider.');
        }

        var parameters = orderParameters.call(this);

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

   /**
     * The possible booking statuses.
     * 
     * @class BookingStatuses
     * @static
     */
    
    SnapCarPlatform.BookingStatuses = {
        
        /**
         * When the booking is waiting for a driver to be attributed. Its value is "pending".
         * 
         * @property PENDING
         * @static
         * @final
         * @type String
         */
        
        PENDING: 'pending',
        
        /**
         * When a driver has accepted a booking and is on his way to pick up the rider. Its value is "going_to_get".
         * 
         * @property GOING_TO_GET
         * @static
         * @final
         * @type String
         */
        
        GOING_TO_GET: 'going_to_get',
        
        /**
         * When the driver has arrived at the pick up location and is waiting for the rider. Its value is "driver_waiting".
         * 
         * @property DRIVER_WAITING
         * @static
         * @final
         * @type String
         */
        
        DRIVER_WAITING: 'driver_waiting',
        
        /**
         * When the rider is in the car. Its value is "on_board".
         * 
         * @property ON_BOARD
         * @static
         * @final
         * @type String
         */
        
        ON_BOARD: 'on_board',
        
        /**
         * When the booking is ended, meaning that the rider has been dropped off. Its value is "complete".
         * 
         * @property COMPLETE
         * @static
         * @final
         * @type String
         */
        
        COMPLETE: 'complete',
        
        /**
         * When the booking is cancelled. Its value is "cancelled".
         * 
         * @property CANCELLED
         * @static
         * @final
         * @type String
         */
        
        CANCELLED: 'cancelled'
    };

   /**
     * The possible booking cancellation reasons.
     * 
     * @class BookingCancellationReasons
     * @static
     */
    
    SnapCarPlatform.BookingCancellationReasons = {
        
        /**
         * The booking has been cancelled by the rider, and not charged. Its value is "rider_cancellation".
         * 
         * @property RIDER_CANCELLATION
         * @static
         * @final
         * @type String
         */
        
        RIDER_CANCELLATION: 'rider_cancellation',
        
        /**
         * The booking has been cancelled by the rider, and has been charged a cancellation fee. Its value is "rider_cancellation_charged".
         * 
         * @property RIDER_CANCELLATION_CHARGED
         * @static
         * @final
         * @type String
         */
        
        RIDER_CANCELLATION_CHARGED: 'rider_cancellation_charged',
        
        /**
         * The booking has been cancelled by SnapCar. Its value is "system_cancellation".
         * 
         * @property SYSTEM_CANCELLATION
         * @static
         * @final
         * @type String
         */
        
        SYSTEM_CANCELLATION: 'system_cancellation',
        
        /**
         * The booking has been cancelled by SnapCar, and charged. Its value is "system_cancellation_charged".
         * 
         * @property SYSTEM_CANCELLATION_CHARGED
         * @static
         * @final
         * @type String
         */
        
        SYSTEM_CANCELLATION_CHARGED: 'system_cancellation_charged',
        
        /**
         * No driver was available for dispatch.
         * 
         * @property NO_DRIVER
         * @static
         * @final
         * @type String
         */
        
        NO_DRIVER: 'no_driver'
    };


    // Config test 

    if (typeof $ === 'undefined') {
        throw new SnapCarPlatform.ConfigError('missing_jquery', 'jQuery is required to run the SnapCarPlatform SDK.');
    }

    // API Calls

    var performAPICall = function (requestParams, resultProcessor) {

        if (typeof SnapCarPlatform.Config.token === 'undefined') {
            throw new SnapCarPlatform.ConfigError('missing_token', 'You have to provide a SnapCar API token in order to perform API calls.');
        }

        var deferred = $.Deferred();
        requestParams.data = $.extend({}, requestParams.data || {}, {token: SnapCarPlatform.Config.token});

        $.ajax(requestParams).done(function (data) {
            deferred.resolve(resultProcessor(data));
        }).fail(function (data) {
            deferred.reject(new SnapCarPlatform.APIError(data));
        });

        return deferred.promise();
    };
    
    /**
     * Defines basic API methods.
     *
     * @class Utils
     * @static
     */

    SnapCarPlatform.Utils = function () {};      

    /**
     * Retrieves current ETA and availability for each service class.
     * 
     * @method eta
     * @param {float} lat Latitude of the position at which you want to get the current eta and availability.
     * @param {float} lng Longitude of the position at which you want to get the current eta and availability.
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCarPlatform.ETAResult as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */

    SnapCarPlatform.Utils.eta = function (lat, lng) {
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

    /**
     * Retrieves a list of all allowed service classes at a specific location.
     * 
     * @method serviceClasses
     * @param {float} lat Latitude of the position at which you want to get the allowed service classes.
     * @param {float} lng Longitude of the position at which you want to get the allowed service classes.
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCarPlatform.ServiceClass as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error.
     */

    SnapCarPlatform.Utils.serviceClasses = function (lat, lng) {
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

    /**
     * Retrieves meeting point information at a specific location.
     * 
     * @method meetingPoints
     * @param {float} lat Latitude of the position at which you want to get the information.
     * @param {float} lng Longitude of the position at which you want to get the information.
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCarPlatform.SpecialArea as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error. Be aware that if no specific meeting point information is found at a location, the failure callback will be called with a SnapCarPlatform.APIError having a 404 code value. 
     */

    SnapCarPlatform.Utils.meetingPoints = function (lat, lng) {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/info/meeting_points",
            data: {lat: lat, lng: lng}
        }, function (data) {
            var result = new SnapCarPlatform.SpecialArea();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Gets the currently authenticated user information.
     * 
     * @method user
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCarPlatform.Rider as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error. 
     */

    SnapCarPlatform.Utils.user = function () {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/users/me"
        }, function (data) {
            var result = new SnapCarPlatform.Rider(data);
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Gets the currently authentified rider's active bookings.
     * 
     * @method activeBookings
     * @return {jQuery.Promise} A Promise object. Success handlers are called with an array of SnapCarPlatform.Booking as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error. 
     */

    SnapCarPlatform.Utils.activeBookings = function () {
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

    /**
     * Gets the currently authentified rider's bookings history.
     * 
     * @method bookingsHistory
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCarPlatform.BookingHistory as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error. 
     * @param {int} [offset=0] The position of the first booking in the pagination.
     * @param {int} [limit=20] The maximum number of bookings to return.
     */

    SnapCarPlatform.Utils.bookingsHistory = function (offset, limit) {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/history",
            data: {
                offset: offset || 0,
                limit: limit || 20
            }
        }, function (data) {
            var result = new SnapCarPlatform.BookingHistory(limit);
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    /**
     * Gets information about a specific booking.
     * 
     * @method booking
     * @return {jQuery.Promise} A Promise object. Success handlers are called with a SnapCarPlatform.Booking as the single argument. Failure handlers are called with a single SnapCarPlatform.APIError argument upon error. 
     * @param {int} id The booking unique identifier.
     */

    SnapCarPlatform.Utils.booking = function (id) {
        return performAPICall({
            url: SnapCarPlatform.Config.baseDomain + "/bookings/" + id
        }, function (data) {
            var result = new SnapCarPlatform.Booking();
            result.constructor.populateProperties(result, data);
            return result;
        });
    };

    return SnapCarPlatform;

} (SnapCarPlatform || {}, jQuery));

