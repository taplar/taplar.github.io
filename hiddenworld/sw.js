importScripts("precache-manifest.b384fc2987b2f42d3d8e4816297c00a6.js", "https://storage.googleapis.com/workbox-cdn/releases/3.0.1/workbox-sw.js");

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
	let dataStore = {};

	let functions = {
		findAccessoriesByAttributeId ( resolve, reject, attributeId ) {
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

			if ( attribute ) {
				resolve( new Response( JSON.stringify( { accessories: dataStore.accessories.filter( result => result.effect.indexOf( attribute ) > -1 ) } ) ) );
			} else {
				reject( new Response( '{}', { status: 400 } ) );
			}
		}
		, findByCollectionId ( resolve, reject, collectionId ) {
			let collectionsById = {
				'1': 'weapons'
				, '2': 'armours'
				, '3': 'accessories'
				, '4': 'potions'
				, '5': 'donations'
			};
			let collectionName = collectionsById[ collectionId ];

			if ( collectionName ) {
				resolve( new Response( JSON.stringify( { [ collectionName ]: dataStore[ collectionName ] } ) ) );
			} else {
				reject( new Response( '{}', { status: 400 } ) );
			}
		}
		, findByTownId ( resolve, reject, townId ) {
			resolve( new Response( JSON.stringify( { monsters: dataStore.monsters.filter( result => result.place == townId ) } ) ) );
		}
		, findByLevel ( resolve, reject, level ) {
			try {
				level = parseInt( level, 10 );
				let response = {};

				response.accessories = dataStore.accessories.filter( result => ( result.level <= level ) ).sort( ( a, b ) => b.level - a.level );
				response.armours     = dataStore.armours.filter( result => ( result.level >= level - 3 && result.level <= level ) ).sort( ( a, b ) => b.level - a.level );
				response.donations   = dataStore.donations.filter( donation => donation.level === level);
				response.monsters    = dataStore.monsters.filter( result => ( result.level >= level - 3 && result.level <= level ) ).sort( ( a, b ) => b.level - a.level );
				response.potions     = dataStore.potions.filter( result => ( result.levelmin <= level && level <= result.levelmax ) ).sort( ( a, b ) => b.levelmin - a.levelmin || b.levelmax - a.levelmax || a.name.localeCompare( b.name ) );
				response.weapons     = dataStore.weapons.filter( result => ( result.level >= level - 3 && result.level <= level ) ).sort( ( a, b ) => b.level - a.level || a.name.localeCompare( b.name ) );

				resolve( new Response( JSON.stringify( response ) ) );
			} catch ( e ) {
				reject( new Response( '{}', { status: 400 } ) );
			}
		}
		, findByWeaponTypeId ( resolve, reject, weaponTypeId ) {
			resolve( new Response( JSON.stringify( { weapons: dataStore.weapons.filter( result => result.type == weaponTypeId ) } ) ) );
		}
		, loadJsonFile ( objectStoreName ) {
			fetch( `${objectStoreName}.json` )
				.then( response => response.json() )
				.then( results => dataStore[ objectStoreName ] = results );
		}
	};

	let api = {
		initialize () {
			functions.loadJsonFile( 'armours' );
			functions.loadJsonFile( 'donations' );
			functions.loadJsonFile( 'accessories' );
			functions.loadJsonFile( 'monsters' );
			functions.loadJsonFile( 'potions' );
			functions.loadJsonFile( 'weapons' );
		},
		processRequest ( { url, event, params } ) {
			return new Promise( ( resolve, reject ) => {
				let [ type, id ] = params;

				switch ( type ) {
					case 'categories':
						functions.findByCollectionId( resolve, reject, id );
						break;
					case 'attributes':
						functions.findAccessoriesByAttributeId( resolve, reject, id );
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

