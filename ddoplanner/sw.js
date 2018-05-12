importScripts("precache-manifest.6c38e7c604ec560289771d3fe9135736.js", "https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

workbox.skipWaiting();
workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

workbox.routing.registerRoute(/^http[s]?:\/\/fonts.googleapis.com\/(.*)/, workbox.strategies.staleWhileRevalidate(), 'GET');
workbox.routing.registerRoute(/^http[s]?:\/\/fonts.gstatic.com\/(.*)/, workbox.strategies.staleWhileRevalidate(), 'GET');
workbox.routing.registerRoute(/\/(.*).json/, workbox.strategies.staleWhileRevalidate(), 'GET');

var DDOPlanner = ( function () {
	let dataStore = {};

	let functions = {
	};

	let api = {
		initialize: function () {
		}
	};

	return api;
}() );

DDOPlanner.initialize();

