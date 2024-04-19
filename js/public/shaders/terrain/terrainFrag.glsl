#version 330 core
out vec4 FragColor;

in vec3 norm;
in vec3 fragment_position;

in vec3 color;
uniform vec3 light_pos;
uniform vec3 light_color;

void main() {
    vec3 light_direction = normalize(light_pos - fragment_position);
    
    float diffuse_factor = max(dot(norm, light_direction), 0.0);
    vec3 diffuse_lighting = diffuse_factor * light_color;

    vec3 ambient_color = vec3(0.3, 0.3, 0.3);
    vec3 final_color = (ambient_color + diffuse_lighting) * color;

    FragColor = vec4(final_color, 1.0);
}

