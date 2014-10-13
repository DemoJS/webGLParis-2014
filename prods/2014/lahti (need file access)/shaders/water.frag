precision highp float;
uniform vec2 iResolution;
uniform float iGlobalTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D iChannel2;
mat3 rotY(float a){
    return mat3( cos(a), 0.0, sin(a),
                 0.0,    1.0, 0.0,
                -sin(a), 0.0, cos(a)
                );
}
float smin( float a, float b, float k )
{
    a = pow( a, k ); b = pow( b, k );
    return pow( (a*b)/(a+b), 1.0/k );
}
float sdTorus( vec3 p, vec2 t ){
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}
float sdCappedCylinder( vec3 p, vec2 h ){
  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdCapsule( vec3 p, vec3 a, vec3 b, float r ){
    float time=max(iGlobalTime-51.,0.);
    r+=-p.y*-2.5*texture2D(iChannel0,vec2((32./1024.)*3.141*atan(p.x,p.z)+0.1,p.y*.01811-time*2.*.0226));

    r-=1.-min(max(time,0.1)*2.-p.y-2.,1.);
    r/=max(time,0.1);
    r-=max(time,0.1)*.06;
    vec3 pa = p - a , ba = b - a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h ) - r;
}
float sdHexPrism( vec3 p, vec2 h ){
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x+q.y*0.57735,q.y*1.1547)-h.x);
}
float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}
float udRoundBox( vec3 p, vec3 b, float r ){
  return length(max(abs(p)-b,0.0))-r;
}
float box( vec3 p, vec3 b, float r ){
  vec3 pp=p;
  pp*=rotY(iGlobalTime);
  pp.zxy*=rotY(iGlobalTime*.7);
  return length(max(abs(pp)-b,0.0))-r;
}
float sdSphere( vec3 p, float s ){
  s+=texture2D(iChannel2, vec2(2.+atan(p.x,p.z)*1.1,p.y)*0.21+iGlobalTime*.03)*0.13;
  return length(p)-s;
}
float pallo( vec3 p, float s ){
  return length(p)-s;
}
float calculateDistance(in vec3 p, out vec3 color){
    float time=iGlobalTime-51.;
    float time2=max(time,0.);
    vec3 rayPosition = vec3(p.xz, p.y).xzy;
    vec3 d = abs(rayPosition) - vec3(2.0, 0.0, -52.0);
    color = vec3(.2, 1.0, 1.6)*.1+vec3(p.x, p.z, 0.)*.01;  
    float finalDistance = 10000000.;
    float dist1 = 100000.;
    if(iGlobalTime>50.){
        if(iGlobalTime<61.){
            dist1 = min(dist1,sdCapsule( p, vec3(0.,5.5,0.), vec3(0.,-1.7,0.), 1.4));
        }
    }
    float h=texture2D(iChannel0,p.xz*.051).r*.2+sin(p.x+p.z+time)*.1+.3*sin(length(p.xz)*3.2-time)*max(min(time-.5,1.)/(length(p.xz*.8)+.1*time2),0.);

    float h2=texture2D(iChannel0,p.xz*.2).r*.1+texture2D(iChannel0,p.xz*.034).r*.5;
    if(iGlobalTime>10.7){
		dist1 = min(dist1,udRoundBox(p-vec3(0.,-1.1,0.),vec3(12.,1.+h*.7,12.),0.1));
		if(iGlobalTime<54.){
			dist1 = min(dist1,sdSphere(p*vec3(1.,(1.+max(time*2.-1.3,0.)),1.)-vec3(0.,-1.8*max(time,0.)*max(time,0.)*2.+1.7,0.),1.));
		}
		finalDistance = dist1;
		dist1 = udRoundBox(p-vec3(0.,0.,0.),vec3(12.,-4.+length(p.xz)*0.4+h2,12.),0.1)-.8;
    }
    
    vec3 dd=p-vec3(8.,13.+iGlobalTime*.2,18.+iGlobalTime*.2);
    
    vec2 positus=vec2(atan(p.z,p.x)*2.+3.141*0.4,p.y)*.5+1.;
    float h3=texture2D(iChannel2,positus*0.06+iGlobalTime*.005).b*.2+sin(positus.y*3.+iGlobalTime)*.1+cos(positus.x*2.)*.017;

    if(iGlobalTime<14.){
        float h4=texture2D(iChannel0,p.xy*.05).r*.6+texture2D(iChannel0,p.yz*.08+iGlobalTime*.001).r;
        dist1 = min(dist1,pallo(dd,12.3+h2*.066+h3*.12+h4*.003));
    }
        if(finalDistance>dist1){
            finalDistance = dist1;
            color=vec3(mod(p.y,1.));
        }
    return finalDistance;
}

float softshadow( in vec3 ro, in vec3 rd, float mint, float k ){
    float res = 1.0;
    float t = mint;
    for( float i=0.; i<4.; i++ ){
        vec3 C;
        float h = calculateDistance(ro + rd*t, C);
        res = min( res, k*h/t );
        t += h;
    }
    return clamp(res,0.0,1.0);
}

vec3 tracer(vec3 rayStartPosition, vec3 rayDirection) {
    vec3 finalColor = vec3(0., 0., 0.);
    vec3 rayPosition = rayStartPosition;
    float stepable = 1.;
    float dist = 0.3;
    vec3 normalVector = rayDirection;
    float coff = 1.;
    float find;
    vec3 lightSource = vec3(16.,25.-0.4*iGlobalTime, -13.2);
    
    for(float k=0.; k<3.; k++) {
        find = 0.0;
        for(float i=0.; i<21.3; i++) {
            vec3 color;
            stepable = calculateDistance(rayPosition, color);
            dist += stepable;
            rayPosition = rayStartPosition + dist * rayDirection;
            if(length(rayPosition.xz)>12.5){
                vec3 lightDir = (lightSource-rayStartPosition);
                lightDir = (lightDir/length(lightDir));
                float directLight = dot(normalVector, lightDir);
                finalColor+=max(pow(directLight,7.)*vec3(1.6,1.1,.9)*1.6,0.0001);
                finalColor+=rand(10.*vec2(atan(rayPosition.x,rayPosition.z),rayPosition.y))*.02;
                return finalColor;
            }
            if( abs(stepable) <= 0.04){
                const float epsilon = 0.04;
                vec3 C;
                normalVector = vec3(    calculateDistance(rayPosition+vec3(epsilon,0,0),C)-calculateDistance(rayPosition+vec3(-epsilon,0,0),C),
                                        calculateDistance(rayPosition+vec3(0,epsilon,0),C)-calculateDistance(rayPosition+vec3(0,-epsilon,0),C),
                                        calculateDistance(rayPosition+vec3(0,0,epsilon),C)-calculateDistance(rayPosition+vec3(0,0,-epsilon),C));
                normalVector = normalize(normalVector);
                
                
                float shadow = (0.1+softshadow(rayPosition + normalVector, normalize(lightSource), 0.0, 22.0) * .7);
                finalColor = mix(finalColor, color * vec3(dot(normalVector, -rayDirection)) * shadow, coff) ;
                finalColor = mix(finalColor, vec3(0.0), dist/19.0);  /*fog*/
                find = 1.0;
                break;
                
            }
        }
        dist = 0.0;
        rayStartPosition = rayPosition + normalVector;
        rayPosition = rayStartPosition;
        rayDirection = reflect(rayDirection, normalVector);
        coff *= 0.2;
    }
    vec3 lightDir = (lightSource-rayStartPosition);
    lightDir = (lightDir/length(lightDir));
    float directLight = dot(normalVector, lightDir);
    finalColor+=max(pow(directLight,12.)*vec3(1.6,1.1,.9)*1.8,0.0001);
    return finalColor;
}

void main() {
    vec3 cameraPosition = vec3( 0., 9.-iGlobalTime*.095, -13.8+iGlobalTime*.07);
    cameraPosition*=rotY(3.141*2.*(10.+iGlobalTime)*.015*(1.-iGlobalTime*0.006));
    //cameraPosition*=rotY(iGlobalTime*.7);
    vec2 uv = gl_FragCoord.xy /( iResolution.xy *vec2(.5,.5))- 1.;
    uv*=.5;
    if(iGlobalTime>90.) gl_FragColor=vec4(0.,0.,0.,1.);
    else if(length(uv.y)>(9./11.)*.36) {
        gl_FragColor=vec4(0.,0.,0.,1.);
    } else {
        float aspect = iResolution.x / iResolution.y;
        vec3 direction = normalize(vec3(.5 * uv * vec2(aspect, 1.0), 1. )) ;
        direction.yxz *= rotY(-0.24);
        direction*=rotY(3.141*2.*(10.+iGlobalTime)*.015*(1.-iGlobalTime*0.006));
        direction.yzx*=rotY(3.141*2.*(8./(1.+iGlobalTime*0.1))*.01);
        //direction *= rotY(iGlobalTime*.7);
        gl_FragColor = vec4(tracer(cameraPosition, direction),1.0);
    }
}