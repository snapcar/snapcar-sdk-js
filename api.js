YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "APIError",
        "Address",
        "BillingDocument",
        "BillingDocumentTypes",
        "Booking",
        "BookingCancellationReasons",
        "BookingHistory",
        "BookingPrice",
        "BookingStatuses",
        "CancellationFee",
        "Config",
        "ConfigError",
        "Driver",
        "ETAResult",
        "ETAResultStatuses",
        "Error",
        "GeoPoint",
        "InvalidParametersError",
        "Location",
        "MeetingPoint",
        "PaymentMethod",
        "Rider",
        "RiderStatuses",
        "ServiceClass",
        "SpecialArea",
        "SpecialAreaTypes",
        "TimestampedPoint",
        "Utils",
        "Vehicle"
    ],
    "modules": [
        "SnapCarPlatform"
    ],
    "allModules": [
        {
            "displayName": "SnapCarPlatform",
            "name": "SnapCarPlatform",
            "description": "This is the base SnapCarPlatform module that allows communication between your web application and the SnapCar platform through the SnapCar Public API. This module is dependent of jQuery.\n\nThe module parameters can be managed through the SnapCarPlatform.Config static class. Before using this module, you must initialize it with a user token by setting the SnapCarPlatform.Config.token property. Please refer to the general SnapCar API documentation for more information on how to obtain a user token : http://developer.snapcar.com/.\n\nThe SnapCarPlatform SDK for JavaScript does not manage user authentication. The reason for this is that obtaining a user token is done through a request that requires your API secret value to be provided. The API secret value is sensitive information that should never be revealed to the user. However, setting it in the JavaScript SDK implies that your users can access it by digging into the source code. Which is why such work flow must be implemented on the server side. Once initialized with a token, the module allows you to perform actions such as making bookings or getting ETAs on behalf of the authenticated user.\n\nBasic API calls such as getting ETAs or allowed service classes can be performed through the SnapCarPlatform.Utils static class. In general, all methods that are in charge of performing an API request always return a jQuery promise. The promises are resolved with the desired resources which depend on the performed request. If an error occurs during the request, the promises are rejected with an instance of SnapCarPlatform.APIError (containing more info about the issue). Look at the examples below for a comprehensive vision of the work flow."
        }
    ]
} };
});