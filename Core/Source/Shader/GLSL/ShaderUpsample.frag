#version 300 es
/**
*Downsamples a given Texture to the current FBOs Texture
*@authors Roland Heer, HFU, 2023 | Jirka Dell'Oro-Friedl, HFU, 2023
*/
precision mediump float;
precision highp int;

in vec2 v_vctTexture;
in vec2[9] v_vctOffsets;
uniform sampler2D u_texture;
uniform sampler2D u_texture2;

float gaussianKernel[9] = float[](0.045f, 0.122f, 0.045f, 0.122f, 0.332f, 0.122f, 0.045f, 0.122f, 0.045f);

out vec4 vctFrag;

void main() {
    /*vec4 tex1 = vec4(0.0f);
    for(int i = 0; i < 9; i++) {
        tex1 += vec4(texture(u_texture, v_vctTexture + v_vctOffsets[i]) * gaussianKernel[i]);
    }*/
    vec4 tex1 = texture(u_texture, v_vctTexture);
    vec4 tex2 = texture(u_texture2, v_vctTexture);
    vctFrag = tex2 + tex1; //The textures are not weighted equally. It gives the bloom Effect a nicer Falloff.
}