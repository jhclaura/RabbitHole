//MY SHADER
THREE.MyShader = {

	uniforms: THREE.UniformsUtils.merge( [
	    THREE.UniformsLib[ "common" ],
	    THREE.UniformsLib[ "fog" ],
	    THREE.UniformsLib[ "lights" ],
	    THREE.UniformsLib[ "shadowmap" ],
	    {
	        "ambient"  : { type: "c", value: new THREE.Color( 0xffffff ) },
	        "emissive" : { type: "c", value: new THREE.Color( 0x000000 ) },
	        "wrapRGB"  : { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
	        "amplitude": { type: "f", value: 0 }
	    }
	]),

	vertexShader: [

	    "#define LAMBERT",

	    "varying vec3 vLightFront;",

	    "#ifdef DOUBLE_SIDED",

	        "varying vec3 vLightBack;",

	    "#endif",

	    "uniform float amplitude;",
	    "attribute float displacement;",
	    "varying vec3 vNormal;",

	    THREE.ShaderChunk[ "map_pars_vertex" ],
	    THREE.ShaderChunk[ "lightmap_pars_vertex" ],
	    THREE.ShaderChunk[ "envmap_pars_vertex" ],
	    THREE.ShaderChunk[ "lights_lambert_pars_vertex" ],
	    THREE.ShaderChunk[ "color_pars_vertex" ],
	    THREE.ShaderChunk[ "morphtarget_pars_vertex" ],
	    THREE.ShaderChunk[ "skinning_pars_vertex" ],
	    THREE.ShaderChunk[ "shadowmap_pars_vertex" ],

	    "void main() {",

	    	"vNormal = normal;",
	    	"vec3 newPosition = position + normal * vec3(displacement * amplitude);",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition,1.0);",

	        THREE.ShaderChunk[ "map_vertex" ],
	        THREE.ShaderChunk[ "lightmap_vertex" ],
	        THREE.ShaderChunk[ "color_vertex" ],

	        THREE.ShaderChunk[ "morphnormal_vertex" ],
	        THREE.ShaderChunk[ "skinbase_vertex" ],
	        THREE.ShaderChunk[ "skinnormal_vertex" ],
	        THREE.ShaderChunk[ "defaultnormal_vertex" ],

	        THREE.ShaderChunk[ "morphtarget_vertex" ],
	        THREE.ShaderChunk[ "skinning_vertex" ],
	        THREE.ShaderChunk[ "default_vertex" ],

	        THREE.ShaderChunk[ "worldpos_vertex" ],
	        THREE.ShaderChunk[ "envmap_vertex" ],
	        THREE.ShaderChunk[ "lights_lambert_vertex" ],
	        THREE.ShaderChunk[ "shadowmap_vertex" ],

	    "}"

	].join("\n"),

	fragmentShader: [

	    "uniform float opacity;",

	    "varying vec3 vLightFront;",

	    "#ifdef DOUBLE_SIDED",

	        "varying vec3 vLightBack;",

	    "#endif",

	    THREE.ShaderChunk[ "color_pars_fragment" ],
	    THREE.ShaderChunk[ "map_pars_fragment" ],
	    THREE.ShaderChunk[ "lightmap_pars_fragment" ],
	    THREE.ShaderChunk[ "envmap_pars_fragment" ],
	    THREE.ShaderChunk[ "fog_pars_fragment" ],
	    THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
	    THREE.ShaderChunk[ "specularmap_pars_fragment" ],



	    "void main() {",

	        "gl_FragColor = vec4( vec3 ( 1.0 ), opacity );",

	        THREE.ShaderChunk[ "map_fragment" ],
	        THREE.ShaderChunk[ "alphatest_fragment" ],
	        THREE.ShaderChunk[ "specularmap_fragment" ],

	        "#ifdef DOUBLE_SIDED",

	            //"float isFront = float( gl_FrontFacing );",
	            //"gl_FragColor.xyz *= isFront * vLightFront + ( 1.0 - isFront ) * vLightBack;",

	            "if ( gl_FrontFacing )",
	                "gl_FragColor.xyz *= vLightFront;",
	            "else",
	                "gl_FragColor.xyz *= vLightBack;",

	        "#else",

	            "gl_FragColor.xyz *= vLightFront;",

	        "#endif",

	        THREE.ShaderChunk[ "lightmap_fragment" ],
	        THREE.ShaderChunk[ "color_fragment" ],
	        THREE.ShaderChunk[ "envmap_fragment" ],
	        THREE.ShaderChunk[ "shadowmap_fragment" ],

	        THREE.ShaderChunk[ "linear_to_gamma_fragment" ],

	        THREE.ShaderChunk[ "fog_fragment" ],

	    "}"

	].join("\n")

}

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------

//PointerLockControls
var pointerControls, dateTime = Date.now();
var objects = [];
var ray;
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

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------

var container;
var width = window.innerWidth;
var height = window.innerHeight;
var renderer, scene, camera, controls, stats, light, lightB, lightC, pointLight;
var clock = new THREE.Clock();

var mouse = new THREE.Vector2();
var keyboard = new KeyboardState();
// var keyboard = new THREEx.KeyboardState();
var spacePress1st = false;
var spacePress2nd = false;
var spacePress3rd = false;
var spacePress4th = false;
var spacePress5th = false;
var spacePress6th = false;
var giggle = false;
var rabbitStop = false;
var text;
var textOther;

// var rabbitWidth, rabbitHeight;
var rabbits = [];
var rabbit;
var rabbitTexture;

// var timeNumber, times = [];
var groundGeo, ground;
var grassGeo, grassMeshes = [];

var screws = [];
var tubeGeo, tubes = [], tubeTexture;

// var dropSpeed = 2;

var speakBox, speakBoxGeo, speakBoxTexture, speakBoxMaterial;
var speakBoxes = [];
var clues = ["Yes.. feed me carrots and I get clues.",
			 "Carrot never fails me.",
			 "It's not the bottom of the hole, <br>and a lot of people are ahead of you.",
			 "Are you sure to proceed? We're all mad here.",
			 "I also love peanut butter & jelly. You too?",
			 "Begin at the beginning.",
			 "\"Fearless courage is the foundation of victory\".<br>I found it in fortune cookie today.<br>"
			 ];
var carrotCount = 0;

//Wave
var time = Math.PI/2;
var frequency = 0.01;
var amplitude = 3;
var offset = 0;
var tanWave = new TanWave(time, frequency, amplitude, offset);
var sinWave = new SinWave(time, frequency*5, amplitude/2, offset);
var sawWave = new SawWave(time, frequency*5, amplitude/2, offset);
var sawWaves = [];

var spin;


//Web Speech API
var msg = new SpeechSynthesisUtterance();


//Web Audio API
var context, source, analyser, buffer, audioBuffer;
var analyserView1;
var bufferLoader;
var source1, source2, source3, source4, source5, source6;
var gainNode1, gainNode2, gainNode3, gainNode4, gainNode5, gainNode6;

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


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------

init();
animate();

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------

function init(){

	//Web Audio API
	// bufferLoader = new BufferLoader(
	// 	context, ['../audios/AIW.mp3', 
	// 			  '../audios/wind_houling.wav', 
	// 			  '../audios/bodyFall.mp3',
	// 			  '../audios/walk_in_grass.wav',
	// 			  '../audios/giggle.wav', 
	// 			  '../audios/eatCarrot.mp3'], 
	// 			  finishedLoading
	// 	);
	// bufferLoader.load();
	bufferLoader = new BufferLoader(
		context, ['../audios/factory.mp3'], 
				  finishedLoading
		);
	bufferLoader.load();

	//Web Speech API
	// var voices = window.speechSynthesis.getVoices();
	// msg.voice = voices[10];
	// msg.text = "welcome welcome welcome to rabbit hole hole";
	// msg.rate = 0.1;


	//SET-UP
	container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();
	// scene.fog = new THREE.FogExp2( 0x9b7264, 0.5 );

	camera = new THREE.PerspectiveCamera(55, width/height, 0.1, 100000);
	// camera.rotation.order = 'YXZ';

	// scene.add(camera);
	// camera.position.set(0,50,100);
	// camera.position.set(0, 2, 0);
	// camera.lookAt(scene.position);


	// camera.position.set(0,-1,0);
	// camera.position.set(0,3,7);
	// camera.rotation.set(-0.46,0,0);



	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	stats.domElement.children[ 0 ].style.background = "transparent";
	stats.domElement.children[ 0 ].children[1].style.display = "none";
	container.appendChild(stats.domElement);

	//DIRECTIONALLIGHT
	light = new THREE.DirectionalLight(0xffffff,1);
	light.position.set(0,2,2);
	light.target.position.set(0,0,0);
	scene.add(light);

	//2nd DIRECTIONALLIGHT
	lightB = new THREE.DirectionalLight(0x72dca6,0.5);
	lightB.position.set(0,-4,-5);
	lightB.target.position.set(0,0,0);
	scene.add(lightB);

	//3rd DIRECTIONALLIGHT
	lightC = new THREE.DirectionalLight(0xfbe282,0.3);
	lightC.position.set(0,-4,5);
	lightC.target.position.set(0,0,0);
	scene.add(lightC);

	//SPOTLIGHT
	pointLight = new THREE.SpotLight(0xffffff,3);
	pointLight.position.set(0,6,3);
	pointLight.target.position.set(0,0,0);
	scene.add(pointLight);


	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setClearColor(0x3f1b10, 1);

	renderer.setSize(width,height);
	container.appendChild(renderer.domElement);

	window.addEventListener( 'resize', onWindowResize, false );



	//CAMERA CONTORLS
	// controls = new THREE.OrbitControls(camera, renderer.domElement);

	//PointerLockControl
	pointerControls = new THREE.PointerLockControls(camera);
	scene.add( pointerControls.getObject() );

	ray = new THREE.Raycaster();
	ray.ray.direction.set(0,-1,0);

	//model
	//RABBIT
	// rabbitWidth = 20;
	// rabbitHeight = 10;

	// rabbitTexture = THREE.ImageUtils.loadTexture('rabbit.png');
	// var modelMaterial = new THREE.MeshLambertMaterial( {map: rabbitTexture} );
	// loadModelR("rabbit.js", modelMaterial);

	//DOOR
	// var doorTexture = THREE.ImageUtils.loadTexture('door.png');
	// var doorMat = new THREE.MeshLambertMaterial( {map: doorTexture} );
	// loadModelD("door.js", doorMat);

	//SCREW
	for(var i=0; i<100; i++){
		sawWaves[i] = new SawWave(Math.random()*3, frequency*5, Math.random()*3/2, offset);
	}
	var screwTexture = THREE.ImageUtils.loadTexture('img/screw.png');
	var screwMat = new THREE.MeshLambertMaterial({map: screwTexture});
	loadModelS("screw.js", screwMat);

	//GROUND
	groundGeo = new THREE.PlaneGeometry(0.5,320,5,5);
	var groundMatt = new THREE.MeshLambertMaterial( {color: 0xfa3738} );
	ground = new THREE.Mesh(groundGeo, groundMatt);
	ground.rotation.x = -Math.PI/2;
	ground.position.y -= 1;
	scene.add(ground);

	//TUBE
	tubeGeo = new THREE.CubeGeometry(500,0.3,0.6);
	var tubeMap = new THREE.ImageUtils.loadTexture('img/rosty4.jpg');
	tubeMap.wrapS = tubeMap.wrapT = THREE.RepeatWrapping;
	tubeMap.repeat.set(2500,1);

	var tubeMat = new THREE.MeshLambertMaterial({map: tubeMap});
	
	for(var i=0; i<20; i++){
		tubes[i] = new THREE.Mesh(tubeGeo, tubeMat);
		tubes[i].rotation.y = -Math.PI/2/(Math.random()*5);
		// tubes[0].rotation.z = -Math.PI/2/(Math.random()*5);
		tubes[i].position.z = -5;
		tubes[i].position.z = Math.random()*100-50;
		tubes[i].position.y = Math.random()*100-50;
		
		scene.add(tubes[i]);
	}

	//MAMMERS
	// for(var i=0; i<tubes.length; i++) {
		tubes[0].updateMatrixWorld();
		
		console.log(tubes[0].geometry.vertices.length);

		var vector = tubes[0].geometry.vertices[0].clone();
		vector.applyMatrix4(tubes[0].matrixWorld);

		var c = new THREE.CubeGeometry(2,2,2);
		var cM = new THREE.MeshLambertMaterial({color: 0xff0000});
		var cMesh = new THREE.Mesh(c, cM);
		cMesh.position.set(vector.x, vector.y, vector.z);
		
		// var lM = new THREE.LineBasicMaterial({color:0xff0000});
		// var l = new THREE.Geometry();
		// l.vertices.push(new THREE.Vector3(vector.x, vector.y, vector.z));
		// lMesh[i] = new THREE.Line(l,lM);

		scene.add(cMesh[0]);
	// }


	//Grass
	// grassGeo = new THREE.PlaneGeometry( 2,2,1,1 );
	// grassGeo.dynamic = true;
	// grassGeo.vertices[3].z = 1;
	// var grassMap = THREE.ImageUtils.loadTexture('img/billboardgrassDark.png');
	// var grassMat = new THREE.MeshLambertMaterial({
	// 					map: grassMap, 
	// 					transparent: true, 
	// 					opacity: 0.5, 
	// 					side: THREE.DoubleSide
	// 				});

	// var k=0;
	// for(var i=0; i<33; i++){
	// 	for(var j=0; j<33; j++){
	// 		grassMeshes[k] = new THREE.Mesh(grassGeo, grassMat);
	// 		grassMeshes[k].position.x = i-32/2;
	// 		grassMeshes[k].position.z = j-32/2;
	// 		grassMeshes[k].rotation.y = Math.random()*Math.PI;
	// 		scene.add(grassMeshes[k]);

	// 		k++;
	// 	}
	// }



	//CARROT ON TOP
	// speakBoxGeo = new THREE.PlaneGeometry(1,1,1,1);
	// speakBoxTexture = THREE.ImageUtils.loadTexture('img/carrot.png');
	// speakBoxMaterial = new THREE.MeshLambertMaterial({
	// 						map: speakBoxTexture, 
	// 						transparent: true, 
	// 						opacity: 1, 
	// 						side: THREE.DoubleSide
	// 					});
	// speakBox = new THREE.Mesh(speakBoxGeo, speakBoxMaterial);
	// speakBox.scale.set(0.01);
	// speakBox.position.y = 3.5;
	// scene.add(speakBox);

	//CARROTS IN GRASS
	// for(var i=0; i<7; i++){
	// 	speakBoxes[i] = new THREE.Mesh(speakBoxGeo, speakBoxMaterial);
	// 	speakBoxes[i].scale.set(0.01);
	// 	speakBoxes[i].position.x = Math.random()*20+5 -32/2;
	// 	speakBoxes[i].position.z = Math.random()*20+5 -32/2;
	// 	speakBoxes[i].position.y = 1.5;
	// 	scene.add(speakBoxes[i]);
	// }


	//TEXT
	textOther = document.createElement('div');
	document.body.appendChild(textOther);
	textOther.id = 'other';
	textOther.innerHTML = '';


	//TEXT
	text = document.createElement('div');
	document.body.appendChild(text);
	text.id = 'stop';
	text.innerHTML = '';

	//PARTICLE_SYSTEM
	// var cubeGeo = new THREE.CubeGeometry(50,50,50,20,20,20);
	// var particleScrew = new THREE.ParticleSystem(screwGeo, screwMat);
	// scene.add(particleScrew);

	
}


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------



var rabbitsMesh, rabbitsGeo, rabbitsGroup;
var attributes, uniforms;

function loadModelR (model, meshMat) {

	//SHADER SETUP FOR RABBIT
	attributes = {
		displacement: {
			type: 'f',
			value: []
		}
	};

	uniforms = {
		amplitude: {
			type: 'f',
			value: 0
		},
		map: {
			type: 't',
			value: THREE.ImageUtils.loadTexture('rabbit.png')
		}
	};


	// var rabbitShader = THREE.ShaderLib['lambert'];
	// uniforms = THREE.UniformsUtils.clone( rabbitShader.uniforms );
	// uniforms.add(amplitude);


	// uniforms.map.value = rabbitTexture;
	

	// console.log(uniforms.map.value);

	var rabbitMaterial = new THREE.ShaderMaterial({
		uniforms: uniforms,
		attributes: attributes,
		vertexShader: document.getElementById( 'vertexShader' ).textContent,
		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
		light: true
	});

	rabbitMaterial.map = true;
	uniforms.map.needsUpdate = true;


	///////AHHHHHH
	var defines = {};
	defines["USE_MAP"] = "";

	var shaderUniforms = THREE.UniformsUtils.clone(THREE.MyShader.uniforms);
	shaderUniforms["map"].value = rabbitTexture;
	var rabbitMaterial2 = new THREE.ShaderMaterial({
		defines: defines,
		uniforms: shaderUniforms,
		attributes: attributes,
		vertexShader: THREE.MyShader.vertexShader,
		fragmentShader: THREE.MyShader.fragmentShader,
		lights:true
	});

	rabbitMaterial2.map = true;
	uniforms.map.needsUpdate = true;


	// var group = new THREE.Object3D();

	// var material = meshMat || new THREE.MeshBasicMaterial({
	// 	color: '0x' + Math.floor(Math.random()*16777215).toString(16),
	// 	wireframe: true
	// });
	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		// var box = [];
		rabbitsMesh = new THREE.Mesh(geometry);
		rabbitsGeo = new THREE.Geometry();

			var k=0;
			// for(var j=0; j<rabbitHeight; j++) {
			// 	for(var i=0; i<rabbitWidth; i++){
				
			// 		rabbits[k] = new THREE.Mesh(geometry, material);

			// 		rabbits[k].scale.set(20,20,20);
			// 		rabbits[k].position.x = Math.sin((360/rabbitWidth*i)*(Math.PI/180))*150;
			// 		rabbits[k].position.z = Math.sin((Math.PI/2 + (360/rabbitWidth*i)*(Math.PI/180)))*150;
			// 		rabbits[k].position.y = j*50;
			// 		rabbits[k].rotation.y = ((360/rabbitWidth*i + 90)*(Math.PI/180));

			// 		THREE.GeometryUtils.merge(rabbitsGeo, rabbits[k]);
			// 		scene.add(rabbits[k]);
			// 		k++;

			// 	}
			// }

			rabbit = new THREE.Mesh(geometry, rabbitMaterial2);

			//shader
			var vertices = rabbit.geometry.vertices;
			var values = attributes.displacement.value;
			for(var v=0; v<vertices.length; v++){
				values.push(Math.random()*30);
			}

			// rabbits[k].scale.set(20,20,20);
			// rabbits[k].position.x = Math.sin((360/rabbitWidth*i)*(Math.PI/180))*150;
			// rabbits[k].position.z = Math.sin((Math.PI/2 + (360/rabbitWidth*i)*(Math.PI/180)))*150;
			rabbit.position.y = 1;
			rabbit.rotation.x = -Math.PI/18*2;
			rabbit.rotation.y = -Math.PI/2;

			scene.add(rabbit);

			
			
	}, "js");

	// return group;
}

var screwMesh, screwGeo, screwTexture, screw;
var screwHeight=10, screwWidth=10;
var screwRandom = [];

function loadModelS (model, meshMat) {

	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		// var box = [];
		screwMesh = new THREE.Mesh(geometry);
		screwGeo = new THREE.Geometry();

		var num=0;
		// for(var j=0; j<screwHeight; j++) {
			for(var i=0; i<100; i++){
				// for(var k=0; i<screwWidth; k++){
			
					screws[num] = new THREE.Mesh(geometry, material);

					screwRandom[num] = Math.random();
					var size = screwRandom[num] + 0.5;

					screws[num].scale.set(size,size,size);

					screws[num].position.x = Math.random()*100-50;
					screws[num].position.z = Math.random()*100-50;
					screws[num].position.y = Math.random()*200-100;

					screws[num].rotation.x = Math.PI + Math.random()/2;
					screws[num].rotation.z = Math.random()/2;

					scene.add(screws[num]);
					num++;
				// }
			}
		// }


		//AT_POINT
		for(var i=0; i<screws.length; i++) {
			screws[i].updateMatrixWorld();
			
			// console.log(screws[i].geometry.vertices.length);

			var vector = screws[i].geometry.vertices[33].clone();
			vector.applyMatrix4(screws[i].matrixWorld);

			var c = new THREE.CubeGeometry(0.01,100,0.01);
			var cM = new THREE.MeshBasicMaterial({color: 0xff0000});
			cMesh[i] = new THREE.Mesh(c, cM);
			cMesh[i].position.set(vector.x, vector.y, vector.z);
			
			var lM = new THREE.LineBasicMaterial({color:0xff0000});
			var l = new THREE.Geometry();
			l.vertices.push(new THREE.Vector3(vector.x, vector.y, vector.z));
			lMesh[i] = new THREE.Line(l,lM);

			scene.add(cMesh[i]);
		}

			
	}, "js");

}

var cMesh = [];
var lMesh = [];

/*
var doorMesh, doorGeo, doorTexture, door;

function loadModelD (model, meshMat) {

	// var group = new THREE.Object3D();

	// var material = meshMat || new THREE.MeshBasicMaterial({
	// 	color: '0x' + Math.floor(Math.random()*16777215).toString(16),
	// 	wireframe: true
	// });
	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		// var box = [];
		doorMesh = new THREE.Mesh(geometry);
		doorGeo = new THREE.Geometry();

		door = new THREE.Mesh(geometry, material);
		door.scale.set(0.01,0.01,0.01);
		door.rotation.x = -Math.PI/20;
		// door.rotation.y = -Math.PI/2;
		scene.add(door);

	}, "js");

}

var timesMesh, timesGeo, timesGroup;

function loadModelT (model, meshMat) {

	// var group = new THREE.Object3D();

	// var material = meshMat || new THREE.MeshBasicMaterial({
	// 	color: '0x' + Math.floor(Math.random()*16777215).toString(16),
	// 	wireframe: true
	// });
	var material = meshMat;
	var loader = new THREE.JSONLoader();

	loader.load(model, function(geometry){
		// var box = [];
		timesMesh = new THREE.Mesh(geometry);
		timesGeo = new THREE.Geometry();

		times[0] = new THREE.Mesh(geometry, material);
		times[0].scale.set(20,20,20);
		times[0].position.set(0,180,0);
		scene.add(times[0]);

	}, "js");

}
*/


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------

var bufferCarrot;
//music
function finishedLoading(bufferList){
	source1 = context.createBufferSource();
	// source2 = context.createBufferSource();
	// source3 = context.createBufferSource();
	// source4 = context.createBufferSource();
	// source5 = context.createBufferSource();
	// source6 = context.createBufferSource();

	gainNode1 = context.createGain();
	// gainNode2 = context.createGain();
	// gainNode4 = context.createGain();
	// gainNode5 = context.createGain();
	// gainNode6 = context.createGain(); 

	source1.buffer = bufferList[0];
	// source2.buffer = bufferList[1];
	// source3.buffer = bufferList[2];
	// source4.buffer = bufferList[3];
	// source5.buffer = bufferList[4];
	// source6.buffer = bufferList[5];
	// bufferCarrot = bufferList[5];

	source1.loop = true;
	// source2.loop = true;
	// source3.loop = false;
	// source4.loop = true;
	// source5.loop = true;
	// source6.loop = false;

	source1.connect(gainNode1);
	gainNode1.connect(context.destination);

	// source2.connect(gainNode2);
	// gainNode2.connect(context.destination);

	// source3.connect(context.destination);

	// source4.connect(gainNode4);
	// gainNode4.connect(context.destination);

	// source5.connect(gainNode5);
	// gainNode5.connect(context.destination);

	// source6.connect(gainNode6);
	// gainNode6.connect(context.destination);

	gainNode1.gain.value = 1;
	// gainNode2.gain.value = 0;
	// gainNode5.gain.value = 0;
	// gainNode6.gain.value = 0;

	source1.start(0);
	// source2.start(0);
	// source3.start(0);
	// source4.start(0);
	
	
}

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------


function animate(){
	requestAnimationFrame(animate);
	update();
	render();
}

function render(){
	renderer.render(scene, camera);
}

function update(){

	// controls.update();
	stats.update();


	pointerControls.isOnObject(false);
	ray.ray.origin.copy(pointerControls.getObject().position);
	ray.ray.origin.y -= 10;

	var intersections = ray.intersectObjects(objects);

	if(intersections.length>0){
		var distance = intersections[0].distance;
		if(distance>0 && distance<10){
			pointerControls.isOnObject(true);
		}
	}

	pointerControls.update();


	
	var time = clock.getElapsedTime(),
		delta = clock.getDelta();
	var moveDistance = 0.05;

	// console.log(camera.position);
	// console.log(camera.rotation);

	//RABBITS
	// for(var i=0; i<rabbits.length; ++i){
		// rabbits[i].position.y += dropSpeed;

		// if(rabbits[i].position.y > 500)
		// 	rabbits[i].position.y = 0;

		var running = (sinWave.run());
		var sawRunning = sawWave.run();
		var sawsRunning = [];
		for(var i=0; i<100; i++){
			sawsRunning[i] = sawWaves[i].run();
		}

		spin = 0.05*tanWave.run();

		for(var i=0; i<screws.length; i++){
			screws[i].rotation.y += moveDistance*(Math.random()+2);
			screws[i].position.y -= 0.1*sawsRunning[i];
			// screws[i].rotation.z = running;

			if(screws[i].position.y < -50)
				screws[i].position.y = 150;
		}

		//RABBIT_JUMP
		// rabbit.position.y = running;
		// speakBox.position.y = 3.5 + running/4;
		// gainNode4.gain.value = 1-running;


		//SHADER
		// uniforms.amplitude.value = Math.abs(Math.sin(time*5)/40);
		// rabbit.verticesNeedUpdate = true;


		//MOVE_OF_LIGHT
		// var lightSpeed = 1.2;
		// pointLight.position.z = pointerControls.posZ()+1.5*(-Math.sin(pointerControls.rotX()));
		// pointLight.target.position.z = pointerControls.posZ();
		// pointLight.position.x = pointerControls.posX()*(-Math.cos(pointerControls.rotX()));
		// pointLight.target.position.x = pointerControls.posX();


		//FOLLOW CAMERA
		keyboard.update();
		// if(keyboard.pressed('W') || keyboard.pressed('up')){
		// 	if(rabbitStop == false){
		// 		rabbit.position.z += (-moveDistance);
		// 		speakBox.position.z += (-moveDistance);
		// 	} else {
		// 		
		// 	}
		// }

		/*
		if(keyboard.pressed('S') || keyboard.pressed('down')){
			if(rabbitStop == false){
				rabbit.position.z += (moveDistance);
				speakBox.position.z += (moveDistance);
			} else {
				// camera.position.z += (moveDistance);
			}

			pointLight.position.z += (moveDistance)*lightSpeed;
			pointLight.target.position.z += (moveDistance)*lightSpeed;

		}

		
		if(keyboard.pressed('A') || keyboard.pressed('left')){
			if(rabbitStop == false){
				rabbit.position.x += (-moveDistance);
				speakBox.position.x += (-moveDistance);
			} else {
				// camera.position.x += (-moveDistance);
			}
			// pointLight.position.x += (-moveDistance)*lightSpeed;
			// pointLight.target.position.x += (-moveDistance)*lightSpeed;

		}
		if(keyboard.pressed('D') || keyboard.pressed('right')){
			if(rabbitStop == false){
				rabbit.position.x += (moveDistance);
				speakBox.position.x += (moveDistance);
			} else {
				// camera.position.x += (moveDistance);
			}

			// pointLight.position.x += (moveDistance)*lightSpeed;
			// pointLight.target.position.x += (moveDistance)*lightSpeed;
		}
		*/

		// if(keyboard.pressed('A')){
		// 	if(rabbitStop == true){
		// 		// camera.rotation.y += moveDistance/2;
		//         camera.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(), moveDistance/2 );
		// 	}
		// }
		// if(keyboard.pressed('D')){
		// 	if(rabbitStop == true){
		// 		// camera.rotation.y -= moveDistance/2;
		//         camera.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(), -moveDistance/2 );
		// 	}
		// }

		/*
		if(keyboard.down('space')){
			// console.log(document.getElementById('stop'));
			// console.log(pointerControls.rotatable);
			// console.log(pointLight.position.z);
			// console.log(bufferCarrot);

			if(spacePress1st == false) {
				document.getElementById('stop').innerHTML = "Stop following me!";
				spacePress1st = true;
			} else if(spacePress2nd == false){
				document.getElementById('stop').innerHTML = "";
				document.getElementById('other').innerHTML = "Ha ha ha...";

				source5.start();
				gainNode5.gain.value = 1;
				spacePress2nd = true;
			} else if(spacePress3rd == false){
				document.getElementById('other').innerHTML = "";
				spacePress3rd = true;
			} else if(spacePress4th == false){
				//show main carrot
				speakBox.scale.set(1,1,1);
				spacePress4th = true;
			} else if (spacePress5th == false){
				for(var i=0; i<speakBoxes.length; i++){
					speakBoxes[i].scale.set(1,1,1);
				}
				spacePress5th = true;
				rabbitStop = true;
				pointerControls.rotatable();
				lightB.intensity = 1;
			}

			if (spacePress4th == true){
				//toggle giggle
				giggle = !giggle;
				if(giggle)
					document.getElementById('other').innerHTML = "Ha ha ha ha...";
				else
					document.getElementById('other').innerHTML = "";
			}
		}


		if(spacePress3rd == true || (giggle == false && spacePress4th == true)){
			if(gainNode5.gain.value>0)
					gainNode5.gain.value -= 0.02;
		}


		if(giggle){
			if(gainNode5.gain.value<1)
					gainNode5.gain.value += 0.1;
		}
		*/


		//CAMERA_OFFSET
		// var relativeCameratOffset = new THREE.Vector3(8, 2, 0);
		// var cameraOffset = relativeCameratOffset.applyMatrix4( rabbit.matrixWorld );

	// }


	//CLOCK
	// spin = 0.05*tanWave.run();
	// times[0].rotation.y = spin + Math.PI/3;
	// times[0].rotation.z = spin;


	/*
	//GRASS
	//manupulate vertices example from 
	//https://dl.dropboxusercontent.com/u/43243793/examples/webgl_geometry_grass.html
	for(var i=0; i<=grassGeo.vertices.length/2-1; i++){
		for(var j=0; j<2; j++){
			grassGeo.vertices[ 2*i + j ].z = ((2-i)/2)*Math.sin(time)/2;
		}
	}
	grassGeo.verticesNeedUpdate = true;


	//GET_CARROTS
	for(var i=0; i<speakBoxes.length; i++){
		if(speakBoxes[i].position.x < pointerControls.posX()+0.6
			&& speakBoxes[i].position.x > pointerControls.posX()-0.6
			&& speakBoxes[i].position.z < pointerControls.posZ()+6+1.3
			&& speakBoxes[i].position.z > pointerControls.posZ()+6-1.3
			)
		{
			console.log(i + "hit, " + speakBoxes.length);


			// source6.start();
			// gainNode6.gain.value = 1;
			scene.remove(speakBoxes[i]);
			speakBoxes.splice(i,1);

			//sound
			source6 = context.createBufferSource();
			source6.buffer = bufferCarrot;
			source6.loop = false;
			source6.connect(context.destination);
			source6.start(time);

			document.getElementById('other').innerHTML = clues[carrotCount];
			carrotCount++;
			// speakBoxes[i].dispose();

			if(carrotCount == 6){
				door.scale.set(1,1,1);
				door.position.set(0, 0, -5);
			}
		}

	}
	*/


	//GROUND
	// for(var i=0; i<groundGeo.vertices.length/2-1; i++){
	// 	for(var j=0; j<groundGeo.vertices.length/2-1; j++){
	// 		groundGeo.vertices[(i*4+j)].y = Math.sin(time*i/10)*2;
	// 	}
	// }
	// groundGeo.verticesNeedUpdate = true;
	// groundGeo.computeVertexNormals();
	// groundGeo.computeFaceNormals();
	// groundGeo.__dirtyVertices = true;
	// groundGeo.__dirtyNormals = true;


	dateTime = Date.now();


	for(var i=0; i<screws.length; i++){
		screws[i].updateMatrixWorld();

		var vector = screws[i].geometry.vertices[33].clone();
		vector.applyMatrix4(screws[i].matrixWorld);

		
		cMesh[i].position.set(vector.x, vector.y-50, vector.z);

	}

	pointerControls.getObject().position.y = Math.random()/50;
	pointerControls.getObject().position.x = Math.random()/20;

}


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------



function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}



