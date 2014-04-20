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

var container;
var width = window.innerWidth;
var height = window.innerHeight;
var renderer, scene, camera, controls, stats, light, lightB, pointLight;
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

// var rabbitWidth, rabbitHeight;
var rabbits = [];
var rabbitTexture;

// var timeNumber, times = [];
var groundGeo, ground;
var grassGeo, grassMeshes = [];

// var dropSpeed = 2;

var speakBox, speakBoxGeo, speakBoxTexture, speakBoxMaterial;
var speakBoxes = [];


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
	bufferLoader = new BufferLoader(
		context, ['../audios/AIW.mp3', '../audios/wind_houling.wav', '../audios/bodyFall.mp3','../audios/walk_in_grass.wav','../audios/giggle.wav'], finishedLoading
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
	camera.rotation.order = 'YXZ';

	scene.add(camera);
	// camera.position.set(0,50,100);
	camera.position.set(0,3.472,6.94);
	// camera.position.set(0, 2, 0);
	camera.rotation.set(-0.463,0,0);
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

	//2nd DIRECTIONALLIGHT
	lightB = new THREE.DirectionalLight(0xffec82,0);
	lightB.position.set(0,1,-2);
	lightB.target.position.set(0,0,0);
	scene.add(lightB);

	//SPOTLIGHT
	pointLight = new THREE.SpotLight(0xffffff,3);
	pointLight.position.set(0,6,3);
	pointLight.target.position.set(0,0,0);
	// light.castShadow = true;
	scene.add(pointLight);


	renderer = new THREE.WebGLRenderer( {antialias: true} );
	renderer.setClearColor(0x2b1a1a, 1);
	renderer.setSize(width,height);
	container.appendChild(renderer.domElement);



	//CAMERA CONTORLS
	// controls = new THREE.OrbitControls(camera, renderer.domElement);



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

	//CARROT ON TOP
	speakBoxGeo = new THREE.PlaneGeometry(1,1,1,1);
	speakBoxTexture = THREE.ImageUtils.loadTexture('img/carrot.png');
	speakBoxMaterial = new THREE.MeshLambertMaterial({map: speakBoxTexture, transparent: true, opacity: 1, side: THREE.DoubleSide});
	speakBox = new THREE.Mesh(speakBoxGeo, speakBoxMaterial);
	speakBox.scale.set(0.01);
	speakBox.position.y = 3.5;
	scene.add(speakBox);

	//CARROTS IN GRASS
	for(var i=0; i<15; i++){
		speakBoxes[i] = new THREE.Mesh(speakBoxGeo, speakBoxMaterial);
		speakBoxes[i].scale.set(0.01);
		speakBoxes[i].position.x = Math.random()*30 -32/2;
		speakBoxes[i].position.z = Math.random()*30 -32/2;
		speakBoxes[i].position.y = 1.5;
		scene.add(speakBoxes[i]);
	}

	//TEXT
	text = document.createElement('div');
	text.id = 'stop';
	text.style.position = 'absolute';
	text.style.width = 100;
	text.style.height = 100;
	text.style.color = 'white';
	text.innerHTML = 'Stop following me!';
	text.style.left = width/2 + 'px';
	text.style.bottom =  100 + 'px';
	
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

			rabbits[k] = new THREE.Mesh(geometry, rabbitMaterial2);

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


//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//-----------------------------------------------------------------

var source1, source2, gainNode1, gainNode2, gainNode4, gainNode5;

//music
function finishedLoading(bufferList){
	source1 = context.createBufferSource();
	source2 = context.createBufferSource();
	source3 = context.createBufferSource();
	source4 = context.createBufferSource();
	source5 = context.createBufferSource();

	gainNode1 = context.createGain();
	gainNode2 = context.createGain();
	gainNode4 = context.createGain();
	gainNode5 = context.createGain(); 

	source1.buffer = bufferList[1];
	source2.buffer = bufferList[0];
	source3.buffer = bufferList[2];
	source4.buffer = bufferList[3];
	source5.buffer = bufferList[4];

	source1.loop = true;
	source2.loop = true;
	source3.loop = false;
	source4.loop = true;
	source5.loop = true;

	source1.connect(gainNode1);
	gainNode1.connect(context.destination);

	source2.connect(gainNode2);
	gainNode2.connect(context.destination);

	source3.connect(context.destination);

	source4.connect(gainNode4);
	gainNode4.connect(context.destination);

	source5.connect(gainNode5);
	gainNode5.connect(context.destination);

	gainNode1.gain.value = 1;
	gainNode2.gain.value = 0;
	gainNode5.gain.value = 0;



	source1.start(0);
	source2.start(0);
	source3.start(0);
	source4.start(0);
	
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

		var running = Math.abs(sinWave.run());

		rabbits[0].position.y = running;
		speakBox.position.y = 3.5 + running/4;
		gainNode4.gain.value = 1-running;

		//SHADER
		uniforms.amplitude.value = Math.abs(Math.sin(time*5)/40);
		rabbits[0].verticesNeedUpdate = true;



		var lightSpeed = 1.2;

		//FOLLOW CAMERA
		keyboard.update();
		if(keyboard.pressed('W')){
			if(rabbitStop == false){
				rabbits[0].position.z += (-moveDistance);
				speakBox.position.z += (-moveDistance);
			} else {
				camera.position.z += (-moveDistance);
			}

			pointLight.position.z += (-moveDistance)*lightSpeed;
			pointLight.target.position.z += (-moveDistance)*lightSpeed;

		}
		if(keyboard.pressed('S')){
			if(rabbitStop == false){
				rabbits[0].position.z += (moveDistance);
				speakBox.position.z += (moveDistance);
			} else {
				camera.position.z += (moveDistance);
			}

			pointLight.position.z += (moveDistance)*lightSpeed;
			pointLight.target.position.z += (moveDistance)*lightSpeed;

		}
		if(keyboard.pressed('Q')){
			if(rabbitStop == false){
				rabbits[0].position.x += (-moveDistance);
				speakBox.position.x += (-moveDistance);
			} else {
				camera.position.x += (-moveDistance);
			}
			pointLight.position.x += (-moveDistance)*lightSpeed;
			pointLight.target.position.x += (-moveDistance)*lightSpeed;

		}
		if(keyboard.pressed('E')){
			if(rabbitStop == false){
				rabbits[0].position.x += (moveDistance);
				speakBox.position.x += (moveDistance);
			} else {
				camera.position.x += (moveDistance);
			}

			pointLight.position.x += (moveDistance)*lightSpeed;
			pointLight.target.position.x += (moveDistance)*lightSpeed;

		}
		if(keyboard.pressed('A')){
			if(rabbitStop == true){
				// camera.rotation.y += moveDistance/2;
		        camera.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(), moveDistance/2 );
			}
		}
		if(keyboard.pressed('D')){
			if(rabbitStop == true){
				// camera.rotation.y -= moveDistance/2;
		        camera.rotateOnAxis(new THREE.Vector3(0,1,0).normalize(), -moveDistance/2 );
			}
		}

		if(keyboard.down('space')){
			// console.log(document.getElementById('stop'));

			if(spacePress1st == false) {
				document.body.appendChild(text);
				spacePress1st = true;
			} else if(spacePress2nd == false){
				document.getElementById('stop').innerHTML = "";
				source5.start();
				gainNode5.gain.value = 1;
				spacePress2nd = true;
			} else if(spacePress3rd == false){
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
				camera.rotation.x = 0;
				lightB.intensity = 1;
			}

			if (spacePress4th == true){
				//toggle giggle
				giggle = !giggle;
			}
		}


		if(spacePress3rd == true || (giggle == false && spacePress4th == true)){
			if(gainNode5.gain.value>0)
					gainNode5.gain.value -= 0.01;
		}


		if(giggle){
			if(gainNode5.gain.value<1)
					gainNode5.gain.value += 0.1;
		}


		//CAMERA
		var relativeCameratOffset = new THREE.Vector3(8, 2, 0);
		var cameraOffset = relativeCameratOffset.applyMatrix4( rabbits[0].matrixWorld );

		if(rabbitStop == false){
			camera.position.x = cameraOffset.x;
			camera.position.z = cameraOffset.z;
			// camera.lookAt(rabbits[0].position);
		}
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



