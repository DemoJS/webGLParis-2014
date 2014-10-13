var SHADERTOOL = {
	waitingToLoad : [],
	vertexShaders : [],
	fragmentShaders : [],
	setFragmentCode : function(name, parameters, filename) {
		this.waitingToLoad.push(name);
		$.ajax({
			url : filename,
			dataType: "text",
			success : function (code) {
				SHADERTOOL.fragmentShaders.push({ name : name, 
											parameters : parameters, 
											code : code
				});
				DEMO.makeReport('the following fragmentshadercode loaded: <b>' + name + '</b>');
				for(val in SHADERTOOL.waitingToLoad) {
					if(SHADERTOOL.waitingToLoad[val] === name) {
						SHADERTOOL.waitingToLoad.splice(val, 1);
						if(SHADERTOOL.waitingToLoad.length === 0) {
							DEMO.makeReport('<i><b>all shaders loaded</b></i>');
						}
						return;
					}
				}
			}
		});
	},
	setVertexCode : function(name, parameters, filename) {
		this.waitingToLoad.push(name);
		$.ajax({
			url : filename,
			dataType: "text",
			success : function (code) {
				SHADERTOOL.vertexShaders.push({ name : name, 
												parameters : parameters, 
												code : code
				});
				DEMO.makeReport('the following vertexshadercode loaded: <b>' + name + '</b>');
				for(val in SHADERTOOL.waitingToLoad) {
					if(SHADERTOOL.waitingToLoad[val] === name) {
						SHADERTOOL.waitingToLoad.splice(val, 1);
						if(SHADERTOOL.waitingToLoad.length === 0) {
							DEMO.makeReport('<i><b>all shaders loaded</b></i>');
						}
						return;
					}
				}
			}
			});
	},
	initialize : function() {
		$.getJSON( "fragShader.json", function( data ) {
			for(val in data.shaders) {
				SHADERTOOL.setFragmentCode(data.shaders[val].name, data.shaders[val].params, data.shaders[val].filename);
			}
		});
		$.getJSON( "vertShader.json", function( data ) {
			for(val in data.shaders) {
				SHADERTOOL.setVertexCode(data.shaders[val].name, data.shaders[val].params, data.shaders[val].filename);
			}
		});
	},
	getFragmentShader : function(name) {
		console.log(this.fragmentShaders);
		for(val in this.fragmentShaders) {
			if(name === this.fragmentShaders[val].name) {
				return this.fragmentShaders[val];
			}
		}
	},
	getVertexShader : function(name) {
		console.log(this.vertexShaders);
		for(val in this.vertexShaders) {
			if(name === this.vertexShaders[val].name) {
				return this.vertexShaders[val];
			}
		}
	},
	getShaderSetup : function( vertexShaderName, fragmentShaderName, passTexture0, passTexture1) {
		var vertexS = this.getVertexShader( vertexShaderName), 
			fragmentS = this.getFragmentShader( fragmentShaderName);
		var uniforms = '{';
		console.log(vertexS);
		console.log(fragmentS);
		for(val in vertexS.parameters) {
			var thisParam = vertexS.parameters[val];
			uniforms +=thisParam.name + ': { type: "f", value: ' + thisParam.value + '}';   
			if(val < vertexS.parameters.length-1) uniforms+=',\n';
		}
		if(fragmentS.parameters.length>0) uniforms+=',\n';
		for(val in fragmentS.parameters) {
			var thisParam = fragmentS.parameters[val];
			uniforms +=thisParam.name + ': { type: "f", value: ' + thisParam.value + '}';   
			if(val < fragmentS.parameters.length-1) uniforms+=',\n';
		}
		uniforms+='}';
		console.log(uniforms);
		eval('uniforms='+uniforms+';');
		uniforms.iGlobalTime = { type: "f", value: 1.0};
		uniforms.iResolution = { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
		if(typeof(passTexture0) !== "undefined") {
			console.log('tex created');
			uniforms.iChannel0 = { type: "t", value: passTexture0};
		}
		if(typeof(passTexture1) !== "undefined") {
			console.log("ichannel1 created");
			uniforms.iChannel1 = { type: "t", value: passTexture1};
		}
		console.log(uniforms);
		console.log(vertexS.code);
		console.log(fragmentS.code);
		return new THREE.ShaderMaterial( {
			uniforms:  uniforms,
			vertexShader: vertexS.code,
			fragmentShader: fragmentS.code
		});
	}
};