"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var subscription_handshake_link_1 = require("./subscription-handshake-link");
exports.CONTROL_EVENTS_KEY = subscription_handshake_link_1.CONTROL_EVENTS_KEY;
var client_1 = require("@apollo/client");
var apollo_utilities_1 = require("apollo-utilities");
var non_terminating_link_1 = require("./non-terminating-link");
var realtime_subscription_handshake_link_1 = require("./realtime-subscription-handshake-link");
function createSubscriptionHandshakeLink(infoOrUrl, theResultsFetcherLink) {
    var resultsFetcherLink, subscriptionLinks;
    if (typeof infoOrUrl === "string") {
        resultsFetcherLink =
            theResultsFetcherLink || client_1.createHttpLink({ uri: infoOrUrl });
        subscriptionLinks = client_1.ApolloLink.from([
            new non_terminating_link_1.NonTerminatingLink("controlMessages", {
                link: new client_1.ApolloLink(function (operation, _forward) {
                    return new client_1.Observable(function (observer) {
                        var _a;
                        var _b = operation.variables, _c = subscription_handshake_link_1.CONTROL_EVENTS_KEY, controlEvents = _b[_c], variables = __rest(_b, [typeof _c === "symbol" ? _c : _c + ""]);
                        if (typeof controlEvents !== "undefined") {
                            operation.variables = variables;
                        }
                        observer.next((_a = {}, _a[subscription_handshake_link_1.CONTROL_EVENTS_KEY] = controlEvents, _a));
                        return function () { };
                    });
                })
            }),
            new non_terminating_link_1.NonTerminatingLink("subsInfo", { link: resultsFetcherLink }),
            new subscription_handshake_link_1.SubscriptionHandshakeLink("subsInfo")
        ]);
    }
    else {
        var url = infoOrUrl.url;
        resultsFetcherLink = theResultsFetcherLink || client_1.createHttpLink({ uri: url });
        subscriptionLinks = new realtime_subscription_handshake_link_1.AppSyncRealTimeSubscriptionHandshakeLink(infoOrUrl);
    }
    return client_1.ApolloLink.split(function (operation) {
        var query = operation.query;
        var _a = apollo_utilities_1.getMainDefinition(query), kind = _a.kind, graphqlOperation = _a.operation;
        var isSubscription = kind === "OperationDefinition" && graphqlOperation === "subscription";
        return isSubscription;
    }, subscriptionLinks, resultsFetcherLink);
}
exports.createSubscriptionHandshakeLink = createSubscriptionHandshakeLink;
