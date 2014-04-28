//adjusted from "SeperationAndSeek"
//of "The Nature of Code" by Daniel Shiffman

//TV object

// function Tv(x, y, z) {
// 	this.position = new THREE.Vector3(x, y, z);
// 	this.r = 12;
// 	this.maxspeed = 3;
// 	this.maxforce = 0.2;
// 	this.acceleration = new THREE.Vector3(0,0,0);
// 	this.velocity = new THREE.Vector3(0,0,0);
// }

function Tv(geo, mat) {
	this.mesh = new THREE.Mesh(geo, mat);
	this.mesh.position = new THREE.Vector3();
	this.r = 2;
	this.maxspeed = 0.2;
	this.maxforce = 0.03;
	this.acceleration = new THREE.Vector3(0,0,0);
	this.velocity = new THREE.Vector3(0,0,0);
	scene.add(this.mesh);
}

Tv.prototype.applyBehaviors = function(tvs, me){
	var separateForce = this.separate(tvs);
	//me --> THREE.Vector3
	// var seekForce = this.seek(me);
	var arriveForce = this.arrive(me);

	// separateForce.multiplyScalar(1);
	// seekForce.multiplyScalar(2);

	// this.applyForce(separateForce);
	// this.applyForce(seekForce);
	this.applyForce(arriveForce);
}

Tv.prototype.applyForce = function(force){
	this.acceleration.add(force);
}

Tv.prototype.separate = function(tvs){
	var desiredseparation = this.r*2;
	var sum = new THREE.Vector3();
	var count = 0;

	for(var i=0; i<tvs.length; i++){
		var d = this.mesh.position.distanceTo(tvs[i].mesh.position);

		if((d>0) && (d<desiredseparation)){
			var diff = this.mesh.position.sub(tvs[i].mesh.position);
			diff.normalize();
			diff.divideScalar(d);
			sum.add(diff);
			count++
		}
	}

	if(count>0){
		sum.divideScalar(count);
		sum.normalize();
		sum.multiplyScalar(this.maxspeed);
		sum.sub(this.velocity);
		sum.clampScalar(this.maxforce*-1, this.maxforce);
	}

	return sum;
}

Tv.prototype.seek = function(target){
	var desired = target.sub(this.mesh.position);

	desired.normalize();
	desired.multiplyScalar(this.maxspeed);

	var steer = desired.sub(this.velocity);
	steer.clampScalar(this.maxforce*-1, this.maxforce);

	return steer;
}

Tv.prototype.arrive = function(target){
	var desired = target.sub(this.mesh.position);
	var d = desired.length();
	if(d<10){
		var m = mapping(d,0,100,0,this.maxspeed);
		desired.setLength(m);
	} else {
		desired.setLength(this.maxspeed);
	}

	var steer = desired.sub(this.velocity);
	steer.clampScalar(this.maxforce*-1, this.maxforce);

	return steer;
}

function mapping(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

Tv.prototype.update = function(){
	this.velocity.add(this.acceleration);
	this.velocity.clampScalar(this.maxspeed*-1, this.maxspeed);
	this.mesh.position.add(this.velocity);
	this.acceleration.multiplyScalar(0);
}

Tv.prototype.retPos = function(){
	return this.mesh.position;
}

Tv.prototype.setPos = function(newPos){
	this.mesh.position.set(newPos);
}






