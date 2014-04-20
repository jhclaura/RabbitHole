/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PointerLockControls = function ( camera ) {

	var scope = this;
	var rotatable = true;
	// var rotatable = false;

	// camera.position.set(0, 3.472, 6.94);
	//0,6,3
	// camera.rotation.set(-0.463,0,0);
	// camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	// yawObject.position.y = 2;
	yawObject.add( pitchObject );

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;

	var isOnObject = false;
	var canJump = false;

	var collisionF = false;
	var collisionB = false;
	var collisionR = false;
	var collisionL = false;

	var show = false;

	var velocity = new THREE.Vector3();
	var move = new THREE.Vector3();

	var PI_2 = Math.PI / 2;

	var onMouseMove = function ( event ) {

		if (scope.enabled === false) return;
		if (rotatable === false) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	};

	var onKeyDown = function ( event ) {

		switch ( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true; 
				break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 32: // space
				//JUMP
				// if ( canJump === true ) velocity.y += 10;
				// canJump = false;
				//TEXT
				show = true;
				break;

		}

	};

	var onKeyUp = function ( event ) {

		switch( event.keyCode ) {

			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

			case 32: // space
				//TEXT
				show = false;
				break;

		}

	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;


	this.rotatable = function(){
		rotatable = true;
	};

	//COLLISION
	this.testCollideF = function(c){
		collisionF = c;
	};
	this.testCollideB = function(c){
		collisionB = c;
	};
	this.testCollideR = function(c){
		collisionR = c;
	};
	this.testCollideL = function(c){
		collisionL = c;
	};
	this.dirF = function(){
		return moveForward;
	};
	this.dirB = function(){
		return moveBackward;
	};
	this.dirL = function(){
		return moveLeft;
	};
	this.dirR = function(){
		return moveRight;
	};
	this.toShow = function(){
		return show;
	};



	this.getObject = function () {

		return yawObject;

	};

	this.isOnObject = function ( boolean ) {

		isOnObject = boolean;
		canJump = boolean;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		}

	}();

	this.posX = function(){
		return yawObject.position.x;
	};

	this.posY = function(){
		return yawObject.position.y;
	};

	var changetPosY = function(moveY){
		yawObject.position.y += moveY;
	};

	this.posZ = function(){
		return yawObject.position.z;
	};

	this.rotX = function(){
		return pitchObject.rotation.x;
	};

	this.rotY = function(){
		return pitchObject.rotation.y;
	};

	this.rotZ = function(){
		return pitchObject.rotation.z;
	};

	this.update = function () {

		if ( scope.enabled === false ) return;

		var delta = 0.07;

		// velocity.x += ( - velocity.x ) * 0.08 * delta;
		// velocity.z += ( - velocity.z ) * 0.08 * delta;

		// velocity.y -= 0.25 * delta;

		if ( moveForward && !collisionF ) velocity.z = -delta;
		else if ( moveBackward && !collisionB ) velocity.z = delta;
		else velocity.z = 0;

		if ( moveLeft && !collisionL ) velocity.x = -delta;
		else if ( moveRight && !collisionR ) velocity.x = delta;
		else velocity.x = 0;

		if ( isOnObject === true ) {

			velocity.y = Math.max( 0, velocity.y );

		}

		yawObject.translateX( velocity.x );
		yawObject.translateY( velocity.y ); 
		yawObject.translateZ( velocity.z );

		if ( yawObject.position.y < 1 ) {

			velocity.y = 0;
			yawObject.position.y = 1;

			canJump = true;

		}

	};

};
