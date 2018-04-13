importScripts("precache-manifest.5518733ddf60dc9dfee65afb030d895c.js", "https://storage.googleapis.com/workbox-cdn/releases/3.0.1/workbox-sw.js");

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

workbox.routing.registerRoute(/^http:\/\/stackpath.bootstrapcdn.com\/font-awesome\/4.7.0\/(.*)/, workbox.strategies.staleWhileRevalidate(), 'GET');

var Hiddenworld = ( function () {
	let functions = {
		findAll ( objectStoreName ) {
			return new Promise( ( resolve, reject ) => {
				let connection = indexedDB.open( 'hiddenworld', 1 );
				
				connection.onsuccess = () => {
					let database = connection.result;
					let transaction = database.transaction( objectStoreName, 'readonly' );
					let objectStore = transaction.objectStore( objectStoreName );
					let request = objectStore.openCursor();
					let results = [];

					request.onsuccess = event => {
						let cursor = event.target.result;

						if ( cursor ) {
							results.push( cursor.value );
							cursor.continue();
						} else {
							database.close();
							resolve( results );
						}
					};

					request.onerror = () => {
						database.close();
						reject( results );
					};
				};
			} );
		}
		, findByAttributeId ( resolve, reject, attributeId ) {
			let attributes = {
				'1': 'Abs'
				, '2': 'Chr'
				, '3': 'Con'
				, '4': 'Dex'
				, '5': 'Evd'
				, '6': 'HP '
				, '7': 'HpRegn'
				, '8': 'Int'
				, '9': 'Mana'
				, '10': 'Spd'
				, '11': 'Sth'
				, '12': 'Wis'
			};
			let attribute = attributes[ attributeId ];
			let objectStore = 'accessories';

			if ( attribute ) {
				functions.findAll( objectStore ).then( results => {
					resolve( new Response( JSON.stringify( { [ objectStore ]: results.filter( result => result.effect.indexOf( attribute ) > -1 ) } ) ) );
				} );
			} else {
				reject( new Response( '{}', { status: 400 } ) );
			}
		}
		, findByCategoryId ( resolve, reject, categoryId ) {
			let objectStores = {
				'1': 'weapons'
				, '2': 'armours'
				, '3': 'accessories'
				, '4': 'potions'
				, '5': 'donations'
			};
			let objectStore = objectStores[ categoryId ];

			if ( objectStore ) {
				functions.findAll( objectStore ).then( results => {
					resolve( new Response( JSON.stringify( { [ objectStore ]: results } ) ) );
				} );
			} else {
				reject( new Response( '{}', { status: 400 } ) );
			}
		}
		, findByTownId ( resolve, reject, townId ) {
			let objectStore = 'monsters';

			functions.findAll( objectStore ).then( results => {
				resolve( new Response( JSON.stringify( { [ objectStore ]: results.filter( result => result.place == townId ) } ) ) );
			} );
		}
		, findByLevel ( resolve, reject, level ) {
			try {
				level = parseInt( level, 10 );
				let response = {};

				Promise.all( [
					functions.findAll( 'accessories' )
					, functions.findAll( 'armours' )
					, functions.findAll( 'donations' )
					, functions.findAll( 'monsters' )
					, functions.findAll( 'potions' )
					, functions.findAll( 'weapons' )
				] ).then( ( results ) => {
					let i = 0;
					response.accessories = results[i++].filter( result => ( result.level <= level ) ).sort( ( a, b ) => b.level - a.level );
					response.armours = results[i++].filter( result => ( result.level >= level - 3 && result.level <= level ) ).sort( ( a, b ) => b.level - a.level );
					response.donations = results[i++].filter( donation => donation.level === level);
					response.monsters = results[i++].filter( result => ( result.level >= level - 3 && result.level <= level ) ).sort( ( a, b ) => b.level - a.level );
					response.potions = results[i++].filter( result => ( result.levelmin <= level && level <= result.levelmax ) ).sort( ( a, b ) => b.levelmin - a.levelmin || b.levelmax - a.levelmax || a.name.localeCompare( b.name ) );
					response.weapons = results[i++].filter( result => ( result.level >= level - 3 && result.level <= level ) ).sort( ( a, b ) => b.level - a.level || a.name.localeCompare( b.name ) );

					resolve( new Response( JSON.stringify( response ) ) );
				} );
			} catch ( e ) {
				reject( new Response( '{}', { status: 400 } ) );
			}
		}
		, findByWeaponTypeId ( resolve, reject, weaponTypeId ) {
			let objectStore = 'weapons';

			functions.findAll( objectStore ).then( results => {
				resolve( new Response( JSON.stringify( { [ objectStore ]: results.filter( result => result.type == weaponTypeId ) } ) ) );
			} );
		}
		, loadJsonFile ( database, objectStoreName ) {
			return fetch( `${objectStoreName}.json` )
				.then( response => response.json() )
				.then( results => {
					let transaction = database.transaction( objectStoreName, 'readwrite' );
					let objectStore = transaction.objectStore( objectStoreName );

					results.forEach( result => objectStore.add( result ) );
				} );
		}
	};

	let api = {
		initialize () {
			let connection = indexedDB.open( 'hiddenworld', 1 );

			connection.onupgradeneeded = () => {
				let database = connection.result;

				database.createObjectStore( 'armours', { keyPath: 'id' } )
				database.createObjectStore( 'donations', { keyPath: 'id' } );
				database.createObjectStore( 'accessories', { keyPath: 'id' } );
				database.createObjectStore( 'monsters', { keyPath: 'id' } );
				database.createObjectStore( 'potions', { keyPath: 'id' } );
				database.createObjectStore( 'weapons', { keyPath: 'id' } );
			};

			connection.onsuccess = () => {
				let database = connection.result;

				Promise.all( [
					functions.loadJsonFile( database, 'armours' ),
					functions.loadJsonFile( database, 'donations' ),
					functions.loadJsonFile( database, 'accessories' ),
					functions.loadJsonFile( database, 'monsters' ),
					functions.loadJsonFile( database, 'potions' ),
					functions.loadJsonFile( database, 'weapons' )
				] ).then( () => database.close() );
			};
		},
		processRequest ( { url, event, params } ) {
			return new Promise( ( resolve, reject ) => {
				let [ type, id ] = params;

				switch ( type ) {
					case 'categories':
						functions.findByCategoryId( resolve, reject, id );
						break;
					case 'attributes':
						functions.findByAttributeId( resolve, reject, id );
						break;
					case 'types':
						functions.findByWeaponTypeId( resolve, reject, id );
						break;
					case 'towns':
						functions.findByTownId( resolve, reject, id );
						break;
					case 'levels':
						functions.findByLevel( resolve, reject, id );
						break;
					default:
						reject( new Response( '{}', { status: 400 } ) );
						break;
				}
			} );
		}
	};

	return api;
}() );

Hiddenworld.initialize();

workbox.routing.registerRoute( /api\/equipment\/([a-zA-Z]+)\/([0-9]+)/, Hiddenworld.processRequest, 'GET' );

