var PARTICLES = {
	

			var particleCount = 1280000,		//1280000 seems to be a safe max
				particles = new THREE.Geometry();
			for(var p = 0; p < particleCount; p++){
				var particle = new THREE.Vector3(
					Math.random() * 50*(p/particleCount) - 25*(p/particleCount),
					Math.random() * 50*(p/particleCount) - 25*(p/particleCount),
					Math.random() * 50*(p/particleCount) - 25*(p/particleCount)
				);
				particles.vertices.push(particle);
			}
			var size  = 0.0082;
			var materialpart = new THREE.PointCloudMaterial( { size: size, color: 0xfafaff, alphaTest:0.4} );
			materialpart.alphaTest = 0.1;
			materialpart.opacity = 0.1;
			materialpart.transparent = true;
			materialpart.blending = THREE.AdditiveAlphaBlending;
			var particleSystem = new THREE.PointCloud( particles, materialpart );
			this.scene.add(particleSystem);

};