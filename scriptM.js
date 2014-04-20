
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
var clock = new THREE.Clock();

var mouse = new THREE.Vector2();
// var keyboard = new KeyboardState();

var rabbitWidth, rabbitHeight;
var rabbits = [];
var rabbit;

var timeNumber, timeClock;

var chocoNumber, chocoGeo, chocoMat, chocos = [];
var groundGeo, groundMat, ground;
var maze;
var cupGeo, cupTexture, cupMat, cup;
var spoonGeo, spoonTexture, spoonMat, spoon;
var plateGeo, plateTexture, plateMate, plate;
var sugars = [];

var dropSpeed = 2;

var dummyGeo, dummyMat, dummy;



//Wave
var time = Math.PI/2;
var frequency = 0.01;
var amplitude = 3;
var offset = 0;
var tanWave = new TanWave(time, frequency, amplitude, offset);
var sinWave = new SinWave(time, frequency*5, amplitude/2, offset);
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
		context, ['../audios/The Coffee Song.mp3', '../audios/giggle.mp3'], finishedLoading
		);
	bufferLoader.load();


	//SET-UP
	container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 100000);
	// camera.position.z = 10;
	// camera.position.set(92,183,73);
	// camera.rotation.set(0.199,0.965,-0.164);
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

	light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0,1,0);
	scene.add(light);

	// light = new THREE.DirectionalLight(0xffec82);
	// light.position.set(-1,-1,-1);
	// scene.add(light);

	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setClearColor(0xffffff, 1);
	renderer.setSize(width,height);

	container.appendChild(renderer.domElement);
	window.addEventListener( 'resize', onWindowResize, false );


	//model
	rabbitTexture = THREE.ImageUtils.loadTexture('img/rabbit.png');
	timeTexture = THREE.ImageUtils.loadTexture('img/clock.png');

	//RABBIT
	// rabbitWidth = 20;
	// rabbitHeight = 10;
	// rabbitTexture = THREE.ImageUtils.loadTexture('img/rabbit.png');
	// rabbitTexture.needsUpdate = true;
	var modelMaterial = new THREE.MeshLambertMaterial( {map: rabbitTexture} );
	loadModelR("rabbit.js", modelMaterial);

	//CLOCK
	timeNumber = 1;
	// timeTexture = THREE.ImageUtils.loadTexture('img/clock.png');
	// timeTexture.needsUpdate = true;
	// modelMaterial = new THREE.MeshLambertMaterial( {map: timeTexture} );
	// loadModelT("clock.js", modelMaterial);

	//MAZE
	maze = new THREE.Geometry();

	//CHOCO_WALLS
	modelMaterial = new THREE.MeshLambertMaterial({color: 0x502911});
	loadModelC("choco.js","choco90.js","choco180.js","choco270.js", modelMaterial);

	//COFFEE
	cupTexture = THREE.ImageUtils.loadTexture('img/cup.png');
	modelMaterial = new THREE.MeshLambertMaterial( {map: timeTexture} );
	loadModelT("models/coffee_cup.js", modelMaterial);

	plateTexture = THREE.ImageUtils.loadTexture('img/plate.png');
	modelMaterial = new THREE.MeshLambertMaterial( {map: timeTexture} );
	loadModelT("models/coffee_plate.js", modelMaterial);

	spoonTexture = THREE.ImageUtils.loadTexture('img/spoon.png');
	modelMaterial = new THREE.MeshLambertMaterial( {map: timeTexture} );
	loadModelT("models/coffee_spoon.js", modelMaterial);


	//GROUND
	// groundGeo = new THREE.PlaneGeometry(100,100,5,5);
	// groundMat = new THREE.MeshLambertMaterial( {color: 0x502911, side: THREE.DoubleSide} );
	// ground = new THREE.Mesh(groundGeo, groundMat);
	// ground.rotation.x = -Math.PI/2;
	// ground.position.y -= 1;
	// scene.add(ground);
	// THREE.GeometryUtils.merge(maze, ground);


	//PointerLockControl
	pointerControls = new THREE.PointerLockControls(camera);
	scene.add( pointerControls.getObject() );

	rays[0] = new THREE.Raycaster();
	rays[1] = new THREE.Raycaster();
	rays[2] = new THREE.Raycaster();
	rays[3] = new THREE.Raycaster();

	rays[0].ray.direction.set(1,0,0);
	rays[1].ray.direction.set(-1,0,0);
	rays[2].ray.direction.set(0,0,1);
	rays[3].ray.direction.set(0,0,-1);


	//DUMMY
	dummyGeo = new THREE.CubeGeometry(0.55,3.5,0.55);
	dummyMat = new THREE.MeshBasicMaterial({color: 0x00ffff});
	dummy = new THREE.Mesh(dummyGeo, dummyMat);
	scene.add(dummy);

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

var timesMesh, timesGeo, timesGroup, timeTexture;

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

		timeClock = new THREE.Mesh(geometry, material);
		timeClock.scale.set(20,20,20);
		timeClock.position.set(0,180,0);
		scene.add(timeClock);

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
	groundGeo = new THREE.CubeGeometry(100,2,100);
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



var source1, source2, gainNode1, gainNode2;

//music
function finishedLoading(bufferList){
	source1 = context.createBufferSource();
	source2 = context.createBufferSource();
	gainNode1 = context.createGain();
	gainNode2 = context.createGain(); 

	source1.buffer = bufferList[0];
	source2.buffer = bufferList[1];

	source1.loop = true;
	source2.loop = true;

	source1.connect(gainNode1);
	gainNode1.connect(context.destination);

	source2.connect(gainNode2);
	gainNode2.connect(context.destination);

	gainNode1.gain.value = 0.5;
	gainNode2.gain.value = 0;

	// source1.start(0);
	// source2.start(0);
}


function animate(){
	requestAnimationFrame(animate);
	update();
	render();
}

function render(){
	renderer.render(scene, camera);
}



var collideF = false;
var collideB = false;
var collideR = false;
var collideL = false;



function update(){
	// controls.update();
	stats.update();

	// console.log(camera.rotation);

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
	if(pointerControls.toShow())
		console.log(pointerControls.posX() + ", " + pointerControls.posZ());

	//DUMMY
	dummy.position.set(pointerControls.posX(), pointerControls.posY()+1.7, pointerControls.posZ());
	var originPoint = dummy.position.clone();

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
	var running = Math.abs(sinWave.run());
	rabbit.position.y = running;

	// for(var i=0; i<rabbits.length; ++i){
		// rabbits[i].position.y += dropSpeed;

		// if(rabbits[i].position.y > 500)
		// 	rabbits[i].position.y = 0;
	// }


	/*
	//CLOCK
	spin = 0.05*tanWave.run();
	// if(timeClock){
		timeClock.rotation.y = spin + Math.PI/3;
		timeClock.rotation.z = spin;
	// }
	*/


	// if(rabbitsGroup != null){
	// 	rabbitsGroup.position.y += dropSpeed;

	// 	if(rabbitsGroup.position.y > 500)
	// 		rabbitsGroup.position.y = 0;
	// }

	// rabbits[0].position.y --;	

	// console.log(rabbits.length);

	/*
	//keyboard_Control
	//----------------------------------------------------
	keyboard.update();
	if(keyboard.pressed("down")){
		if(dropSpeed<=12)
			dropSpeed += 0.1;
		if(gainNode1.gain.value>0) 
			gainNode1.gain.value -= 0.005;
		if(gainNode2.gain.value<1)
			gainNode2.gain.value += 0.005;

		if(tanWave.frequency<2)
			tanWave.frequency += 0.002;
	}
	if(keyboard.pressed("up")){
		if(dropSpeed>2)
			dropSpeed -= 0.1;
		if(gainNode1.gain.value<1) 
			gainNode1.gain.value += 0.005;
		if(gainNode2.gain.value>0)
			gainNode2.gain.value -= 0.005;

		if(tanWave.frequency>0.01)
			tanWave.frequency -= 0.006;
	}
	if(keyboard.down("r")){
		dropSpeed = 1;
		timeClock.frequency = 0.01;
		gainNode1.gain.value = 1;
		gainNode2.gain.value = 0;
	}
	if(keyboard.down("S")){
		msg.voice = voices[20];
		msg.rate = 0.5;
		msg.pitch = 2;
		// window.speechSynthesis.speak(msg);
	}
	*/


}

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}