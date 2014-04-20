// var runSceneOne = function(){

	var container;
	var width = window.innerWidth;
	var height = window.innerHeight;
	var renderer, scene, camera, controls, stats, light;
	var clock = new THREE.Clock();

	var mouse = new THREE.Vector2();
	var keyboard = new KeyboardState();

	var rabbitWidth, rabbitHeight;
	var rabbits = [];

	var timeNumber, timeClock;

	var dropSpeed = 2;


	//Wave
	var time = Math.PI/2;
	var frequency = 0.01;
	var amplitude = 3;
	var offset = 0;
	var tanWave = new TanWave(time, frequency, amplitude, offset);
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
			context, ['../audios/AIW.mp3', '../audios/wind_houling.wav'], finishedLoading
			);
		bufferLoader.load();


		//SET-UP
		container = document.createElement('div');
		document.body.appendChild(container);

		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera(60, width/height, 0.1, 100000);

		scene.add(camera);
		camera.position.set(92,183,73);
		camera.rotation.set(0.199,0.965,-0.164);
		// camera.lookAt(scene.position);

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.bottom = '5px';
		stats.domElement.style.zIndex = 100;
		stats.domElement.children[ 0 ].style.background = "transparent";
		stats.domElement.children[ 0 ].children[1].style.display = "none";
		container.appendChild(stats.domElement);

		light = new THREE.DirectionalLight(0xffffff);
		light.position.set(1,1,1);
		scene.add(light);

		light = new THREE.DirectionalLight(0xffec82);
		light.position.set(-1,-1,-1);
		scene.add(light);

		renderer = new THREE.WebGLRenderer( {antialias: true} );
		renderer.setClearColor(0x6c3519, 1);
		renderer.setSize(width,height);
		container.appendChild(renderer.domElement);

		// controls = new THREE.OrbitControls(camera, renderer.domElement);

		//model
		rabbitTexture = THREE.ImageUtils.loadTexture('img/rabbit.png');
		timeTexture = THREE.ImageUtils.loadTexture('img/clock.png');

		rabbitWidth = 20;
		rabbitHeight = 10;
		// rabbitTexture = THREE.ImageUtils.loadTexture('img/rabbit.png');
		// rabbitTexture.needsUpdate = true;
		var modelMaterial = new THREE.MeshLambertMaterial( {map: rabbitTexture} );
		loadModelR("rabbit.js", modelMaterial);

		timeNumber = 1;
		// timeTexture = THREE.ImageUtils.loadTexture('img/clock.png');
		// timeTexture.needsUpdate = true;
		modelMaterial = new THREE.MeshLambertMaterial( {map: timeTexture} );
		loadModelT("clock.js", modelMaterial);

	}

	var rabbitsMesh, rabbitsGeo, rabbitsGroup, rabbitTexture;

	function loadModelR (model, meshMat) {

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
				for(var j=0; j<rabbitHeight; j++) {
					for(var i=0; i<rabbitWidth; i++){
					
						rabbits[k] = new THREE.Mesh(geometry, material);

						rabbits[k].scale.set(20,20,20);
						rabbits[k].position.x = Math.sin((360/rabbitWidth*i)*(Math.PI/180))*150;
						rabbits[k].position.z = Math.sin((Math.PI/2 + (360/rabbitWidth*i)*(Math.PI/180)))*150;
						rabbits[k].position.y = j*50;
						rabbits[k].rotation.y = ((360/rabbitWidth*i + 90)*(Math.PI/180));

						scene.add(rabbits[k]);
						k++;

					}
				}
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
		// controls.update();
		stats.update();

		// console.log(camera.rotation);

		//RABBITS
		for(var i=0; i<rabbits.length; ++i){
			rabbits[i].position.y += dropSpeed;

			if(rabbits[i].position.y > 500)
				rabbits[i].position.y = 0;
		}


		//CLOCK
		spin = 0.05*tanWave.run();

		// if(timeClock){
			timeClock.rotation.y = spin + Math.PI/3;
			timeClock.rotation.z = spin;
		// }

		// if(rabbitsGroup != null){
		// 	rabbitsGroup.position.y += dropSpeed;

		// 	if(rabbitsGroup.position.y > 500)
		// 		rabbitsGroup.position.y = 0;
		// }

		// rabbits[0].position.y --;	

		// console.log(rabbits.length);


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

			if(tanWave.frequency>0.015)
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


	}

	function onWindowResize(){
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(window.innerWidth, window.innerHeight);
	}
//};