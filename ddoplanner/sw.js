importScripts("precache-manifest.668d68c0dad171b32521b312fb85a929.js", "https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js");

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

