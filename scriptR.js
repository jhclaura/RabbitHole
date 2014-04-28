
//PointerLockControls
var pointerControls, dateTime = Date.now();
var objects = [];
var rays = [];
var blocker = document.getElementById('blocker');
var instructions = document.getElementById('instructions');

// http://www.html5rocks.com/en/tutorials/pointerlock/intro/

var havePointerLock = 
			'pointerLockElement' in document || 
			'mozPointerLockElement' in document || 
			'webkitPointerLockElement' in document;

if ( havePointerLock ) {

	var element = document.body;

	var pointerlockchange = function ( event ) {

		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

			pointerControls.enabled = true;
			blocker.style.display = 'none';

		} else {

			pointerControls.enabled = false;
			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';
		}

	}

	var pointerlockerror = function(event){
		instructions.style.display = '';
	}

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );


	instructions.addEventListener( 'click', function ( event ) {

		instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {

			var fullscreenchange = function ( event ) {

				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

					element.requestPointerLock();
				}

			}

			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();

		} else {

			element.requestPointerLock();

		}

	}, false );

} else {

	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}



var container;
var width = window.innerWidth;
var height = window.innerHeight;
var renderer, scene, camera, controls, stats, light;
var dirLightA, dirLightB, dirLightC;
var sky;
var clock = new THREE.Clock();

var mouse = new THREE.Vector2();
var keyboard = new KeyboardState();

var rabbitWidth, rabbitHeight;
var rabbits = [];
var rabbit;

var timeNumber, timeClocks = [];

var chocoNumber, chocoGeo, chocoMat, chocos = [];
var groundGeo, groundMat, ground;
var maze;
var cupGeo, cupTexture, cupMat, cup;
var spoonGeo, spoonTexture, spoonMat, spoon;
var plateGeo, plateTexture, plateMate, plate;
var sugarA, sugarB, sugarC;
var cookie, cookieArmA, cookieArmB, cookieLegA, cookieLegB, cookieTexture;
var cookieSwing = true;
var lollipop;
var clouds = [];



var bubbles = [];
var stages = [];
var tubes = [], tubesR = [];

var dropSpeed = 2;

var dummyGeo, dummyMat, dummy;

var thinker;
var think;			//animator

var decreaseLight = true;


//WEB_CAM
var video, videoImage, videoImageContext, videoTexture;
var tvsets = [];
var tvTexture;
var screens = [];
var screensR = [];
var tvs = [];
var tvsR = [];
var tvWidth;
//TV_OBJECT
var alienTvs = [];
var alienScrs = [];


//Wave
var time = Math.PI/2;
var frequency = 0.01;
var amplitude = 3;
var offset = 0;
var tanWave = new TanWave(time, frequency, amplitude, offset);
var sinWave = new SinWave(time, frequency*5, amplitude/2, offset);
var sinWaveSlowA = new SinWave(time, frequency*2, amplitude/2, offset);
var sinWaveSlowB = new SinWave(time*2, frequency*2, amplitude/2, offset);
var spin;


//Web Audio API
var context, source, analyser, buffer, audioBuffer;
var analyserView1;
var bufferLoader;

var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var detectorElem, canvasContext, pitchElem, noteElem, detuneElem, detuneAmount;
var confidence = 0;
var currentPitch = 0;

var buf, fft;
var samples = 128;
var setup = false;

var high = false;
var highTime;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
context = new AudioContext();


//-------------------------------------------------------------

init();
animate();

function init(){

	//Web Audio API
	bufferLoader = new BufferLoader(
		context, ['../audios/Hell Around The Corner.mp3', 
				  '../audios/giggle.mp3', 
				  '../audios/wind_houling.mp3', 
				  '../audios/crackles.mp3'], 
				  finishedLoading
		);
	bufferLoader.load();



	//SET-UP
	container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x3d1146, 0.03 );

	camera = new THREE.PerspectiveCamera(45, width/height, 0.05, 100000);
	// camera.position.set(17.4, 0, 43.5);
	// camera.lookAt(scene.position);

	//CONTROLS
	// controls = new THREE.OrbitControls(camera);
	// controls.addEventListener('change',render);


	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '5px';
	stats.domElement.style.zIndex = 100;
	stats.domElement.children[ 0 ].style.background = "transparent";
	stats.domElement.children[ 0 ].children[1].style.display = "none";
	container.appendChild(stats.domElement);

	dirLightA = new THREE.DirectionalLight(0xffffff);
	dirLightA.position.set(0,7,0);
	//SHADOW
	dirLightA.castShadow = true;
	dirLightA.shadowDarkness = 0.5;
	// dirLightA.shadowCameraVisible = true;
	dirLightA.shadowCameraNear = 2;
	dirLightA.shadowCameraFar = 15;
	dirLightA.shadowCameraLeft = -100;
	dirLightA.shadowCameraRight = 100;
	dirLightA.shadowCameraTop = 100;
	dirLightA.shadowCameraBottom = -100;

	scene.add(dirLightA);

	dirLightB = new THREE.DirectionalLight(0xffec82, 2);
	dirLightB.castShadow = false;
	dirLightB.position.set(0,1,1);
	scene.add(dirLightB);

	dirLightC = new THREE.DirectionalLight(0xf2a8b0, 2);
	dirLightC.castShadow = false;
	dirLightC.position.set(0,1,-1);
	scene.add(dirLightC);

	light = new THREE.DirectionalLight(0x94eaeb);
	light.position.set(-1,1,0);
	light.castShadow = false;
	// light.target.position.set(8,0,2)
	scene.add(light);

	//AMBIENT
	light = new THREE.AmbientLight(0xffffff);
	// scene.add(light);


	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setClearColor(0x3d1146, 1);
	renderer.setSize(width,height);
	//SHADOW
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	container.appendChild(renderer.domElement);

	window.addEventListener( 'resize', onWindowResize, false );


	//SKY
	var urls = [
		'img/sky/pos_x.png',
		'img/sky/neg_x.png',
		'img/sky/pos_y.png',
		'img/sky/neg_y.png',
		'img/sky/pos_z.png',
		'img/sky/neg_z.png'
	];
	var skyTexture = THREE.ImageUtils.loadTextureCube(urls);
	skyTexture.format = THREE.RGBFormat;

	var skyShader = THREE.ShaderLib["cube"];
	skyShader.uniforms["tCube"].value = skyTexture;

	var skyMat = new THREE.ShaderMaterial({
		fragmentShader: skyShader.fragmentShader,
		vertexShader: skyShader.vertexShader,
		uniforms: skyShader.uniforms,
		depthWrite: false,
		side: THREE.BackSide
	});

	var skyGeo = new THREE.BoxGeometry(1000, 1000, 1000);
	sky = new THREE.Mesh(skyGeo, skyMat);
	// scene.add(sky);



	//model
	rabbitTexture = THREE.ImageUtils.loadTexture('img/rabbit.png');
	timeTexture = THREE.ImageUtils.loadTexture('img/clock.png');
	tvTexture = THREE.ImageUtils.loadTexture('img/tv.png');



	//WEB_CAM
	//-----------------------------------------------------------------
	//-----------------------------------------------------------------
	//-----------------------------------------------------------------
	//-----------------------------------------------------------------
	video = document.getElementById('monitor');
	videoImage = document.getElementById('videoImage');

	videoImageContext = videoImage.getContext('2d');
	videoImageContext.fillStyle = '0xffff00';
	videoImageContext.fillRect(0,0,videoImage.width, videoImage.height);

	videoTexture = new THREE.Texture( videoImage );
	videoTexture.minFilter = THREE.LinearFilter;
	videoTexture.magFilter = THREE.LinearFilter;
	videoTexture.format = THREE.RGBFormat;
	videoTexture.generateMipmaps = false;

	var tvGeo = new THREE.PlaneGeometry(5, 5, 1, 1);
	var tvMat = new THREE.MeshLambertMaterial({map: videoTexture, overdraw: true, side: THREE.DoubleSide});
	tvWidth = 20;
	loadModelScreen("models/screen.js", tvMat);

	//TV_MODEL
	// for(var i=0; i<20; i++){
	// 	tvsets[i] = new THREE.Mesh(tvGeo, tvMat);
	// 	tvsets[i].position.set(Math.random()*50,Math.random()*10,Math.random()*10);
	// 	scene.add(tvsets[i]);
	// }

	/*
	var k=0;
	for(var j=0; j<20; j++) {
		for(var i=0; i<20; i++){
		
			tvsets[k] = new THREE.Mesh(tvGeo, tvMat);

			tvsets[k].position.x = Math.sin((360/20*i)*(Math.PI/180))*20;
			tvsets[k].position.z = Math.sin((Math.PI/2 + (360/20*i)*(Math.PI/180)))*20;
			tvsets[k].position.y = j*10;
			tvsets[k].rotation.y = ((360/20*i)*(Math.PI/180));

			// scene.add(tvsets[k]);
			k++;

		}
	}
	*/
	//-----------------------------------------------------------------
	//-----------------------------------------------------------------
	//-----------------------------------------------------------------
	//-----------------------------------------------------------------


	//RABBIT
	// rabbitWidth = 20;
	// rabbitHeight = 10;
	// rabbitTexture = THREE.ImageUtils.loadTexture('img/rabbit.png');
	// rabbitTexture.needsUpdate = true;
	var modelMaterial = new THREE.MeshLambertMaterial( {map: rabbitTexture} );
	// loadModelR("rabbit.js", modelMaterial);

	//TV
	modelMaterial = new THREE.MeshLambertMaterial( {map: tvTexture} );
	loadModelTV("models/tv.js", modelMaterial);

	//CLOCK
	// timeNumber = 1;
	timeTexture = THREE.ImageUtils.loadTexture('img/clock.png');
	// timeTexture.needsUpdate = true;
	modelMaterial = new THREE.MeshLambertMaterial( {map: timeTexture} );
	// loadModelT("clock.js", modelMaterial);

	//MAZE
	maze = new THREE.Geometry();

	//CHOCO_WALLS
	modelMaterial = new THREE.MeshLambertMaterial({color: 0x502911});
	// loadModelC("choco.js","choco90.js","choco180.js","choco270.js", modelMaterial);

	//COFFEE
	cupTexture = THREE.ImageUtils.loadTexture('img/coffee.png');
	modelMaterial = new THREE.MeshLambertMaterial( {map: cupTexture} );
	// loadModelCup("models/coffee_cup.js", modelMaterial);

	// plateTexture = THREE.ImageUtils.loadTexture('img/plate.png');
	// modelMaterial = new THREE.MeshLambertMaterial( {map: plateTexture} );
	// loadModelPlate("models/coffee_plate.js", modelMaterial);

	spoonTexture = THREE.ImageUtils.loadTexture('img/spoon.png');
	modelMaterial = new THREE.MeshLambertMaterial( {map: spoonTexture} );
	// loadModelSpoon("models/coffee_spoon.js", modelMaterial);

	modelMaterial = new THREE.MeshLambertMaterial( {color: 0xffffff} );
	// loadModelSugar("models/coffee_sugarA.js","models/coffee_sugarB.js","models/coffee_sugarC.js", modelMaterial);

	//COOKIE
	cookieTexture = THREE.ImageUtils.loadTexture('img/cookie.png');
	modelMaterial = new THREE.MeshLambertMaterial( {map: cookieTexture} );
	// loadmodelCookie("models/cookie.js","models/cookieArmA.js","models/cookieArmB.js","models/cookieLegA.js","models/cookieLegB.js",modelMaterial);

	/*
	//BUBBLES
	for(var j=0; j<tvWidth; j++) {
		for(var i=0; i<tvWidth; i++){
			var bubbleGeo = new THREE.PlaneGeometry(0.3,0.3,1,1);
			var bubbleTextureA = THREE.ImageUtils.loadTexture('img/bubbleA.png');
			var bubbleTextureB = THREE.ImageUtils.loadTexture('img/bubbleB.png');
			var bubbleTextureC = THREE.ImageUtils.loadTexture('img/bubbleC.png');

			var modelMaterialA = new THREE.MeshBasicMaterial({map: bubbleTextureA, transparent: true, opacity: 1, side: THREE.DoubleSide});
			var modelMaterialB = new THREE.MeshBasicMaterial({map: bubbleTextureB, transparent: true, opacity: 1, side: THREE.DoubleSide});
			var modelMaterialC = new THREE.MeshBasicMaterial({map: bubbleTextureC, transparent: true, opacity: 1, side: THREE.DoubleSide});

			var bubA = new THREE.Mesh(bubbleGeo, modelMaterialA);
			var bubB = new THREE.Mesh(bubbleGeo, modelMaterialB);
			var bubC = new THREE.Mesh(bubbleGeo, modelMaterialC);

			bubA.position.x = 5*i;
			bubA.position.z = -8*j;
			bubA.position.y = Math.random()*100;
			bubA.rotation.y = Math.random();
			scene.add(bubA);
			bubbles.push(bubA);
			bubA.position.z = 10+8*j;
			scene.add(bubA);
			bubbles.push(bubA);

			bubB.position.x = 5*i;
			bubB.position.z = -8*j;
			bubB.position.y = Math.random()*100;
			bubB.rotation.y = Math.random();
			scene.add(bubB);
			bubbles.push(bubB);

			bubC.position.x = 5*i;
			bubC.position.z = -8*j;
			bubC.position.y = Math.random()*100;
			bubC.rotation.y = Math.random();
			scene.add(bubC);
			bubbles.push(bubC);

			

		}
	}
	*/


	//LOLLIPOP
	for(var i=0; i<20; i++){
		var lollipopGeo = new THREE.PlaneGeometry(3,3,1,1);
		var lollipopTexture = THREE.ImageUtils.loadTexture('img/lollipopA.png');
		modelMaterial = new THREE.MeshLambertMaterial({map: lollipopTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
		lollipop = new THREE.Mesh(lollipopGeo, modelMaterial);
		lollipop.position.x = Math.random()*80-40;
		lollipop.position.z = Math.random()*20+30;
		lollipop.position.y = -2;
		lollipop.rotation.y = Math.random();

		// scene.add(lollipop);

		lollipopTexture = THREE.ImageUtils.loadTexture('img/lollipopB.png');
		modelMaterial = new THREE.MeshLambertMaterial({map: lollipopTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
		lollipop = new THREE.Mesh(lollipopGeo, modelMaterial);
		lollipop.position.x = Math.random()*80-40;
		lollipop.position.z = Math.random()*20+30;
		lollipop.position.y = -2;
		lollipop.rotation.y = Math.random();

		// scene.add(lollipop);
	}

	//Cloud
	for(var i=0; i<30; i++){
		var cloudGeo = new THREE.PlaneGeometry(4,4,1,1);
		var cloudTexture = THREE.ImageUtils.loadTexture('img/cloudA.png');
		modelMaterial = new THREE.MeshBasicMaterial({map: cloudTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
		clouds[i] = new THREE.Mesh(cloudGeo, modelMaterial);
		clouds[i].position.x = Math.random()*100-40;
		clouds[i].position.z = Math.random()*100-40;
		clouds[i].position.y = Math.random()*15+11;
		clouds[i].rotation.x = Math.PI/2;
		clouds[i].rotation.y = -Math.PI;

		// scene.add(clouds[i]);

		cloudTexture = THREE.ImageUtils.loadTexture('img/cloudB.png');
		modelMaterial = new THREE.MeshBasicMaterial({map: cloudTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
		clouds[i+30] = new THREE.Mesh(cloudGeo, modelMaterial);
		clouds[i+30].position.x = Math.random()*100-40;
		clouds[i+30].position.z = Math.random()*100-40;
		clouds[i+30].position.y = Math.random()*15+11;
		clouds[i+30].rotation.x = Math.PI/2;
		clouds[i+30].rotation.y = -Math.PI;

		// scene.add(clouds[i+30]);
	}

	//THINK
	// var thinkTexture = new THREE.ImageUtils.loadTexture('img/run.png');
	// thinkTexture.needsUpdate = true;

	// think = new TextureAnimator(thinkTexture, 10, 1, 10, 45);

	// var thinkMat = new THREE.MeshBasicMaterial({map: thinkTexture, side: THREE.DoubleSide});
	// thinkMat.needsUpdate = true;
	// thinkMat.map.needsUpdate = true;


	// var thinkGeo = new THREE.PlaneGeometry(50,50,1,1);
	// thinker = new THREE.Mesh(thinkGeo, thinkMat);
	// thinker.position.set(25.5, 1, 22);
	// scene.add(thinker);


	//GROUND
	groundGeo = new THREE.PlaneGeometry(1000,1000,1,1);
	groundMat = new THREE.MeshLambertMaterial( {color: 0x502911} );
	ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI/2;
	ground.position.y = -2;
	ground.receiveShadow = true;
	scene.add(ground);
	// THREE.GeometryUtils.merge(maze, ground);

	//STAGES
	var stageGeo = new THREE.BoxGeometry(1000, 0.1, 3, 1, 1, 1);
	var stageMat = new THREE.MeshLambertMaterial( {color: 0x05b5f3} );
	for(var j=0; j<tvWidth; j++) {
		var stage = new THREE.Mesh(stageGeo, stageMat);
		stage.position.x = 495;
		stage.position.z = 0.3-3*(1+j);
		stage.position.y = 2+(4*j);
		stage.receiveShadow = true;
		stages.push(stage);
		scene.add(stage);

		stage = new THREE.Mesh(stageGeo, stageMat);
		stage.position.x = 495;
		stage.position.z = 9.5+3*(1+j);
		stage.position.y = 2+(4*j);
		stage.receiveShadow = true;
		stages.push(stage);
		scene.add(stage);
	}

	//TUBES
	// var tubeGeo = new THREE.CylinderGeometry(0.2, 0.2, 20, 8, 1);
	var tubeTexture = THREE.ImageUtils.loadTexture('img/tube.png');
	var tubeMat = new THREE.MeshLambertMaterial( {map: tubeTexture} );
	loadModelTube("models/tube.js", tubeMat);

	// for(var j=0; j<tvWidth; j++) {
	// 	for(var i=0; i<tvWidth; i++){
	// 		var tube = new THREE.Mesh(tubeGeo, tubeMat);
	// 		tube.position.x = 5*i;
	// 		tube.position.z = -3*j;
	// 		tube.position.y = 5+(4*j);
	// 		tubes.push(tube);
	// 		scene.add(tube);

	// 		tube = new THREE.Mesh(tubeGeo, tubeTexture);
	// 		tube.position.x = 5*i;
	// 		tube.position.z = 10+3*j;
	// 		tube.position.y = 5+(4*j);
	// 		tubes.push(tube);
	// 		scene.add(tube);
	// 	}
	// }


	//PointerLockControl
	pointerControls = new THREE.PointerLockControls(camera);

	scene.add( pointerControls.getObject() );


	// pointerControls.setPosX(17.4);
	// pointerControls.setPoxZ(43.5);

	rays[0] = new THREE.Raycaster();
	rays[1] = new THREE.Raycaster();
	rays[2] = new THREE.Raycaster();
	rays[3] = new THREE.Raycaster();

	rays[0].ray.direction.set(1,0,0);
	rays[1].ray.direction.set(-1,0,0);
	rays[2].ray.direction.set(0,0,1);
	rays[3].ray.direction.set(0,0,-1);


	//DUMMY
	dummyGeo = new THREE.BoxGeometry(0.55,3.5,0.55);
	dummyGeo.dynamic = true;
	dummyMat = new THREE.MeshBasicMaterial({color: 0x00ffff});
	dummy = new THREE.Mesh(dummyGeo, dummyMat);
	dummy.position.set(pointerControls.posX(), 0, pointerControls.posZ());
	scene.add(dummy);


	//TEXT
	textOther = document.createElement('div');
	document.body.appendChild(textOther);
	textOther.id = 'other';
	textOther.innerHTML = '';

	text = document.createElement('div');
	document.body.appendChild(text);
	text.id = 'stop';
	text.innerHTML = '';

}

var rabbitsMesh, rabbitsGeo, rabbitsGroup, rabbitTexture;

function loadModelR (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		// var box = [];
		// rabbitsMesh = new THREE.Mesh(geometry);
		// rabbitsGeo = new THREE.Geometry();

			// var k=0;
			// for(var j=0; j<rabbitHeight; j++) {
			// 	for(var i=0; i<rabbitWidth; i++){
				
					rabbit = new THREE.Mesh(geometry, material);

					rabbit.scale.set(2,2,2);
					rabbit.position.x = 13.2;
					rabbit.position.z = 2.2;
					// rabbit.position.y = j*50;
					// rabbit.rotation.y = ((360/rabbitWidth*i + 90)*(Math.PI/180));

					scene.add(rabbit);
			// 		k++;

			// 	}
			// }
			// rabbitsGroup = new THREE.Mesh(rabbitsGeo, material);
			// rabbitsGroup.matrixAutoUpdate = false;
			// rabbitsGroup.updateMatrix();
			// scene.add(rabbitsGroup);
			
	}, "js");

	// return group;
}

function loadModelTube (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){

		for(var j=0; j<tvWidth; j++) {
			for(var i=0; i<tvWidth; i++){
				var tube = new THREE.Mesh(geometry, material);
				tube.position.x = 5*i;
				tube.position.z = -3*j;
				tube.position.y = 1+(4*j);
				tubes.push(tube);
				scene.add(tube);

				tube = new THREE.Mesh(geometry, material);
				tube.position.x = 5*i;
				tube.position.z = 10+3*j;
				tube.position.y = 1+(4*j);
				tubesR.push(tube);
				scene.add(tube);
			}
		}

			
	}, "js");

	// return group;
}

function loadModelTV (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){

			// var k=0;
			for(var j=0; j<tvWidth; j++) {
				for(var i=0; i<tvWidth; i++){
				
					var tv = new THREE.Mesh(geometry, material);
					if(j==0)
						tv.castShadow = true;

					// tv.scale.set(2,2,2);
					tv.position.x = 5*i;
					tv.position.z = -3*j;
					tv.position.y = -2+(4*j);
					tv.rotation.y = -30*(Math.PI/180);

					tvs.push(tv);
					scene.add(tv);


					tv = new THREE.Mesh(geometry, material);
					if(j==0)
						tv.castShadow = true;

					// tv.scale.set(2,2,2);
					tv.position.x = 5*i;
					tv.position.z = 10+3*j;
					tv.position.y = -2+(4*j);
					tv.rotation.y = 210*(Math.PI/180);

					tvsR.push(tv);
					scene.add(tv);


					//OBJECT_ALIENTVS
					// var Atv = new Tv(geometry, material);

					// Atv.mesh.position.x = Math.random()*10;
					// Atv.mesh.position.z = Math.random()*10;
					// Atv.mesh.position.y = 0;

					// alienTvs.push(Atv);

				}
			}

			// rabbitsGroup = new THREE.Mesh(rabbitsGeo, material);
			// rabbitsGroup.matrixAutoUpdate = false;
			// rabbitsGroup.updateMatrix();
			// scene.add(rabbitsGroup);
			
	}, "js");

	// return group;
}

function loadModelScreen (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		// var box = [];
		// rabbitsMesh = new THREE.Mesh(geometry);
		// rabbitsGeo = new THREE.Geometry();

			// var k=0;
			for(var j=0; j<tvWidth; j++) {
				for(var i=0; i<tvWidth; i++){
				
					var scr = new THREE.Mesh(geometry, material);

					scr.position.x = 5*i;
					scr.position.z = -3*j;
					scr.position.y = -2+(4*j);
					scr.rotation.y = -30*(Math.PI/180);

					screens.push(scr);
					scene.add(scr);


					scr = new THREE.Mesh(geometry, material);

					scr.position.x = 5*i;
					scr.position.z = 10+3*j;
					scr.position.y = -2+(4*j);
					scr.rotation.y = 210*(Math.PI/180);

					screensR.push(scr);
					scene.add(scr);


					//OBJECT_ALIENTVS
					// var Ascr = new Tv(geometry, material);

					// Ascr.mesh.position.x = Math.random()*10;
					// Ascr.mesh.position.z = Math.random()*10;
					// Ascr.mesh.position.y = 0;

					// alienScrs.push(Ascr);

				}
			}
			// rabbitsGroup = new THREE.Mesh(rabbitsGeo, material);
			// rabbitsGroup.matrixAutoUpdate = false;
			// rabbitsGroup.updateMatrix();
			// scene.add(rabbitsGroup);
			
	}, "js");

	// return group;
}

function loadModelCup (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
				
		cup = new THREE.Mesh(geometry, material);

		cup.scale.set(2,2,2);
		cup.position.x = 13.2;
		cup.position.z = 2.2;
		cup.position.y = -3;
		cup.rotation.y = (Math.PI);

		scene.add(cup);
			
	}, "js");
}

function loadModelPlate (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
				
		plate = new THREE.Mesh(geometry, material);

		plate.scale.set(2,2,2);
		plate.position.x = 13.2;
		plate.position.z = 2.2;
		plate.position.y = -2;
		// plate.rotation.y = (Math.PI);

		scene.add(plate);
			
	}, "js");
}

function loadModelSpoon (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
				
		spoon = new THREE.Mesh(geometry, material);

		spoon.scale.set(2,2,2);
		spoon.position.x = 13.2;
		spoon.position.z = 2.2;
		spoon.position.y = -3;
		spoon.rotation.y = (Math.PI);

		scene.add(spoon);
			
	}, "js");
}

function loadModelSugar (model, model2, model3, meshMat) {

	
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		var materialA = new THREE.MeshLambertMaterial({color: 0xff0000});
		sugarA = new THREE.Mesh(geometry, materialA);

		sugarA.scale.set(2,2,2);
		sugarA.position.x = 13.2;
		sugarA.position.z = 2.2;
		sugarA.position.y = -3;
		sugarA.rotation.y = (Math.PI);

		scene.add(sugarA);
			
	}, "js");

	
	loader.load(model2, function(geometry){

		var materialB = new THREE.MeshLambertMaterial({color: 0x00ff00});
		sugarB = new THREE.Mesh(geometry, materialB);

		sugarB.scale.set(2,2,2);
		sugarB.position.x = 13.2;
		sugarB.position.z = 2.2;
		sugarB.position.y = -3;
		sugarB.rotation.y = (Math.PI);

		scene.add(sugarB);

	}, "js");

	
	loader.load(model3, function(geometry){

		var materialC = new THREE.MeshLambertMaterial({color: 0x0000ff});
		sugarC = new THREE.Mesh(geometry, materialC);

		sugarC.scale.set(2,2,2);
		sugarC.position.x = 13.2;
		sugarC.position.z = 2.2;
		sugarC.position.y = -3;
		sugarC.rotation.y = (Math.PI);

		scene.add(sugarC);
			
	}, "js");
}

function loadmodelCookie (model, model2, model3, model4, model5, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){

		cookie = new THREE.Mesh(geometry, material);
		cookie.castShadow = true;

		// cookie.scale.set(2,2,2);
		cookie.position.x = 23;
		cookie.position.z = 30;
		cookie.position.y = 1;
		cookie.rotation.y = -(Math.PI)/1.7;
		cookie.rotation.x = -0.2;

		scene.add(cookie);
			
	}, "js");

	loader.load(model2, function(geometry){

		cookieArmA = new THREE.Mesh(geometry, material);

		// cookieArmA.scale.set(2,2,2);
		cookieArmA.position.x = 23;
		cookieArmA.position.z = 30;
		cookieArmA.position.y = 1;
		cookieArmA.rotation.y = -(Math.PI)/1.7;
		scene.add(cookieArmA);

	}, "js");

	loader.load(model3, function(geometry){

		cookieArmB = new THREE.Mesh(geometry, material);

		// cookieArmB.scale.set(2,2,2);
		cookieArmB.position.x = 23;
		cookieArmB.position.z = 30;
		cookieArmB.position.y = 1;
		cookieArmB.rotation.y = -(Math.PI)/1.7;
		scene.add(cookieArmB);
			
	}, "js");

	loader.load(model4, function(geometry){

		cookieLegA = new THREE.Mesh(geometry, material);

		// cookieLegA.scale.set(2,2,2);
		cookieLegA.position.x = 23;
		cookieLegA.position.z = 30;
		cookieLegA.position.y = 1;
		cookieLegA.rotation.y = (Math.PI)/2;
		scene.add(cookieLegA);
			
	}, "js");

	loader.load(model5, function(geometry){

		cookieLegB = new THREE.Mesh(geometry, material);

		// cookieLegB.scale.set(2,2,2);
		cookieLegB.position.x = 23;
		cookieLegB.position.z = 30;
		cookieLegB.position.y = 1;
		cookieLegB.rotation.y = (Math.PI)/2;
		scene.add(cookieLegB);
			
	}, "js");
}

var timesMesh, timesGeo, timesGroup, timeTexture;

function loadModelT (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		// var box = [];
		timesMesh = new THREE.Mesh(geometry);
		timesGeo = new THREE.Geometry();

		timeClocks[0] = new THREE.Mesh(geometry, material);
		// timeClock.scale.set(20,20,20);
		timeClocks[0].position.set(25.5, 1, 22);
		scene.add(timeClocks[0]);

		timeClocks[1] = new THREE.Mesh(geometry, material);
		// timeClock.scale.set(20,20,20);
		timeClocks[1].position.set(-19, 1, 15);
		scene.add(timeClocks[1]);

		timeClocks[2] = new THREE.Mesh(geometry, material);
		// timeClock.scale.set(20,20,20);
		timeClocks[2].position.set(12, 1, -16);
		scene.add(timeClocks[2]);

	}, "js");

}

var chocoMesh;

function transX(geo, n){
	for(var i=0; i<geo.vertices.length; i++){
		geo.vertices[i].x += n;
	}
}

function transZ(geo, n){
	for(var i=0; i<geo.vertices.length; i++){
		geo.vertices[i].z += n;
	}
}

function transY(geo, n){
	for(var i=0; i<geo.vertices.length; i++){
		geo.vertices[i].y += n;
	}
}

function rotateY(geo, r){
	for(var i=0; i<geo.vertices.length; i++){
		geo.vertices[i].y = -Math.PI/2;
	}
}


function loadModelC (model, model2, model3, model4, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	//GROUND
	groundGeo = new THREE.BoxGeometry(100,2,100);
	groundMat = new THREE.MeshLambertMaterial( {color: 0x502911} );
	// ground = new THREE.Mesh(groundGeo, groundMat);

	// groundGeo.rotation.x = -Math.PI/2;
	transY(groundGeo, -4);
	// scene.add(ground);


	loader.load(model, function(geometry){

		// var rightMesh = new THREE.Mesh(geometry);

		// rightMesh.rotation.y = Math.PI/4;
		// rightMesh.updateMatrix();
		// rightMesh.geometry.dynamic = true;
		// rightMesh.geometry.verticesNeedUpdate = true;

		// var rightGeo = rightMesh.geometry;

		for(var i=0; i<8; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], i*8.05-30);
			transZ(chocos[i], -30);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//LEFT_ONE
		chocos[8] = geometry.clone();

		transX(chocos[8], -30);
		transZ(chocos[8], 2);
		transY(chocos[8], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[8]);

		//LEFT_ONE
		chocos[9] = geometry.clone();

		transX(chocos[9], 8.05-30);
		transZ(chocos[9], -22);
		transY(chocos[9], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[9]);

		//TOP_THREE
		for(var i=10; i<13; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], (i-6)*8.05-30);
			transZ(chocos[i], -22);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//MIDDLE_THREE
		for(var i=13; i<16; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], (i-9)*8.05-30);
			transZ(chocos[i], -6);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//BOTTOM_SEVEN
		for(var i=16; i<23; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], (i-15)*8.05-30);
			transZ(chocos[i], 18);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//TOP_DOWN_THREE
		for(var i=23; i<26; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], (i-18)*8.05-30);
			transZ(chocos[i], -14);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//BOTTOM_TOP_ONE
		chocos[26] = geometry.clone();

		transX(chocos[26], 8.05-30);
		transZ(chocos[26], 10);
		transY(chocos[26], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[26]);


		// for(var i=0; i<8; i++){
		
			// chocos[i] = geometry.clone();

			// transX(chocos[i], i*8.05-30);
			// transZ(chocos[i], -30);
			// transY(chocos[i], -3);

			// THREE.GeometryUtils.merge(groundGeo, rightGeo);
		// }

		// mazeMesh = new THREE.Mesh(groundGeo,groundMat);

		// scene.add(mazeMesh);
			
	}, "js");

	loader.load(model2, function(geometry){

		// var rightMesh = new THREE.Mesh(geometry);

		// rightMesh.rotation.y = Math.PI/4;
		// rightMesh.updateMatrix();
		// rightMesh.geometry.dynamic = true;
		// rightMesh.geometry.verticesNeedUpdate = true;

		// var rightGeo = rightMesh.geometry;

		for(var i=0; i<7; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], -34);
			transZ(chocos[i], i*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		for(var i=7; i<9; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], -34+8.05);
			transZ(chocos[i], (i-6)*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//LEFT_BOTTOM_ONE
		chocos[9] = geometry.clone();

		transX(chocos[9], -34+8.05);
		transZ(chocos[9], (i-4)*8.05-26.5);
		transY(chocos[9], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[9]);

		//MIDDLE_THREE
		for(var i=10; i<13; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], -34+8.05*4);
			transZ(chocos[i], (i-7)*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//LEFT_MIDDLE_ONE
		chocos[13] = geometry.clone();

		transX(chocos[13], -34+8.05);
		transZ(chocos[13], 2*8.05-26.5);
		transY(chocos[13], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[13]);

		//MIDDLE_TWO
		for(var i=14; i<16; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], -34+8.05*3);
			transZ(chocos[i], (i-14)*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

			
	}, "js");

	loader.load(model3, function(geometry){

		for(var i=0; i<8; i++){
			
			if(i != 6){
				chocos[i] = geometry.clone();

				transX(chocos[i], i*8.05-30);
				transZ(chocos[i], 26);
				transY(chocos[i], -3);

				THREE.GeometryUtils.merge(groundGeo, chocos[i]);
			}
		}

		//LEFT_MIDDLE
		chocos[8] = geometry.clone();

		transX(chocos[8], 8.05-30);
		transZ(chocos[8], 10-8*2);
		transY(chocos[8], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[8]);

		//MIDDLE_MIDDLE
		chocos[9] = geometry.clone();

		transX(chocos[9], 8.05*2-30);
		transZ(chocos[9], 10-8*3);
		transY(chocos[9], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[9]);

		//MIDDLE_LEFT_TW)
		for(var i=10; i<12; i++){
			
			chocos[i] = geometry.clone();

			transX(chocos[i], (i-5)*8.05-30);
			transZ(chocos[i], 10);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}
			
	}, "js");

	loader.load(model4, function(geometry){

		for(var i=0; i<7; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], 30);
			transZ(chocos[i], i*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//LEFT_TWO
		for(var i=7; i<9; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], -34+8.05*2);
			transZ(chocos[i], (i-4)*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//MIDDLE_TWO
		for(var i=9; i<11; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], -34+8.05*3);
			transZ(chocos[i], (i-6)*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//RIGHT_TWO
		for(var i=11; i<13; i++){
		
			chocos[i] = geometry.clone();

			transX(chocos[i], -34+8.05*7);
			transZ(chocos[i], (i-8)*8.05-26.5);
			transY(chocos[i], -3);

			THREE.GeometryUtils.merge(groundGeo, chocos[i]);
		}

		//TOP_ONE
		chocos[13] = geometry.clone();

		transX(chocos[13], -34+8.05*5);
		transZ(chocos[13], 1*8.05-26.5);
		transY(chocos[13], -3);

		THREE.GeometryUtils.merge(groundGeo, chocos[i]);

		// var mazeMat = new THREE.MeshLambertMaterial({color: 0x502911});
		mazeMesh = new THREE.Mesh(groundGeo,groundMat);

		scene.add(mazeMesh);
			
	}, "js");
}


//FROM_Stemkoski
//http://stemkoski.github.io/Three.js/Texture-Animation.html
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration) 
{	
	// note: texture passed by reference, will be updated by the update function.
		
	this.tilesHorizontal = tilesHoriz;
	this.tilesVertical = tilesVert;
	// how many images does this spritesheet contain?
	//  usually equals tilesHoriz * tilesVert, but not necessarily,
	//  if there at blank tiles at the bottom of the spritesheet. 
	this.numberOfTiles = numTiles;
	// texture.needsUpdate = true;
	texture.wrapS = texture.wrapT = THREE.RepeatWrapping; 
	texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );

	// how long should each image be displayed?
	this.tileDisplayDuration = tileDispDuration;

	// how long has the current image been displayed?
	this.currentDisplayTime = 0;

	// which image is currently being displayed?
	this.currentTile = 0;
		
	this.update = function( milliSec )
	{
		this.currentDisplayTime += milliSec;
		while (this.currentDisplayTime > this.tileDisplayDuration)
		{
			this.currentDisplayTime -= this.tileDisplayDuration;
			this.currentTile++;
			if (this.currentTile == this.numberOfTiles)
				this.currentTile = 0;
			var currentColumn = this.currentTile % this.tilesHorizontal;
			texture.offset.x = currentColumn / this.tilesHorizontal;
			var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
			texture.offset.y = currentRow / this.tilesVertical;
		}
		texture.needsUpdate = true;
	};
}


var source1, source2, gainNode1, gainNode2;

//music
function finishedLoading(bufferList){

	//filter
	var filter = context.createBiquadFilter();

	source1 = context.createBufferSource();
	source2 = context.createBufferSource();
	source3 = context.createBufferSource();
	source4 = context.createBufferSource();

	gainNode1 = context.createGain();
	gainNode2 = context.createGain();
	gainNode3 = context.createGain();
	gainNode4 = context.createGain(); 

	source1.buffer = bufferList[0];
	source2.buffer = bufferList[1];
	source3.buffer = bufferList[2];
	source4.buffer = bufferList[3];

	source1.loop = true;
	source2.loop = true;
	source3.loop = true;
	source4.loop = true;

	source1.connect(gainNode1);
	gainNode1.connect(filter);
	filter.connect(context.destination);
	// gainNode1.connect(context.destination);

	source2.connect(gainNode2);
	gainNode2.connect(context.destination);

	source3.connect(gainNode3);
	gainNode3.connect(context.destination);

	source4.connect(gainNode4);
	gainNode4.connect(context.destination);

	gainNode1.gain.value = 0.6;
	gainNode2.gain.value = 0;
	gainNode3.gain.value = 0.5;
	gainNode4.gain.value = 0.1;

	filter.type = 0;
	filter.frequency.value = 150;

	source1.start(0);
	source2.start(0);
	source3.start(0);
	source4.start(0);
}


function animate(){
	requestAnimationFrame(animate);
	update();
	render();

}

function render(){
	
	// TWEEN.update();

	if(video.readyState === video.HAVE_ENOUGH_DATA){
		videoImageContext.drawImage(video, 0, 0,videoImage.width, videoImage.height);

		if(videoTexture){
			videoTexture.flipY = true;
			videoTexture.needsUpdate = true;
			// tvset.dynamic = true;
		}
	}

	renderer.clear();
	renderer.render(scene, camera);
}



var collideF = false;
var collideB = false;
var collideR = false;
var collideL = false;



function update(){
	video.play();

	var time = clock.getElapsedTime(),
		delta = clock.getDelta();

	//TEXTURE
	// think.update(1000*delta);
	// think.needsUpdate = true;
	// thinker.material.needsUpdate = true;
	// thinker.material.map.needsUpdate = true;
	
	
	// controls.update();
	stats.update();
	// console.log(camera.rotation);

	
	spin = 0.05*tanWave.run();
	

	//POINTER_LOCKER
	// pointerControls.isOnObject(false);
	// for(var i=0; i<4; i++){
	// ray.ray.origin.copy(pointerControls.getObject().position);
	// ray.ray.origin.y -= 10;


	// var intersections = ray.intersectObjects(objects);

	// if(intersections.length>0){
	// 	var distance = intersections[0].distance;
	// 	if(distance>0 && distance<20){
	// 		pointerControls.isOnObject(true);
	// 	}
	// }

	
	pointerControls.update();

	//SHOW_LOC
	// if(pointerControls.toShow())
		// console.log(pointerControls.posX() + ", " + pointerControls.posZ());

	
	//DUMMY
	dummy.position.set(pointerControls.posX(), pointerControls.posY()+1.7, pointerControls.posZ());
	var originPoint = dummy.position.clone();

	//TVs
	for(var i=0; i<tvs.length; i++){
		if(i%7==3 || i%9==7){
			tvs[i].rotation.y = spin;
			screens[i].rotation.y = spin;

			tvsR[i].rotation.y = -spin;
			screensR[i].rotation.y = -spin;
		} else {
			tvs[i].rotation.y = -tvs[i].position.angleTo(originPoint);
			screens[i].rotation.y = -screens[i].position.angleTo(originPoint);

			tvsR[i].rotation.y = tvsR[i].position.angleTo(originPoint)+180*(Math.PI/180);
			screensR[i].rotation.y = screensR[i].position.angleTo(originPoint)+180*(Math.PI/180);
		}
	}

	//TUBES
	for(var i=0; i<tubes.length; i++){
		if(i%7==3 || i%9==7){
			tubes[i].rotation.y = spin;
			tubesR[i].rotation.y = -spin;
		} else {	
			tubes[i].rotation.y += 0.1;
			tubesR[i].rotation.y -= 0.1;
		}
	}

	//BUBBLES
	// for(var i=0; i<bubbles.length; i++){
	// 	bubbles[i].position.y -= 0.2;

	// 	if(bubbles[i].position.y < 1)
	// 		bubbles[i].position.y = 50;
	// }

	/*
	//MAZE_COLLIDE_DUMMY
	for(var vertexIndex = 0; vertexIndex < dummy.geometry.vertices.length; vertexIndex++){
		var localVertex = dummy.geometry.vertices[vertexIndex].clone();
		var globalVertex = localVertex.applyMatrix4(dummy.matrix);
		var directionVector = globalVertex.sub(dummy.position);

		var ray = new THREE.Raycaster(originPoint, directionVector.clone().normalize());

		if(mazeMesh){
			var collisionResults = ray.intersectObject(mazeMesh);
			
			if(collisionResults.length > 0 && collisionResults[0].distance < directionVector.length()){
				// console.log("Collide!" + " F:" + collideF + " B:" + collideB + " L:" + collideL + " R:" + collideR);

				if(pointerControls.dirF()){
					collideF = true;
					pointerControls.testCollideF(collideF);
				}
				if(pointerControls.dirB()){
					collideB = true;
					pointerControls.testCollideB(collideB);
				}
				if(pointerControls.dirL()){
					collideL = true;
					pointerControls.testCollideL(collideL);
				}
				if(pointerControls.dirR()){
					collideR = true;
					pointerControls.testCollideR(collideR);
				}
			} else {
				collideF = false;
				collideB = false;
				collideR = false;
				collideL = false;
				pointerControls.testCollideF(collideF);
				pointerControls.testCollideB(collideB);
				pointerControls.testCollideL(collideL);
				pointerControls.testCollideR(collideR);
			}
		}
	}

	
	//RABBITS
	var swinging = sinWave.run();

	var rotatingA = sinWaveSlowA.run();
	var rotatingB = sinWaveSlowB.run();

	var running = Math.abs(swinging);
	rabbit.position.y = running;

	// for(var i=0; i<rabbits.length; ++i){
		// rabbits[i].position.y += dropSpeed;

		// if(rabbits[i].position.y > 500)
		// 	rabbits[i].position.y = 0;
	// }

	//COOKIE
	if(cookieSwing) {
		cookie.position.y = running/5+1;
		cookieArmA.rotation.x = swinging/3;
		cookieArmB.rotation.z = swinging/3;
	} else {
		cookieArmA.rotation.x = swinging/7;
		cookieArmB.rotation.z = swinging/7;
	}

	//CLOUDS
	for(var i=0; i<clouds.length; i++){
		clouds[i].position.x += Math.random()*0.01 + 0.01;
		clouds[i].position.z += Math.random()*0.01 + 0.01;

		if(clouds[i].position.x > 70)
			clouds[i].position.x = -70;

		if(clouds[i].position.z > 70)
			clouds[i].position.z = -70;
	}

	//LIGHT
	if(decreaseLight == true)
		dirLightA.intensity -= 0.001;
	
	dirLightC.target.position.set(rotatingA*30,0,rotatingB*30);

	
	//CLOCK
	for(var i=0; i<timeClocks.length; i++){
		timeClocks[i].rotation.y = spin + Math.PI/3;
		timeClocks[i].rotation.z = spin;
	}

	if(rabbitPress9th == true){
		sugarA.rotation.y = spin + Math.PI/3;
		sugarA.rotation.z = spin;
		sugarB.rotation.y = spin + Math.PI/3;
		sugarB.rotation.z = spin;
		sugarC.rotation.y = spin + Math.PI/3;
		sugarC.rotation.z = spin;
	}
	

	
	//GAIN_TIME
	for(var i=0; i<timeClocks.length; i++){
		if(timeClocks[i].position.x-1 < pointerControls.posX()
			&& timeClocks[i].position.x+1 > pointerControls.posX()
			&& timeClocks[i].position.z-1 < pointerControls.posZ()
			&& timeClocks[i].position.z+1 > pointerControls.posZ()
			)
		{
			console.log(i + "hit, " + timeClocks.length);

			dirLightA.intensity = 1;

			// source6.start();
			// gainNode6.gain.value = 1;
			scene.remove(timeClocks[i]);
			timeClocks.splice(i,1);

			//sound
			// source6 = context.createBufferSource();
			// source6.buffer = bufferCarrot;
			// source6.loop = false;
			// source6.connect(context.destination);
			// source6.start(time);

			// document.getElementById('other').innerHTML = clues[carrotCount];
			// carrotCount++;

			// if(carrotCount == 7){
			// 	door.scale.set(1,1,1);
			// 	door.position.set(0, 0, -5);
			// }
		}

	}
	*/

	// if(rabbitsGroup != null){
	// 	rabbitsGroup.position.y += dropSpeed;

	// 	if(rabbitsGroup.position.y > 500)
	// 		rabbitsGroup.position.y = 0;
	// }

	// rabbits[0].position.y --;	

	// console.log(rabbits.length);



	//----------------------------------------------------
	//----------------------------------------------------
	//----------------------------------------------------
	//KEYBOARD_CONTROL
	//TALK_TO_COOKIE
	keyboard.update();
	if(keyboard.down("space")){
		console.log(pointerControls.posX() + ", " + pointerControls.posY() + ", " + pointerControls.posZ() + ", " + pointerControls.rotY());

		if(pointerControls.posX()>20.2 && pointerControls.posX()<22.8 &&
			pointerControls.posZ()>34.3 && pointerControls.posZ()<35.8){
			if(cookieSpacePress1st == false){
				cookieSwing = false;
				document.getElementById('other').innerHTML = "WHAT";

				// new TWEEN.Tween(cookie.position).to(
				// 	{x: 22.6, y: 1.3, z: 30.5}, 2000).easing( TWEEN.Easing.Elastic.Out).start();

				cookieSpacePress1st = true;
			} else if (cookieSpacePress2nd == false){
				document.getElementById('other').innerHTML = "People have got to learn:<br>if they don't have cookies in the cookie jar,<br>they can't eat cookies.";
				cookieSpacePress2nd = true;
			} else if (cookieSpacePress3rd == false){
				document.getElementById('other').innerHTML = "Get ready to be lost.<br>Oh wait<br>You already are.";
				cookieSpacePress3rd = true;
			} else if (cookieSpacePress4th == false){
				document.getElementById('other').innerHTML = "";
				document.getElementById('stop').innerHTML = "Would you tell me, please,<br> which way I ought to go from here?";
				cookieSpacePress4th = true;
			} else if (cookieSpacePress5th == false){
				document.getElementById('other').innerHTML = "That depends a good deal on where you want to get to.";
				document.getElementById('stop').innerHTML = "";
				cookieSpacePress5th = true;
			} else if (cookieSpacePress6th == false){
				document.getElementById('other').innerHTML = "";
				document.getElementById('stop').innerHTML = "I don't much care where-";
				cookieSpacePress6th = true;
			} else if (cookieSpacePress7th == false){
				document.getElementById('other').innerHTML = "Then it doesn't matter which way you go.";
				document.getElementById('stop').innerHTML = "";
				cookieSpacePress7th = true;
			} else if (cookieSpacePress8th == false){
				document.getElementById('other').innerHTML = "";
				// document.getElementById('stop').innerHTML = "";
				cookieSwing = true;
				cookieSpacePress8th = true;
			} else if (cookieSpacePress9th == false){
				cookieSpacePress9th = true;
			} else if (cookieSpacePress10th == false){
				cookieSpacePress10th = true;
			} else if (cookieSpacePress11th == false){
				cookieSwing = false;
				document.getElementById('other').innerHTML = "Just get in the Maze!";
				cookieSpacePress11th = true;
			} else if (cookieSpacePress12th == false){
				document.getElementById('other').innerHTML = "And enjoy the lost.";
				cookieSpacePress12th = true;
			} else if (cookieSpacePress13th == false){
				document.getElementById('other').innerHTML = "Oh right.<br>Get a clock if you feel it's too dark.";
				cookieSpacePress13th = true;
			} else if (cookieSpacePress14th == false){
				cookieSwing = true;
				document.getElementById('other').innerHTML = "";
				cookieSpacePress14th = true;
			}

			if(cookieSpacePress14th == true){
				cookieSwing = !cookieSwing;
				if(cookieSwing)
					document.getElementById('other').innerHTML = "";
				else
					document.getElementById('other').innerHTML = "I've nothing to say";
			} 
		}


		if(pointerControls.posX()>4.9 && pointerControls.posX()<7.1 &&
			pointerControls.posZ()>0.2 && pointerControls.posZ()<3.4){
			if(rabbitPress1st == false){
				cookieSwing = false;
				document.getElementById('other').innerHTML = "Hi";
				gainNode2.gain.value = 1;

				rabbitPress1st = true;
			} else if (rabbitPress2nd == false){
				document.getElementById('other').innerHTML = "Again";
				rabbitPress2nd = true;
			} else if (rabbitPress3rd == false){
				document.getElementById('other').innerHTML = "If you don't know where you are going,<br>any road will take you there.";

				rabbitPress3rd = true;
			} else if (rabbitPress4th == false){
				document.getElementById('other').innerHTML = "Are you enjoying being lost now?";
				gainNode2.gain.value = 0;

				// document.getElementById('stop').innerHTML = "Would you tell me, please,<br> which way I ought to go from here?";
				rabbitPress4th = true;
			} else if (rabbitPress5th == false){
				document.getElementById('other').innerHTML = "Do you need coffee? I'm drinking one now.";
				rabbitPress5th = true;
			} else if (rabbitPress6th == false){
				document.getElementById('other').innerHTML = "";
				document.getElementById('stop').innerHTML = "Sure.";
				rabbitPress6th = true;
			} else if (rabbitPress7th == false){
				document.getElementById('other').innerHTML = "Coffee...<br>We can sleep when we're dead.";
				document.getElementById('stop').innerHTML = "";
				rabbitPress7th = true;
			} else if (rabbitPress8th == false){
				document.getElementById('other').innerHTML = "Then, which sugar cube would you like?";
				// document.getElementById('stop').innerHTML = "";

				rabbitPress8th = true;
			} else if (rabbitPress9th == false){
				document.getElementById('other').innerHTML = "";

				//SUGARS_FLY
				new TWEEN.Tween(sugarA.position).to(
					{x: 11.58, y: 1.3, z: -2.98}, 2000).easing( TWEEN.Easing.Elastic.Out).start();
				new TWEEN.Tween(sugarC.position).to(
					{x: 9, y: 1.3, z: 1.86}, 2000).easing( TWEEN.Easing.Elastic.Out).start();
				new TWEEN.Tween(sugarB.position).to(
					{x: 10.61, y: 1.3, z: 7.12}, 2000).easing( TWEEN.Easing.Elastic.Out).start();

				rabbitPress9th = true;
			} else if (rabbitPress10th == false){
				document.getElementById('other').innerHTML = "Red, green, or blue?";
				rabbitPress10th = true;
			} 

			// else if (rabbitPress11th == false){
			// 	rabbitPress11th = true;
			// 	document.getElementById('other').innerHTML = "Red, green, or blue?";
			// 	document.getElementById('other').innerHTML = "Just get in the Maze!";
			// } else if (rabbitPress12th == false){
			// 	document.getElementById('other').innerHTML = "And enjoy the lost.";
			// 	rabbitPress12th = true;
			// } else if (rabbitPress13th == false){
			// 	document.getElementById('other').innerHTML = "Oh right.<br>Get a clock if you feel it's too dark.";
			// 	rabbitPress13th = true;
			// } else if (rabbitPress14th == false){
			// 	cookieSwing = true;
			// 	document.getElementById('other').innerHTML = "";
			// 	rabbitPress14th = true;
			// }

			// if(rabbitPress14th == true){
			// 	cookieSwing = !cookieSwing;
			// 	if(cookieSwing)
			// 		document.getElementById('other').innerHTML = "";
			// 	else
			// 		document.getElementById('other').innerHTML = "I've nothing to say";
			// } 
		}

	}
	


}

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

