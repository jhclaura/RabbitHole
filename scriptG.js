var container;
var width = window.innerWidth;
var height = window.innerHeight;
var renderer, scene, camera, controls, stats, light, pointLight;
var clock = new THREE.Clock();

var mouse = new THREE.Vector2();
// var keyboard = new KeyboardState();
var keyboard = new THREEx.KeyboardState();

// var rabbitWidth, rabbitHeight;
var rabbits = [];
var rabbitTexture;
var breakSpeed = 0;
var moveDistance = 0.05;


// var timeNumber, times = [];
var groundGeo, ground;
var grassGeo, grassMeshes = [];

// var dropSpeed = 2;


//Wave
var time = Math.PI/2;
var frequency = 0.01;
var amplitude = 3;
var offset = 0;
var tanWave = new TanWave(time, frequency, amplitude, offset);
var sinWave = new SinWave(time, frequency*5, amplitude/2, offset);
var spin;


//Web Speech API
var msg = new SpeechSynthesisUtterance();


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
		context, ['../audios/AIW.mp3', '../audios/wind_houling.wav'], finishedLoading
		);
	bufferLoader.load();

	//Web Speech API
	var voices = window.speechSynthesis.getVoices();
	msg.voice = voices[10];
	msg.text = "welcome welcome welcome to rabbit hole hole";
	msg.rate = 0.1;
	// msg.pitch = 2;
	// msg.onend = function(event) { alert('Finished in ' + event.elapsedTime + ' seconds.'); }
	// window.speechSynthesis.speak(msg);


	//SET-UP
	container = document.createElement('div');
	document.body.appendChild(container);

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 100000);

	scene.add(camera);
	// camera.position.set(0,50,100);
	// camera.position.set(0,3.472,6.94);
	camera.position.set(0, 2, 0);
	// camera.rotation.set(-0.463,0,0);
	// camera.lookAt(scene.position);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild(stats.domElement);

	//DIRECTIONALLIGHT
	light = new THREE.DirectionalLight(0xffffff,0.5);
	light.position.set(0,1,2);
	light.target.position.set(0,0,0);
	scene.add(light);

	// light = new THREE.DirectionalLight(0xffec82);
	// light.position.set(-1,-1,-1);
	// scene.add(light);

	//SPOTLIGHT
	pointLight = new THREE.SpotLight(0xffffff,5);
	pointLight.position.set(0,6,3);
	pointLight.target.position.set(0,0,0);
	// light.castShadow = true;
	scene.add(pointLight);


	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setClearColor(0x2b1a1a, 1);
	renderer.setSize(width,height);
	container.appendChild(renderer.domElement);



	//CAMERA CONTORLS
	controls = new THREE.OrbitControls(camera, renderer.domElement);



	//model
	//RABBIT
	// rabbitWidth = 20;
	// rabbitHeight = 10;



	rabbitTexture = THREE.ImageUtils.loadTexture('rabbit.png');
	var modelMaterial = new THREE.MeshLambertMaterial( {map: rabbitTexture} );
	loadModelR("rabbit.js", modelMaterial);

	// timeNumber = 1;
	// var timeTexture = THREE.ImageUtils.loadTexture('clock.png');
	// modelMaterial = new THREE.MeshLambertMaterial( {map: timeTexture} );
	// loadModelT("clock.js", modelMaterial);

	//GROUND
	groundGeo = new THREE.PlaneGeometry(32,32,5,5);
	var groundMat = new THREE.MeshLambertMaterial( {color: 0x1a2b2b} );
	ground = new THREE.Mesh(groundGeo, groundMat);
	ground.rotation.x = -Math.PI/2;
	ground.position.y -= 1;
	scene.add(ground);

	//Grass
	grassGeo = new THREE.PlaneGeometry( 2,2,1,1 );
	grassGeo.dynamic = true;
	grassGeo.vertices[3].z = 1;
	var grassMap = THREE.ImageUtils.loadTexture('img/billboardgrassDark.png');
	var grassMat = new THREE.MeshLambertMaterial({map: grassMap, transparent: true, opacity: 0.5, side: THREE.DoubleSide});

	// for(var i=0; i<1000; i++){
	// 	grassMeshes[i] = new THREE.Mesh(grassGeo, grassMat);
	// 	grassMeshes[i].position.x = Math.random()*32-16;
	// 	grassMeshes[i].position.z = Math.random()*32-16;
	// 	grassMeshes[i].rotation.y = Math.random()*Math.PI;
	// 	scene.add(grassMeshes[i]);
	// }

	var k=0;
	for(var i=0; i<33; i++){
		for(var j=0; j<33; j++){
			grassMeshes[k] = new THREE.Mesh(grassGeo, grassMat);
			grassMeshes[k].position.x = i-32/2;
			grassMeshes[k].position.z = j-32/2;
			grassMeshes[k].rotation.y = Math.random()*Math.PI;
			scene.add(grassMeshes[k]);

			k++;
		}
	}

}


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
		// THREE.UniformsLib["shadowmap"],

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

			rabbits[k] = new THREE.Mesh(geometry, rabbitMaterial);

			//shader
			var vertices = rabbits[k].geometry.vertices;
			var values = attributes.displacement.value;
			for(var v=0; v<vertices.length; v++){
				values.push(Math.random()*30);
			}

			// rabbits[k].scale.set(20,20,20);
			// rabbits[k].position.x = Math.sin((360/rabbitWidth*i)*(Math.PI/180))*150;
			// rabbits[k].position.z = Math.sin((Math.PI/2 + (360/rabbitWidth*i)*(Math.PI/180)))*150;
			rabbits[k].position.y = 1;
			rabbits[k].rotation.x = -Math.PI/18*2;
			rabbits[k].rotation.y = -Math.PI/2;

			scene.add(rabbits[k]);

			
			
	}, "js");

	// return group;
}

/*
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

var source1, source2, gainNode1, gainNode2;

//music
function finishedLoading(bufferList){
	source1 = context.createBufferSource();
	source2 = context.createBufferSource();
	gainNode1 = context.createGain();
	gainNode2 = context.createGain(); 

	source1.buffer = bufferList[1];
	source2.buffer = bufferList[0];

	source1.loop = true;
	source2.loop = true;

	source1.connect(gainNode1);
	gainNode1.connect(context.destination);

	source2.connect(gainNode2);
	gainNode2.connect(context.destination);

	gainNode1.gain.value = 1;
	gainNode2.gain.value = 0;


	source1.start(0);
	source2.start(0);
}


function animate(){
	requestAnimationFrame(animate);
	update();
	render();
}

function render(){
	renderer.render(scene, camera);
}



function update(){

	controls.update();
	stats.update();

	var time = clock.getElapsedTime(),
		delta = clock.getDelta();
	
	

	// console.log(camera.position);
	// console.log(camera.rotation);

	//RABBITS
	// for(var i=0; i<rabbits.length; ++i){
		// rabbits[i].position.y += dropSpeed;

		// if(rabbits[i].position.y > 500)
		// 	rabbits[i].position.y = 0;

		rabbits[0].position.y = Math.abs(sinWave.run());

		//SHADER
		// uniforms.amplitude.value = Math.abs(Math.sin(time*5)/40);



		//FOLLOW CAMERA
		if(keyboard.pressed('up')){
			rabbits[0].position.z += (-moveDistance);
			pointLight.position.z += (-moveDistance)*1.7;
			pointLight.target.position.z += (-moveDistance)*1.7;

		}
		if(keyboard.pressed('down')){
			rabbits[0].position.z += (moveDistance);
			pointLight.position.z += (moveDistance)*1.7;
			pointLight.target.position.z += (moveDistance)*1.7;

		}
		if(keyboard.pressed('left')){
			rabbits[0].position.x += (-moveDistance);
			rabbits[0].rotation.y += Math.PI/1800;
			pointLight.position.x += (-moveDistance)*1.7;
			pointLight.target.position.x += (-moveDistance)*1.7;

		}
		if(keyboard.pressed('right')){
			rabbits[0].position.x += (moveDistance);
			rabbits[0].rotation.y -= Math.PI/1800;
			pointLight.position.x += (moveDistance)*1.7;
			pointLight.target.position.x += (moveDistance)*1.7;

		}


		//CAMERA
		// var relativeCameratOffset = new THREE.Vector3(8, 2, 0);
		// var cameraOffset = relativeCameratOffset.applyMatrix4( rabbits[0].matrixWorld );

		// camera.position.x = cameraOffset.x;
		// camera.position.z = cameraOffset.z;
		// camera.lookAt(rabbits[0].position);

	// }


	//CLOCK
	// spin = 0.05*tanWave.run();
	// times[0].rotation.y = spin + Math.PI/3;
	// times[0].rotation.z = spin;



	//GRASS
	//manupulate vertices example from 
	//https://dl.dropboxusercontent.com/u/43243793/examples/webgl_geometry_grass.html
	for(var i=0; i<=grassGeo.vertices.length/2-1; i++){
		for(var j=0; j<2; j++){
			grassGeo.vertices[ 2*i + j ].z = ((2-i)/2)*Math.sin(time)/2;
		}
	}
	grassGeo.verticesNeedUpdate = true;


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

	/*
	//keyboard_Control
	//----------------------------------------------------
	keyboard.update();
	if(keyboard.pressed("down")){
		// if(dropSpeed<=12)
		// 	dropSpeed += 0.1;
		if(gainNode1.gain.value>0) 
			gainNode1.gain.value -= 0.005;
		if(gainNode2.gain.value<1)
			gainNode2.gain.value += 0.005;

		// if(tanWave.frequency<2)
		// 	tanWave.frequency += 0.002;
	}
	if(keyboard.pressed("up")){
		// if(dropSpeed>2)
		// 	dropSpeed -= 0.1;
		if(gainNode1.gain.value<1) 
			gainNode1.gain.value += 0.005;
		if(gainNode2.gain.value>0)
			gainNode2.gain.value -= 0.005;

		// if(tanWave.frequency>0.01)
		// 	tanWave.frequency -= 0.006;
	}
	if(keyboard.down("r")){
		// dropSpeed = 1;
		// times[0].frequency = 0.01;
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