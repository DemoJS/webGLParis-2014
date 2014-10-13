precision mediump float;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform float h;
uniform float s;
uniform float v;
uniform float blur;
uniform float blurrange;
uniform sampler2D iChannel0;
// Amount of distortion
#define N 12
#define NOISE

float rrand(vec2 co) {
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
void main() {
    vec2 uv = gl_FragCoord.xy / iResolution.xy;
    vec2 step = vec2(1.) / iResolution.xy;
    vec4 final = vec4(vec3(0.),1.);

    float blurSize = (blurrange/10.0)/iResolution.x;
    vec4 sum = texture2D( iChannel0, vec2(uv.x - 4.0*blurSize, uv.y)) * 0.05;
    sum += texture2D( iChannel0, vec2(uv.x - 3.0*blurSize, uv.y)) * 0.09;
    sum += texture2D( iChannel0, vec2(uv.x - 2.0*blurSize, uv.y)) * 0.12;
    sum += texture2D( iChannel0, vec2(uv.x - blurSize, uv.y)) * 0.15;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y)) * 0.16;
    sum += texture2D( iChannel0, vec2(uv.x + blurSize, uv.y)) * 0.15;
    sum += texture2D( iChannel0, vec2(uv.x + 2.0*blurSize, uv.y)) * 0.12;
    sum += texture2D( iChannel0, vec2(uv.x + 3.0*blurSize, uv.y)) * 0.09;
    sum += texture2D( iChannel0, vec2(uv.x + 4.0*blurSize, uv.y)) * 0.05;
        
    // blur in y (vertical)
    // take nine samples, with the distance blurSize between them
    sum += texture2D( iChannel0, vec2(uv.x, uv.y - 4.0*blurSize)) * 0.05;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y - 3.0*blurSize)) * 0.09;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y - 2.0*blurSize)) * 0.12;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y - blurSize)) * 0.15;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y)) * 0.16;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y + blurSize)) * 0.15;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y + 2.0*blurSize)) * 0.12;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y + 3.0*blurSize)) * 0.09;
    sum += texture2D( iChannel0, vec2(uv.x, uv.y + 4.0*blurSize)) * 0.05;

    
    //sum += get( uv);
    for(float i=0.; i<11.; i++) {
        vec2 rpos=vec2(rrand(uv*i)*3.-1.5, rrand(uv*7.*i)*3.-1.5)*step*0.4;
        final.rgb+=texture2D( iChannel0, uv*(1.+length(rpos*.1*i))+rpos).rgb + sum.rgb * blur/100.0;
    }
    final.rgb*=.1;
    
    final.rgb=rgb2hsv(final.rgb);
    final.r*=h/100.0;
    final.g*=s/100.0;
    final.b*=v/100.0;
    final.rgb=hsv2rgb(final.rgb);   

    final.rgb*=mod(gl_FragCoord.x+gl_FragCoord.y,3.0)*0.04+0.96;
    final=vec4( min(final.r, 1.), min(final.g, 1.), min(final.b, 1.), 1.);

    uv.y*=iResolution.y/iResolution.x;
    uv-=vec2(0.5,0.5*iResolution.y/iResolution.x);
    float vignette = (.5+0.165) / 0.77*dot(uv, uv);

    gl_FragColor = final-vec4(vec3(vignette),1.);
}