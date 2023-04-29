#version 300 es
/**
* Phong shading
* @authors Jirka Dell'Oro-Friedl, HFU, 2022 || Roland Heer, HFU, 2023
*/

precision mediump float;
precision highp int;

uniform vec4 u_vctColor;
uniform float u_fDiffuse;
uniform float u_fMetallic;
uniform float u_fSpecular;
uniform float u_fIntensity;
uniform mat4 u_mtxMeshToWorld;
uniform vec3 u_vctCamera;

in vec4 v_vctColor;
in vec4 v_vctPosition;
in vec3 v_vctNormal;
out vec4 vctFrag;

struct Light {
  vec4 vctColor;
  mat4 mtxShape;
  mat4 mtxShapeInverse;
};

const uint MAX_LIGHTS_DIRECTIONAL = 10u;
const uint MAX_LIGHTS_POINT = 50u;
const uint MAX_LIGHTS_SPOT = 50u;

uniform uint u_nLightsDirectional;
uniform Light u_directional[MAX_LIGHTS_DIRECTIONAL];
uniform uint u_nLightsPoint;
uniform Light u_point[MAX_LIGHTS_POINT];
uniform uint u_nLightsSpot;
uniform Light u_spot[MAX_LIGHTS_SPOT];

// TEXTURE: input UVs and texture
#if defined(TEXTURE)
in vec2 v_vctTexture;
uniform sampler2D u_texture;
#endif

// NORMALMAP: input UVs and texture
#if defined(NORMALMAP)
in vec2 v_vctNormalMap;
uniform sampler2D u_normalMap;
#endif

vec4 calculateReflection(vec3 _vctLight, vec3 _vctView, vec3 _vctNormal, float _fSpecular, vec4 _vctColor) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  if(_fSpecular <= 0.0)
    return vctResult;

  //BLINN-Phong Shading
  vec3 halfwayDir = normalize(-_vctLight - _vctView);
  float factor = max(dot(-_vctLight, _vctNormal), 0.0);       //Factor for smoothing out transition from surface facing the lightsource to surface facing away from the lightsource
  factor = 1.0 - (pow(factor - 1.0, 8.0));                            //The factor is altered In Order to clearly see the specular Highlight even at steep angles, while still preventing artifacts
  vctResult += pow(max(dot(_vctNormal, halfwayDir), 0.0), _fSpecular * 16.0) * factor * u_fIntensity;
  return vctResult * _vctColor;

  //Standard Phong Shading
  //vec3 vctReflection = normalize(reflect(-_vctLight, _vctNormal));
  //float fHitCamera = dot(vctReflection, _vctView);
  //return pow(max(fHitCamera, 0.0), _fSpecular * 10.0) * _fSpecular; // 10.0 = magic number, looks good... 
}

vec4 illuminateDiffuse(vec3 _vctDirection, vec3 _vctNormal, vec4 _vctColor, vec3 _normalMap) {
  vec4 vctResult = vec4(0, 0, 0, 1);
  //_vctNormal += 1.0 - (2.0 * _normalMap);
  float fIllumination = -dot(_vctNormal, _vctDirection);
  if(fIllumination > 0.0f) {
    vctResult += u_fDiffuse * fIllumination * _vctColor;
  }
  return vctResult;
}

void main() {
  float fmetallic = max(min(u_fMetallic, 1.0), 0.0);
  vctFrag += v_vctColor;
  vec4 vctSpec = vec4(0, 0, 0, 1);
  vec3 vctView = normalize(vec3(u_mtxMeshToWorld * v_vctPosition) - u_vctCamera);

  vec4 tempNormalMap = vec4(0);

  // calculate directional light effect
  for(uint i = 0u; i < u_nLightsDirectional; i++) {
    vec3 vctDirection = normalize(vec3(u_directional[i].mtxShape * vec4(0.0, 0.0, 1.0, 1.0)));
    vctFrag += illuminateDiffuse(vctDirection, v_vctNormal, u_directional[i].vctColor, tempNormalMap.xyz);
    vctSpec += calculateReflection(vctDirection, vctView, v_vctNormal, u_fSpecular, u_directional[i].vctColor);
  }

  // calculate point light effect
  for(uint i = 0u; i < u_nLightsPoint; i++) {
    vec3 vctPositionLight = vec3(u_point[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    float fIntensity = 1.0 - length(mat3(u_point[i].mtxShapeInverse) * vctDirection);
    vctDirection = normalize(vctDirection);
    vctSpec += calculateReflection(vctDirection, vctView, v_vctNormal, u_fSpecular, u_point[i].vctColor);

    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDiffuse(vctDirection, v_vctNormal, fIntensity * u_point[i].vctColor, tempNormalMap.xyz);
  }

  // calculate spot light effect
  for(uint i = 0u; i < u_nLightsSpot; i++) {
    vec3 vctPositionLight = vec3(u_spot[i].mtxShape * vec4(0.0, 0.0, 0.0, 1.0));
    vec3 vctDirection = vec3(u_mtxMeshToWorld * v_vctPosition) - vctPositionLight;
    vec3 vctDirectionInverted = mat3(u_spot[i].mtxShapeInverse) * vctDirection;
    if(vctDirectionInverted.z <= 0.0)
      continue;

    float fSpotIntensity = min(1.0, vctDirectionInverted.z * 5.0);                                        //Due to the specular highlight simulating the direct reflection of a given Light, it makes sense to calculate the specular highlight only infront of a spotlight however not dependend on the coneshape.
    vctDirection = normalize(vctDirection);
    vctSpec += calculateReflection(vctDirection, vctView, v_vctNormal, u_fSpecular, fSpotIntensity * u_spot[i].vctColor);

    float fIntensity = 1.0 - min(1.0, 2.0 * length(vctDirectionInverted.xy) / vctDirectionInverted.z);    //Coneshape that is brightest in the center. Possible Todo: "Variable Spotlightsoftness"
    fIntensity *= 1.0 - pow(vctDirectionInverted.z, 2.0);                                                 //Prevents harsh lighting artifacts at boundary of the given spotlight
    if(fIntensity < 0.0)
      continue;
    vctFrag += illuminateDiffuse(vctDirection, v_vctNormal, fIntensity * u_spot[i].vctColor, tempNormalMap.xyz);
  }

  vctFrag += vctSpec * fmetallic * 2.0;

/*
  // TEXTURE: multiply with texel color
  #if defined(TEXTURE)
  vec4 vctColorTexture = texture(u_texture, v_vctTexture);
  vctFrag *= vctColorTexture;
  #endif
*/
  
  // NORMALMAP: multiply with texel color
  #if defined(NORMALMAP)
  vec4 vctNormalMapCol = texture(u_normalMap, v_vctNormalMap);
  vctFrag *= vctNormalMapCol;
  #endif


  //vctFrag *= u_vctColor;
  vctFrag += vctSpec * (1.0 - fmetallic);
}