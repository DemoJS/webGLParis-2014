precision mediump float;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform float h;
uniform float s;
uniform float v;
uniform float blur; 
uniform float blurrange;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec4 taikuri(){
    vec4 C;
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    float time=iGlobalTime*25.;
    uv-=vec2(.5);
    uv*=1.4;
    uv=uv/(1.+mod(time,1.)*.5);
    uv+=vec2(.5);
    uv.y*=1.4;
    if(mod(time,1.)<0.5)
        C = texture2D(iChannel0, uv);
    else
        C = vec4(1.,1.,1.,2.)-texture2D(iChannel0, uv);
    return C;
}
void main(void)
{
    vec2 uv = (gl_FragCoord.xy / iResolution.xy);
    vec2 steppy = (vec2(1.,0.) / iResolution.xy);
    vec4 C = texture2D(iChannel1,uv)*.5
                + texture2D(iChannel1,uv+steppy)*.1
                + texture2D(iChannel1,uv-steppy)*.1
                + texture2D(iChannel1,uv+steppy.yx)*.1
                + texture2D(iChannel1,uv-steppy.yx)*.1
                + texture2D(iChannel1,uv+steppy*2.)*.05
                + texture2D(iChannel1,uv-steppy*2.)*.05
                + texture2D(iChannel1,uv+steppy.yx*2.)*.05
                + texture2D(iChannel1,uv-steppy.yx*2.)*.05;
    C-=max(iGlobalTime-80.,0.)*.1*rand(uv+iGlobalTime);
    C+=max(iGlobalTime-80.,0.)*.05;
    C+=min(max(iGlobalTime-100.,0.),2.)*taikuri()*.6;
    float vignette = 1.5 /(1. + 0.7*length(uv-vec2(.5)));
    float noise=rand(uv+iGlobalTime*uv);
    if(length(uv.y-0.5)>(9./11.)*.36) {
        gl_FragColor=vec4(0.,0.,0.,1.);
    } else {
		if(iGlobalTime < 120.){
			noise += rand(iGlobalTime*uv*300.);
		}
        gl_FragColor=vec4(.6*C.rgb*vec3(vignette)-vec3(noise*.005), 1.);
		
    }
}